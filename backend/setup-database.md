# Database Setup Guide

## Option 1: Docker PostgreSQL (Recommended)

1. **Start Docker Desktop** on your machine
2. **Run the database**:
   ```bash
   docker-compose up -d postgres
   ```
3. **Initialize the database**:
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

## Option 2: Local PostgreSQL Installation

1. **Download and install PostgreSQL** from https://www.postgresql.org/download/windows/
2. **Create database**:
   ```sql
   CREATE DATABASE hms_db;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE hms_db TO postgres;
   ```
3. **Update .env file** with your database credentials
4. **Initialize the database**:
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

## Option 3: Cloud Database (Supabase/Neon)

1. **Create a free account** at https://supabase.com or https://neon.tech
2. **Create a new PostgreSQL database**
3. **Copy the connection string** and update your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```
4. **Initialize the database**:
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

## Current Status

The backend is configured to use PostgreSQL. Please choose one of the options above to set up your database.

### Default Credentials (after seeding):
- **Admin**: admin@hms.com / admin123
- **Doctor**: doctor@hms.com / doctor123  
- **Staff**: staff@hms.com / staff123
- **Patient**: patient@hms.com / patient123