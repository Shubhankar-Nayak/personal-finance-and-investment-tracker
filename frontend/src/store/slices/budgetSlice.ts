import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

export interface BudgetCategory {
  _id?: string;
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM format
}

interface BudgetState {
  budgets: BudgetCategory[];
  currentMonth: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
  status: 'idle',
  error: null,
};

export const createBudget = createAsyncThunk<
  BudgetCategory,
  {
    category: string;
    amount: number;
    startDate: Date;
    endDate: Date;
    period?: string;
  },
  { state: RootState}
>(
  'budget/create',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.post('/api/budget', formData, {
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
      return rejectWithValue(error.response?.data?.message || 'Budget creation failed');
    }
  }
);

export const updateBudget = createAsyncThunk<
  BudgetCategory,
  { id: string; category: string; limit: number; month: string },
  { state: RootState }
>(
  'budget/update',
  async (budget, { getState, rejectWithValue}) => {
    try {
      const token = getState().auth.token;
      const res = await axios.put(`/api/budget/${budget.id}`, budget, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const item = res.data;
      const transformed = {
        id: item._id,
        category: item.category,
        limit: item.amount,
        spent: 0,
        month: item.startDate.slice(0, 7),
      };
      return transformed;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

export const deleteBudget = createAsyncThunk<
  string,
  string,
  { state: RootState }
>(
  'budget/delete',
  async (budgetId, { getState, rejectWithValue}) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`/api/budget/${budgetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return budgetId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Deletion failed');
    }
  }
);

export const fetchBudget = createAsyncThunk<BudgetCategory[], void, { state: RootState }>(
  'budget/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get('/api/budget', {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      const transformed = res.data.map((item: any) => ({
        id: item._id,
        category: item.category,
        limit: item.amount,
        spent: 0,
        month: item.startDate.slice(0, 7), 
      }));

      return transformed;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budgets');
    }
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setCurrentMonth: (state, action: PayloadAction<string>) => {
      state.currentMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBudget.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action: PayloadAction<BudgetCategory>) => {
        state.status = 'succeeded';
        state.budgets.push(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateBudget.fulfilled, (state, action: PayloadAction<BudgetCategory>) => {
        const index = state.budgets.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(deleteBudget.fulfilled, (state, action: PayloadAction<string>) => {
        state.budgets = state.budgets.filter(b => b.id !== action.payload);
      })
      .addCase(fetchBudget.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBudget.fulfilled, (state, action: PayloadAction<BudgetCategory[]>) => {
        state.status = 'succeeded';
        state.budgets = action.payload;
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { setCurrentMonth } = budgetSlice.actions;
export default budgetSlice.reducer;