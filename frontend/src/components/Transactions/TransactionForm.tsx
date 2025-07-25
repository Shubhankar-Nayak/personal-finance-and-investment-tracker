import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { fetchTransactions, createTransaction, updateTransaction, addCategory, Transaction } from '../../store/slices/transactionSlice';
import { ArrowLeft, Save, DollarSign, Calendar, Tag, FileText } from 'lucide-react';

interface TransactionFormData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onClose }) => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(state => state.transactions);
  const { darkMode } = useAppSelector(state => state.ui);

  const { register, handleSubmit, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: transaction ? {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
    } : {
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
    }
  });


  const onSubmit = (data: TransactionFormData) => {
    if (transaction?._id) {
      dispatch(updateTransaction({
        id: transaction._id,
        createdAt: transaction.createdAt,
        ...data,
      }));
      dispatch(fetchTransactions());
    } else {
      dispatch(createTransaction(data));
    }
    dispatch(fetchTransactions());
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
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {transaction ? 'Update your transaction details' : 'Record a new income or expense'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className={`
          p-8 rounded-xl shadow-sm border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          {/* Transaction Type */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative cursor-pointer">
                <input
                  {...register('type', { required: 'Transaction type is required' })}
                  type="radio"
                  value="income"
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
                  <span className="font-medium">Income</span>
                </div>
              </label>
              
              <label className="relative cursor-pointer">
                <input
                  {...register('type', { required: 'Transaction type is required' })}
                  type="radio"
                  value="expense"
                  className="sr-only peer"
                />
                <div className={`
                  flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200
                  peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700
                  ${darkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-300 peer-checked:bg-red-900 peer-checked:text-red-300' 
                    : 'border-gray-300 bg-white text-gray-700'
                  }
                  hover:border-red-400
                `}>
                  <span className="font-medium">Expense</span>
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    ${errors.amount ? 'border-red-500' : ''}
                  `}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    ${errors.date ? 'border-red-500' : ''}
                  `}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="mt-6">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  ${errors.category ? 'border-red-500' : ''}
                `}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Description
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              <input
                {...register('description', { required: 'Description is required' })}
                type="text"
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                  ${errors.description ? 'border-red-500' : ''}
                `}
                placeholder="Enter transaction description"
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
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
              <span>{transaction ? 'Update Transaction' : 'Save Transaction'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;