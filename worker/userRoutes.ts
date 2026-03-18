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
        const submission: GiftSubmission = {
            ...body,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
        };
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.addSubmission(submission);
        return c.json({ success: true, data } satisfies ApiResponse<GiftSubmission[]>);
    });
    // Boilerplate cleanup
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Passover Portal API' }}));
}