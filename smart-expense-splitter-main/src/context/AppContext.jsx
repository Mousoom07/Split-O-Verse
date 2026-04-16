import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { categorizeExpense } from '../utils/ai';

// Context
const AppContext = createContext(null);

// Action types
const ACTIONS = {
  SET_GROUPS: 'SET_GROUPS',
  ADD_GROUP: 'ADD_GROUP',
  UPDATE_GROUP: 'UPDATE_GROUP',
  DELETE_GROUP: 'DELETE_GROUP',
  SET_EXPENSES: 'SET_EXPENSES',
  ADD_EXPENSE: 'ADD_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_GROUPS:
      return { ...state, groups: action.payload };
    case ACTIONS.ADD_GROUP:
      return { ...state, groups: [...state.groups, action.payload] };
    case ACTIONS.UPDATE_GROUP:
      return {
        ...state,
        groups: state.groups.map(g => g.id === action.payload.id ? action.payload : g),
      };
    case ACTIONS.DELETE_GROUP:
      return {
        ...state,
        groups: state.groups.filter(g => g.id !== action.payload),
        expenses: state.expenses.filter(e => e.groupId !== action.payload),
      };
    case ACTIONS.SET_EXPENSES:
      return { ...state, expenses: action.payload };
    case ACTIONS.ADD_EXPENSE:
      return { ...state, expenses: [...state.expenses, action.payload] };
    case ACTIONS.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e),
      };
    case ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      };
    case ACTIONS.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] };
    case ACTIONS.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      };
    default:
      return state;
  }
}

// Initial state
const initialState = {
  groups: [],
  expenses: [],
  toasts: [],
};

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from storage on mount
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_GROUPS, payload: storage.getGroups() });
    dispatch({ type: ACTIONS.SET_EXPENSES, payload: storage.getExpenses() });
  }, []);

  // Persist groups
  useEffect(() => {
    storage.saveGroups(state.groups);
  }, [state.groups]);

  // Persist expenses
  useEffect(() => {
    storage.saveExpenses(state.expenses);
  }, [state.expenses]);

  // Toast helper
  const showToast = useCallback((message, type = 'info') => {
    const id = generateId();
    dispatch({ type: ACTIONS.ADD_TOAST, payload: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id });
    }, 3500);
  }, []);

  // Group actions
  const addGroup = useCallback((groupData) => {
    const group = {
      id: generateId(),
      name: groupData.name,
      members: groupData.members,
      createdAt: new Date().toISOString(),
      currency: groupData.currency || '₹',
    };
    dispatch({ type: ACTIONS.ADD_GROUP, payload: group });
    showToast(`Group "${group.name}" created!`, 'success');
    return group;
  }, [showToast]);

  const updateGroup = useCallback((group) => {
    dispatch({ type: ACTIONS.UPDATE_GROUP, payload: group });
    showToast(`Group "${group.name}" updated!`, 'success');
  }, [showToast]);

  const deleteGroup = useCallback((groupId) => {
    const group = state.groups.find(g => g.id === groupId);
    dispatch({ type: ACTIONS.DELETE_GROUP, payload: groupId });
    showToast(`Group "${group?.name}" deleted`, 'info');
  }, [state.groups, showToast]);

  // Expense actions
  const addExpense = useCallback((expenseData) => {
    const autoCategory = categorizeExpense(expenseData.description);
    const expense = {
      id: generateId(),
      groupId: expenseData.groupId,
      description: expenseData.description,
      amount: parseFloat(expenseData.amount),
      paidBy: expenseData.paidBy,
      splitType: expenseData.splitType || 'equal',
      splits: expenseData.splits || [],
      customSplits: expenseData.customSplits || {},
      percentageSplits: expenseData.percentageSplits || {},
      category: expenseData.category || autoCategory,
      date: expenseData.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: ACTIONS.ADD_EXPENSE, payload: expense });
    showToast(`Expense added: ${expense.description}`, 'success');
    return expense;
  }, [showToast]);

  const updateExpense = useCallback((expense) => {
    dispatch({ type: ACTIONS.UPDATE_EXPENSE, payload: expense });
    showToast('Expense updated', 'success');
  }, [showToast]);

  const deleteExpense = useCallback((expenseId) => {
    dispatch({ type: ACTIONS.DELETE_EXPENSE, payload: expenseId });
    showToast('Expense deleted', 'info');
  }, [showToast]);

  // Get expenses for a specific group
  const getGroupExpenses = useCallback((groupId) => {
    return state.expenses.filter(e => e.groupId === groupId);
  }, [state.expenses]);

  const value = {
    ...state,
    addGroup,
    updateGroup,
    deleteGroup,
    addExpense,
    updateExpense,
    deleteExpense,
    getGroupExpenses,
    showToast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
