require('dotenv').config();

const base = {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
};

module.exports = {
    development: base,
    test: base,
    production: base,
};
