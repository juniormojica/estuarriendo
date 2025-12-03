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

## Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
