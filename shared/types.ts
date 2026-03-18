export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export type FulfillmentStatus = 'pending' | 'shipped';
export interface GiftSubmission {
  id: string;
  repName: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: FulfillmentStatus;
  createdAt: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}