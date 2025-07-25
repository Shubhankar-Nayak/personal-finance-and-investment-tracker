import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { fetchInvestments, createInvestment, updateInvestment, Investment } from '../../store/slices/investmentSlice';
import { ArrowLeft, Save, DollarSign, Calendar, TrendingUp, Hash, FileText } from 'lucide-react';

interface InvestmentFormData {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'mutual_fund';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
}

interface InvestmentFormProps {
  investment?: Investment | null;
  onClose: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ investment, onClose }) => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector(state => state.ui);

  const { register, handleSubmit, formState: { errors } } = useForm<InvestmentFormData>({
    defaultValues: investment ? {
      symbol: investment.symbol,
      name: investment.name,
      type: investment.type,
      quantity: investment.quantity,
      purchasePrice: investment.purchasePrice,
      currentPrice: investment.currentPrice,
      purchaseDate: investment.purchaseDate,
    } : {
      symbol: '',
      name: '',
      type: 'stock',
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
      purchaseDate: new Date().toISOString().slice(0, 10),
    }
  });

  const onSubmit = (data: InvestmentFormData) => {
    if (investment?._id) {
      dispatch(updateInvestment({
        id: investment._id,
        createdAt: investment.createdAt,
        ...data,
      }));
      dispatch(fetchInvestments());
    } else {
      dispatch(createInvestment(data));
    }
    dispatch(fetchInvestments());
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {investment ? 'Edit Investment' : 'Add Investment'}
          </h1>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {investment ? 'Update your investment details' : 'Add a new investment to your portfolio'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className={`
          p-8 rounded-xl shadow-sm border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          {/* Investment Type */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Investment Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              <label className="relative cursor-pointer">
                <input
                  {...register('type', { required: 'Investment type is required' })}
                  type="radio"
                  value="stock"
                  className="sr-only peer"
                />
                <div className={`
                  flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200
                  peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700
                  ${darkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-300 peer-checked:bg-blue-900 peer-checked:text-blue-300' 
                    : 'border-gray-300 bg-white text-gray-700'
                  }
                  hover:border-blue-400
                `}>
                  <span className="font-medium">📈 Stock</span>
                </div>
              </label>
              
              <label className="relative cursor-pointer">
                <input
                  {...register('type', { required: 'Investment type is required' })}
                  type="radio"
                  value="crypto"
                  className="sr-only peer"
                />
                <div className={`
                  flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200
                  peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-700
                  ${darkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-300 peer-checked:bg-orange-900 peer-checked:text-orange-300' 
                    : 'border-gray-300 bg-white text-gray-700'
                  }
                  hover:border-orange-400
                `}>
                  <span className="font-medium">₿ Crypto</span>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input
                  {...register('type', { required: 'Investment type is required' })}
                  type="radio"
                  value="mutual_fund"
                  className="sr-only peer"
                />
                <div className={`
                  flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200
                  peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700
                  ${darkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-300 peer-checked:bg-green-900 peer-checked:text-green-300' 
                    : 'border-gray-300 bg-white text-gray-700'
                  }
                  hover:border-green-400
                `}>
                  <span className="font-medium">🏛️ Mutual Fund</span>
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symbol */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Symbol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingUp className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('symbol', { required: 'Symbol is required' })}
                  type="text"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    ${errors.symbol ? 'border-red-500' : ''}
                  `}
                  placeholder="AAPL, BTC, etc."
                />
              </div>
              {errors.symbol && (
                <p className="mt-1 text-sm text-red-600">{errors.symbol.message}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    ${errors.name ? 'border-red-500' : ''}
                  `}
                  placeholder="Apple Inc., Bitcoin, etc."
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Quantity */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Quantity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 0.001, message: 'Quantity must be greater than 0' }
                  })}
                  type="number"
                  step="0.001"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    ${errors.quantity ? 'border-red-500' : ''}
                  `}
                  placeholder="0.000"
                />
              </div>
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            {/* Purchase Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Purchase Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('purchaseDate', { required: 'Purchase date is required' })}
                  type="date"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    ${errors.purchaseDate ? 'border-red-500' : ''}
                  `}
                />
              </div>
              {errors.purchaseDate && (
                <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Purchase Price */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Purchase Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('purchasePrice', { 
                    required: 'Purchase price is required',
                    min: { value: 0.01, message: 'Purchase price must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    ${errors.purchasePrice ? 'border-red-500' : ''}
                  `}
                  placeholder="0.00"
                />
              </div>
              {errors.purchasePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>
              )}
            </div>

            {/* Current Price */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Current Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('currentPrice', { 
                    required: 'Current price is required',
                    min: { value: 0.01, message: 'Current price must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    ${errors.currentPrice ? 'border-red-500' : ''}
                  `}
                  placeholder="0.00"
                />
              </div>
              {errors.currentPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPrice.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`
                px-6 py-3 border rounded-lg font-medium transition-colors
                ${darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <Save className="w-5 h-5" />
              <span>{investment ? 'Update Investment' : 'Add Investment'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvestmentForm;