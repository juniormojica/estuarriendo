# Database Setup Instructions

## Prerequisites

Before starting the backend server, you need to set up the PostgreSQL database and create the required ENUM types.

## Step 1: Create Database

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE estuarriendo_db;
```

## Step 2: Run ENUM Initialization Script

Run the initialization script to create all required ENUM types:

```bash
psql -U your_username -d estuarriendo_db -f database/init-enums.sql
```

Or from psql command line:

```sql
\c estuarriendo_db
\i database/init-enums.sql
```

## Step 3: Configure Environment Variables

Make sure your `.env` file has the correct database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estuarriendo_db
DB_USER=your_username
DB_PASSWORD=your_password
NODE_ENV=development
PORT=3001
```

## Step 4: Start the Server

After the ENUM types are created, you can start the backend server:

```bash
npm run dev
```

The server will automatically sync all table structures using Sequelize.

## Troubleshooting

### Error: type "xxx_enum" already exists

If you see this error, the ENUM types are already created. You can skip Step 2 and proceed directly to starting the server.

### Error: type "xxx_enum" does not exist

Run the initialization script (Step 2) before starting the server.

### Upgrading from Old ENUM Names

If you previously ran an older version of `init-enums.sql` with different ENUM names, you need to drop the old types first:

```sql
-- Connect to your database
\c estuarriendo_db

-- Drop old ENUM types
DROP TYPE IF EXISTS id_type_enum CASCADE;
DROP TYPE IF EXISTS owner_role_enum CASCADE;
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS account_type_enum CASCADE;
DROP TYPE IF EXISTS property_type_enum CASCADE;
DROP TYPE IF EXISTS property_status_enum CASCADE;
DROP TYPE IF EXISTS verification_status_enum CASCADE;
DROP TYPE IF EXISTS plan_type_enum CASCADE;
DROP TYPE IF EXISTS subscription_type_enum CASCADE;
DROP TYPE IF EXISTS payment_request_status_enum CASCADE;
DROP TYPE IF EXISTS notification_type_enum CASCADE;
DROP TYPE IF EXISTS student_request_status_enum CASCADE;

-- Then run the new init script
\i database/init-enums.sql
```

### Database Connection Error

- Verify your PostgreSQL service is running
- Check that the credentials in `.env` are correct
- Ensure the database exists

## Database Reset (Development Only)

If you need to completely reset the database:

```sql
DROP DATABASE estuarriendo_db;
CREATE DATABASE estuarriendo_db;
```

Then repeat Steps 2-4.
