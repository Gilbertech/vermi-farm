import React, { useState } from 'react';
import { 
  Shield, 
  CloudRain, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Info,
  Plus,
  Eye,
  DollarSign,
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import MsaidiziInsurance from "./MsaidiziInsurance";

export default function App() {
  return (
    <div>
      <MsaidiziInsurance />
    </div>
  );
}

interface InsuranceCover {
  id: string;
  farmLocation: string;
  cropType: string;
  coverageAmount: number;
  premium: number;
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate: string;
  weatherTrigger: {
    rainfall: { min: number; max: number };
    temperature: { min: number; max: number };
  };
}

interface Claim {
  id: string;
  coverId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  submittedDate: string;
  weatherData: {
    rainfall: number;
    temperature: number;
    date: string;
  };
  payoutDate?: string;
}

const MsaidiziInsurance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'enroll' | 'status' | 'claims' | 'learn'>('status');
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  // Mock data
  const userCovers: InsuranceCover[] = [
    {
      id: 'IC001',
      farmLocation: 'Thika, Kiambu County',
      cropType: 'Maize',
      coverageAmount: 50000,
      premium: 2500,
      status: 'active',
      startDate: '2024-03-01',
      endDate: '2024-08-31',
      weatherTrigger: {
        rainfall: { min: 200, max: 800 },
        temperature: { min: 18, max: 28 }
      }
    }
  ];

  const userClaims: Claim[] = [
    {
      id: 'CL001',
      coverId: 'IC001',
      amount: 15000,
      status: 'approved',
      submittedDate: '2024-07-15',
      weatherData: {
        rainfall: 150,
        temperature: 32,
        date: '2024-07-10'
      },
      payoutDate: '2024-07-20'
    }
  ];

  const weatherData = {
    currentWeek: {
      rainfall: 45,
      temperature: 24,
      humidity: 68,
      windSpeed: 12
    },
    forecast: [
      { date: '2024-08-12', rainfall: 15, temp: 26, risk: 'low' },
      { date: '2024-08-13', rainfall: 75, temp: 22, risk: 'medium' },
      { date: '2024-08-14', rainfall: 120, temp: 19, risk: 'high' }
    ]
  };

  const renderEnrollSection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">Weather-Indexed Insurance</h3>
        </div>
        <p className="text-green-700 mb-4">
          Protect your farm against weather risks with our data-driven insurance coverage.
          Get automatic payouts when weather conditions exceed your coverage thresholds.
        </p>
        <button 
          onClick={() => setShowEnrollForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Enroll New Cover
        </button>
      </div>

      {showEnrollForm && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">New Insurance Enrollment</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Farm Location</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., Thika, Kiambu County"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Crop Type</label>
              <select className="w-full p-2 border rounded-lg">
                <option>Select crop</option>
                <option>Maize</option>
                <option>Beans</option>
                <option>Tomatoes</option>
                <option>Kale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Coverage Amount (KES)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Farm Size (Acres)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg"
                placeholder="2"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Calculate Premium
            </button>
            <button 
              onClick={() => setShowEnrollForm(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStatusSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Active Covers</span>
          </div>
          <span className="text-2xl font-bold text-blue-900">
            {userCovers.filter(c => c.status === 'active').length}
          </span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Total Coverage</span>
          </div>
          <span className="text-2xl font-bold text-green-900">
            KES {userCovers.reduce((sum, c) => sum + c.coverageAmount, 0).toLocaleString()}
          </span>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-800">Weather Risk</span>
          </div>
          <span className="text-2xl font-bold text-orange-900">Medium</span>
        </div>
      </div>

      {userCovers.map(cover => (
        <div key={cover.id} className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">Coverage #{cover.id}</h3>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {cover.farmLocation} - {cover.cropType}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              cover.status === 'active' ? 'bg-green-100 text-green-700' :
              cover.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {cover.status.charAt(0).toUpperCase() + cover.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-500">Coverage Amount</span>
              <p className="font-semibold">KES {cover.coverageAmount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Premium Paid</span>
              <p className="font-semibold">KES {cover.premium.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Coverage Period</span>
              <p className="font-semibold">{cover.startDate} to {cover.endDate}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Weather Triggers</span>
              <p className="font-semibold text-sm">
                Rain: {cover.weatherTrigger.rainfall.min}-{cover.weatherTrigger.rainfall.max}mm<br/>
                Temp: {cover.weatherTrigger.temperature.min}-{cover.weatherTrigger.temperature.max}°C
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Current Weather Conditions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Rainfall: {weatherData.currentWeek.rainfall}mm</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm">Temp: {weatherData.currentWeek.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Humidity: {weatherData.currentWeek.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-green-500" />
                <span className="text-sm">Wind: {weatherData.currentWeek.windSpeed}km/h</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderClaimsSection = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Claims History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Claim ID</th>
                <th className="text-left py-2">Coverage</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date Submitted</th>
                <th className="text-left py-2">Weather Data</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {userClaims.map(claim => (
                <tr key={claim.id} className="border-b">
                  <td className="py-3">{claim.id}</td>
                  <td className="py-3">{claim.coverId}</td>
                  <td className="py-3">KES {claim.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      claim.status === 'paid' ? 'bg-green-100 text-green-700' :
                      claim.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3">{claim.submittedDate}</td>
                  <td className="py-3">
                    <div className="text-sm">
                      <div>Rain: {claim.weatherData.rainfall}mm</div>
                      <div>Temp: {claim.weatherData.temperature}°C</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Weather Alert</span>
        </div>
        <p className="text-yellow-700">
          Weather forecast shows potential trigger conditions for your active coverage.
          Claims will be processed automatically if conditions exceed your thresholds.
        </p>
      </div>
    </div>
  );

  const renderLearnSection = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">How Weather-Indexed Insurance Works</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CloudRain className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">Weather Monitoring</h4>
              <p className="text-gray-600">
                We continuously monitor weather conditions at your farm location using satellite data and local weather stations.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Automatic Triggers</h4>
              <p className="text-gray-600">
                When weather conditions exceed your coverage thresholds (too much rain, drought, extreme temperatures), claims are triggered automatically.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium">Fast Payouts</h4>
              <p className="text-gray-600">
                No need to file traditional claims or wait for assessors. Payouts are processed automatically within 48 hours of trigger events.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Coverage Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Rainfall Coverage</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Drought protection (insufficient rainfall)</li>
              <li>• Flood protection (excessive rainfall)</li>
              <li>• Customizable thresholds based on crop needs</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Temperature Coverage</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Heat stress protection</li>
              <li>• Cold damage protection</li>
              <li>• Critical growth period coverage</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-800 mb-4">Why Choose Msaidizi Insurance?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-800">Affordable Premiums</h4>
            <p className="text-sm text-green-700">Starting from just 5% of coverage amount</p>
          </div>
          <div className="text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-800">Quick Payouts</h4>
            <p className="text-sm text-green-700">Automatic processing within 48 hours</p>
          </div>
          <div className="text-center">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-800">Reliable Coverage</h4>
            <p className="text-sm text-green-700">Based on accurate satellite weather data</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-7 w-7 text-green-600" />
                My Vermi-Farm Msaidizi Insurance
              </h1>
              <p className="text-gray-600 mt-1">Weather-indexed crop insurance for your farm</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Cover
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white border rounded-lg mb-6">
          <div className="flex border-b">
            {[
              { key: 'status', label: 'My Cover Status', icon: Eye },
              { key: 'enroll', label: 'Enroll or Manage Cover', icon: Plus },
              { key: 'claims', label: 'Claims and Payout Info', icon: FileText },
              { key: 'learn', label: 'Learn About Insurance', icon: Info }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'enroll' && renderEnrollSection()}
          {activeTab === 'status' && renderStatusSection()}
          {activeTab === 'claims' && renderClaimsSection()}
          {activeTab === 'learn' && renderLearnSection()}
        </div>
      </div>
    </div>
  );
};

export default MsaidiziInsurance;