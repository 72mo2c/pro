// ======================================
// Invoice Payment Tracking System - نظام تتبع مدفوعات الفواتير
// عرض شامل للمدفوعات الجزئية وحالات الفواتير
// ======================================

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { 
  FaFileInvoice, FaMoneyBillWave, FaClock, FaCheckCircle, 
  FaExclamationTriangle, FaEye, FaEdit, FaPlus, FaSearch,
  FaFilter, FaHistory, FaPercentage
} from 'react-icons/fa';

const InvoicePaymentTracking = () => {
  const { 
    salesInvoices, 
    customers, 
    products,
    payInvoiceAmount,
    addCashReceiptWithInvoiceLink,
    cashReceipts
  } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;
    return numericAmount.toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ج.م';
  };

  // فلترة الفواتير
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // الفواتير المؤهلة للعرض (الآجلة أو الجزئية أو غير المسددة)
  const eligibleInvoices = salesInvoices.filter(invoice => {
    return invoice.paymentType === 'deferred' || 
           invoice.paymentType === 'partial' || 
           invoice.remaining > 0;
  });

  // الفواتير المفلترة
  const filteredInvoices = eligibleInvoices.filter(invoice => {
    const customer = customers.find(c => c.id === parseInt(invoice.customerId));
    const customerName = customer ? customer.name : '';
    
    // البحث
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.id.toString().includes(searchQuery);
    
    // فلتر العميل
    const matchesCustomer = customerFilter === 'all' || 
                           invoice.customerId.toString() === customerFilter;
    
    // فلتر حالة الدفع
    const matchesStatus = paymentStatusFilter === 'all' || 
                         invoice.paymentStatus === paymentStatusFilter;
    
    // فلتر التاريخ
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const invoiceDate = new Date(invoice.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      if (fromDate && invoiceDate < fromDate) matchesDate = false;
      if (toDate && invoiceDate > toDate) matchesDate = false;
    }
    
    return matchesSearch && matchesCustomer && matchesStatus && matchesDate;
  });

  // إحصائيات سريعة
  const getStats = () => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = filteredInvoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const totalRemaining = filteredInvoices.reduce((sum, inv) => sum + (inv.remaining || 0), 0);
    
    const fullyPaid = filteredInvoices.filter(inv => inv.remaining <= 0).length;
    const partiallyPaid = filteredInvoices.filter(inv => inv.remaining > 0 && inv.paid > 0).length;
    const notPaid = filteredInvoices.filter(inv => inv.paid <= 0).length;
    
    return {
      totalAmount,
      totalPaid,
      totalRemaining,
      count: filteredInvoices.length,
      fullyPaid,
      partiallyPaid,
      notPaid
    };
  };

  const stats = getStats();

  // حساب نسبة الدفع
  const getPaymentProgress = (invoice) => {
    const total = invoice.total || 0;
    const paid = invoice.paid || 0;
    return total > 0 ? Math.round((paid / total) * 100) : 0;
  };

  // عرض تفاصيل الفاتورة والمدفوعات
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedInvoice.remaining) {
      showError('المبلغ المدخل غير صحيح');
      return;
    }

    try {
      // إضافة استلام نقدي مع ربط الفاتورة
      const receiptData = {
        fromType: 'customer',
        fromId: selectedInvoice.customerId,
        amount: amount,
        referenceNumber: `INV-${selectedInvoice.id}-PAY-${Date.now()}`,
        linkedInvoices: [
          {
            invoiceId: selectedInvoice.id,
            paymentAmount: amount
          }
        ],
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        description: `دفعة جزئية من فاتورة رقم ${selectedInvoice.id}`
      };

      await addCashReceiptWithInvoiceLink(receiptData);
      
      showSuccess(`تم استلام ${formatCurrency(amount)} وتحديث حالة الفاتورة`);
      setShowPaymentModal(false);
      setPaymentAmount('');
      
    } catch (error) {
      showError(`خطأ في معالجة الدفعة: ${error.message}`);
    }
  };

  // معالجة تغيير فلاتر
  const clearFilters = () => {
    setSearchQuery('');
    setCustomerFilter('all');
    setPaymentStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const canManagePayments = hasPermission('manage_treasury') || hasPermission('receive_payments');

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">تتبع مدفوعات الفواتير</h2>
        <p className="text-gray-600">إدارة شاملة للفواتير الآجلة والمدفوعات الجزئية</p>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-blue-700">{stats.count}</p>
            </div>
            <FaFileInvoice className="text-3xl text-blue-300" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">إجمالي المبلغ</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <FaMoneyBillWave className="text-2xl text-green-300" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">المبالغ المحصلة</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(stats.totalPaid)}</p>
            </div>
            <FaCheckCircle className="text-2xl text-green-300" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">المبلغ المتبقي</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(stats.totalRemaining)}</p>
            </div>
            <FaExclamationTriangle className="text-2xl text-red-300" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">مسددة بالكامل</p>
              <p className="text-lg font-bold text-green-700">{stats.fullyPaid}</p>
            </div>
            <FaCheckCircle className="text-2xl text-green-300" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">دفع جزئي</p>
              <p className="text-lg font-bold text-orange-700">{stats.partiallyPaid}</p>
            </div>
            <FaPercentage className="text-2xl text-orange-300" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">لم يتم الدفع</p>
              <p className="text-lg font-bold text-gray-700">{stats.notPaid}</p>
            </div>
            <FaClock className="text-2xl text-gray-300" />
          </div>
        </div>
      </div>

      {/* أدوات التصفية */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-12 gap-4">
          {/* البحث */}
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="رقم الفاتورة أو اسم العميل..."
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* فلتر العميل */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل العملاء</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* فلتر حالة الدفع */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الحالات</option>
              <option value="pending">لم يتم الدفع</option>
              <option value="partial">دفع جزئي</option>
              <option value="paid">مسددة بالكامل</option>
            </select>
          </div>

          {/* فلتر التاريخ - من */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* فلتر التاريخ - إلى */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* مسح الفلاتر */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              مسح
            </button>
          </div>
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">العميل</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">التاريخ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">المجموع</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">المدفوع</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">المتبقي</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">نسبة الدفع</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الحالة</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <FaFileInvoice className="mx-auto mb-2 text-3xl text-gray-300" />
                    <p>لا توجد فواتير مطابقة للفلاتر المحددة</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const customer = customers.find(c => c.id === parseInt(invoice.customerId));
                  const progress = getPaymentProgress(invoice);
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-blue-600">
                          #{invoice.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoice.paymentType === 'deferred' ? 'آجل' : 'جزئي'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{customer?.name || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500">{customer?.phone || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {new Date(invoice.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {formatCurrency(invoice.total || 0)}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">
                        {formatCurrency(invoice.paid || 0)}
                      </td>
                      <td className="px-4 py-3 text-center text-red-600 font-semibold">
                        {formatCurrency(invoice.remaining || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.paymentStatus === 'partial' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.paymentStatus === 'paid' ? 'مسددة' :
                           invoice.paymentStatus === 'partial' ? 'دفع جزئي' :
                           'لم يتم الدفع'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {canManagePayments && (
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="استلام دفعة"
                            >
                              <FaMoneyBillWave />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="عرض التفاصيل"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة تفاصيل الفاتورة والمدفوعات */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">تفاصيل فاتورة #{selectedInvoice.id}</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* معلومات الفاتورة */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">العميل</label>
                <p className="text-lg font-semibold">
                  {customers.find(c => c.id === parseInt(selectedInvoice.customerId))?.name || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">التاريخ</label>
                <p className="text-lg font-semibold">
                  {new Date(selectedInvoice.date).toLocaleDateString('ar-EG')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">المجموع</label>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(selectedInvoice.total || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">المدفوع</label>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(selectedInvoice.paid || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">المتبقي</label>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(selectedInvoice.remaining || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">الحالة</label>
                <p className="text-lg font-semibold">
                  {selectedInvoice.paymentStatus === 'paid' ? 'مسددة بالكامل' :
                   selectedInvoice.paymentStatus === 'partial' ? 'دفع جزئي' :
                   'لم يتم الدفع'}
                </p>
              </div>
            </div>

            {/* تاريخ المدفوعات */}
            {selectedInvoice.paymentHistory && selectedInvoice.paymentHistory.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FaHistory />
                  تاريخ المدفوعات
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {selectedInvoice.paymentHistory.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString('ar-EG')}
                        </p>
                        <p className="text-xs text-gray-400">{payment.reference}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* نموذج استلام دفعة جديدة */}
            {selectedInvoice.remaining > 0 && canManagePayments && (
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-3">استلام دفعة جديدة</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المبلغ (الحد الأقصى: {formatCurrency(selectedInvoice.remaining)})
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل المبلغ"
                      max={selectedInvoice.remaining}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleProcessPayment}
                      disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaMoneyBillWave className="inline ml-2" />
                      استلام
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePaymentTracking;