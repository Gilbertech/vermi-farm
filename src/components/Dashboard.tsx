import React from 'react';
import { Users, Users2, CheckCircle, DollarSign, TrendingUp, TrendingDown, Wallet, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from './StatCard';

const Dashboard: React.FC = () => {
  const { stats, transactions } = useApp();

  const failedTransactions = transactions.filter(t => t.status === 'failed').length;

  const statCards = [
    {
      title: 'Registered Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'blue' as const,
      trend: '+12%'
    },
    {
      title: 'Groups',
      value: stats.totalGroups.toString(),
      icon: Users2,
      color: 'purple' as const,
      trend: '+8%'
    },
    {
      title: 'Transactions Completed',
      value: stats.completedTransactions.toString(),
      icon: CheckCircle,
      color: 'green' as const,
      trend: '+23%'
    },
    {
      title: 'Total Amount Transacted',
      value: `KES ${stats.totalTransacted.toLocaleString()}`,
      icon: DollarSign,
      color: 'indigo' as const,
      trend: '+18%'
    },
    {
      title: 'Total Loan Disbursed',
      value: `KES ${stats.totalLoanDisbursed.toLocaleString()}`,
      icon: TrendingUp,
      color: 'orange' as const,
      trend: '+15%'
    },
    {
      title: 'Total Amount Earned',
      value: `KES ${stats.totalEarned.toLocaleString()}`,
      icon: Wallet,
      color: 'emerald' as const,
      trend: '+25%'
    },
    {
      title: 'Transactions Failed',
      value: failedTransactions.toString(),
      icon: XCircle,
      color: 'red' as const,
      trend: failedTransactions === 0 ? '0%' : `+${failedTransactions}`
    }
  ];

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">New user registered</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Loan disbursed</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">5 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">New group created</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">System Health</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payment Gateway</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">30 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;