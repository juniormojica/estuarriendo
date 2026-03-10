import { MercadoPagoConfig, Payment } from 'mercadopago';
import { User, ActivityLog, CreditBalance, CreditTransaction, Subscription } from '../models/index.js';
import { notifyPaymentVerified, notifyCreditPurchased } from '../services/notificationService.js';
import { Op } from 'sequelize';

const getMpClient = () => {
    return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
};

export const handleMercadoPagoWebhook = async (req, res) => {
    try {
        // Important: Always reply 200 OK immediately to MP webhooks so they don't retry unnecessarily
        res.status(200).send('OK');

        const { type, action, data } = req.body;

        console.log(`[MercadoPago Webhook] Received: type=${type}, action=${action}, id=${data?.id}`);

        // We only care about payments (even for subscriptions, the actual charge triggers a payment event)
        if (type === 'payment' && data?.id) {
            const client = getMpClient();
            const paymentClient = new Payment(client);

            // Query MercadoPago directly for secure data
            const payment = await paymentClient.get({ id: data.id });

            if (payment.status === 'approved' && payment.external_reference) {
                await processPaymentSuccess(payment.external_reference, payment.id.toString());
            } else if (payment.status === 'approved') {
                console.log(`[MercadoPago Webhook] Payment ${payment.id} approved but no external_reference found.`);
            }
        }
    } catch (error) {
        console.error('[MercadoPago Webhook] Error processing:', error);
    }
};

async function processPaymentSuccess(externalReference, paymentId) {
    try {
        // externalReference format: "userId:xxx|planType:yyy"
        const parts = externalReference.split('|');
        if (parts.length !== 2) return;

        const userIdPart = parts.find(p => p.startsWith('userId:'));
        const planTypePart = parts.find(p => p.startsWith('planType:'));

        if (!userIdPart || !planTypePart) return;

        const userId = userIdPart.split(':')[1];
        const planType = planTypePart.split(':')[1];

        // 1. Prevent duplicate processing
        const existingLog = await ActivityLog.findOne({
            where: {
                message: {
                    [Op.like]: `%MP_ID:${paymentId}%`
                }
            }
        });

        if (existingLog) {
            console.log(`[MercadoPago Webhook] Payment ${paymentId} already processed.`);
            return;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            console.error(`[MercadoPago Webhook] User ${userId} not found.`);
            return;
        }

        const now = new Date();
        const isCreditPlan = ['5_credits', '10_credits', '20_credits'].includes(planType);

        if (isCreditPlan) {
            // -- ALGORITHM FOR TENANT CREDITS --
            let balance = await CreditBalance.findOne({ where: { userId: user.id } });

            if (!balance) {
                balance = await CreditBalance.create({
                    userId: user.id,
                    availableCredits: 0,
                    totalPurchased: 0,
                    totalUsed: 0,
                    totalRefunded: 0
                });
            }

            let creditsToAdd = 0;
            if (planType === '5_credits') creditsToAdd = 5;
            else if (planType === '10_credits') creditsToAdd = 10;
            else if (planType === '20_credits') creditsToAdd = 20;

            if (creditsToAdd > 0) {
                if (balance.availableCredits !== -1) {
                    balance.availableCredits += creditsToAdd;
                }
                balance.totalPurchased += creditsToAdd;
                await balance.save();

                await CreditTransaction.create({
                    userId: user.id,
                    type: 'purchase',
                    amount: creditsToAdd,
                    balanceAfter: balance.availableCredits,
                    description: `Compra de plan de créditos: ${planType}`,
                    referenceType: 'mercadopago',
                    referenceId: paymentId
                });

                // Add to subscription history for uniform tracking
                const expiresAt = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year fallback expiration for credits without duration limit in the UI
                await Subscription.create({
                    userId: user.id,
                    plan: 'free',
                    planType: planType,
                    startedAt: now,
                    expiresAt: expiresAt,
                    status: 'active',
                    createdAt: now
                });

                if (notifyCreditPurchased) {
                    await notifyCreditPurchased({
                        userId: user.id,
                        userName: user.name,
                        planType: planType,
                        credits: creditsToAdd
                    });
                }
            }

            await ActivityLog.create({
                type: 'payment_verified',
                message: `Pago de créditos procesado automáticamente para ${user.name} - Plan ${planType} (MP_ID:${paymentId})`,
                userId: user.id,
                timestamp: now
            });
            console.log(`[MercadoPago Webhook] Added ${creditsToAdd} credits to ${user.id}`);

        } else {
            // -- ALGORITHM FOR OWNER PREMIUM PLANS --
            let planDuration = 30; // default monthly
            if (planType === 'weekly') planDuration = 7;
            else if (planType === 'quarterly') planDuration = 90;

            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + planDuration);

            await Subscription.create({
                userId: user.id,
                plan: 'premium',
                planType: planType,
                startedAt: now,
                expiresAt: expiresAt,
                status: 'active',
                createdAt: now
            });

            await user.update({
                plan: 'premium',
                premiumSince: user.premiumSince || now,
                updatedAt: now
            });

            if (notifyPaymentVerified) {
                await notifyPaymentVerified({
                    userId: user.id,
                    userName: user.name,
                    planType: planType,
                    expiresAt: expiresAt
                });
            }

            await ActivityLog.create({
                type: 'payment_verified',
                message: `Suscripción Premium activada automáticamente para ${user.name} - Plan ${planType} (MP_ID:${paymentId})`,
                userId: user.id,
                timestamp: now
            });
            console.log(`[MercadoPago Webhook] Granted Premium to ${user.id} until ${expiresAt}`);
        }
    } catch (error) {
        console.error(`[MercadoPago Webhook] Error processing payment ${paymentId}:`, error);
    }
}

export default {
    handleMercadoPagoWebhook
};
