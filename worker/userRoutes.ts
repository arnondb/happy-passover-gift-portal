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
        // 1. Backend Validation Layer
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
        // 2. Duplicate Prevention
        const existingSubmissions = await stub.getSubmissions();
        const isDuplicate = existingSubmissions.some(
            (s) => s.email.toLowerCase() === body.email.toLowerCase()
        );
        if (isDuplicate) {
            return c.json({
                success: false,
                error: "This email has already claimed a gift."
            } satisfies ApiResponse, 400);
        }
        // 3. Create Submission
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