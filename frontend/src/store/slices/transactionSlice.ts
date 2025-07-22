import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

export interface Transaction {
  _id?: string;
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
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  categories: [
    'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills',
    'Healthcare', 'Salary', 'Freelance', 'Investment', 'Other'
  ],
  filters: {
    category: '',
    type: 'all',
    dateFrom: '',
    dateTo: '',
  },
  status: 'idle',
  error: null,
};

export const createTransaction = createAsyncThunk<
  Transaction,
  Omit<Transaction, 'id' | 'createdAt'>,
  { state: RootState }
>(
  'transactions/create',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.post('/api/transactions', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data;

      return {
        ...data,
        id: data._id, 
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Transaction creation failed');
    }
  }
);

export const updateTransaction = createAsyncThunk<
  Transaction,
  Transaction,
  { state: RootState }
>(
  'transactions/update',
  async (transaction, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.put(`/api/transactions/${transaction.id}`, transaction, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.map((t: any) => ({
        ...t,
        id: t._id,
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

export const deleteTransaction = createAsyncThunk<
  string, // Return the deleted transaction's ID
  string, // Accept the transaction ID as an argument
  { state: RootState }
>(
  'transactions/delete',
  async (transactionId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`/api/transactions/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return transactionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  }
);

export const fetchTransactions = createAsyncThunk<Transaction[], void, { state: RootState }>(
  'transactions/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get('/api/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.map((t: any) => ({
        ...t,
        id: t._id,
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TransactionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.status = 'succeeded';
        state.transactions.push(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<string>) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.status = 'succeeded';
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, addCategory } = transactionSlice.actions;
export default transactionSlice.reducer;