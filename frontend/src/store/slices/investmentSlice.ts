import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'mutual_fund';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  createdAt: string;
}

interface InvestmentState {
  investments: Investment[];
}

const initialState: InvestmentState = {
  investments: [],
};

const investmentSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    addInvestment: (state, action: PayloadAction<Omit<Investment, 'id' | 'createdAt'>>) => {
      const newInvestment: Investment = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.investments.push(newInvestment);
    },
    updateInvestment: (state, action: PayloadAction<Investment>) => {
      const index = state.investments.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.investments[index] = action.payload;
      }
    },
    deleteInvestment: (state, action: PayloadAction<string>) => {
      state.investments = state.investments.filter(i => i.id !== action.payload);
    },
    updateCurrentPrices: (state, action: PayloadAction<{ [symbol: string]: number }>) => {
      state.investments.forEach(investment => {
        if (action.payload[investment.symbol]) {
          investment.currentPrice = action.payload[investment.symbol];
        }
      });
    },
  },
});

export const { addInvestment, updateInvestment, deleteInvestment, updateCurrentPrices } = investmentSlice.actions;
export default investmentSlice.reducer;