import { User, Transaction } from '../transactions/transaction.model';

export const DEMO_USER: User = {
  id: 'user_demo',
  username: 'demo',
  name: 'Alex Morgan',
  email: 'alex@example.com',
  password: 'password',
  country: 'United States',
  income_bracket: 'middle'
};

export function generateMockTransactions(userId: string): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth(); // 0-11

  // Helper to format date as YYYY-MM-DD in local time
  const formatDate = (year: number, month: number, day: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // 1. Seed Current Month Transactions
  transactions.push(
    {
      id: 'tx_cur_1',
      user_id: userId,
      type: 'income',
      description: 'Web Design Project Retainer',
      amount: 4500.00,
      category: 'Web Design',
      date: formatDate(currentYear, currentMonthIdx, 5),
      notes: 'First milestone payment for Spark Tech website redesign'
    },
    {
      id: 'tx_cur_2',
      user_id: userId,
      type: 'income',
      description: 'Consulting Session - Acme Corp',
      amount: 1200.00,
      category: 'Consulting',
      date: formatDate(currentYear, currentMonthIdx, 12),
      notes: 'Strategy and cloud architecture consulting'
    },
    {
      id: 'tx_cur_3',
      user_id: userId,
      type: 'expense',
      description: 'Co-working Office Rent',
      amount: 1500.00,
      category: 'Office Rent',
      date: formatDate(currentYear, currentMonthIdx, 1),
      notes: 'Monthly desk rental fee'
    },
    {
      id: 'tx_cur_4',
      user_id: userId,
      type: 'expense',
      description: 'AWS Cloud Infrastructure',
      amount: 340.00,
      category: 'Software Subscriptions',
      date: formatDate(currentYear, currentMonthIdx, 8),
      notes: 'Production servers and hosting'
    },
    {
      id: 'tx_cur_5',
      user_id: userId,
      type: 'expense',
      description: 'Dinner with client (Spark Tech)',
      amount: 185.00,
      category: 'Meals & Entertainment',
      date: formatDate(currentYear, currentMonthIdx, 15),
      notes: 'Discussed milestone 2 details'
    }
  );

  // Add more income / expense if needed to show recent transaction list nicely
  transactions.push(
    {
      id: 'tx_cur_6',
      user_id: userId,
      type: 'income',
      description: 'E-book Royalties',
      amount: 450.00,
      category: 'Product Sales',
      date: formatDate(currentYear, currentMonthIdx, 20),
      notes: 'Monthly payout from Gumroad sales'
    },
    {
      id: 'tx_cur_7',
      user_id: userId,
      type: 'expense',
      description: 'LinkedIn Premium Subscription',
      amount: 59.99,
      category: 'Marketing',
      date: formatDate(currentYear, currentMonthIdx, 22),
      notes: 'Sales Navigator subscription'
    }
  );

  // 2. Seed Past 5 Months Historical Transactions
  // We want to generate aggregated transactions for each of the past 5 months.
  for (let i = 1; i <= 5; i++) {
    // Determine target month and year
    let targetMonthIdx = currentMonthIdx - i;
    let targetYear = currentYear;
    if (targetMonthIdx < 0) {
      targetMonthIdx += 12;
      targetYear -= 1;
    }

    // Generate random but realistic totals: Income between 6k-9k, Expenses between 2k-4.5k
    const incomeAmount = 6500 + (Math.sin(targetMonthIdx) * 1500); // stable variation
    const expenseAmount = 3000 + (Math.cos(targetMonthIdx) * 800);

    transactions.push(
      {
        id: `tx_hist_inc_${i}`,
        user_id: userId,
        type: 'income',
        description: 'Monthly Client Retainers',
        amount: parseFloat(incomeAmount.toFixed(2)),
        category: 'Consulting',
        date: formatDate(targetYear, targetMonthIdx, 15)
      },
      {
        id: `tx_hist_exp_rent_${i}`,
        user_id: userId,
        type: 'expense',
        description: 'Office Rent & Utilities',
        amount: 1500.00,
        category: 'Office Rent',
        date: formatDate(targetYear, targetMonthIdx, 1)
      },
      {
        id: `tx_hist_exp_sub_${i}`,
        user_id: userId,
        type: 'expense',
        description: 'SaaS Tool Subscriptions',
        amount: parseFloat((expenseAmount - 1500).toFixed(2)),
        category: 'Software Subscriptions',
        date: formatDate(targetYear, targetMonthIdx, 10)
      }
    );
  }

  // Sort descending by date
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
