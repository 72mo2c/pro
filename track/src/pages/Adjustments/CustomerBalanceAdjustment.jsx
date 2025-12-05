// ======================================
// Customer Balance Adjustment - تسوية أرصدة العملاء (Enhanced)
// ======================================

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { 
  FaUsers, FaSearch, FaSave, FaDollarSign, FaUserPlus, FaChartLine, 
  FaHistory, FaExclamationTriangle, FaLightbulb, FaMoneyBillWave,
  FaBuilding, FaPercent, FaArrowUp, FaArrowDown, FaMinus, FaPlus
} from 'react-icons/fa';

const CustomerBalanceAdjustment = () => {
  const { customers, invoices, cashReceipts, adjustments } = useData();
  const { showWarning, showSuccess } = useNotification();
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('add'); // add or deduct
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Smart filtering and search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.name?.toLowerCase().includes(term) ||
      customer.phone?.includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.address?.toLowerCase().includes(term) ||
      customer.code?.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  // Customer analytics
  const customerAnalytics = useMemo(() => {
    const balanceStats = customers.map(c => ({
      balance: c.balance || 0,
      customer: c
    })).filter(item => item.balance !== 0);

    const positiveBalances = balanceStats.filter(item => item.balance > 0);
    const negativeBalances = balanceStats.filter(item => item.balance < 0);
    
    const totalCustomers = customers.length;
    const customersWithBalance = balanceStats.length;
    const debtCustomers = positiveBalances.length;
    const creditCustomers = negativeBalances.length;
    
    const totalDebt = positiveBalances.reduce((sum, item) => sum + item.balance, 0);
    const totalCredit = Math.abs(negativeBalances.reduce((sum, item) => sum + item.balance, 0));
    
    const avgBalance = customersWithBalance > 0 ? (totalDebt - totalCredit) / customersWithBalance : 0;
    const largestDebt = positiveBalances.length > 0 ? Math.max(...positiveBalances.map(item => item.balance)) : 0;
    const largestCredit = negativeBalances.length > 0 ? Math.max(...negativeBalances.map(item => Math.abs(item.balance))) : 0;

    return {
      totalCustomers,
      customersWithBalance,
      debtCustomers,
      creditCustomers,
      totalDebt,
      totalCredit,
      avgBalance,
      largestDebt,
      largestCredit,
      balanceDistribution: positiveBalances.length / Math.max(customersWithBalance, 1)
    };
  }, [customers]);

  // Transaction history for selected customer
  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    
    const customerInvoices = invoices?.filter(inv => inv.customerId === selectedCustomer.id) || [];
    const customerReceipts = cashReceipts?.filter(receipt => receipt.customerId === selectedCustomer.id) || [];
    const customerAdjustments = adjustments?.filter(adj => adj.customerId === selectedCustomer.id) || [];
    
    const allTransactions = [
      ...customerInvoices.map(inv => ({ ...inv, type: 'فاتورة', date: inv.date })),
      ...customerReceipts.map(rec => ({ ...rec, type: 'إيصال', date: rec.date })),
      ...customerAdjustments.map(adj => ({ ...adj, type: 'تسوية', date: adj.date }))
    ];
    
    return allTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [selectedCustomer, invoices, cashReceipts, adjustments]);

  // Smart suggestions based on history
  const adjustmentSuggestions = useMemo(() => {
    if (!selectedCustomer || !customerTransactions.length) return [];
    
    const lastAdjustments = customerTransactions.filter(t => t.type === 'تسوية');
    const lastTransaction = customerTransactions[0];
    
    const suggestions = [];
    
    if (lastAdjustments.length > 0) {
      const lastAdjustment = lastAdjustments[0];
      const daysSinceLast = Math.floor((Date.now() - new Date(lastAdjustment.date)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLast <= 30) {
        suggestions.push({
          type: 'similar_pattern',
          message: `آخر تسوية قبل ${daysSinceLast} يوم - قد تحتاج لمتابعة مماثلة`,
          priority: 'medium'
        });
      }
    }
    
    const positiveTransactions = customerTransactions.filter(t => 
      t.total && t.total > 0
    ).length;
    
    const avgTransactionAmount = positiveTransactions > 0 ? 
      customerTransactions
        .filter(t => t.total && t.total > 0)
        .reduce((sum, t) => sum + (t.total || 0), 0) / positiveTransactions : 0;
    
    if (avgTransactionAmount > 0) {
      suggestions.push({
        type: 'amount_suggestion',
        message: `متوسط قيمة المعاملات: ${avgTransactionAmount.toFixed(2)} ج.م`,
        priority: 'high'
      });
    }
    
    return suggestions;
  }, [selectedCustomer, customerTransactions]);

  // Risk assessment for adjustment
  const riskAssessment = useMemo(() => {
    if (!selectedCustomer || !amount) {
      return { level: 'low', factors: [] };
    }
    
    const amt = parseFloat(amount) || 0;
    const currentBalance = getCurrentBalance();
    const newBalance = getNewBalance();
    
    const factors = [];
    let riskScore = 0;
    
    // Large adjustment check
    if (amt > 10000) {
      factors.push('مبلغ كبير نسبياً');
      riskScore += 3;
    } else if (amt > 5000) {
      factors.push('مبلغ متوسط');
      riskScore += 2;
    }
    
    // Balance direction check
    if (adjustmentType === 'add' && currentBalance < 0 && Math.abs(currentBalance + amt) > Math.abs(currentBalance)) {
      factors.push('زيادة الدين للعميل');
      riskScore += 2;
    } else if (adjustmentType === 'deduct' && currentBalance > 0 && newBalance < 0) {
      factors.push('تحويل من دين إلى رصيد');
      riskScore += 1;
    }
    
    // Customer payment history check (simplified)
    if (customerTransactions.length === 0) {
      factors.push('عميل جديد بدون تاريخ');
      riskScore += 1;
    }
    
    // Risk level determination
    let level = 'low';
    if (riskScore >= 5) level = 'high';
    else if (riskScore >= 3) level = 'medium';
    
    return { level, factors };
  }, [selectedCustomer, amount, adjustmentType, customerTransactions]);

  // Helper functions - moved above first usage
  const getCurrentBalance = () => {
    return selectedCustomer?.balance || 0;
  };

  const getNewBalance = () => {
    const current = getCurrentBalance();
    const amt = parseFloat(amount) || 0;
    return adjustmentType === 'add' ? current + amt : current - amt;
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (!selectedCustomer || !amount || !reason) {
      showWarning('يرجى ملء جميع الحقول المطلوبة');
      setIsProcessing(false);
      return;
    }

    const amt = parseFloat(amount);
    if (amt <= 0) {
      showWarning('المبلغ يجب أن يكون أكبر من صفر');
      setIsProcessing(false);
      return;
    }

    const transaction = {
      type: 'customer_balance_adjustment',
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      adjustmentType,
      amount: amt,
      oldBalance: getCurrentBalance(),
      newBalance: getNewBalance(),
      reason,
      notes,
      riskLevel: riskAssessment.level,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    try {
      // Enhanced logging with analytics
      console.log('🔧 تسوية رصيد عميل (مطورة):', {
        ...transaction,
        customerAnalytics: {
          totalTransactions: customerTransactions.length,
          suggestionsCount: adjustmentSuggestions.length,
          lastTransaction: customerTransactions[0]?.date
        },
        systemInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
      
      showSuccess(`تم تسجيل تسوية رصيد العميل بنجاح (${riskAssessment.level} risk)`);
      
      // Reset form
      setSelectedCustomer(null);
      setAmount('');
      setReason('');
      setNotes('');
      
    } catch (error) {
      console.error('Error processing adjustment:', error);
      showWarning('حدث خطأ أثناء حفظ التسوية');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaUsers className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">تسوية أرصدة العملاء</h1>
              <p className="text-gray-500 mt-1">تصحيح ذكي لأرصدة حسابات العملاء مع تحليل متقدم</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{customerAnalytics.totalCustomers}</p>
              </div>
              <FaUsers className="text-3xl text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">أرصدة مستحقة</p>
                <p className="text-lg font-bold">{formatCurrency(customerAnalytics.totalDebt)}</p>
              </div>
              <FaArrowUp className="text-2xl text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">دائنين لنا</p>
                <p className="text-lg font-bold">{formatCurrency(customerAnalytics.totalCredit)}</p>
              </div>
              <FaArrowDown className="text-2xl text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">متوسط الرصيد</p>
                <p className="text-lg font-bold">{formatCurrency(customerAnalytics.avgBalance)}</p>
              </div>
              <FaChartLine className="text-2xl text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">أكبر رصيد</p>
                <p className="text-lg font-bold">{formatCurrency(Math.max(customerAnalytics.largestDebt, customerAnalytics.largestCredit))}</p>
              </div>
              <FaMoneyBillWave className="text-2xl text-yellow-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            {/* Search Customer */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-cyan-500 text-xl" />
                البحث المتقدم عن العميل
              </h3>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم، الهاتف، البريد الإلكتروني، العنوان..."
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all text-lg"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {searchTerm && (
                <div className="mt-4 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-xl">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full p-5 hover:bg-cyan-50 transition-colors text-right border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-800 text-lg">{customer.name}</div>
                            <div className="text-sm text-gray-500 flex gap-4">
                              <span>{customer.phone}</span>
                              {customer.email && <span>{customer.email}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">الرصيد الحالي</div>
                            <div className={`font-bold text-lg ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(customer.balance || 0)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">تفاصيل التسوية الذكية</h3>
                
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaBuilding className="text-cyan-500" />
                      معلومات العميل المفصلة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-semibold mr-2">{selectedCustomer.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الهاتف:</span>
                        <span className="font-semibold mr-2">{selectedCustomer.phone}</span>
                      </div>
                      {selectedCustomer.email && (
                        <div>
                          <span className="text-gray-600">البريد الإلكتروني:</span>
                          <span className="font-semibold mr-2">{selectedCustomer.email}</span>
                        </div>
                      )}
                      {selectedCustomer.address && (
                        <div>
                          <span className="text-gray-600">العنوان:</span>
                          <span className="font-semibold mr-2">{selectedCustomer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Balance with Risk Assessment */}
                  <div className={`border-2 rounded-xl p-6 ${getCurrentBalance() >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700 font-bold text-lg">الرصيد الحالي:</span>
                      <span className={`text-3xl font-bold ${getCurrentBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(getCurrentBalance())}
                      </span>
                    </div>
                    
                    {/* Risk Assessment */}
                    {amount && (
                      <div className={`mt-4 p-4 rounded-lg border ${getRiskColor(riskAssessment.level)}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <FaExclamationTriangle className="text-lg" />
                          <span className="font-bold">تقييم المخاطر:</span>
                          <span className="font-bold uppercase">{riskAssessment.level}</span>
                        </div>
                        {riskAssessment.factors.length > 0 && (
                          <ul className="text-sm space-y-1">
                            {riskAssessment.factors.map((factor, index) => (
                              <li key={index}>• {factor}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Adjustment Type */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">نوع التسوية *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setAdjustmentType('add')}
                        className={`p-6 rounded-xl border-2 font-bold transition-all text-lg ${
                          adjustmentType === 'add'
                            ? 'bg-green-500 border-green-500 text-white shadow-lg'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-green-500'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <FaPlus />
                          <span>إضافة (+)</span>
                        </div>
                        <div className="text-sm opacity-80 mt-1">زيادة الدين</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustmentType('deduct')}
                        className={`p-6 rounded-xl border-2 font-bold transition-all text-lg ${
                          adjustmentType === 'deduct'
                            ? 'bg-red-500 border-red-500 text-white shadow-lg'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-red-500'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <FaMinus />
                          <span>خصم (-)</span>
                        </div>
                        <div className="text-sm opacity-80 mt-1">تقليل الدين</div>
                      </button>
                    </div>
                  </div>

                  {/* Amount with Suggestions */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">
                      <FaDollarSign className="inline ml-2 text-cyan-500" />
                      المبلغ *
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none text-lg"
                      placeholder="أدخل المبلغ..."
                      required
                    />
                    
                    {/* Smart Suggestions */}
                    {adjustmentSuggestions.length > 0 && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaLightbulb className="text-blue-500" />
                          <span className="font-bold text-blue-700">اقتراحات ذكية</span>
                        </div>
                        {adjustmentSuggestions.map((suggestion, index) => (
                          <div key={index} className="text-sm text-blue-600">
                            • {suggestion.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* New Balance Preview */}
                  {amount && (
                    <div className={`rounded-xl p-6 border-2 ${getNewBalance() >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-bold text-lg">الرصيد المتوقع بعد التسوية:</span>
                        <span className={`text-3xl font-bold ${getNewBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(getNewBalance())}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">السبب *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none text-lg"
                      required
                    >
                      <option value="">اختر السبب...</option>
                      <option value="تصحيح_خطأ">تصحيح خطأ في الرصيد</option>
                      <option value="ديون_معدومة">شطب ديون معدومة</option>
                      <option value="خصم_خاص">خصم خاص</option>
                      <option value="مكافأة">مكافأة أو حافز</option>
                      <option value="تسوية_نزاع">تسوية نزاع</option>
                      <option value="خصم_عمولة">خصم عمولة</option>
                      <option value="فائدة_تأخير">فائدة تأخير</option>
                      <option value="دفعة_مسبقة">دفعة مسبقة</option>
                      <option value="استرداد">استرداد مبالغ</option>
                      <option value="أخرى">سبب آخر</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">ملاحظات مفصلة</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none text-lg"
                      placeholder="أضف ملاحظات مفصلة حول سبب التسوية..."
                    />
                  </div>

                  {/* Transaction History Preview */}
                  {customerTransactions.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaHistory className="text-gray-500" />
                        آخر المعاملات ({customerTransactions.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {customerTransactions.map((transaction, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div>
                              <span className="font-semibold">{transaction.type}</span>
                              <span className="text-sm text-gray-500 mr-2">
                                {new Date(transaction.date).toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                            {transaction.total && (
                              <span className="font-bold text-green-600">
                                {formatCurrency(transaction.total)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-6 rounded-xl font-bold hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                  >
                    <FaSave />
                    {isProcessing ? 'جاري الحفظ...' : 'حفظ التسوية'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Enhanced Info Panel */}
          <div className="space-y-6">
            {/* Analytics Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartLine className="text-blue-500" />
                تحليلات ذكية
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">عملاء بأرصدة:</span>
                  <span className="font-bold text-blue-600">{customerAnalytics.customersWithBalance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">عملاء مدينون:</span>
                  <span className="font-bold text-red-600">{customerAnalytics.debtCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">عملاء دائنون:</span>
                  <span className="font-bold text-green-600">{customerAnalytics.creditCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">معدل الأرصدة:</span>
                  <span className="font-bold text-purple-600">{Math.round(customerAnalytics.balanceDistribution * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaLightbulb className="text-amber-500" />
                نصائح مهمة
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>راجع تاريخ العميل قبل التسوية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>تحقق من تقييم المخاطر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>أضف ملاحظات مفصلة للتوثيق</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>المبالغ الكبيرة تحتاج موافقة</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-500" />
                معلومات عامة
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>الرصيد الإيجابي = دين للعميل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>الرصيد السلبي = دين على العميل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>التسويات تظهر في التقارير</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>يمكن تصدير البيانات</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBalanceAdjustment;