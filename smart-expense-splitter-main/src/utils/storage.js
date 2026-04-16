// Local Storage Utility for persistent data

const STORAGE_KEYS = {
  GROUPS: 'splitwise_groups',
  EXPENSES: 'splitwise_expenses',
  SETTINGS: 'splitwise_settings',
};

export const storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // Groups
  getGroups() {
    return this.get(STORAGE_KEYS.GROUPS) || [];
  },

  saveGroups(groups) {
    this.set(STORAGE_KEYS.GROUPS, groups);
  },

  // Expenses
  getExpenses() {
    return this.get(STORAGE_KEYS.EXPENSES) || [];
  },

  saveExpenses(expenses) {
    this.set(STORAGE_KEYS.EXPENSES, expenses);
  },

  // Export all data
  exportData() {
    return {
      groups: this.getGroups(),
      expenses: this.getExpenses(),
      exportedAt: new Date().toISOString(),
    };
  },

  // Import data
  importData(data) {
    if (data.groups) this.saveGroups(data.groups);
    if (data.expenses) this.saveExpenses(data.expenses);
  },

  // Clear all data
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => this.remove(key));
  },
};

export { STORAGE_KEYS };
