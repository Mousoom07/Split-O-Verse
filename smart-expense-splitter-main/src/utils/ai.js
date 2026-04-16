// AI-powered features for expense management

const CATEGORY_KEYWORDS = {
  'Food & Dining': [
    'food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'cafe', 'coffee',
    'pizza', 'burger', 'snack', 'meal', 'cooking', 'grocery', 'groceries',
    'swiggy', 'zomato', 'dominos', 'mcdonalds', 'kfc', 'starbucks',
    'tea', 'juice', 'beverage', 'drink', 'biryani', 'chai', 'maggi',
    'canteen', 'mess', 'tiffin', 'bakery', 'ice cream', 'dessert', 'eat',
    'dine', 'order', 'delivery', 'takeout', 'buffet'
  ],
  'Travel & Transport': [
    'travel', 'uber', 'ola', 'cab', 'taxi', 'bus', 'train', 'flight',
    'ticket', 'metro', 'auto', 'rickshaw', 'petrol', 'diesel', 'fuel',
    'gas', 'parking', 'toll', 'airport', 'railway', 'booking', 'ride',
    'commute', 'transport', 'rapido', 'shuttle'
  ],
  'Entertainment': [
    'movie', 'film', 'cinema', 'netflix', 'spotify', 'game', 'gaming',
    'concert', 'party', 'club', 'bar', 'pub', 'bowling', 'karaoke',
    'amazon prime', 'hotstar', 'subscription', 'ticket', 'show',
    'event', 'amusement', 'fun', 'outing', 'trip', 'picnic', 'adventure'
  ],
  'Shopping': [
    'shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'myntra',
    'electronics', 'gadget', 'phone', 'laptop', 'gift', 'accessories',
    'bag', 'watch', 'jewel', 'cosmetics', 'makeup', 'fashion',
    'online', 'market', 'mall', 'store', 'purchase', 'buy'
  ],
  'Rent & Housing': [
    'rent', 'house', 'flat', 'apartment', 'pg', 'hostel', 'room',
    'deposit', 'maintenance', 'society', 'brokerage', 'lease',
    'accommodation', 'stay', 'hotel', 'airbnb', 'lodge'
  ],
  'Utilities & Bills': [
    'electricity', 'water', 'wifi', 'internet', 'phone bill', 'recharge',
    'gas bill', 'cylinder', 'laundry', 'cleaning', 'maid', 'cook',
    'bill', 'utility', 'broadband', 'dth', 'cable', 'newspaper'
  ],
  'Health & Medical': [
    'medicine', 'doctor', 'hospital', 'medical', 'pharmacy', 'health',
    'gym', 'fitness', 'yoga', 'insurance', 'checkup', 'dental',
    'eye', 'clinic', 'lab', 'test', 'prescription'
  ],
  'Education': [
    'book', 'course', 'class', 'tuition', 'study', 'exam', 'fee',
    'udemy', 'coursera', 'college', 'school', 'library', 'stationery',
    'notebook', 'pen', 'educational', 'material', 'tutorial'
  ],
};

/**
 * AI-powered expense categorization based on description
 */
export function categorizeExpense(description) {
  const lower = description.toLowerCase().trim();
  let bestMatch = 'Other';
  let maxScore = 0;

  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (lower.includes(keyword)) {
        // Longer keyword matches get higher scores
        score += keyword.length;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  });

  return bestMatch;
}

/**
 * Generate spending insights
 */
export function generateInsights(expenses, members) {
  if (!expenses.length) return [];

  const insights = [];
  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Category breakdown
  const categories = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categories[cat] = (categories[cat] || 0) + parseFloat(e.amount);
  });

  // Find top category
  const sortedCats = Object.entries(categories).sort(([, a], [, b]) => b - a);
  if (sortedCats.length > 0) {
    const [topCat, topAmount] = sortedCats[0];
    const percentage = ((topAmount / totalSpent) * 100).toFixed(0);
    insights.push({
      type: 'category',
      icon: '📊',
      title: 'Top Spending Category',
      message: `${topCat} accounts for ${percentage}% of total spending (₹${topAmount.toFixed(2)})`,
      severity: percentage > 50 ? 'warning' : 'info',
    });
  }

  // Weekly comparison
  const now = new Date();
  const thisWeekExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    const diffDays = (now - d) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });
  const lastWeekExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    const diffDays = (now - d) / (1000 * 60 * 60 * 24);
    return diffDays > 7 && diffDays <= 14;
  });

  const thisWeekTotal = thisWeekExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const lastWeekTotal = lastWeekExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  if (lastWeekTotal > 0 && thisWeekTotal > 0) {
    const change = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(0);
    if (change > 0) {
      insights.push({
        type: 'trend',
        icon: '📈',
        title: 'Spending Trend',
        message: `You spent ${change}% more this week compared to last week`,
        severity: change > 30 ? 'warning' : 'info',
      });
    } else {
      insights.push({
        type: 'trend',
        icon: '📉',
        title: 'Spending Trend',
        message: `Great! You spent ${Math.abs(change)}% less this week compared to last week`,
        severity: 'success',
      });
    }
  }

  // Average expense
  const avgExpense = totalSpent / expenses.length;
  insights.push({
    type: 'average',
    icon: '💰',
    title: 'Average Expense',
    message: `Your average expense is ₹${avgExpense.toFixed(2)} across ${expenses.length} transactions`,
    severity: 'info',
  });

  // Highest spender
  const memberSpending = {};
  expenses.forEach(e => {
    memberSpending[e.paidBy] = (memberSpending[e.paidBy] || 0) + parseFloat(e.amount);
  });
  const topSpender = Object.entries(memberSpending).sort(([, a], [, b]) => b - a)[0];
  if (topSpender) {
    insights.push({
      type: 'member',
      icon: '👤',
      title: 'Top Contributor',
      message: `${topSpender[0]} has paid the most: ₹${topSpender[1].toFixed(2)}`,
      severity: 'info',
    });
  }

  // Expense frequency
  if (expenses.length > 1) {
    const dates = expenses.map(e => new Date(e.date)).sort((a, b) => a - b);
    const daySpan = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24) || 1;
    const frequency = (expenses.length / daySpan).toFixed(1);
    insights.push({
      type: 'frequency',
      icon: '⚡',
      title: 'Expense Frequency',
      message: `On average, ${frequency} expenses are added per day`,
      severity: 'info',
    });
  }

  // Category-specific food insight
  if (categories['Food & Dining']) {
    const foodPct = ((categories['Food & Dining'] / totalSpent) * 100).toFixed(0);
    if (foodPct > 30) {
      insights.push({
        type: 'food',
        icon: '🍕',
        title: 'Food Spending Alert',
        message: `You spent ${foodPct}% on food! Consider cooking at home to save more.`,
        severity: 'warning',
      });
    }
  }

  return insights;
}

/**
 * Get all available categories
 */
export function getCategories() {
  return [
    'Food & Dining',
    'Travel & Transport',
    'Entertainment',
    'Shopping',
    'Rent & Housing',
    'Utilities & Bills',
    'Health & Medical',
    'Education',
    'Other',
  ];
}

/**
 * Get category color
 */
export function getCategoryColor(category) {
  const colors = {
    'Food & Dining': '#f97316',
    'Travel & Transport': '#06b6d4',
    'Entertainment': '#ec4899',
    'Shopping': '#8b5cf6',
    'Rent & Housing': '#10b981',
    'Utilities & Bills': '#f59e0b',
    'Health & Medical': '#ef4444',
    'Education': '#3b82f6',
    'Other': '#6b7280',
  };
  return colors[category] || '#6b7280';
}

/**
 * Get category icon
 */
export function getCategoryIcon(category) {
  const icons = {
    'Food & Dining': '🍔',
    'Travel & Transport': '✈️',
    'Entertainment': '🎬',
    'Shopping': '🛍️',
    'Rent & Housing': '🏠',
    'Utilities & Bills': '💡',
    'Health & Medical': '🏥',
    'Education': '📚',
    'Other': '📌',
  };
  return icons[category] || '📌';
}
