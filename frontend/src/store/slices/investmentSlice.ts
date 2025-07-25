import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

export interface Investment {
  _id?: string;
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

export const createInvestment = createAsyncThunk<
  Investment,
  Omit<Investment, 'id' | 'createdAt'>,
  { state: RootState }
>(
  'investments/create',
  async (FormData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.post('/api/investments', FormData, {
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
      return rejectWithValue(error.response?.data?.message || 'Investment creation failed');
    }
  }
);

export const updateInvestment = createAsyncThunk<
  Investment,
  Investment,
  { state: RootState}
>(
  'investments/update',
  async (investment, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.put(`/api/investments/${investment.id}`, investment, {
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

export const deleteInvestment = createAsyncThunk<
  string,
  string,
  { state: RootState }
>(
  'investments/delete',
  async (investmentId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`/api/investments/${investmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return investmentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  }
);

export const fetchInvestments = createAsyncThunk<Investment[], void, { state: RootState }>(
  'investments/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get('/api/investments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.map((t: any) => ({
        ...t,
        id: t._id,
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch investments');
    }
  }
);

const investmentSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    updateCurrentPrices: (state, action: PayloadAction<{ [symbol: string]: number }>) => {
      state.investments.forEach(investment => {
        if (action.payload[investment.symbol]) {
          investment.currentPrice = action.payload[investment.symbol];
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action: PayloadAction<Investment[]>) => {
        state.status = 'succeeded';
        state.investments = action.payload;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createInvestment.fulfilled, (state, action) => {
        state.investments.push(action.payload);
      })
      .addCase(updateInvestment.fulfilled, (state, action: PayloadAction<Investment>) => {
        const index = state.investments.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.investments[index] = action.payload;
        }
      })
      .addCase(deleteInvestment.fulfilled, (state, action: PayloadAction<string>) => {
        state.investments = state.investments.filter(i => i.id !== action.payload);
      });
  }
});

export const { updateCurrentPrices } = investmentSlice.actions;
export default investmentSlice.reducer;