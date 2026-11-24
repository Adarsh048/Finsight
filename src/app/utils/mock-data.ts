import { Transaction } from '../models/finance.models';

export function generateMockData(): Transaction[] {
  const data: Transaction[] = [];
  const today = new Date();

  // 1. Inject Fixed Monthly Income & Expenses for the last 3 months
  for (let i = 0; i < 3; i++) {
    // Salary
    data.push({
      id: `tx_SALARY${i}`,
      date: new Date(today.getFullYear(), today.getMonth() - i, 1).toISOString().split('T')[0],
      merchant: 'Tech Corp India (Salary)',
      category: 'Income',
      amount: 145000,
      type: 'income',
      status: 'cleared',
      note: 'Monthly Salary Credited'
    });
    // Mutual Fund SIP
    data.push({
      id: `tx_SIP${i}`,
      date: new Date(today.getFullYear(), today.getMonth() - i, 5).toISOString().split('T')[0],
      merchant: 'Zerodha Coin (Mutual Funds)',
      category: 'Investments',
      amount: 25000,
      type: 'expense',
      status: 'cleared',
      note: 'Monthly SIP Auto-deduct'
    });
    // Rent / EMI
    data.push({
      id: `tx_RENT${i}`,
      date: new Date(today.getFullYear(), today.getMonth() - i, 3).toISOString().split('T')[0],
      merchant: 'HDFC Home Loan / Landlord',
      category: 'Housing',
      amount: 35000,
      type: 'expense',
      status: 'cleared',
      note: 'Housing'
    });
  }

  // 2. Variable Lifestyle Expenses
  const templates = [
    { cat: 'Groceries', type: 'expense' as const, merchant: 'Swiggy Instamart', min: 300, max: 1200 },
    { cat: 'Groceries', type: 'expense' as const, merchant: 'D-Mart Ready', min: 2500, max: 4500 },
    { cat: 'Food & Dining', type: 'expense' as const, merchant: 'Zomato', min: 350, max: 800 },
    { cat: 'Food & Dining', type: 'expense' as const, merchant: 'Rameshwaram Cafe', min: 150, max: 400 },
    { cat: 'Food & Dining', type: 'expense' as const, merchant: 'Social (Dining)', min: 1800, max: 3500 },
    { cat: 'Transport', type: 'expense' as const, merchant: 'Uber India', min: 150, max: 450 },
    { cat: 'Transport', type: 'expense' as const, merchant: 'Indian Oil (Fuel)', min: 2000, max: 2500 },
    { cat: 'Shopping', type: 'expense' as const, merchant: 'Amazon India', min: 499, max: 3000 },
    { cat: 'Shopping', type: 'expense' as const, merchant: 'Myntra', min: 1200, max: 2500 },
    { cat: 'Housing', type: 'expense' as const, merchant: 'Tata Power / BESCOM', min: 1200, max: 2200 },
    { cat: 'Housing', type: 'expense' as const, merchant: 'Airtel Broadband', min: 1180, max: 1180 },
    { cat: 'Health', type: 'expense' as const, merchant: 'Apollo Pharmacy', min: 250, max: 800 },
  ];

  // Distribute ~90 variable transactions over the last 90 days
  for (let i = 0; i < 90; i++) {
    const t = templates[Math.floor(Math.random() * templates.length)];
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    data.push({
      id: `tx_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      date: date.toISOString().split('T')[0],
      merchant: t.merchant,
      category: t.cat,
      amount: Math.floor(Math.random() * (t.max - t.min + 1)) + t.min,
      type: t.type,
      status: Math.random() > 0.9 ? 'pending' : 'cleared'
    });
  }

  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Ignore quota errors */
  }
}

export function loadTransactions(): Transaction[] {
  const stored = safeStorageGet('fin_transactions_salaried_v1');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      /* Corrupt data fallback */
    }
  }
  const mock = generateMockData();
  safeStorageSet('fin_transactions_salaried_v1', JSON.stringify(mock));
  return mock;
}
