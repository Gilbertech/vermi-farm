import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BulkPaymentsFormProps {
  onClose: () => void;
}

const BulkPaymentsForm: React.FC<BulkPaymentsFormProps> = ({ onClose }) => {
  const { currentUser, addNotification, canMakePayment } = useAuth();
  const [formData, setFormData] = useState({
    referenceLabel: '',
    scheduledDate: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Calculate total amount for notification
    const totalAmount = previewData.reduce((sum, item) => sum + item.amount, 0);
    
    if (canMakePayment()) {
      // Super admin can directly process bulk payments
      alert(`✅ Bulk payment of KES ${totalAmount.toLocaleString()} processed successfully! (${previewData.length} transactions)`);
    } else {
      // Initiators send notification to super admin
      if (currentUser) {
        addNotification({
          type: 'payment_initiated',
          message: `Bulk payment of KES ${totalAmount.toLocaleString()} requested (${previewData.length} transactions)`,
          initiatorName: currentUser.name,
          amount: totalAmount,
          actionType: 'payment',
          details: {
            paymentType: 'bulk',
            bulkCount: previewData.length,
            referenceLabel: formData.referenceLabel,
            scheduledDate: formData.scheduledDate
          }
        });
        
        alert(`📤 Bulk payment request sent to Super Admin for approval!\n\nTotal Amount: KES ${totalAmount.toLocaleString()}\nTransactions: ${previewData.length}\nReference: ${formData.referenceLabel || 'N/A'}`);
      }
    }
    
    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Mock preview data
      setPreviewData([
        { recipientName: 'John Doe', msisdn: '+254712345678', amount: 5000, paymentType: 'Single' },
        { recipientName: 'Jane Smith', msisdn: '+254787654321', amount: 3500, paymentType: 'Single' },
        { recipientName: 'Mike Johnson', msisdn: '+254798765432', amount: 7200, paymentType: 'Single' },
        { recipientName: 'Sarah Wilson', msisdn: '+254756789123', amount: 4200, paymentType: 'Single' },
        { recipientName: 'David Brown', msisdn: '+254723456789', amount: 6800, paymentType: 'Single' }
      ]);
    }
  };

  const totalAmount = previewData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Upload and schedule multiple payments easily.</h3>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload File
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#983F21] dark:hover:border-[#983F21] transition-colors duration-200 bg-white dark:bg-gray-800">
          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload or drag and drop
            </span>
            <br />
            <span className="text-xs text-gray-500 dark:text-gray-500">CSV or XLSX files only</span>
          </label>
          {uploadedFile && (
            <div className="mt-2 flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">{uploadedFile.name}</span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <button
            type="button"
            className="text-sm text-[#983F21] dark:text-orange-400 hover:text-[#7a3219] dark:hover:text-orange-300 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Download sample template</span>
          </button>
        </div>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reference Label (Optional)
          </label>
          <input
            type="text"
            name="referenceLabel"
            value={formData.referenceLabel}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter reference label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Scheduled Date (Optional)
          </label>
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Preview Table */}
      {previewData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview (First 5 entries)</h4>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recipient Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">MSISDN</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {previewData.map((item, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800">
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.recipientName}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.msisdn}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">KES {item.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.paymentType}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Valid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-white">KES {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !uploadedFile}
          className="flex-1 px-4 py-2 bg-[#983F21] text-white rounded-lg hover:bg-[#7a3219] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {canMakePayment() ? 'Processing...' : 'Sending Request...'}
            </div>
          ) : (
            canMakePayment() ? 'Submit Bulk Payment' : 'Send Request'
          )}
        </button>
      </div>
    </form>
  );
};

export default BulkPaymentsForm;