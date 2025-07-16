import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BudgetCategory {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM format
}

interface BudgetState {
  budgets: BudgetCategory[];
  currentMonth: string;
}

const initialState: BudgetState = {
  budgets: [],
  currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudget: (state, action: PayloadAction<{ category: string; limit: number; month: string }>) => {
      const existingIndex = state.budgets.findIndex(
        b => b.category === action.payload.category && b.month === action.payload.month
      );
      
      if (existingIndex !== -1) {
        state.budgets[existingIndex].limit = action.payload.limit;
      } else {
        state.budgets.push({
          id: Date.now().toString(),
          category: action.payload.category,
          limit: action.payload.limit,
          spent: 0,
          month: action.payload.month,
        });
      }
    },
    updateSpentAmount: (state, action: PayloadAction<{ category: string; amount: number; month: string }>) => {
      const budget = state.budgets.find(
        b => b.category === action.payload.category && b.month === action.payload.month
      );
      if (budget) {
        budget.spent = action.payload.amount;
      }
    },
    setCurrentMonth: (state, action: PayloadAction<string>) => {
      state.currentMonth = action.payload;
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(b => b.id !== action.payload);
    },
  },
});

export const { setBudget, updateSpentAmount, setCurrentMonth, deleteBudget } = budgetSlice.actions;
export default budgetSlice.reducer;