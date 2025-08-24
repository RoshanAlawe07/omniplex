'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';

// Mock billing data - in real app, this would come from Stripe API
const mockBillingHistory = [
  {
    id: 'pi_1234567890',
    date: '2024-01-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2024-001'
  },
  {
    id: 'pi_0987654321',
    date: '2024-01-01',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2024-002'
  },
  {
    id: 'pi_1122334455',
    date: '2023-12-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2023-015'
  },
  {
    id: 'pi_1122334456',
    date: '2023-11-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2023-014'
  },
  {
    id: 'pi_1122334457',
    date: '2023-10-15',
    amount: '$12.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription (Price Increase)',
    invoice: 'INV-2023-013'
  },
  {
    id: 'pi_1122334458',
    date: '2023-09-15',
    amount: '$12.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription (Price Increase)',
    invoice: 'INV-2023-012'
  },
  {
    id: 'pi_1122334459',
    date: '2023-08-15',
    amount: '$12.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription (Price Increase)',
    invoice: 'INV-2023-011'
  },
  {
    id: 'pi_1122334460',
    date: '2023-07-15',
    amount: '$12.00',
    status: 'failed',
    description: 'Pro Plan - Monthly Subscription (Payment Failed)',
    invoice: 'INV-2023-010'
  },
  {
    id: 'pi_1122334461',
    date: '2023-06-15',
    amount: '$12.00',
    status: 'pending',
    description: 'Pro Plan - Monthly Subscription (Processing)',
    invoice: 'INV-2023-009'
  },
  {
    id: 'pi_1122334462',
    date: '2023-05-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2023-008'
  },
  {
    id: 'pi_1122334463',
    date: '2023-04-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2023-007'
  },
  {
    id: 'pi_1122334464',
    date: '2023-03-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2023-006'
  },
  {
    id: 'pi_1122334465',
    date: '2023-02-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2023-005'
  },
  {
    id: 'pi_1122334466',
    date: '2023-01-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2023-004'
  },
  {
    id: 'pi_1122334467',
    date: '2022-12-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2022-015'
  },
  {
    id: 'pi_1122334468',
    date: '2022-11-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2022-014'
  },
  {
    id: 'pi_1122334469',
    date: '2022-10-15',
    amount: '$10.00',
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
    invoice: 'INV-2022-013'
  }
];

export default function BillingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const userDetails = useSelector((state: any) => state.auth.userDetails);

  // Filter billing history based on selected period
  const getFilteredBillingHistory = () => {
    const now = new Date();
    const filteredData = mockBillingHistory.filter(payment => {
      const paymentDate = new Date(payment.date);
      
      switch (selectedPeriod) {
        case '30':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return paymentDate >= thirtyDaysAgo;
        case '90':
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return paymentDate >= ninetyDaysAgo;
        case '365':
          const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return paymentDate >= oneYearAgo;
        default:
          return true; // 'all' - show everything
      }
    });
    
    return filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredHistory = getFilteredBillingHistory();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.paid;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!userDetails?.isPro) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Billing History</h1>
            <p className="text-gray-600 mb-6">Upgrade to Pro to access your billing history and manage your subscription.</p>
            <Link 
              href="/pricing"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              🚀 Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
              <p className="text-gray-600 mt-2">Manage your subscription and view payment history</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/pricing"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                📋 Manage Plan
              </Link>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                📄 Download Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
              <p className="text-gray-600">Pro Plan - $10/month</p>
              <p className="text-sm text-gray-500">Next billing date: February 1, 2024</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">$10.00</div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredHistory.length}
              </div>
              <div className="text-sm text-gray-600">Total Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${filteredHistory.reduce((total, payment) => {
                  const amount = parseFloat(payment.amount.replace('$', ''));
                  return total + amount;
                }, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredHistory.filter(p => p.status === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {selectedPeriod === 'all' ? 'All Time' : 
                 selectedPeriod === '30' ? 'Last 30 Days' :
                 selectedPeriod === '90' ? 'Last 90 Days' : 'Last Year'}
              </div>
              <div className="text-sm text-gray-600">Time Period</div>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredHistory.length} payments
                  {selectedPeriod !== 'all' && (
                    <span> in the last {selectedPeriod === '30' ? '30 days' : selectedPeriod === '90' ? '90 days' : 'year'}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black bg-white"
                >
                  <option value="all" className="text-black bg-white">All Time</option>
                  <option value="30" className="text-black bg-white">Last 30 Days</option>
                  <option value="90" className="text-black bg-white">Last 90 Days</option>
                  <option value="365" className="text-black bg-white">Last Year</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.invoice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">No payments found</p>
                        <p className="text-gray-600">No payments match the selected time period.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                💳
              </div>
              <span className="text-sm text-gray-600">•••• •••• •••• 4242</span>
            </div>
            <span className="text-xs text-gray-500">Expires 12/25</span>
            <button className="text-sm text-blue-600 hover:text-blue-900 transition-colors">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
