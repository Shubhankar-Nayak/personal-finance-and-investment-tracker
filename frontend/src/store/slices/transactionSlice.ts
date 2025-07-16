import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

interface TransactionState {
  transactions: Transaction[];
  categories: string[];
  filters: {
    category: string;
    type: 'all' | 'income' | 'expense';
    dateFrom: string;
    dateTo: string;
  };
}

const initialState: TransactionState = {
  transactions: [],
  categories: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Salary', 'Freelance', 'Investment', 'Other'],
  filters: {
    category: '',
    type: 'all',
    dateFrom: '',
    dateTo: '',
  },
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Omit<Transaction, 'id' | 'createdAt'>>) => {
      const newTransaction: Transaction = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.transactions.push(newTransaction);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Partial<TransactionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
  },
});

export const { addTransaction, updateTransaction, deleteTransaction, setFilters, addCategory } = transactionSlice.actions;
export default transactionSlice.reducer;