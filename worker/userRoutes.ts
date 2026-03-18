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
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        // Fetch existing submissions for duplicate check
        const existingSubmissions = await stub.getSubmissions();
        // Case-insensitive duplicate email check
        const isDuplicate = existingSubmissions.some(
            (s) => s.email.toLowerCase() === body.email.toLowerCase()
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
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Passover Portal API' }}));
}