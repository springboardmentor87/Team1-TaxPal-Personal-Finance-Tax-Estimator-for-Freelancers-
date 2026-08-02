export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  country: string;
  income_bracket?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  notes?: string;
}
