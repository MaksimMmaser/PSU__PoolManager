export interface Transaction {
  id: number;
  dateTime: string;
  clientName: string;
  serviceItem: string;
  amount: number;
  paymentMethod: 'Card' | 'Cash';
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface IncomeCategory {
  name: string;
  percentage: number;
  color: string;
}

export interface MemberCategory {
  name: string;
  percentage: number;
  color: string;
}

export interface DailyRevenue {
  day: string;
  amount: number;
}
export interface Transaction {
  id: number;
  dateTime: string;
  createdAt?: string; // ISO дата от сервера
  clientName: string;
  serviceItem: string;
  amount: number;
  paymentMethod: 'Card' | 'Cash';
  status: 'Completed' | 'Pending' | 'Cancelled';
}