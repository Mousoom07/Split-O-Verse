// Expense calculation utilities

/**
 * Calculate balances for a group based on its expenses
 * Returns a map of member -> net balance (positive = owed money, negative = owes money)
 */
export function calculateBalances(expenses, members) {
  const balances = {};
  members.forEach(m => { balances[m] = 0; });

  expenses.forEach(expense => {
    const { paidBy, splits } = expense;
    const totalAmount = parseFloat(expense.amount);

    // Add the full amount to the payer's balance
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += totalAmount;
    }

    // Subtract each person's share
    if (expense.splitType === 'equal') {
      const share = totalAmount / splits.length;
      splits.forEach(person => {
        if (balances[person] !== undefined) {
          balances[person] -= share;
        }
      });
    } else if (expense.splitType === 'custom') {
      Object.entries(expense.customSplits || {}).forEach(([person, amount]) => {
        if (balances[person] !== undefined) {
          balances[person] -= parseFloat(amount);
        }
      });
    } else if (expense.splitType === 'percentage') {
      Object.entries(expense.percentageSplits || {}).forEach(([person, pct]) => {
        if (balances[person] !== undefined) {
          balances[person] -= (totalAmount * parseFloat(pct)) / 100;
        }
      });
    }
  });

  // Round to 2 decimal places
  Object.keys(balances).forEach(k => {
    balances[k] = Math.round(balances[k] * 100) / 100;
  });

  return balances;
}

/**
 * Calculate simplified debts (minimum transactions to settle all balances)
 * Returns array of { from, to, amount }
 */
export function calculateDebts(balances) {
  const debtors = []; // people who owe money (negative balance)
  const creditors = []; // people who are owed money (positive balance)

  Object.entries(balances).forEach(([person, balance]) => {
    if (balance < -0.01) {
      debtors.push({ person, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ person, amount: balance });
    }
  });

  // Sort for optimal matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}

/**
 * Get spending by category for a group
 */
export function getSpendingByCategory(expenses) {
  const categories = {};
  expenses.forEach(expense => {
    const cat = expense.category || 'Other';
    categories[cat] = (categories[cat] || 0) + parseFloat(expense.amount);
  });
  return categories;
}

/**
 * Get spending over time (by month)
 */
export function getSpendingOverTime(expenses) {
  const monthly = {};
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = (monthly[key] || 0) + parseFloat(expense.amount);
  });
  
  const sorted = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(sorted);
}

/**
 * Get spending by member
 */
export function getSpendingByMember(expenses, members) {
  const spendingPaid = {};
  const spendingOwed = {};
  
  members.forEach(m => {
    spendingPaid[m] = 0;
    spendingOwed[m] = 0;
  });

  expenses.forEach(expense => {
    const amount = parseFloat(expense.amount);
    if (spendingPaid[expense.paidBy] !== undefined) {
      spendingPaid[expense.paidBy] += amount;
    }

    if (expense.splitType === 'equal') {
      const share = amount / expense.splits.length;
      expense.splits.forEach(person => {
        if (spendingOwed[person] !== undefined) {
          spendingOwed[person] += share;
        }
      });
    } else if (expense.splitType === 'custom') {
      Object.entries(expense.customSplits || {}).forEach(([person, amt]) => {
        if (spendingOwed[person] !== undefined) {
          spendingOwed[person] += parseFloat(amt);
        }
      });
    }
  });

  return { spendingPaid, spendingOwed };
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = '₹') {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${currency}${formatted}`;
}
