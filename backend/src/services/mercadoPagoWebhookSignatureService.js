import crypto from 'crypto';

const isProduction = () => (process.env.NODE_ENV || 'development') === 'production';

export const parseMercadoPagoSignature = (rawSignature) => {
    if (!rawSignature || typeof rawSignature !== 'string') return null;

    const parts = rawSignature.split(',').map(part => part.trim()).filter(Boolean);
    const parsed = {};

    for (const part of parts) {
        const [key, ...rest] = part.split('=');
        if (!key || rest.length === 0) continue;
        parsed[key.trim()] = rest.join('=').trim();
    }

    if (!parsed.ts || !parsed.v1) return null;
    return { ts: parsed.ts, v1: parsed.v1 };
};

export const getWebhookNotificationId = (req) => {
    return req.body?.data?.id || req.query?.['data.id'] || req.query?.id || null;
};

export const verifyMercadoPagoWebhookSignature = (req) => {
    const secret = process.env.MP_WEBHOOK_SECRET?.trim();
    const signatureHeader = req.headers?.['x-signature'];
    const requestId = req.headers?.['x-request-id'];

    if (!secret) {
        if (isProduction()) {
            return {
                ok: false,
                status: 503,
                code: 'MP_WEBHOOK_SECRET_MISSING',
                error: 'MP webhook secret no configurado en producción'
            };
        }

        console.warn('[MercadoPago Webhook] MP_WEBHOOK_SECRET no configurado. Saltando validación de firma en entorno no productivo.');
        return { ok: true, skipped: true };
    }

    const parsed = parseMercadoPagoSignature(signatureHeader);
    if (!parsed || !requestId) {
        return {
            ok: false,
            status: 401,
            code: 'MP_WEBHOOK_SIGNATURE_REQUIRED',
            error: 'Headers de firma de webhook faltantes o inválidos'
        };
    }

    const notificationId = getWebhookNotificationId(req);
    if (!notificationId) {
        return {
            ok: false,
            status: 400,
            code: 'MP_WEBHOOK_NOTIFICATION_ID_REQUIRED',
            error: 'ID de notificación de MercadoPago no encontrado'
        };
    }

    const manifest = `id:${notificationId};request-id:${requestId};ts:${parsed.ts};`;
    const expected = crypto
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex');

    let receivedBuffer;
    let expectedBuffer;

    try {
        receivedBuffer = Buffer.from(parsed.v1, 'hex');
        expectedBuffer = Buffer.from(expected, 'hex');
    } catch (_error) {
        return {
            ok: false,
            status: 403,
            code: 'MP_WEBHOOK_SIGNATURE_INVALID',
            error: 'Firma de webhook de MercadoPago inválida'
        };
    }

    if (
        receivedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
        return {
            ok: false,
            status: 403,
            code: 'MP_WEBHOOK_SIGNATURE_INVALID',
            error: 'Firma de webhook de MercadoPago inválida'
        };
    }

    return { ok: true, skipped: false };
};
