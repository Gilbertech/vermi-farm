import React from 'react';
import { Users, Users2, CheckCircle, DollarSign, TrendingUp, TrendingDown, Wallet,  XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from './StatCard';

const Dashboard: React.FC = () => {
  const { stats } = useApp();

  const statCards = [
    {
      title: 'Registered Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'blue',
      trend: '+12%'
    },
    {
      title: 'Groups',
      value: stats.totalGroups.toString(),
      icon: Users2,
      color: 'purple',
      trend: '+8%'
    },
    {
      title: 'Transactions Completed',
      value: stats.completedTransactions.toString(),
      icon: CheckCircle,
      color: 'green',
      trend: '+23%'
    },
    {
      title: 'Total Amount Transacted',
      value: `KES ${stats.totalTransacted.toLocaleString()}`,
      icon: DollarSign,
      color: 'indigo',
      trend: '+18%'
    },
    {
      title: 'Total Loan Disbursed',
      value: `KES ${stats.totalLoanDisbursed.toLocaleString()}`,
      icon: TrendingUp,
      color: 'orange',
      trend: '+15%'
    },
   
    {
      title: 'Total Amount Earned',
      value: `KES ${stats.totalEarned.toLocaleString()}`,
      icon: Wallet,
      color: 'emerald',
      trend: '+25%'
    },
     title: 'Total Amount Earned',
      value: `KES ${stats.totalEarned.toLocaleString()}`,
      icon: Wallet,
      color: 'emerald',
      trend: '+25%'

  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">New user registered</span>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Loan disbursed</span>
              </div>
              <span className="text-xs text-gray-500">5 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">New group created</span>
              </div>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Health</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Gateway</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-xs text-gray-500">30 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;