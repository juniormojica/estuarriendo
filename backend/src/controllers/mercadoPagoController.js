import { MercadoPagoConfig, Preference, PreApproval, Payment } from 'mercadopago';
import { badRequest, unauthorized } from '../errors/AppError.js';

// Get base URL for callbacks depending on environment
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const getWebhookUrl = () => {
    const base = process.env.WEBHOOK_BASE_URL;
    return base ? `${base}/api/webhooks/mercadopago` : null;
};

const getMpClient = () => {
    return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
};

// Plan configurations
const PLAN_CONFIGS = {
    'weekly': { title: 'Plan Semanal Premium', price: 12999, frequency: 7, frequency_type: 'days' },
    'monthly': { title: 'Plan Mensual Premium', price: 19999, frequency: 1, frequency_type: 'months' },
    'quarterly': { title: 'Plan Trimestral Premium', price: 49999, frequency: 3, frequency_type: 'months' },
};

const CREDIT_CONFIGS = {
    '5_credits': { title: '5 Créditos de Contacto', price: 8999 },
    '10_credits': { title: '10 Créditos de Contacto', price: 12999 },
    '20_credits': { title: '20 Créditos de Contacto', price: 19999 },
};

export const createCheckoutLink = async (req, res, next) => {
    try {
        const { planType, userEmail } = req.body;
        const authenticatedUserId = req.auth?.userId || req.userId;

        if (!authenticatedUserId) {
            throw unauthorized('Autenticación requerida', {
                code: 'MP_CHECKOUT_AUTH_REQUIRED'
            });
        }

        if (!planType) {
            throw badRequest('Faltan campos requeridos (planType)', {
                code: 'MP_CHECKOUT_VALIDATION_ERROR'
            });
        }

        const client = getMpClient();
        const successUrl = `${getFrontendUrl()}/success-payment?planType=${planType}`;
        const failureUrl = `${getFrontendUrl()}/perfil?tab=billing`;
        // We use external_reference to identify the user and plan when the webhook arrives
        // Security: never trust body.userId for billing ownership.
        // Route requires auth and user identity is derived from JWT.
        const externalReference = `userId:${authenticatedUserId}|planType:${planType}`;

        // 1. Check if it's a Subscription plan (owner plans) — use Preference instead of PreApproval
        //    PreApproval has strict country validation that breaks in local dev.
        //    We use a one-time Preference and handle plan duration/renewal on our backend.
        if (PLAN_CONFIGS[planType]) {
            const config = PLAN_CONFIGS[planType];

            const preference = new Preference(client);
            const webhookUrl = getWebhookUrl();
            const body = {
                items: [
                    {
                        id: planType,
                        title: config.title,
                        quantity: 1,
                        unit_price: config.price,
                        currency_id: 'COP'
                    }
                ],
                back_urls: {
                    success: successUrl,
                    failure: failureUrl,
                    pending: successUrl
                },
                external_reference: externalReference,
                payer: userEmail ? { email: userEmail } : undefined
            };
            if (webhookUrl) body.notification_url = webhookUrl;

            const pref = await preference.create({ body });
            return res.json({ init_point: pref.init_point });
        }

        // 2. Check if it's a one-time Preference payment (tenant credits)
        if (CREDIT_CONFIGS[planType]) {
            const config = CREDIT_CONFIGS[planType];

            const preference = new Preference(client);
            const webhookUrl = getWebhookUrl();
            const body = {
                items: [
                    {
                        id: planType,
                        title: config.title,
                        quantity: 1,
                        unit_price: config.price,
                        currency_id: 'COP'
                    }
                ],
                back_urls: {
                    success: successUrl,
                    failure: failureUrl,
                    pending: successUrl
                },
                external_reference: externalReference,
                payer: userEmail ? { email: userEmail } : undefined
            };
            if (webhookUrl) body.notification_url = webhookUrl;

            const pref = await preference.create({ body });

            return res.json({ init_point: pref.init_point });
        }

        throw badRequest('Plan no reconocido', { code: 'MP_PLAN_NOT_RECOGNIZED' });

    } catch (error) {
        next(error);
    }
};

// Manual verification: fetch a payment by ID from MP API and process it
export const verifyPaymentManually = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        if (!paymentId) {
            throw badRequest('paymentId es requerido', { code: 'MP_PAYMENT_ID_REQUIRED' });
        }

        const client = getMpClient();
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: paymentId });

        console.log('[Manual Verify] Payment data:', JSON.stringify({
            id: payment.id,
            status: payment.status,
            external_reference: payment.external_reference,
            transaction_amount: payment.transaction_amount,
        }, null, 2));

        return res.json({
            id: payment.id,
            status: payment.status,
            external_reference: payment.external_reference,
            amount: payment.transaction_amount,
            currency: payment.currency_id,
            payer_email: payment.payer?.email,
            date_approved: payment.date_approved,
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createCheckoutLink,
    verifyPaymentManually
};
