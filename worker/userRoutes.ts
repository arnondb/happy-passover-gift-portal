import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, GiftSubmission } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/submissions', async (c) => {
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.getSubmissions();
            return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            return c.json({ success: false, error: 'Failed to retrieve data' } satisfies ApiResponse, 500);
        }
    });
    app.post('/api/submissions', async (c) => {
        let body: Omit<GiftSubmission, 'id' | 'createdAt'>;
        try {
            body = await c.req.json();
        } catch (e) {
            return c.json({ success: false, error: 'Invalid JSON body' } satisfies ApiResponse, 400);
        }
        const requiredFields: (keyof Omit<GiftSubmission, 'id' | 'createdAt'>)[] = [
            'firstName', 'lastName', 'company', 'email', 'phone', 'address', 'repName'
        ];
        for (const field of requiredFields) {
            if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
                return c.json({
                    success: false,
                    error: `Missing or invalid required field: ${field}`
                } satisfies ApiResponse, 400);
            }
        }
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const existingSubmissions = await stub.getSubmissions();
        const normalizeEmail = (email?: string) => email?.toLowerCase().trim() ?? '';
        const currentEmail = normalizeEmail(body.email);
        const isDuplicate = existingSubmissions.some(
            (s) => normalizeEmail(s.email) === currentEmail
        );
        if (isDuplicate) {
            return c.json({
                success: false,
                error: "This email has already claimed a gift."
            } satisfies ApiResponse, 400);
        }
        const submission: GiftSubmission = {
            ...body,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
        };
        try {
            const data = await stub.addSubmission(submission);
            return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
        } catch (error) {
            console.error('Failed to add submission:', error);
            return c.json({ success: false, error: 'Internal Server Error' } satisfies ApiResponse, 500);
        }
    });
    app.put('/api/submissions/:id', async (c) => {
        const id = c.req.param('id');
        if (!id) return c.json({ success: false, error: 'Missing ID parameter' } satisfies ApiResponse, 400);
        let body: Partial<GiftSubmission>;
        try {
            body = await c.req.json();
        } catch (e) {
            return c.json({ success: false, error: 'Invalid JSON body' } satisfies ApiResponse, 400);
        }
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.updateSubmission(id, body);
            return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
        } catch (error) {
            console.error('Update failed:', error);
            return c.json({ success: false, error: 'Update failed' } satisfies ApiResponse, 500);
        }
    });
    app.delete('/api/submissions/:id', async (c) => {
        const id = c.req.param('id');
        if (!id) return c.json({ success: false, error: 'Missing ID parameter' } satisfies ApiResponse, 400);
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.deleteSubmission(id);
            return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
        } catch (error) {
            console.error('Delete failed:', error);
            return c.json({ success: false, error: 'Delete failed' } satisfies ApiResponse, 500);
        }
    });
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Passover Portal API' }}));
}