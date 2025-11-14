// ======================================
// New Cash Receipt - إضافة إذن استلام نقدي
// ======================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useNotification } from '../../context/NotificationContext';
import { useTab } from '../../contexts/TabContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { 
  FaSave, 
  FaTimes, 
  FaMoneyBillWave, 
  FaList,
  FaUser,
  FaBuilding,
  FaBalanceScale,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalculator,
  FaHistory,
  FaFileInvoice,
  FaSearch,
  FaPlus,
  FaMinus,
  FaEye,
  FaLink
} from 'react-icons/fa';

const NewCashReceipt = () => {
  const navigate = useNavigate();
  const { 
    addCashReceipt, 
    customers, 
    suppliers, 
    getCustomerBalance, 
    getSupplierBalance, 
    treasuryBalance,
    getCustomerDeferredInvoices,
    addCashReceiptWithInvoiceLink,
    updateCustomerAdvanceBalance,
    updateSupplierAdvanceBalance
  } = useData();
  const { settings } = useSystemSettings();
  const { showError, showSuccess, showInfo } = useNotification();
  const { openTab } = useTab();
  
  // دالة لفتح سجل إيصالات الاستلام في تبويبة جديدة
  const handleOpenReceiptsRecord = () => {
    openTab('/treasury/receipts', 'سجل إيصالات الاستلام', '💰');
  };
  
  const [formData, setFormData] = useState({
    receiptNumber: `REC-${Date.now()}`,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    fromType: 'customer', // customer, supplier, other
    fromId: '',
    fromName: '',
    paymentMethod: 'cash', // cash, check, bank_transfer
    referenceNumber: '',
    notes: '',
    description: ''
  });
  
  const [selectedSource, setSelectedSource] = useState(null);
  const [deferredInvoices, setDeferredInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  
  // خيارات طرق الدفع
  const paymentMethods = [
    { value: 'cash', label: 'نقداً' },
    { value: 'check', label: 'شيك' },
    { value: 'bank_transfer', label: 'تحويل بنكي' }
  ];

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // حساب الرصيد الحالي للعميل/المورد
  const getSourceCurrentBalance = () => {
    if (formData.fromType === 'customer' && formData.fromId) {
      return getCustomerBalance(parseInt(formData.fromId));
    } else if (formData.fromType === 'supplier' && formData.fromId) {
      return getSupplierBalance(parseInt(formData.fromId));
    }
    return 0;
  };

  // حساب الرصيد المسبق للعميل/المورد
  const getSourceAdvanceBalance = () => {
    if (formData.fromType === 'customer' && formData.fromId) {
      const customer = customers.find(c => c.id === parseInt(formData.fromId));
      return customer?.advanceBalance || 0;
    } else if (formData.fromType === 'supplier' && formData.fromId) {
      const supplier = suppliers.find(s => s.id === parseInt(formData.fromId));
      return supplier?.advanceBalance || 0;
    }
    return 0;
  };

  // حساب الرصيد الشامل (دين + رصيد مسبق)
  const getSourceComprehensiveBalance = () => {
    const currentBalance = getSourceCurrentBalance();
    const advanceBalance = getSourceAdvanceBalance();
    
    return {
      debtBalance: currentBalance,
      advanceBalance: advanceBalance,
      netBalance: currentBalance - advanceBalance,
      totalDebt: Math.max(0, currentBalance),
      totalAdvance: Math.max(0, advanceBalance)
    };
  };

  // حساب المبلغ المتبقي بعد التسوية الذكية
  const getRemainingAmount = () => {
    const comprehensiveBalance = getSourceComprehensiveBalance();
    const paymentAmount = parseFloat(formData.amount) || 0;
    
    // النظام الذكي: استخدام الرصيد المسبق أولاً، ثم سداد الدين
    if (comprehensiveBalance.advanceBalance > 0) {
      // يوجد رصيد مسبق - سيتم استخدامه أولاً
      const advanceToUse = Math.min(comprehensiveBalance.advanceBalance, paymentAmount);
      const remainingAfterAdvance = paymentAmount - advanceToUse;
      
      if (comprehensiveBalance.debtBalance > 0) {
        // يوجد دين أيضاً - سيتم سداده من المبلغ المتبقي
        return Math.max(0, remainingAfterAdvance - comprehensiveBalance.debtBalance);
      } else {
        // لا يوجد دين - المبلغ المتبقي يصبح رصيد مسبق جديد
        return remainingAfterAdvance;
      }
    } else if (comprehensiveBalance.debtBalance > 0) {
      // يوجد دين فقط - سيتم خصم المبلغ الزائد
      return Math.max(0, paymentAmount - comprehensiveBalance.debtBalance);
    }
    
    // لا يوجد دين ولا رصيد مسبق - كل المبلغ يصبح رصيد مسبق جديد
    return paymentAmount;
  };

  // تحديد نوع المعاملة
  const getTransactionType = () => {
    const currentBalance = getSourceCurrentBalance();
    const paymentAmount = parseFloat(formData.amount) || 0;
    
    if (currentBalance > 0) {
      if (paymentAmount >= currentBalance) {
        return 'دفع دين كامل';
      } else {
        return 'دفع دين جزئي';
      }
    }
    return 'دفع مقدماً';
  };

  // معلومات المعاملة المحسوبة مع النظام الذكي
  const transactionInfo = useMemo(() => {
    const comprehensiveBalance = getSourceComprehensiveBalance();
    const paymentAmount = parseFloat(formData.amount) || 0;
    const remainingAmount = getRemainingAmount();
    const transactionType = getTransactionType();
    
    // تحليل التسوية الذكية
    let advanceUsed = 0;
    let debtPaid = 0;
    let advanceCredit = 0;
    
    if (comprehensiveBalance.advanceBalance > 0) {
      advanceUsed = Math.min(comprehensiveBalance.advanceBalance, paymentAmount);
      const remainingAfterAdvance = paymentAmount - advanceUsed;
      
      if (comprehensiveBalance.debtBalance > 0) {
        debtPaid = Math.min(comprehensiveBalance.debtBalance, remainingAfterAdvance);
        advanceCredit = remainingAfterAdvance - debtPaid;
      } else {
        advanceCredit = remainingAfterAdvance;
      }
    } else if (comprehensiveBalance.debtBalance > 0) {
      debtPaid = Math.min(comprehensiveBalance.debtBalance, paymentAmount);
      advanceCredit = paymentAmount - debtPaid;
    } else {
      advanceCredit = paymentAmount;
    }
    
    return {
      // الأرصدة الحالية
      currentDebtBalance: comprehensiveBalance.debtBalance,
      currentAdvanceBalance: comprehensiveBalance.advanceBalance,
      currentNetBalance: comprehensiveBalance.netBalance,
      
      // تفاصيل المعاملة
      paymentAmount,
      remainingAmount,
      transactionType,
      
      // التحليل الذكي
      advanceUsed,
      debtPaid,
      advanceCredit,
      
      // النتائج المتوقعة
      willUseAdvance: advanceUsed > 0,
      willPayDebt: debtPaid > 0,
      willAddAdvance: advanceCredit > 0,
      
      // الأرصدة الجديدة
      newDebtBalance: Math.max(0, comprehensiveBalance.debtBalance - debtPaid),
      newAdvanceBalance: Math.max(0, comprehensiveBalance.advanceBalance - advanceUsed + advanceCredit),
      newNetBalance: Math.max(0, comprehensiveBalance.debtBalance - debtPaid) - Math.max(0, comprehensiveBalance.advanceBalance - advanceUsed + advanceCredit)
    };
  }, [formData.fromType, formData.fromId, formData.amount, customers, suppliers, getCustomerBalance, getSupplierBalance]);

  // الحصول على قائمة المصادر بناءً على النوع
  const getSourceList = () => {
    if (formData.fromType === 'customer') {
      return customers;
    } else if (formData.fromType === 'supplier') {
      return suppliers;
    }
    return [];
  };
  
  // تحميل الفواتير الآجلة للعميل المختار
  const loadDeferredInvoices = (sourceId, sourceType) => {
    if (sourceType === 'customer' && sourceId) {
      try {
        const invoices = getCustomerDeferredInvoices(parseInt(sourceId));
        setDeferredInvoices(invoices);
        console.log('تم تحميل الفواتير الآجلة للعميل:', invoices);
      } catch (error) {
        console.error('خطأ في تحميل الفواتير الآجلة:', error);
        setDeferredInvoices([]);
      }
    } else {
      setDeferredInvoices([]);
    }
  };
  
  // إضافة فاتورة إلى قائمة المختارة
  const addInvoiceToSelection = (invoice) => {
    const existingIndex = selectedInvoices.findIndex(selected => selected.invoiceId === invoice.id);
    
    if (existingIndex >= 0) {
      // الفاتورة مختارة مسبقاً - لا نضيفها مرة أخرى
      return;
    }
    
    const newSelection = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.id,
      invoiceDate: invoice.date,
      totalAmount: invoice.originalAmount,
      remainingAmount: invoice.remainingAmount,
      paymentAmount: 0,
      isFullySelected: false
    };
    
    setSelectedInvoices(prev => [...prev, newSelection]);
  };
  
  // إزالة فاتورة من قائمة المختارة
  const removeInvoiceFromSelection = (invoiceId) => {
    setSelectedInvoices(prev => prev.filter(selected => selected.invoiceId !== invoiceId));
  };
  
  // تحديث مبلغ الدفع لفاتورة محددة
  const updateInvoicePaymentAmount = (invoiceId, paymentAmount) => {
    setSelectedInvoices(prev => prev.map(selected => {
      if (selected.invoiceId === invoiceId) {
        const maxAmount = selected.remainingAmount;
        const amount = Math.min(parseFloat(paymentAmount) || 0, maxAmount);
        return {
          ...selected,
          paymentAmount: amount,
          isFullySelected: amount >= maxAmount
        };
      }
      return selected;
    }));
  };
  
  // تحديد الفاتورة بالكامل
  const selectInvoiceFully = (invoiceId) => {
    setSelectedInvoices(prev => prev.map(selected => {
      if (selected.invoiceId === invoiceId) {
        return {
          ...selected,
          paymentAmount: selected.remainingAmount,
          isFullySelected: true
        };
      }
      return selected;
    }));
  };
  
  // حساب إجمالي مبالغ الفواتير المختارة
  const getTotalSelectedInvoicePayments = () => {
    return selectedInvoices.reduce((total, selected) => total + (selected.paymentAmount || 0), 0);
  };
  
  // تحديد ما إذا كان يمكن استخدام وضع الفواتير المحددة
  const canUseInvoiceMode = () => {
    return formData.fromType === 'customer' && formData.fromId && selectedInvoices.length > 0;
  };
  
  // حساب المبلغ الإضافي للخزينة (ما لا يذهب للفواتير)
  const getAdditionalTreasuryAmount = () => {
    const paymentAmount = parseFloat(formData.amount) || 0;
    const totalInvoicePayments = getTotalSelectedInvoicePayments();
    return Math.max(0, paymentAmount - totalInvoicePayments);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // مسح الخطأ عند التعديل
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // إعادة تعيين fromId عند تغيير النوع
    if (name === 'fromType') {
      setFormData(prev => ({
        ...prev,
        fromId: '',
        fromName: ''
      }));
    }
    
    // تحديث الاسم عند اختيار المصدر
    if (name === 'fromId') {
      const sourceList = formData.fromType === 'customer' ? customers : suppliers;
      const selected = sourceList.find(s => s.id === parseInt(value));
      if (selected) {
        setSelectedSource(selected);
        setFormData(prev => ({
          ...prev,
          fromName: selected.name
        }));
        
        // تحميل الفواتير الآجلة للعميل المختار
        if (formData.fromType === 'customer') {
          loadDeferredInvoices(value, 'customer');
          setSelectedInvoices([]); // مسح الفواتير المختارة السابقة
        }
      } else {
        setSelectedSource(null);
        setDeferredInvoices([]);
        setSelectedInvoices([]);
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'يرجى إدخال مبلغ صحيح';
    }
    
    if (formData.fromType !== 'other' && !formData.fromId) {
      newErrors.fromId = 'يرجى اختيار المصدر';
    }
    
    if (formData.fromType === 'other' && !formData.fromName) {
      newErrors.fromName = 'يرجى إدخال اسم المصدر';
    }
    
    // التحقق من الفواتير المختارة
    if (canUseInvoiceMode()) {
      const totalInvoicePayments = getTotalSelectedInvoicePayments();
      const paymentAmount = parseFloat(formData.amount) || 0;
      
      if (totalInvoicePayments > paymentAmount) {
        newErrors.invoices = `إجمالي مبالغ الفواتير المختارة (${formatCurrency(totalInvoicePayments)}) أكبر من مبلغ الدفع (${formatCurrency(paymentAmount)})`;
      }
      
      // التحقق من أن المبالغ المدخلة للفواتير منطقية
      selectedInvoices.forEach(selected => {
        if (selected.paymentAmount > selected.remainingAmount) {
          newErrors[`invoice_${selected.invoiceId}`] = `مبلغ السداد للفاتورة ${selected.invoiceNumber} أكبر من المتبقي`;
        }
        if (selected.paymentAmount < 0) {
          newErrors[`invoice_${selected.invoiceId}`] = `مبلغ السداد للفاتورة ${selected.invoiceNumber} لا يمكن أن يكون سالباً`;
        }
      });
    }
    
    // لا نحتاج للتحقق من الرصيد في إذن الاستلام النقدي
    // إذن الاستلام النقدي يزيد الرصيد في الخزينة وليس ينقصه
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setProcessing(true);
    
    try {
      const receiptData = {
        ...formData,
        date: `${formData.date}T${formData.time}:00`,
        // الفواتير المرتبطة (إذا وجدت)
        linkedInvoices: canUseInvoiceMode() ? selectedInvoices.map(selected => ({
          invoiceId: selected.invoiceId,
          paymentAmount: selected.paymentAmount
        })) : [],
        // معلومات إضافية لحركة الخزينة
        transactionInfo: {
          currentBalance: transactionInfo.currentBalance,
          paymentAmount: transactionInfo.paymentAmount,
          remainingAmount: transactionInfo.remainingAmount,
          transactionType: transactionInfo.transactionType,
          newBalanceAfterPayment: transactionInfo.newBalanceAfterPayment,
          willReduceBalance: transactionInfo.willReduceBalance,
          willIncreaseBalance: transactionInfo.willIncreaseBalance,
          hasInvoiceLinks: canUseInvoiceMode(),
          totalInvoicePayments: getTotalSelectedInvoicePayments(),
          additionalTreasuryAmount: getAdditionalTreasuryAmount()
        }
      };
      
      // استخدام النظام الذكي الجديد للتسوية
      const result = addCashReceiptWithInvoiceLink(receiptData);
      
      // عرض رسالة تفصيلية للنظام الذكي
      let successMessage = `🎯 تم إضافة إيصال الاستلام بنجاح بالنظام الذكي!\n\n`;
      
      if (result.intelligentSettlement) {
        const settlement = result.intelligentSettlement;
        
        successMessage += `📊 تفاصيل التسوية الذكية:\n`;
        successMessage += `• المبلغ الأصلي: ${formatCurrency(settlement.originalPayment)}\n`;
        
        if (settlement.advanceUsed > 0) {
          successMessage += `• تم استخدام رصيد مسبق: ${formatCurrency(settlement.advanceUsed)}\n`;
        }
        
        if (settlement.invoicePayments > 0) {
          successMessage += `• تم سداد فواتير: ${formatCurrency(settlement.invoicePayments)}\n`;
        }
        
        if (settlement.advanceCredit > 0) {
          successMessage += `• تم إضافة رصيد مسبق جديد: ${formatCurrency(settlement.advanceCredit)}\n`;
        }
        
        if (settlement.settledInvoices && settlement.settledInvoices.length > 0) {
          successMessage += `\n📋 الفواتير المسددة:\n`;
          settlement.settledInvoices.forEach(invoice => {
            successMessage += `• فاتورة #${invoice.invoiceId}: ${formatCurrency(invoice.amount)} `;
            successMessage += invoice.fullyPaid ? '(مسددة بالكامل)\n' : '(مسددة جزئياً)\n';
          });
        }
      } else {
        // في حالة عدم وجود تسوية ذكية (للمصادر الأخرى)
        successMessage += `• تم تسجيل إيصال بمبلغ: ${formatCurrency(transactionInfo.paymentAmount)}\n`;
        successMessage += `• نوع المعاملة: ${transactionInfo.transactionType}\n`;
      }
      
      successMessage += `\n✅ النظام الذكي يضمن الاستخدام الأمثل للأرصدة المسبقة وسداد الديون بالترتيب.`;
      
      showSuccess(successMessage);
      navigate('/treasury/receipts');
    } catch (error) {
      showError('خطأ: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/treasury/receipts');
  };
  
  return (
    <div className="space-y-4">
      <PageHeader 
        title="إذن استلام نقدي جديد"
        icon={<FaMoneyBillWave />}
      />
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* معلومات الإيصال */}
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-800">معلومات الإيصال</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">رقم الإيصال</label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  المبلغ <span className="text-red-500 text-xs">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  التاريخ <span className="text-red-500 text-xs">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  الوقت <span className="text-red-500 text-xs">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* معلومات المصدر */}
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-800">معلومات المصدر</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  نوع المصدر <span className="text-red-500 text-xs">*</span>
                </label>
                <select
                  name="fromType"
                  value={formData.fromType}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                >
                  <option value="customer">عميل</option>
                  <option value="supplier">مورد</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              
              {formData.fromType !== 'other' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      {formData.fromType === 'customer' ? 'العميل' : 'المورد'} <span className="text-red-500 text-xs">*</span>
                    </label>
                    <select
                      name="fromId"
                      value={formData.fromId}
                      onChange={handleChange}
                      className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${
                        errors.fromId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">اختر {formData.fromType === 'customer' ? 'العميل' : 'المورد'}</option>
                      {getSourceList().map(source => (
                        <option key={source.id} value={source.id}>
                          {source.name} - {
                            formData.fromType === 'customer' 
                              ? (source.phone1 || source.phone2 || 'لا يوجد هاتف')
                              : (source.phone1 || source.phone2 || 'لا يوجد هاتف')
                          }
                        </option>
                      ))}
                    </select>
                    {errors.fromId && (
                      <p className="text-red-500 text-xs mt-1">{errors.fromId}</p>
                    )}
                  </div>
                  
                  {/* عرض معلومات المصدر المختار وحالة الرصيد */}
                  {selectedSource && (
                    <div className="md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                          {formData.fromType === 'customer' ? <FaUser className="text-blue-600" /> : <FaBuilding className="text-blue-600" />}
                          معلومات {formData.fromType === 'customer' ? 'العميل' : 'المورد'}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">الاسم:</span>
                            <p className="font-medium">{selectedSource.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">الهاتف الأول:</span>
                            <p className="font-medium">{selectedSource.phone1 || selectedSource.phone || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">الهاتف الثاني:</span>
                            <p className="font-medium">{selectedSource.phone2 || '-'}</p>
                          </div>
                          {selectedSource.address && (
                            <div>
                              <span className="text-gray-600">العنوان:</span>
                              <p className="font-medium">{selectedSource.address}</p>
                            </div>
                          )}
                          {formData.fromType === 'customer' && selectedSource.area && (
                            <div>
                              <span className="text-gray-600">النطاق:</span>
                              <p className="font-medium">{selectedSource.area}</p>
                            </div>
                          )}
                          {formData.fromType === 'customer' && selectedSource.agentType && (
                            <div>
                              <span className="text-gray-600">نوع العميل:</span>
                              <p className="font-medium">{selectedSource.agentType}</p>
                            </div>
                          )}
                          {formData.fromType === 'supplier' && selectedSource.email && (
                            <div className="md:col-span-3">
                              <span className="text-gray-600">البريد الإلكتروني:</span>
                              <p className="font-medium">{selectedSource.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* بطاقة معلومات الرصيد والمعاملة - النظام الذكي */}
                      {formData.amount && (
                        <div className={`border rounded-md p-4 ${
                          transactionInfo.currentDebtBalance > 0 || transactionInfo.currentAdvanceBalance > 0 
                            ? 'bg-purple-50 border-purple-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                            <FaBalanceScale className="text-purple-600" />
                            النظام الذكي للتسوية
                          </h4>
                          
                          {/* الأرصدة الحالية */}
                          <div className="bg-gray-50 rounded-md p-3 mb-3">
                            <h5 className="font-medium text-gray-700 mb-2 text-xs">الأرصدة الحالية</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">الدين الحالي:</span>
                                <span className={`font-bold ${transactionInfo.currentDebtBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {formatCurrency(transactionInfo.currentDebtBalance)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">الرصيد المسبق:</span>
                                <span className={`font-bold ${transactionInfo.currentAdvanceBalance > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                                  {formatCurrency(transactionInfo.currentAdvanceBalance)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* تفاصيل التسوية الذكية */}
                          <div className="bg-blue-50 rounded-md p-3 mb-3">
                            <h5 className="font-medium text-blue-700 mb-2 text-xs">تفاصيل التسوية الذكية</h5>
                            <div className="space-y-1 text-xs">
                              {transactionInfo.advanceUsed > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">استخدام الرصيد المسبق:</span>
                                  <span className="font-bold text-blue-600">-{formatCurrency(transactionInfo.advanceUsed)}</span>
                                </div>
                              )}
                              {transactionInfo.debtPaid > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">سداد الدين:</span>
                                  <span className="font-bold text-orange-600">-{formatCurrency(transactionInfo.debtPaid)}</span>
                                </div>
                              )}
                              {transactionInfo.advanceCredit > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">إضافة رصيد مسبق:</span>
                                  <span className="font-bold text-green-600">+{formatCurrency(transactionInfo.advanceCredit)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">مبلغ الدفع:</span>
                              <span className="font-bold text-blue-600">{formatCurrency(transactionInfo.paymentAmount)}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">نوع المعاملة:</span>
                              <span className="font-semibold text-purple-600">
                                {transactionInfo.transactionType}
                              </span>
                            </div>
                          </div>

                          {/* الأرصدة المتوقعة */}
                          <div className="bg-gray-50 rounded-md p-3 mt-3">
                            <h5 className="font-medium text-gray-700 mb-2 text-xs">الأرصدة بعد المعاملة</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">الدين المتبقي:</span>
                                <span className={`font-bold ${transactionInfo.newDebtBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {formatCurrency(transactionInfo.newDebtBalance)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">الرصيد المسبق الجديد:</span>
                                <span className={`font-bold ${transactionInfo.newAdvanceBalance > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                                  {formatCurrency(transactionInfo.newAdvanceBalance)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* تحذيرات وتوضيحات للنظام الذكي */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {transactionInfo.willUseAdvance && transactionInfo.willPayDebt ? (
                              <div className="flex items-start gap-2 text-purple-700 bg-purple-100 p-2 rounded text-xs">
                                <FaCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">تسوية ذكية شاملة</p>
                                  <p>النظام سيستخدم الرصيد المسبق أولاً ({formatCurrency(transactionInfo.advanceUsed)}) ثم يسدد الدين ({formatCurrency(transactionInfo.debtPaid)})</p>
                                </div>
                              </div>
                            ) : transactionInfo.willUseAdvance ? (
                              <div className="flex items-start gap-2 text-blue-700 bg-blue-100 p-2 rounded text-xs">
                                <FaHistory className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">استخدام رصيد مسبق</p>
                                  <p>سيتم استخدام {formatCurrency(transactionInfo.advanceUsed)} من الرصيد المسبق</p>
                                </div>
                              </div>
                            ) : transactionInfo.willPayDebt ? (
                              <div className="flex items-start gap-2 text-orange-700 bg-orange-100 p-2 rounded text-xs">
                                <FaBalanceScale className="text-orange-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">سداد دين</p>
                                  <p>سيتم سداد {formatCurrency(transactionInfo.debtPaid)} من الدين الحالي</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 text-green-700 bg-green-100 p-2 rounded text-xs">
                                <FaMoneyBillWave className="text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">دفع مسبق جديد</p>
                                  <p>سيتم إضافة {formatCurrency(transactionInfo.advanceCredit)} كرصيد مسبق جديد</p>
                                </div>
                              </div>
                            )}
                            
                            {/* توضيح النظام الذكي */}
                            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                              <p className="text-gray-600">
                                <strong>النظام الذكي:</strong> أولاً يُستخدم الرصيد المسبق (إن وجد)، ثم يُسدد الدين، وأي مبلغ زائد يُضاف كرصيد مسبق جديد. لا يتم إضافة أموال العملاء للخزينة مباشرة.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    اسم المصدر <span className="text-red-500 text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    name="fromName"
                    value={formData.fromName}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${
                      errors.fromName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل اسم المصدر"
                  />
                  {errors.fromName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fromName}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* ==================== قسم إدارة الفواتير الآجلة (للمديرين فقط) ==================== */}
          {formData.fromType === 'customer' && formData.fromId && deferredInvoices.length > 0 && (
            <div>
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-purple-800 flex items-center gap-2">
                    <FaFileInvoice className="text-purple-600" />
                    إدارة فواتير العميل الآجلة
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowInvoicesList(!showInvoicesList)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                  >
                    <FaEye />
                    {showInvoicesList ? 'إخفاء' : 'عرض'} الفواتير ({deferredInvoices.length})
                  </button>
                </div>
                
                {showInvoicesList && (
                  <div className="space-y-3">
                    {/* قائمة الفواتير المتاحة */}
                    <div className="bg-white border border-purple-100 rounded-md p-3">
                      <h4 className="font-medium text-purple-700 mb-2 text-sm">الفواتير الآجلة المتاحة</h4>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {deferredInvoices.map(invoice => {
                          const isSelected = selectedInvoices.some(selected => selected.invoiceId === invoice.id);
                          return (
                            <div key={invoice.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">فاتورة #{invoice.id}</span>
                                  <span className="text-gray-500">({new Date(invoice.date).toLocaleDateString('ar-EG')})</span>
                                </div>
                                <div className="text-gray-600 mt-1">
                                  المبلغ الأصلي: {formatCurrency(invoice.originalAmount)} | 
                                  المتبقي: <span className="text-orange-600 font-medium">{formatCurrency(invoice.remainingAmount)}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => addInvoiceToSelection(invoice)}
                                disabled={isSelected}
                                className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                                  isSelected 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                              >
                                <FaPlus />
                                {isSelected ? 'مختارة' : 'اختيار'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* الفواتير المختارة */}
                    {selectedInvoices.length > 0 && (
                      <div className="bg-white border border-purple-100 rounded-md p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-purple-700 text-sm">الفواتير المختارة للسداد</h4>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoices([])}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            مسح الكل
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedInvoices.map(selected => {
                            const invoice = deferredInvoices.find(inv => inv.id === selected.invoiceId);
                            return (
                              <div key={selected.invoiceId} className="bg-purple-50 border border-purple-200 rounded p-2">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-purple-700 text-xs">
                                    فاتورة #{selected.invoiceNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeInvoiceFromSelection(selected.invoiceId)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    <FaMinus />
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-600">المتبقي:</span>
                                    <p className="font-medium">{formatCurrency(selected.remainingAmount)}</p>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-gray-600 mb-1">مبلغ السداد:</label>
                                    <input
                                      type="number"
                                      value={selected.paymentAmount}
                                      onChange={(e) => updateInvoicePaymentAmount(selected.invoiceId, e.target.value)}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                                      min="0"
                                      max={selected.remainingAmount}
                                      step="0.01"
                                    />
                                    {errors[`invoice_${selected.invoiceId}`] && (
                                      <p className="text-red-500 text-xs mt-1">{errors[`invoice_${selected.invoiceId}`]}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-end">
                                    <button
                                      type="button"
                                      onClick={() => selectInvoiceFully(selected.invoiceId)}
                                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs font-medium"
                                    >
                                      دفع كامل
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* ملخص الفواتير المختارة */}
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-purple-700">إجمالي مبالغ الفواتير:</span>
                            <span className="font-bold text-purple-600">{formatCurrency(getTotalSelectedInvoicePayments())}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className="font-medium text-purple-700">سيتم إضافته للخزينة:</span>
                            <span className="font-bold text-green-600">{formatCurrency(getAdditionalTreasuryAmount())}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {errors.invoices && (
                      <p className="text-red-500 text-xs mt-2 bg-red-50 border border-red-200 rounded p-2">
                        {errors.invoices}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* معلومات إضافية */}
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-800">معلومات إضافية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">طريقة الدفع</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">رقم المرجع</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  placeholder="رقم الفاتورة أو المرجع"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">الوصف</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  placeholder="وصف مختصر"
                />
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-xs font-medium mb-1 text-gray-700">ملاحظات</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                placeholder="ملاحظات إضافية..."
              />
            </div>
          </div>
          
          {/* أزرار التحكم */}
          <div className="flex flex-wrap justify-center gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={handleOpenReceiptsRecord}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-md transition-colors font-medium text-xs shadow-sm hover:shadow-md"
              title="فتح سجل إيصالات الاستلام في تبويبة جديدة"
            >
              <FaList /> سجل الإيصالات
            </button>
            <Button type="submit" variant="primary" icon={<FaSave />} size="sm" disabled={processing}>
              {processing ? 'جارِ الحفظ...' : 'حفظ الإيصال'}
            </Button>
            <Button type="button" variant="secondary" icon={<FaTimes />} onClick={handleCancel} size="sm">
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewCashReceipt;