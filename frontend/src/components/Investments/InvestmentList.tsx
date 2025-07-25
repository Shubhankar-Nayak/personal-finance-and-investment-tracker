import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { deleteInvestment, fetchInvestments, Investment } from '../../store/slices/investmentSlice';
import { Plus, TrendingUp, TrendingDown, Edit, Trash2, DollarSign } from 'lucide-react';
import InvestmentForm from './InvestmentForm';

const InvestmentList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { investments } = useAppSelector(state => state.investments);
  const { darkMode } = useAppSelector(state => state.ui);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  useEffect(() => {
    dispatch(fetchInvestments());
  }, [dispatch]);

  const portfolioData = useMemo(() => {
    const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const totalCost = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
    
    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercentage,
    };
  }, [investments]);

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      dispatch(deleteInvestment(id));
      dispatch(fetchInvestments());
    }
  };

  const handleAddNew = () => {
    setEditingInvestment(null);
    setShowForm(true);
  };

  const getInvestmentProfitLoss = (investment: Investment) => {
    const currentValue = investment.quantity * investment.currentPrice;
    const purchaseValue = investment.quantity * investment.purchasePrice;
    const profitLoss = currentValue - purchaseValue;
    const profitLossPercentage = purchaseValue > 0 ? (profitLoss / purchaseValue) * 100 : 0;
    
    return { profitLoss, profitLossPercentage };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return '📈';
      case 'crypto':
        return '₿';
      case 'mutual_fund':
        return '🏛️';
      default:
        return '💰';
    }
  };

  if (showForm) {
    return (
      <InvestmentForm
        investment={editingInvestment}
        onClose={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Investments
          </h1>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your investment portfolio and performance
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Investment</span>
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`
          p-6 rounded-xl shadow-sm border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Portfolio Value
              </p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${portfolioData.totalValue.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
              <DollarSign className="w-6 h-6" />
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
                Total Cost
              </p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${portfolioData.totalCost.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
              <DollarSign className="w-6 h-6" />
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
                Total P&L
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                portfolioData.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${portfolioData.totalProfitLoss.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              portfolioData.totalProfitLoss >= 0 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {portfolioData.totalProfitLoss >= 0 ? 
                <TrendingUp className="w-6 h-6" /> : 
                <TrendingDown className="w-6 h-6" />
              }
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
                Total Return
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                portfolioData.totalProfitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {portfolioData.totalProfitLossPercentage.toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              portfolioData.totalProfitLossPercentage >= 0 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {portfolioData.totalProfitLossPercentage >= 0 ? 
                <TrendingUp className="w-6 h-6" /> : 
                <TrendingDown className="w-6 h-6" />
              }
            </div>
          </div>
        </div>
      </div>

      {/* Investment List */}
      <div className={`
        rounded-xl shadow-sm border
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="p-6">
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Investments ({investments.length})
          </h2>
          
          {investments.length > 0 ? (
            <div className="space-y-4">
              {investments.map((investment) => {
                const { profitLoss, profitLossPercentage } = getInvestmentProfitLoss(investment);
                const currentValue = investment.quantity * investment.currentPrice;
                
                return (
                  <div
                    key={investment.id}
                    className={`
                      p-6 rounded-lg border transition-all duration-200 hover:shadow-md
                      ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {getTypeIcon(investment.type)}
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {investment.symbol.toUpperCase()}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {investment.name}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {investment.type.replace('_', ' ').toUpperCase()} • {investment.quantity} shares
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${currentValue.toLocaleString()}
                        </p>
                        <p className={`text-sm ${
                          profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()} 
                          ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ${investment.currentPrice.toFixed(2)} per share
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(investment)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                          }`}
                          title="Edit investment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(investment.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete investment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Purchase Price</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${investment.purchasePrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Price</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${investment.currentPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quantity</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {investment.quantity}
                          </p>
                        </div>
                        <div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Purchase Date</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(investment.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No investments yet</h3>
              <p className="text-sm">Start building your portfolio by adding your first investment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentList;