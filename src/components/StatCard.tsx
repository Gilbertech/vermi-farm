import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'indigo' | 'orange' | 'red' | 'emerald';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    green: 'bg-green-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-500 text-white',
    emerald: 'bg-emerald-500 text-white'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">{trend}</span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;