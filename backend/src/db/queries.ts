import { pool } from './pool.js';
import { QueryResult } from 'pg';

export class Database {
    static async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
        return pool.query<T>(text, values);
    }

    static async queryOne<T = any>(text: string, values?: any[]): Promise<T | null> {
        const result = await pool.query<T>(text, values);
        return result.rows[0] || null;
    }

    static async queryMany<T = any>(text: string, values?: any[]): Promise<T[]> {
        const result = await pool.query<T>(text, values);
        return result.rows;
    }

    static async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
