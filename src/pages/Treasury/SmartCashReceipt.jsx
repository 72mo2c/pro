// ======================================
// Smart Cash Receipt System - النظام الذكي لإستلام النقدية
// نظام متقدم للخزينة مع التحقق من الدين والسداد التلقائي
// ======================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
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
  FaLink,
  FaArrowRight,
  FaArrowLeft,
  FaCreditCard,
  FaShiledAlt,
  FaChartLine,
  FaSync
} from 'react-icons/fa';

const SmartCashReceipt = () => {
  const navigate = useNavigate();
  const { 
    addCashReceiptWithInvoiceLink,
    customers, 
    suppliers, 
    getCustomerBalance, 
    getSupplierBalance,
    getCustomerDeferredInvoices,
    getSupplierDeferredInvoices,
    salesInvoices,
    purchaseInvoices
  } = useData();
  const { showError, showSuccess, showInfo } = useNotification();
  const { settings } = useSystemSettings();
  const { openTab } = useTab();
  
  const [formData, setFormData] = useState({
    receiptNumber: `REC-${Date.now()}`,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    fromType: 'customer',
    fromId: '',
    paymentMethod: 'cash',
    notes: ''
  });
  
  const [selectedSource, setSelectedSource] = useState(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [settlementPlan, setSettlementPlan] = useState({
    totalDebt: 0,
    paymentAmount: 0,
    invoicesToPay: [],
    remainingAmount: 0,
    willUseAdvance: false,
    willIncreaseAdvance: false
  });
  const [processing, setProcessing] = useState(false);
  const [autoMode, setAutoMode] = useState(true); // السداد التلقائي
  const [showDetails, setShowDetails] = useState(false);
  
  // تنسيق العملة
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // تحديد مصدر البيانات حسب النوع
  const getSourceList = () => {
    if (formData.fromType === 'customer') return customers;
    if (formData.fromType === 'supplier') return suppliers;
    return [];
  };
  
  // الحصول على الرصيد الحالي
  const getCurrentBalance = () => {
    if (!selectedSource) return 0;
    return formData.fromType === 'customer' 
      ? getCustomerBalance(selectedSource.id) 
      : getSupplierBalance(selectedSource.id);
  };
  
  // الحصول على الفواتير غير المسددة بالترتيب
  const getUnpaidInvoices = () => {
    if (!selectedSource || !formData.fromType) return [];
    
    let invoices = formData.fromType === 'customer' 
      ? getCustomerDeferredInvoices(selectedSource.id)
      : getSupplierDeferredInvoices(selectedSource.id);
    
    // فلترة الفواتير غير المسددة وترتيبها حسب التاريخ
    return invoices
      .filter(invoice => invoice.remainingAmount > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // حساب خطة السداد الذكية
  const calculateSettlementPlan = () => {
    if (!selectedSource || !formData.amount) {
      setSettlementPlan({
        totalDebt: 0,
        paymentAmount: 0,
        invoicesToPay: [],
        remainingAmount: 0,
        willUseAdvance: false,
        willIncreaseAdvance: false
      });
      return;
    }
    
    const paymentAmount = parseFloat(formData.amount) || 0;
    const currentBalance = getCurrentBalance();
    const invoices = unpaidInvoices;
    
    let remainingPayment = paymentAmount;
    const invoicesToPay = [];
    let totalDebtToPay = 0;
    
    // سداد الفواتير بالترتيب
    for (const invoice of invoices) {
      if (remainingPayment <= 0) break;
      
      const amountToPay = Math.min(invoice.remainingAmount, remainingPayment);
      if (amountToPay > 0) {
        invoicesToPay.push({
          ...invoice,
          paymentAmount: amountToPay,
          willFullyPaid: amountToPay >= invoice.remainingAmount,
          currentPayment: amountToPay,
          newRemaining: invoice.remainingAmount - amountToPay
        });
        totalDebtToPay += amountToPay;
        remainingPayment -= amountToPay;
      }
    }
    
    setSettlementPlan({
      totalDebt: currentBalance,
      paymentAmount,
      invoicesToPay,
      remainingAmount: remainingPayment,
      willUseAdvance: currentBalance > 0,
      willIncreaseAdvance: remainingPayment > 0 && currentBalance <= 0
    });
  };
  
  // تحديث البيانات عند تغيير البيانات الأساسية
  useEffect(() => {
    calculateSettlementPlan();
  }, [formData.amount, selectedSource, formData.fromType, unpaidInvoices]);
  
  // تحميل الفواتير عند اختيار مصدر
  useEffect(() => {
    if (selectedSource) {
      setUnpaidInvoices(getUnpaidInvoices());
    } else {
      setUnpaidInvoices([]);
    }
  }, [selectedSource]);
  
  // معالجة تغيير النماذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'fromId') {
      const sourceList = getSourceList();
      const selected = sourceList.find(s => s.id === parseInt(value));
      setSelectedSource(selected || null);
    }
  };
  
  // التحقق من صحة النموذج
  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showError('يرجى إدخال مبلغ صحيح');
      return false;
    }
    
    if (!selectedSource) {
      showError('يرجى اختيار العميل أو المورد');
      return false;
    }
    
    if (settlementPlan.totalDebt > 0 && settlementPlan.remainingAmount > settlementPlan.totalDebt) {
      showError(`المبلغ المدخل (${formatCurrency(formData.amount)}) أكبر من إجمالي الدين (${formatCurrency(settlementPlan.totalDebt)})`);
      return false;
    }
    
    return true;
  };
  
  // حفظ الإيصال مع التسوية الذكية
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    
    try {
      const receiptData = {
        ...formData,
        fromId: selectedSource.id,
        fromName: selectedSource.name,
        date: `${formData.date}T${formData.time}:00`,
        
        // الفواتير المرتبطة للسداد
        linkedInvoices: settlementPlan.invoicesToPay.map(invoice => ({
          invoiceId: invoice.id,
          paymentAmount: invoice.paymentAmount,
          invoiceType: formData.fromType === 'customer' ? 'sales' : 'purchase',
          willFullyPaid: invoice.willFullyPaid,
          originalAmount: invoice.originalAmount,
          newRemainingAmount: invoice.newRemaining
        })),
        
        // معلومات التسوية الذكية
        intelligentSettlement: {
          totalDebt: settlementPlan.totalDebt,
          paymentAmount: settlementPlan.paymentAmount,
          debtPaid: settlementPlan.totalDebt > 0 ? 
            Math.min(settlementPlan.paymentAmount, settlementPlan.totalDebt) : 0,
          remainingAmount: settlementPlan.remainingAmount,
          invoicesSettled: settlementPlan.invoicesToPay.length,
          invoicesToFullyPaid: settlementPlan.invoicesToPay.filter(inv => inv.willFullyPaid).length,
          settlementPlan: settlementPlan.invoicesToPay.map(inv => ({
            invoiceId: inv.id,
            paymentAmount: inv.paymentAmount,
            currentRemaining: inv.remainingAmount,
            newRemaining: inv.newRemaining,
            willFullyPaid: inv.willFullyPaid,
            percentageOfPayment: (inv.paymentAmount / inv.originalAmount * 100).toFixed(2)
          }))
        }
      };
      
      const result = await addCashReceiptWithInvoiceLink(receiptData);
      
      // عرض رسالة نجاح تفصيلية
      const successMessage = `🎯 تم تسجيل استلام النقدية بنجاح بالنظام الذكي!\n\n` +
        `📊 تفاصيل التسوية:\n` +
        `• المبلغ المستلم: ${formatCurrency(formData.amount)}\n` +
        `• إجمالي الدين: ${formatCurrency(settlementPlan.totalDebt)}\n` +
        `• المبلغ المخصص لسداد الدين: ${formatCurrency(settlementPlan.totalDebt > 0 ? Math.min(settlementPlan.paymentAmount, settlementPlan.totalDebt) : 0)}\n` +
        `• عدد الفواتير المسددة: ${settlementPlan.invoicesToPay.length}\n` +
        `• الفواتير المسددة بالكامل: ${settlementPlan.invoicesToPay.filter(inv => inv.willFullyPaid).length}\n` +
        `• المبلغ المتبقي (رصيد مسبق): ${formatCurrency(settlementPlan.remainingAmount)}\n\n` +
        `✅ النظام يضمن سداد الفواتير بالترتيب وخصم الدين بالكامل`;
      
      showSuccess(successMessage);
      navigate('/treasury/receipts');
      
    } catch (error) {
      showError(`خطأ في معالجة المعاملة: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleCancel = () => navigate('/treasury');
  
  // حساب الإحصائيات
  const stats = useMemo(() => {
    const paymentAmount = parseFloat(formData.amount) || 0;
    const totalDebt = settlementPlan.totalDebt;
    
    return {
      totalDebt,
      paymentAmount,
      debtToPay: totalDebt > 0 ? Math.min(paymentAmount, totalDebt) : 0,
      remainingAmount: paymentAmount - (totalDebt > 0 ? Math.min(paymentAmount, totalDebt) : 0),
      paymentProgress: totalDebt > 0 ? Math.min((paymentAmount / totalDebt) * 100, 100) : 0,
      fullyPaidInvoices: settlementPlan.invoicesToPay.filter(inv => inv.willFullyPaid).length,
      partiallyPaidInvoices: settlementPlan.invoicesToPay.filter(inv => !inv.willFullyPaid && inv.paymentAmount > 0).length
    };
  }, [settlementPlan, formData.amount]);
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="النظام الذكي لإستلام النقدية"
        icon={<FaMoneyBillWave />}
        subtitle="تحقق من الدين - سداد الفواتير بالترتيب - تحديث تلقائي"
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* معلومات الإيصال */}
        <Card title="معلومات الإيصال">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">رقم الإيصال</label>
              <input
                type="text"
                name="receiptNumber"
                value={formData.receiptNumber}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                المبلغ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">التاريخ</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">الوقت</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>
        
        {/* معلومات العميل/المورد */}
        <Card title="معلومات العميل/المورد">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                نوع المصدر <span className="text-red-500">*</span>
              </label>
              <select
                name="fromType"
                value={formData.fromType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="customer">عميل</option>
                <option value="supplier">مورد</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.fromType === 'customer' ? 'العميل' : 'المورد'} <span className="text-red-500">*</span>
              </label>
              <select
                name="fromId"
                value={formData.fromId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر {formData.fromType === 'customer' ? 'العميل' : 'المورد'}</option>
                {getSourceList().map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name} - {source.phone1 || 'لا يوجد هاتف'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* عرض معلومات المصدر والديه */}
          {selectedSource && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                {formData.fromType === 'customer' ? <FaUser /> : <FaBuilding />}
                معلومات {formData.fromType === 'customer' ? 'العميل' : 'المورد'}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">الاسم:</span>
                  <span className="font-medium mr-2">{selectedSource.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">الهاتف:</span>
                  <span className="font-medium mr-2">{selectedSource.phone1 || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">الدين الحالي:</span>
                  <span className={`font-bold mr-2 ${getCurrentBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(getCurrentBalance())}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">الفواتير المؤجلة:</span>
                  <span className="font-bold mr-2">{unpaidInvoices.length} فاتورة</span>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* تحليل التسوية الذكية */}
        {selectedSource && formData.amount && (
          <Card title="تحليل التسوية الذكية">
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="bg-red-50 p-3 rounded text-center">
                <div className="text-sm text-red-600">إجمالي الدين</div>
                <div className="text-lg font-bold text-red-700">{formatCurrency(stats.totalDebt)}</div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded text-center">
                <div className="text-sm text-blue-600">المبلغ المستلم</div>
                <div className="text-lg font-bold text-blue-700">{formatCurrency(stats.paymentAmount)}</div>
              </div>
              
              <div className="bg-orange-50 p-3 rounded text-center">
                <div className="text-sm text-orange-600">سيتم سداده</div>
                <div className="text-lg font-bold text-orange-700">{formatCurrency(stats.debtToPay)}</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded text-center">
                <div className="text-sm text-green-600">المتبقي (رصيد مسبق)</div>
                <div className="text-lg font-bold text-green-700">{formatCurrency(stats.remainingAmount)}</div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded text-center">
                <div className="text-sm text-purple-600">نسبة السداد</div>
                <div className="text-lg font-bold text-purple-700">{stats.paymentProgress.toFixed(1)}%</div>
              </div>
            </div>
            
            {/* تفاصيل الفواتير التي سيتم سدادها */}
            {settlementPlan.invoicesToPay.length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <FaFileInvoice />
                  الفواتير التي سيتم سدادها (بترتيب التاريخ)
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {settlementPlan.invoicesToPay.map((invoice, index) => (
                    <div key={invoice.id} className="bg-gray-50 p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <span className="font-medium">فاتورة #{invoice.id}</span>
                          <span className="text-xs text-gray-500">
                            ({new Date(invoice.date).toLocaleDateString('ar-EG')})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {invoice.willFullyPaid ? (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              سيتم السداد بالكامل
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">
                              سداد جزئي
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">المبلغ الأصلي:</span>
                          <div className="font-medium">{formatCurrency(invoice.originalAmount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">المتبقي حالياً:</span>
                          <div className="font-medium text-red-600">{formatCurrency(invoice.remainingAmount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">سيتم السداد:</span>
                          <div className="font-medium text-blue-600">{formatCurrency(invoice.paymentAmount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">المتبقي بعد السداد:</span>
                          <div className="font-medium text-green-600">{formatCurrency(invoice.newRemaining)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* تحذيرات وتوجيهات */}
            {stats.totalDebt > 0 && stats.paymentProgress < 100 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">تنبيه: سداد جزئي للدين</p>
                    <p className="text-yellow-700">
                      سيتم سداد {stats.paymentProgress.toFixed(1)}% من إجمالي الدين. 
                      الرصيد المتبقي ({formatCurrency(stats.totalDebt - stats.debtToPay)}) 
                      سيتم سداده في العمليات القادمة.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {stats.remainingAmount > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-start gap-2">
                  <FaCheckCircle className="text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">رصيد مسبق جديد</p>
                    <p className="text-blue-700">
                      سيتم إضافة {formatCurrency(stats.remainingAmount)} كرصيد مسبق جديد للعميل 
                      سيتم استخدامه في العمليات القادمة.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
        
        {/* طريقة الدفع والملاحظات */}
        <Card title="تفاصيل إضافية">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">نقداً</option>
                <option value="check">شيك</option>
                <option value="bank_transfer">تحويل بنكي</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">ملاحظات</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="ملاحظات إضافية..."
              />
            </div>
          </div>
        </Card>
        
        {/* أزرار التحكم */}
        <div className="flex justify-center gap-4">
          <Button
            type="button"
            onClick={() => openTab('/treasury/receipts', 'سجل الإيصالات', '💰')}
            variant="secondary"
            icon={<FaList />}
          >
            سجل الإيصالات
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            icon={<FaSave />}
            disabled={processing || !selectedSource}
          >
            {processing ? 'جارٍ المعالجة...' : 'حفظ الإيصال مع التسوية'}
          </Button>
          
          <Button
            type="button"
            variant="danger"
            icon={<FaTimes />}
            onClick={handleCancel}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SmartCashReceipt;