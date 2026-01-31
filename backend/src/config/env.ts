import dotenv from 'dotenv';

dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    database: {
        url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/myapp',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expire: (process.env.JWT_EXPIRE || '7d') as string | number,
    },
    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },
};

// Validate required env vars
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
}
