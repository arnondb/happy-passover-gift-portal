import { DurableObject } from "cloudflare:workers";
import type { DemoItem, GiftSubmission } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
export class GlobalDurableObject extends DurableObject {
    async getCounterValue(): Promise<number> {
      const value = (await this.ctx.storage.get("counter_value")) || 0;
      return value as number;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      if (items) {
        return items as DemoItem[];
      }
      await this.ctx.storage.put("demo_items", MOCK_ITEMS);
      return MOCK_ITEMS;
    }
    async getSubmissions(): Promise<GiftSubmission[]> {
      const items = await this.ctx.storage.get("submissions");
      const submissions = (items as GiftSubmission[]) || [];
      // Data migration/integrity: ensure all items have a status
      return submissions.map(s => ({
        ...s,
        status: s.status || 'pending'
      }));
    }
    async addSubmission(submission: GiftSubmission): Promise<GiftSubmission[]> {
      const items = await this.getSubmissions();
      const updated = [{ ...submission, status: 'pending' }, ...items];
      await this.ctx.storage.put("submissions", updated);
      return updated;
    }
    async updateSubmission(id: string, updates: Partial<GiftSubmission>): Promise<GiftSubmission[]> {
      const items = await this.getSubmissions();
      const updated = items.map(item =>
        item.id === id ? { ...item, ...updates, id } : item
      );
      await this.ctx.storage.put("submissions", updated);
      return updated;
    }
    async deleteSubmission(id: string): Promise<GiftSubmission[]> {
      const items = await this.getSubmissions();
      const updated = items.filter(item => item.id !== id);
      await this.ctx.storage.put("submissions", updated);
      return updated;
    }
    async addDemoItem(item: DemoItem): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = [...items, item];
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async updateDemoItem(id: string, updates: Partial<Omit<DemoItem, 'id'>>): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async deleteDemoItem(id: string): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.filter(item => item.id !== id);
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
}