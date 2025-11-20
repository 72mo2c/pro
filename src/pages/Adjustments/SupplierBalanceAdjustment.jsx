// ======================================
// Supplier Balance Adjustment - تسوية أرصدة الموردين (Enhanced)
// ======================================

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { 
  FaTruck, FaSearch, FaSave, FaDollarSign, FaUserPlus, FaChartLine, 
  FaHistory, FaExclamationTriangle, FaLightbulb, FaMoneyBillWave,
  FaBuilding, FaPercent, FaArrowUp, FaArrowDown, FaMinus, FaPlus,
  FaCalculator, FaHandshake, FaFileInvoiceDollar
} from 'react-icons/fa';

const SupplierBalanceAdjustment = () => {
  const { suppliers, purchases, cashDisbursements, adjustments } = useData();
  const { showWarning, showSuccess } = useNotification();
  
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Smart filtering and search
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;
    
    const term = searchTerm.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.name?.toLowerCase().includes(term) ||
      supplier.phone?.includes(term) ||
      supplier.email?.toLowerCase().includes(term) ||
      supplier.address?.toLowerCase().includes(term) ||
      supplier.taxNumber?.toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);

  // Suppliers analytics
  const suppliersAnalytics = useMemo(() => {
    const balanceStats = suppliers.map(supplier => ({
      balance: supplier.balance || 0,
      supplier: supplier
    })).filter(item => item.balance !== 0);

    const positiveBalances = balanceStats.filter(item => item.balance > 0);
    const negativeBalances = balanceStats.filter(item => item.balance < 0);
    
    const totalSuppliers = suppliers.length;
    const suppliersWithBalance = balanceStats.length;
    const debtToSuppliers = positiveBalances.length;
    const creditFromSuppliers = negativeBalances.length;
    
    const totalDebt = positiveBalances.reduce((sum, item) => sum + item.balance, 0);
    const totalCredit = Math.abs(negativeBalances.reduce((sum, item) => sum + item.balance, 0));
    
    const avgBalance = suppliersWithBalance > 0 ? (totalDebt - totalCredit) / suppliersWithBalance : 0;
    const largestDebt = positiveBalances.length > 0 ? Math.max(...positiveBalances.map(item => item.balance)) : 0;
    const largestCredit = negativeBalances.length > 0 ? Math.max(...negativeBalances.map(item => Math.abs(item.balance))) : 0;

    // Supplier risk assessment
    const highValueSuppliers = suppliers.filter(s => (s.balance || 0) > 10000);
    const avgDebtPerSupplier = suppliersWithBalance > 0 ? totalDebt / suppliersWithBalance : 0;

    return {
      totalSuppliers,
      suppliersWithBalance,
      debtToSuppliers,
      creditFromSuppliers,
      totalDebt,
      totalCredit,
      avgBalance,
      largestDebt,
      largestCredit,
      balanceDistribution: positiveBalances.length / Math.max(suppliersWithBalance, 1),
      highValueSuppliers: highValueSuppliers.length,
      avgDebtPerSupplier
    };
  }, [suppliers]);

  // Transaction history for selected supplier
  const supplierTransactions = useMemo(() => {
    if (!selectedSupplier) return [];
    
    const supplierPurchases = purchases?.filter(pur => pur.supplierId === selectedSupplier.id) || [];
    const supplierDisbursements = cashDisbursements?.filter(disb => disb.supplierId === selectedSupplier.id) || [];
    const supplierAdjustments = adjustments?.filter(adj => adj.supplierId === selectedSupplier.id) || [];
    
    const allTransactions = [
      ...supplierPurchases.map(pur => ({ ...pur, type: 'فاتورة شراء', date: pur.date })),
      ...supplierDisbursements.map(disb => ({ ...disb, type: 'دفع مورد', date: disb.date })),
      ...supplierAdjustments.map(adj => ({ ...adj, type: 'تسوية', date: adj.date }))
    ];
    
    return allTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);
  }, [selectedSupplier, purchases, cashDisbursements, adjustments]);

  // Smart suggestions for supplier adjustments
  const supplierSuggestions = useMemo(() => {
    if (!selectedSupplier || !supplierTransactions.length) return [];
    
    const lastAdjustments = supplierTransactions.filter(t => t.type === 'تسوية');
    const paymentHistory = supplierTransactions.filter(t => t.type === 'دفع مورد');
    const purchaseHistory = supplierTransactions.filter(t => t.type === 'فاتورة شراء');
    
    const suggestions = [];
    
    // Payment pattern analysis
    if (paymentHistory.length > 0) {
      const avgPayment = paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0) / paymentHistory.length;
      suggestions.push({
        type: 'payment_pattern',
        message: `متوسط المدفوعات: ${avgPayment.toFixed(2)} ج.م`,
        priority: 'high'
      });
    }
    
    // Purchase frequency analysis
    if (purchaseHistory.length > 0) {
      const lastPurchase = purchaseHistory[0];
      const daysSinceLastPurchase = Math.floor((Date.now() - new Date(lastPurchase.date)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastPurchase <= 30) {
        suggestions.push({
          type: 'recent_activity',
          message: `آخر عملية شراء قبل ${daysSinceLastPurchase} يوم`,
          priority: 'medium'
        });
      }
    }
    
    // Outstanding balance analysis
    const currentBalance = selectedSupplier.balance || 0;
    if (currentBalance > 0) {
      suggestions.push({
        type: 'outstanding_debt',
        message: `العميل مدين بمبلغ ${currentBalance.toFixed(2)} ج.م`,
        priority: 'high'
      });
    }
    
    // Contract analysis (simplified)
    const totalPurchases = purchaseHistory.reduce((sum, p) => sum + (p.total || 0), 0);
    if (totalPurchases > 50000) {
      suggestions.push({
        type: 'major_supplier',
        message: 'مورد رئيسي - تحقق من الموافقات',
        priority: 'critical'
      });
    }
    
    return suggestions;
  }, [selectedSupplier, supplierTransactions]);

  // Helper functions - moved above first usage
  const getCurrentBalance = () => {
    return selectedSupplier?.balance || 0;
  };

  const getNewBalance = () => {
    const current = getCurrentBalance();
    const amt = parseFloat(amount) || 0;
    return adjustmentType === 'add' ? current + amt : current - amt;
  };

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    setSearchTerm('');
  };

  // Advanced risk assessment for supplier adjustments
  const supplierRiskAssessment = useMemo(() => {
    if (!selectedSupplier || !amount) {
      return { level: 'low', factors: [], criticalFlags: [] };
    }
    
    const amt = parseFloat(amount) || 0;
    const currentBalance = getCurrentBalance();
    const newBalance = getNewBalance();
    
    const factors = [];
    const criticalFlags = [];
    let riskScore = 0;
    
    // Large adjustment check
    if (amt > 20000) {
      factors.push('مبلغ كبير جداً');
      criticalFlags.push('يتطلب موافقة إدارية');
      riskScore += 4;
    } else if (amt > 10000) {
      factors.push('مبلغ كبير');
      riskScore += 3;
    } else if (amt > 5000) {
      factors.push('مبلغ متوسط');
      riskScore += 2;
    }
    
    // Balance direction logic for suppliers
    if (adjustmentType === 'add' && currentBalance < 0 && Math.abs(currentBalance + amt) > Math.abs(currentBalance)) {
      factors.push('زيادة الدين للمورد');
      riskScore += 2;
      criticalFlags.push('تأكد من سعة الائتمان');
    } else if (adjustmentType === 'deduct' && currentBalance > 0 && newBalance < 0) {
      factors.push('تحويل من دين إلى رصيد');
      riskScore += 1;
    }
    
    // Supplier transaction history check
    if (supplierTransactions.length === 0) {
      factors.push('مورد جديد بدون تاريخ');
      criticalFlags.push('تحقق من هوية المورد');
      riskScore += 2;
    }
    
    // High-value supplier check
    const totalPurchases = supplierTransactions
      .filter(t => t.type === 'فاتورة شراء')
      .reduce((sum, t) => sum + (t.total || 0), 0);
    
    if (totalPurchases > 100000) {
      factors.push('مورد رئيسي بحجم عمليات كبير');
      criticalFlags.push('راجع مع الإدارة العليا');
      riskScore += 3;
    }
    
    // Payment pattern check
    const payments = supplierTransactions.filter(t => t.type === 'دفع مورد');
    const avgPayment = payments.length > 0 ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length : 0;
    
    if (amt > avgPayment * 2 && avgPayment > 0) {
      factors.push('المبلغ يتجاوز المتوسط المعتاد');
      riskScore += 2;
    }
    
    // Critical balance threshold
    if (currentBalance > 50000 || newBalance > 50000) {
      criticalFlags.push('الرصيد يتجاوز الحد المسموح');
      riskScore += 2;
    }
    
    // Risk level determination
    let level = 'low';
    if (riskScore >= 7 || criticalFlags.length >= 2) level = 'critical';
    else if (riskScore >= 4) level = 'high';
    else if (riskScore >= 2) level = 'medium';
    
    return { level, factors, criticalFlags };
  }, [selectedSupplier, amount, adjustmentType, supplierTransactions]);

  // Performance insights
  const performanceInsights = useMemo(() => {
    if (!selectedSupplier) return null;
    
    const purchases = supplierTransactions.filter(t => t.type === 'فاتورة شراء');
    const payments = supplierTransactions.filter(t => t.type === 'دفع مورد');
    
    const totalPurchases = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const avgPurchaseValue = purchases.length > 0 ? totalPurchases / purchases.length : 0;
    const paymentEfficiency = totalPurchases > 0 ? (totalPayments / totalPurchases) * 100 : 0;
    
    return {
      totalPurchases,
      totalPayments,
      avgPurchaseValue,
      paymentEfficiency,
      transactionCount: supplierTransactions.length,
      lastActivity: supplierTransactions[0]?.date
    };
  }, [selectedSupplier, supplierTransactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (!selectedSupplier || !amount || !reason) {
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
      type: 'supplier_balance_adjustment',
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      adjustmentType,
      amount: amt,
      oldBalance: getCurrentBalance(),
      newBalance: getNewBalance(),
      reason,
      notes,
      riskLevel: supplierRiskAssessment.level,
      performanceData: performanceInsights,
      suggestions: supplierSuggestions.length,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      userValidation: {
        riskScore: supplierRiskAssessment.criticalFlags.length > 0 ? 'required' : 'passed',
        approvalLevel: supplierRiskAssessment.level === 'critical' ? 'manager' : 'auto'
      }
    };

    try {
      console.log('🚚 تسوية رصيد مورد (مطورة):', {
        ...transaction,
        supplierAnalytics: {
          totalTransactions: supplierTransactions.length,
          suggestionsCount: supplierSuggestions.length,
          criticalFlags: supplierRiskAssessment.criticalFlags,
          performance: performanceInsights
        },
        systemInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          version: '2.0'
        }
      });
      
      const successMessage = supplierRiskAssessment.level === 'critical' 
        ? `تم حفظ التسوية (مستوى مخاطرة عالي - ${supplierRiskAssessment.criticalFlags.length} تنبيه)`
        : 'تم تسجيل تسوية رصيد المورد بنجاح';
      
      showSuccess(successMessage);
      
      // Reset form
      setSelectedSupplier(null);
      setAmount('');
      setReason('');
      setNotes('');
      
    } catch (error) {
      console.error('Error processing supplier adjustment:', error);
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
      case 'critical': return 'text-red-700 bg-red-50 border-red-300';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getSupplierTypeIcon = (supplier) => {
    const balance = supplier.balance || 0;
    if (balance > 10000) return <FaBuilding className="text-purple-500" />;
    if (balance > 1000) return <FaHandshake className="text-blue-500" />;
    return <FaTruck className="text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaTruck className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">تسوية أرصدة الموردين</h1>
              <p className="text-gray-500 mt-1">إدارة ذكية لأرصدة الموردين مع تحليل المخاطر والتوصيات</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">إجمالي الموردين</p>
                <p className="text-2xl font-bold">{suppliersAnalytics.totalSuppliers}</p>
              </div>
              <FaTruck className="text-3xl text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">ما ندين به للموردين</p>
                <p className="text-lg font-bold">{formatCurrency(suppliersAnalytics.totalDebt)}</p>
              </div>
              <FaArrowUp className="text-2xl text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">ما يدين لنا به الموردون</p>
                <p className="text-lg font-bold">{formatCurrency(suppliersAnalytics.totalCredit)}</p>
              </div>
              <FaArrowDown className="text-2xl text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">موردين قيمين</p>
                <p className="text-lg font-bold">{suppliersAnalytics.highValueSuppliers}</p>
              </div>
              <FaBuilding className="text-2xl text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">متوسط الدين</p>
                <p className="text-lg font-bold">{formatCurrency(suppliersAnalytics.avgDebtPerSupplier)}</p>
              </div>
              <FaCalculator className="text-2xl text-yellow-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            {/* Search Supplier */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-indigo-500 text-xl" />
                البحث المتقدم عن المورد
              </h3>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم، الهاتف، البريد الإلكتروني، الرقم الضريبي..."
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-lg"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {searchTerm && (
                <div className="mt-4 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-xl">
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <button
                        key={supplier.id}
                        onClick={() => handleSupplierSelect(supplier)}
                        className="w-full p-5 hover:bg-indigo-50 transition-colors text-right border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                              {getSupplierTypeIcon(supplier)}
                              {supplier.name}
                            </div>
                            <div className="text-sm text-gray-500 flex gap-4">
                              <span>{supplier.phone}</span>
                              {supplier.email && <span>{supplier.email}</span>}
                              {supplier.taxNumber && <span>الضريبة: {supplier.taxNumber}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">الرصيد الحالي</div>
                            <div className={`font-bold text-lg ${supplier.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(supplier.balance || 0)}
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

            {selectedSupplier && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">تفاصيل التسوية المتقدمة</h3>
                
                <div className="space-y-6">
                  {/* Supplier Info with Performance */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaBuilding className="text-indigo-500" />
                      معلومات المورد المفصلة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-semibold mr-2">{selectedSupplier.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الهاتف:</span>
                        <span className="font-semibold mr-2">{selectedSupplier.phone}</span>
                      </div>
                      {selectedSupplier.email && (
                        <div>
                          <span className="text-gray-600">البريد الإلكتروني:</span>
                          <span className="font-semibold mr-2">{selectedSupplier.email}</span>
                        </div>
                      )}
                      {selectedSupplier.taxNumber && (
                        <div>
                          <span className="text-gray-600">الرقم الضريبي:</span>
                          <span className="font-semibold mr-2">{selectedSupplier.taxNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Performance Insights */}
                    {performanceInsights && (
                      <div className="bg-white rounded-lg p-4 mt-4">
                        <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <FaChartLine className="text-green-500" />
                          تحليل الأداء
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">إجمالي المشتريات:</span>
                            <div className="font-bold text-blue-600">{formatCurrency(performanceInsights.totalPurchases)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">متوسط المشتريات:</span>
                            <div className="font-bold text-green-600">{formatCurrency(performanceInsights.avgPurchaseValue)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">عدد المعاملات:</span>
                            <div className="font-bold text-purple-600">{performanceInsights.transactionCount}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">كفاءة الدفع:</span>
                            <div className="font-bold text-orange-600">{performanceInsights.paymentEfficiency.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current Balance with Risk Assessment */}
                  <div className={`border-2 rounded-xl p-6 ${getCurrentBalance() >= 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700 font-bold text-lg">الرصيد الحالي:</span>
                      <span className={`text-3xl font-bold ${getCurrentBalance() >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(getCurrentBalance())}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {getCurrentBalance() >= 0 ? 'دين علينا للمورد' : 'دين لنا على المورد'}
                    </div>
                    
                    {/* Risk Assessment */}
                    {amount && (
                      <div className={`mt-4 p-4 rounded-lg border ${getRiskColor(supplierRiskAssessment.level)}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <FaExclamationTriangle className="text-lg" />
                          <span className="font-bold">تقييم المخاطر:</span>
                          <span className="font-bold uppercase">{supplierRiskAssessment.level}</span>
                        </div>
                        {supplierRiskAssessment.factors.length > 0 && (
                          <div className="text-sm space-y-1 mb-2">
                            {supplierRiskAssessment.factors.map((factor, index) => (
                              <div key={index}>• {factor}</div>
                            ))}
                          </div>
                        )}
                        {supplierRiskAssessment.criticalFlags.length > 0 && (
                          <div className="border-t pt-2">
                            <div className="font-bold text-red-700 mb-1">تنبيهات حرجة:</div>
                            {supplierRiskAssessment.criticalFlags.map((flag, index) => (
                              <div key={index} className="text-sm text-red-600">⚠️ {flag}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Smart Suggestions */}
                  {supplierSuggestions.length > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <FaLightbulb className="text-blue-500" />
                        اقتراحات ذكية ({supplierSuggestions.length})
                      </h4>
                      <div className="space-y-3">
                        {supplierSuggestions.map((suggestion, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-blue-700">{suggestion.message}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                suggestion.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                suggestion.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {suggestion.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                        <div className="text-sm opacity-80 mt-1">زيادة الدين للمورد</div>
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
                        <div className="text-sm opacity-80 mt-1">تقليل الدين للمورد</div>
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">
                      <FaDollarSign className="inline ml-2 text-indigo-500" />
                      المبلغ *
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                      placeholder="أدخل المبلغ..."
                      required
                    />
                  </div>

                  {/* New Balance Preview */}
                  {amount && (
                    <div className={`rounded-xl p-6 border-2 ${getNewBalance() >= 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-bold text-lg">الرصيد المتوقع بعد التسوية:</span>
                        <span className={`text-3xl font-bold ${getNewBalance() >= 0 ? 'text-red-600' : 'text-green-600'}`}>
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
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                      required
                    >
                      <option value="">اختر السبب...</option>
                      <option value="تصحيح_خطأ">تصحيح خطأ في الرصيد</option>
                      <option value="خصم_مرتجعات">خصم مرتجعات</option>
                      <option value="خصم_جودة">خصم جودة</option>
                      <option value="خصم_إعلان">خصم إعلان وترويج</option>
                      <option value="خصم_دفع_مقدم">خصم دفع مقدم</option>
                      <option value="خصم_كفاءة">خصم كفاءة في التسليم</option>
                      <option value="ضريبة_قيمة_مضافة">ضريبة قيمة مضافة</option>
                      <option value="رسوم_مصاريف">رسوم ومصاريف إضافية</option>
                      <option value="تسوية_ نزاع">تسوية نزاع</option>
                      <option value="دفعة_مسبقة">دفعة مسبقة</option>
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
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none text-lg"
                      placeholder="أضف ملاحظات مفصلة حول سبب التسوية..."
                    />
                  </div>

                  {/* Transaction History */}
                  {supplierTransactions.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaHistory className="text-gray-500" />
                        تاريخ المعاملات ({supplierTransactions.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {supplierTransactions.map((transaction, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg">
                            <div>
                              <span className="font-semibold flex items-center gap-2">
                                {transaction.type === 'فاتورة شراء' && <FaFileInvoiceDollar className="text-blue-500" />}
                                {transaction.type === 'دفع مورد' && <FaMoneyBillWave className="text-green-500" />}
                                {transaction.type === 'تسوية' && <FaCalculator className="text-purple-500" />}
                                {transaction.type}
                              </span>
                              <span className="text-sm text-gray-500 mr-2">
                                {new Date(transaction.date).toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                            {transaction.total && (
                              <span className="font-bold text-green-600">
                                {formatCurrency(transaction.total)}
                              </span>
                            )}
                            {transaction.amount && (
                              <span className="font-bold text-blue-600">
                                {formatCurrency(transaction.amount)}
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
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-6 rounded-xl font-bold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-3 text-lg disabled:opacity-50"
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
            {/* Suppliers Analytics */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartLine className="text-purple-500" />
                تحليلات الموردين
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">موردين بأرصدة:</span>
                  <span className="font-bold text-purple-600">{suppliersAnalytics.suppliersWithBalance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">موردين مدينين لنا:</span>
                  <span className="font-bold text-green-600">{suppliersAnalytics.creditFromSuppliers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">نمدينهم بالمال:</span>
                  <span className="font-bold text-red-600">{suppliersAnalytics.debtToSuppliers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">أكبر دين:</span>
                  <span className="font-bold text-orange-600">{formatCurrency(suppliersAnalytics.largestDebt)}</span>
                </div>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaLightbulb className="text-amber-500" />
                توصيات ذكية
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>راجع تاريخ المشتريات قبل التسوية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>تحقق من تقييم المخاطر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>المبالغ الكبيرة تحتاج موافقة إدارية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>فحص جودة الفاتورة قبل الدفع</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>مراجعة شروط الدفع والتخفيض</span>
                </li>
              </ul>
            </div>

            {/* Risk Management */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                إدارة المخاطر
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>تحديد حدود الائتمان لكل مورد</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>مراقبة دفعات الموردين</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>تحديث تقييم الموردين دورياً</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>توثيق جميع الاتفاقات</span>
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
                  <span>الرصيد الإيجابي = ما ندينه للمورد</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>الرصيد السلبي = ما يدين لنا به المورد</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>التسويات تؤثر على قائمة المركز المالي</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>تظهر في تقارير الحسابات الدائنة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierBalanceAdjustment;