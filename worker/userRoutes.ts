import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, GiftSubmission } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/submissions', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getSubmissions();
        return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
    });
    app.post('/api/submissions', async (c) => {
        const body = await c.req.json() as Omit<GiftSubmission, 'id' | 'createdAt'>;
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
        const isDuplicate = existingSubmissions.some(
            (s) => normalizeEmail(s.email) === normalizeEmail(body.email)
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
        const data = await stub.addSubmission(submission);
        return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
    });
    app.put('/api/submissions/:id', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json() as Partial<GiftSubmission>;
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.updateSubmission(id, body);
        return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
    });
    app.delete('/api/submissions/:id', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.deleteSubmission(id);
        return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
    });
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Passover Portal API' }}));
}