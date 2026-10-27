import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  X,
  Check,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, FeeItem, PaymentTransaction, FeeCategory, PaymentStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { exportFeeReceiptPDF, exportToCSV } from '../../utils/pdfExport';

interface FeeManagementProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  initialFeeItemId?: string | null;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
  currentUser,
  onShowToast,
  initialFeeItemId
}) => {
  const students = StorageService.getStudents();
  const allFees = StorageService.getFees();
  const transactions = StorageService.getTransactions();

  const isParent = currentUser.role === 'parent';
  const isAdmin = currentUser.role === 'admin';
  const isTeacher = currentUser.role === 'teacher';

  const linkedChild = students.find(s => s.id === currentUser.linkedStudentId) || students[0];

  const [activeTab, setActiveTab] = useState<'fees' | 'transactions'>('fees');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Modal state
  const [paymentModalFee, setPaymentModalFee] = useState<FeeItem | null>(() => {
    if (initialFeeItemId) {
      return allFees.find(f => f.id === initialFeeItemId) || null;
    }
    return null;
  });
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Receipt Modal state
  const [viewingReceipt, setViewingReceipt] = useState<PaymentTransaction | null>(null);

  // Filter fees
  let displayedFees = allFees;
  if (isParent && linkedChild) {
    displayedFees = allFees.filter(f => f.studentId === linkedChild.id);
  } else {
    if (categoryFilter !== 'All') {
      displayedFees = displayedFees.filter(f => f.category === categoryFilter);
    }
    if (statusFilter !== 'All') {
      displayedFees = displayedFees.filter(f => f.status === statusFilter);
    }
    if (searchQuery.trim()) {
      displayedFees = displayedFees.filter(f =>
        f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.class.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }

  // Filter transactions
  let displayedTransactions = transactions;
  if (isParent && linkedChild) {
    displayedTransactions = transactions.filter(t => t.studentId === linkedChild.id);
  }

  // Summary Metrics
  const totalAssessed = displayedFees.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPaid = displayedFees.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalAssessed - totalPaid);

  const handleOpenPayment = (fee: FeeItem) => {
    const balance = fee.totalAmount - fee.paidAmount;
    setPaymentModalFee(fee);
    setPaymentAmount(balance);
    setPaymentNotes(`Online fee settlement for ${fee.category}`);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalFee) return;

    const res = StorageService.recordPayment(
      paymentModalFee.id,
      Number(paymentAmount),
      paymentMethod,
      currentUser.name,
      paymentNotes
    );

    if (res.success && res.receipt) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      onShowToast('success', 'Payment Successful', res.message);
      setViewingReceipt(res.receipt);
      setPaymentModalFee(null);
    } else {
      onShowToast('error', 'Payment Error', res.message);
    }
  };

  const handleDownloadReceipt = (txn: PaymentTransaction) => {
    const fee = allFees.find(f => f.id === txn.feeItemId);
    exportFeeReceiptPDF(txn, fee);
    onShowToast('success', 'Receipt Downloaded', `Receipt #${txn.receiptNumber} saved.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-pink-600" />
            <span>School Fee &amp; Payment Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isParent
              ? `Demonstration fee structure, statements, and simulated payment receipt generator for ${linkedChild?.name}`
              : 'Institutional fee structure tracking, payment transactions, and collection reconciliations'}
          </p>
        </div>

        {/* Tab switch between Fee Structure and Transactions */}
        <div className="flex items-center gap-1.5 p-1 bg-pink-50/70 dark:bg-slate-800 rounded-xl border border-pink-100 dark:border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'fees'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Fee Structure ({displayedFees.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'transactions'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Payment Receipts ({displayedTransactions.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Assessed Fees</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            ${totalAssessed.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Annual academic session curriculum fees</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Settled / Paid</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ${totalPaid.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            {totalAssessed > 0 ? Math.round((totalPaid / totalAssessed) * 100) : 0}% cleared
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Outstanding Balance</span>
          <div className="mt-2 text-2xl font-bold font-mono text-pink-600 dark:text-pink-400">
            ${totalOutstanding.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {displayedFees.filter(f => f.status !== 'Paid').length} pending item(s)
          </span>
        </div>
      </div>

      {/* Educational Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/60 dark:border-pink-900/40 flex items-start gap-3 text-xs text-pink-950 dark:text-pink-200">
        <ShieldCheck className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Educational Internship Demonstration:</span>
          <p className="mt-0.5 opacity-90 leading-relaxed text-[11px]">
            Payment transactions in this portal are simulated locally using browser localStorage. 
            No real payment gateways or credit card charges occur.
          </p>
        </div>
      </div>

      {/* Tab 1: Fee Structure Table */}
      {activeTab === 'fees' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          
          {/* Filters for teachers/admin */}
          {!isParent && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[180px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search student or class..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="All">All Categories</option>
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="Transport Fee">Transport Fee</option>
                  <option value="Library Fee">Library Fee</option>
                  <option value="Sports Fee">Sports Fee</option>
                  <option value="Examination Fee">Examination Fee</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <span className="text-slate-400 font-mono">{displayedFees.length} fee record(s)</span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 pl-2">Student &amp; Class</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Total Assessed</th>
                  <th className="pb-3">Paid Amount</th>
                  <th className="pb-3">Outstanding Balance</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {displayedFees.map(fee => {
                  const balance = Math.max(0, fee.totalAmount - fee.paidAmount);
                  return (
                    <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pl-2">
                        <p className="font-bold text-slate-900 dark:text-white">{fee.studentName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{fee.class}</p>
                      </td>
                      <td className="py-3 font-medium">{fee.category}</td>
                      <td className="py-3 font-mono font-semibold">${fee.totalAmount}</td>
                      <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        ${fee.paidAmount}
                      </td>
                      <td className="py-3 font-mono font-bold text-pink-600 dark:text-pink-400">
                        ${balance}
                      </td>
                      <td className="py-3 font-mono text-slate-500">{fee.dueDate}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          fee.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : fee.status === 'Partial'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        {balance > 0 ? (
                          <button
                            onClick={() => handleOpenPayment(fee)}
                            className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            Pay Demo
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Cleared</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Transactions / Receipts History */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Electronic Payment Receipts Ledger
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 pl-2">Receipt #</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Payment Date</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Amount Paid</th>
                  <th className="pb-3">Payer</th>
                  <th className="pb-3 pr-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {displayedTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 font-mono font-bold text-pink-600 dark:text-pink-400">
                      {txn.receiptNumber}
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{txn.studentName}</td>
                    <td className="py-3 font-mono text-slate-500">{txn.paymentDate}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {txn.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${txn.amount}
                    </td>
                    <td className="py-3">{txn.paidBy}</td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingReceipt(txn)}
                          className="text-pink-600 dark:text-pink-400 hover:underline font-semibold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(txn)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-pink-600" />
                <span>Simulated Fee Payment</span>
              </h3>
              <button
                onClick={() => setPaymentModalFee(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-700 text-xs space-y-1">
                <p className="text-slate-500">Student: <strong>{paymentModalFee.studentName}</strong> ({paymentModalFee.class})</p>
                <p className="text-slate-500">Fee Category: <strong>{paymentModalFee.category}</strong></p>
                <p className="text-slate-500">
                  Outstanding Balance:{' '}
                  <strong className="text-pink-600 font-mono text-sm">
                    ${paymentModalFee.totalAmount - paymentModalFee.paidAmount}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount ($) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModalFee.totalAmount - paymentModalFee.paidAmount}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-bold font-mono focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
                >
                  <option value="UPI">UPI / Instant Transfer (GPay, PhonePe)</option>
                  <option value="Cash">Cash at School Counter</option>
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalFee(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-600/25 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Demo Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Payment Confirmed
              </span>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Fee Payment Acknowledgment</h3>
              <p className="text-xs text-slate-400 font-mono">Receipt #: {viewingReceipt.receiptNumber}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewingReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">${viewingReceipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-medium">{viewingReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid By:</span>
                <span className="font-medium">{viewingReceipt.paidBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-mono">{viewingReceipt.paymentDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleDownloadReceipt(viewingReceipt)}
                className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
