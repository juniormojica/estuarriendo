# Backend

Node.js backend for EstuArriendo platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials

3. Create PostgreSQL database:
```sql
CREATE DATABASE estuarriendo_db;
```

4. Run the development server:
```bash
npm run dev
```

## Schema workflow (PR3 bootstrap)

- Default startup mode keeps current dev behavior (`DB_SCHEMA_MODE` unset -> sync only in development).
- For migration-first flow, run migrations explicitly:

```bash
npm run db:migrate
```

- Optional guarded startup execution (opt-in only):

```bash
DB_SCHEMA_MODE=migrate
DB_RUN_MIGRATIONS_ON_STARTUP=true
```

- Smoke check helper (requires DB env vars):

```bash
npm run db:smoke:migrations
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── models/          # Sequelize models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
└── package.json
```

## API Endpoints

- `GET /api/health` - Health check endpoint

## Documentation

- `docs/API_ERROR_CONTRACT.md` - Contrato de errores API para consumidores frontend.

## Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
