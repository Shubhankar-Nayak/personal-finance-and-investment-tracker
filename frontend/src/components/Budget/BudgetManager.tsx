import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { setBudget, deleteBudget, setCurrentMonth } from '../../store/slices/budgetSlice';
import { Plus, Target, AlertTriangle, Edit, Trash2, Calendar } from 'lucide-react';

const BudgetManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { budgets, currentMonth } = useAppSelector(state => state.budget);
  const { transactions, categories } = useAppSelector(state => state.transactions);
  const { darkMode } = useAppSelector(state => state.ui);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string>('');
  const [formData, setFormData] = useState({ category: '', limit: 0 });

  const currentMonthBudgets = useMemo(() => {
    return budgets.filter(b => b.month === currentMonth);
  }, [budgets, currentMonth]);

  const spentByCategory = useMemo(() => {
    const spent: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.date.startsWith(currentMonth)) {
        spent[transaction.category] = (spent[transaction.category] || 0) + transaction.amount;
      }
    });
    
    return spent;
  }, [transactions, currentMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category && formData.limit > 0) {
      dispatch(setBudget({
        category: formData.category,
        limit: formData.limit,
        month: currentMonth,
      }));
      setFormData({ category: '', limit: 0 });
      setEditingBudget('');
      setShowForm(false);
    }
  };

  const handleEdit = (budget: any) => {
    setFormData({ category: budget.category, limit: budget.limit });
    setEditingBudget(budget.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      dispatch(deleteBudget(id));
    }
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getProgressPercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const totalBudget = currentMonthBudgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = Object.values(spentByCategory).reduce((sum, amount) => sum + amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Budget Manager
          </h1>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Set spending limits and track your progress
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Month Selector */}
          <div className="relative">
            <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => dispatch(setCurrentMonth(e.target.value))}
              className={`
                pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
              `}
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Budget</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`
          p-6 rounded-xl shadow-sm border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Budget
              </p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${totalBudget.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`
          p-6 rounded-xl shadow-sm border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Spent
              </p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                ${totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`
          p-6 rounded-xl shadow-sm border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Remaining
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${remainingBudget.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              remainingBudget >= 0 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className={`
          p-6 rounded-xl shadow-sm border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingBudget ? 'Edit Budget' : 'Add New Budget'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`
                    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Budget Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit || ''}
                  onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) || 0 })}
                  className={`
                    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                  `}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBudget('');
                  setFormData({ category: '', limit: 0 });
                }}
                className={`
                  px-4 py-2 border rounded-lg font-medium transition-colors
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                {editingBudget ? 'Update Budget' : 'Add Budget'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      <div className={`
        rounded-xl shadow-sm border
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="p-6">
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Budget Categories ({currentMonthBudgets.length})
          </h2>
          
          {currentMonthBudgets.length > 0 ? (
            <div className="space-y-4">
              {currentMonthBudgets.map((budget) => {
                const spent = spentByCategory[budget.category] || 0;
                const progress = getProgressPercentage(spent, budget.limit);
                const isOverBudget = spent > budget.limit;
                
                return (
                  <div
                    key={budget.id}
                    className={`
                      p-6 rounded-lg border transition-all duration-200
                      ${isOverBudget 
                        ? darkMode 
                          ? 'bg-red-900 border-red-700' 
                          : 'bg-red-50 border-red-200'
                        : darkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {isOverBudget && (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {budget.category}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ${spent.toLocaleString()} of ${budget.limit.toLocaleString()} spent
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${
                          isOverBudget ? 'text-red-600' : darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {progress.toFixed(1)}%
                        </span>
                        
                        <button
                          onClick={() => handleEdit(budget)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                          }`}
                          title="Edit budget"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`w-full bg-gray-200 rounded-full h-3 ${darkMode ? 'bg-gray-600' : ''}`}>
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(spent, budget.limit)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    {isOverBudget && (
                      <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <p className="text-sm text-red-700 font-medium">
                            Over budget by ${(spent - budget.limit).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No budgets set</h3>
              <p className="text-sm">Create your first budget to start tracking your spending limits</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;