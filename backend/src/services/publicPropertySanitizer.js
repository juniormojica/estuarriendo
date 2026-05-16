const SENSITIVE_OWNER_FIELDS = [
    'email',
    'phone',
    'whatsapp',
    'documentNumber',
    'password',
    'resetPasswordToken',
    'resetPasswordExpires',
    'verificationToken',
    'twoFactorSecret'
];

const OWNER_PUBLIC_FIELDS = ['id', 'name'];

const toPlain = (entity) => {
    if (!entity) return entity;
    if (typeof entity.toJSON === 'function') return entity.toJSON();
    return entity;
};

const sanitizeOwner = (owner) => {
    if (!owner) return owner;

    const plainOwner = toPlain(owner);
    const publicOwner = {};

    for (const field of OWNER_PUBLIC_FIELDS) {
        if (plainOwner[field] !== undefined) {
            publicOwner[field] = plainOwner[field];
        }
    }

    for (const field of SENSITIVE_OWNER_FIELDS) {
        delete publicOwner[field];
    }

    return publicOwner;
};

const sanitizeProperty = (property) => {
    if (!property) return property;

    const plainProperty = toPlain(property);
    const sanitized = {
        ...plainProperty
    };

    delete sanitized.contact;

    if (sanitized.owner) {
        sanitized.owner = sanitizeOwner(sanitized.owner);
    }

    if (Array.isArray(sanitized.units)) {
        sanitized.units = sanitized.units.map((unit) => sanitizeProperty(unit));
    }

    if (sanitized.container) {
        sanitized.container = sanitizeProperty(sanitized.container);
    }

    return sanitized;
};

export const sanitizePublicProperty = (property) => sanitizeProperty(property);

export const sanitizePublicPropertyList = (properties = []) => {
    if (!Array.isArray(properties)) return [];
    return properties.map((property) => sanitizeProperty(property));
};
