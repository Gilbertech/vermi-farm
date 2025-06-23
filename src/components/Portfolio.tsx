import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Portfolio: React.FC = () => {
  const { stats, loans, transactions } = useApp();
  const [activeTab, setActiveTab] = useState<'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b'>('loan');

  const portfolioTabs = [
    { id: 'loan', label: 'Loan Portfolio', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue Portfolio', icon: DollarSign },
    { id: 'investment', label: 'Investment Portfolio', icon: BarChart3 },
    { id: 'expense', label: 'Expense Portfolio', icon: TrendingDown },
    { id: 'working', label: 'Working Account Portfolio', icon: Wallet },
    { id: 'b2b', label: 'B2B Holding Portfolio', icon: PieChart }
  ];

  const renderLoanPortfolio = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-green-600 font-medium">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">KES {stats.totalLoanDisbursed.toLocaleString()}</h3>
          <p className="text-gray-600">Total Disbursed</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">KES {stats.totalLoanRepaid.toLocaleString()}</h3>
          <p className="text-gray-600">Total Repaid</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-red-600 font-medium">-2%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{loans.filter(l => l.status === 'active').length}</h3>
          <p className="text-gray-600">Active Loans</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Loan Activities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loans.slice(0, 5).map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{loan.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">KES {loan.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      loan.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                      loan.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(loan.repaidAmount / loan.amount) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRevenuePortfolio = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES {stats.totalEarned.toLocaleString()}</h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES {(stats.totalEarned * 0.3).toLocaleString()}</h3>
          <p className="text-gray-600">Interest Income</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES {(stats.totalEarned * 0.1).toLocaleString()}</h3>
          <p className="text-gray-600">Service Fees</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES {(stats.totalEarned * 0.05).toLocaleString()}</h3>
          <p className="text-gray-600">Other Income</p>
        </div>
      </div>
    </div>
  );

  const renderGenericPortfolio = (title: string) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES 0</h3>
          <p className="text-gray-600">Total {title}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">0</h3>
          <p className="text-gray-600">Active Items</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">0%</h3>
          <p className="text-gray-600">Growth Rate</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-8">No {title.toLowerCase()} data available</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'loan':
        return renderLoanPortfolio();
      case 'revenue':
        return renderRevenuePortfolio();
      case 'investment':
        return renderGenericPortfolio('Investment');
      case 'expense':
        return renderGenericPortfolio('Expense');
      case 'working':
        return renderGenericPortfolio('Working Account');
      case 'b2b':
        return renderGenericPortfolio('B2B Holding');
      default:
        return renderLoanPortfolio();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Portfolio</h1>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {portfolioTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-[#2d8e41] text-[#2d8e41]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;