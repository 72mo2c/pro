// ======================================
// Simple Treasury Movement - حركة الخزينة المبسطة
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { 
  FaHistory, 
  FaMoneyBillWave, 
  FaUser, 
  FaBuilding,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDownload,
  FaEye,
  FaPrint
} from 'react-icons/fa';

const SimpleTreasuryMovement = () => {
  const { cashReceipts, cashDisbursements, treasuryBalance, customers, suppliers } = useData();
  const { hasPermission } = useAuth();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all'); // all, receipts, disbursements
  const [showBalance, setShowBalance] = useState(true);

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;
    return numericAmount.toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ج.م';
  };

  // دمج الإيصالات والمصروفات
  const allTransactions = useMemo(() => {
    const receipts = cashReceipts.map(r => ({
      ...r,
      transactionType: 'receipt',
      type: 'استلام',
      icon: <FaArrowUp className="text-green-500" />,
      amountColor: 'text-green-600',
      backgroundColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }));
    
    const disbursements = cashDisbursements.map(d => ({
      ...d,
      transactionType: 'disbursement',
      type: 'صرف',
      icon: <FaArrowDown className="text-red-500" />,
      amountColor: 'text-red-600',
      backgroundColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }));
    
    return [...receipts, ...disbursements];
  }, [cashReceipts, cashDisbursements]);

  // تصفية المعاملات
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];
    
    // تصفية حسب نوع المعاملة
    if (transactionType === 'receipts') {
      filtered = filtered.filter(t => t.transactionType === 'receipt');
    } else if (transactionType === 'disbursements') {
      filtered = filtered.filter(t => t.transactionType === 'disbursement');
    }
    
    // تصفية حسب التاريخ
    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }
    
    return filtered.sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00:00')) - new Date(a.date + ' ' + (a.time || '00:00:00')));
  }, [allTransactions, transactionType, startDate, endDate]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalReceipts = filteredTransactions
      .filter(t => t.transactionType === 'receipt')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
    const totalDisbursements = filteredTransactions
      .filter(t => t.transactionType === 'disbursement')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
    const netFlow = totalReceipts - totalDisbursements;
    
    return {
      totalReceipts,
      totalDisbursements,
      netFlow,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // الحصول على اسم الجهة
  const getEntityName = (transaction) => {
    if (transaction.fromName) return transaction.fromName;
    if (transaction.toName) return transaction.toName;
    if (transaction.fromType === 'customer' && transaction.fromId) {
      const customer = customers.find(c => c.id === transaction.fromId);
      return customer ? customer.name : 'عميل غير محدد';
    }
    if (transaction.toType === 'supplier' && transaction.toId) {
      const supplier = suppliers.find(s => s.id === transaction.toId);
      return supplier ? supplier.name : 'مورد غير محدد';
    }
    return 'غير محدد';
  };

  // تصدير البيانات
  const exportToCSV = () => {
    const csvContent = [
      ['التاريخ', 'النوع', 'المبلغ', 'الجهة', 'الوصف', 'طريقة الدفع', 'رقم مرجعي'].join(','),
      ...filteredTransactions.map(t => [
        t.date,
        t.type,
        t.amount,
        getEntityName(t),
        t.description || '',
        t.paymentMethod || '',
        t.referenceNumber || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `treasury_movement_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* رأس الصفحة */}
        <PageHeader 
          title="حركة الخزينة"
          subtitle={`سجل شامل لجميع المقبوضات والمدفوعات النقدية - الرصيد الحالي: ${formatCurrency(treasuryBalance)}`}
          actions={
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowBalance(!showBalance)}
              >
                <FaEye className="ml-2" />
                {showBalance ? 'إخفاء الرصيد' : 'إظهار الرصيد'}
              </Button>
              
              <Button
                variant="secondary"
                onClick={exportToCSV}
              >
                <FaDownload className="ml-2" />
                تصدير CSV
              </Button>
            </div>
          }
        />

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.transactionCount}</div>
              <div className="text-sm text-gray-600">إجمالي المعاملات</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {showBalance ? formatCurrency(stats.totalReceipts) : '••••••'}
              </div>
              <div className="text-sm text-gray-600">إجمالي المقبوضات</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {showBalance ? formatCurrency(stats.totalDisbursements) : '••••••'}
              </div>
              <div className="text-sm text-gray-600">إجمالي المدفوعات</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className={`text-2xl font-bold ${stats.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {showBalance ? formatCurrency(stats.netFlow) : '••••••'}
              </div>
              <div className="text-sm text-gray-600">صافي التدفق</div>
            </div>
          </Card>
        </div>

        {/* فلاتر البحث */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <FaFilter className="ml-2 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">فلاتر البحث</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من تاريخ
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع المعاملة
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع المعاملات</option>
                <option value="receipts">المقبوضات فقط</option>
                <option value="disbursements">المدفوعات فقط</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setTransactionType('all');
                }}
                className="w-full"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </Card>

        {/* جدول المعاملات */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ والوقت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الجهة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوصف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    طريقة الدفع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم مرجعي
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <FaHistory className="mx-auto text-4xl mb-4 text-gray-300" />
                      <p>لا توجد معاملات في الفترة المحددة</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <tr key={transaction.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{transaction.date}</div>
                          {transaction.time && (
                            <div className="text-gray-500 text-xs">{transaction.time}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {transaction.icon}
                          <span className={`mr-2 px-2 py-1 text-xs font-medium rounded-full ${transaction.backgroundColor} ${transaction.borderColor}`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${transaction.amountColor}`}>
                          {showBalance ? formatCurrency(transaction.amount) : '••••••'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {transaction.transactionType === 'receipt' ? 
                            <FaUser className="ml-2 text-blue-500" /> : 
                            <FaBuilding className="ml-2 text-purple-500" />
                          }
                          {getEntityName(transaction)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={transaction.description}>
                          {transaction.description || 'غير محدد'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.paymentMethod === 'cash' ? 'نقداً' :
                         transaction.paymentMethod === 'check' ? 'شيك' :
                         transaction.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={transaction.referenceNumber}>
                          {transaction.referenceNumber || '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ملاحظات */}
        <Card className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">ملاحظات حول نظام الخزينة الجديد:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• المقبوضات تضيف المبلغ إلى رصيد الخزينة مباشرة</li>
              <li>• المدفوعات تخصم المبلغ من رصيد الخزينة مباشرة</li>
              <li>• عند استلام من عميل مديون، يتم خصم المبلغ من دين العميل تلقائياً</li>
              <li>• المبيعات النقدية تضاف للخزينة فوراً عند الإنشاء</li>
              <li>• المبيعات الآجلة تسجل في أرصدة العملاء فقط</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SimpleTreasuryMovement;
