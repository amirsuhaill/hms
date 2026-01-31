import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { Post } from '../types/index.js';

const router = Router();

const postSchema = Joi.object({
    title: Joi.string().required().max(255),
    content: Joi.string().optional(),
});

// Get all posts
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM posts ORDER BY created_at DESC LIMIT 50');
        const posts = result.rows as Post[];
        res.json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch posts' });
    }
});

// Get user posts
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        const posts = result.rows as Post[];
        res.json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch posts' });
    }
});

// Create post
router.post('/', authMiddleware, validateRequest(postSchema), async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const { title, content } = req.body;
        const postId = uuidv4();

        const result = await query(
            'INSERT INTO posts (id, user_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [postId, req.user.userId, title, content]
        );

        const post = result.rows[0] as Post;
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create post' });
    }
});

// Update post
router.put('/:postId', authMiddleware, validateRequest(postSchema), async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const { postId } = req.params;
        const { title, content } = req.body;

        const postResult = await query('SELECT user_id FROM posts WHERE id = $1', [postId]);
        if (postResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Post not found' });
            return;
        }

        if (postResult.rows[0].user_id !== req.user.userId) {
            res.status(403).json({ success: false, error: 'Forbidden' });
            return;
        }

        const result = await query(
            'UPDATE posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [title, content, postId]
        );

        const post = result.rows[0] as Post;
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update post' });
    }
});

// Delete post
router.delete('/:postId', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const { postId } = req.params;

        const postResult = await query('SELECT user_id FROM posts WHERE id = $1', [postId]);
        if (postResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Post not found' });
            return;
        }

        if (postResult.rows[0].user_id !== req.user.userId) {
            res.status(403).json({ success: false, error: 'Forbidden' });
            return;
        }

        await query('DELETE FROM posts WHERE id = $1', [postId]);
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete post' });
    }
});

export default router;
