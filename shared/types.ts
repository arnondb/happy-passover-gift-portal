export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface GiftSubmission {
  id: string;
  repName: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  address: string;
  createdAt: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}