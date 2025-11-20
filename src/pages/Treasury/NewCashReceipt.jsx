// ======================================
// New Cash Receipt - إضافة إذن استلام نقدي
// ======================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useNotification } from '../../context/NotificationContextWithSound';
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
  FaHistory
} from 'react-icons/fa';

const NewCashReceipt = () => {
  const navigate = useNavigate();
  const { addCashReceipt, customers, suppliers, getCustomerBalance, getSupplierBalance, treasuryBalance } = useData();
  const { settings } = useSystemSettings();
  const { showError, showSuccess, showInfo } = useNotification();
  const { openTab } = useTab();
  
  // دالة لفتح سجل إيصالات الاستلام في تبويبة جديدة
  const handleOpenReceiptsRecord = () => {
    openTab('/treasury/receipts', 'سجل إيصالات الاستلام', '💰');
  };
  
  const [formData, setFormData] = useState({
    receiptNumber: Date.now(),
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    fromType: 'customer', // customer, supplier, other
    fromId: '',
    fromName: '',
    paymentMethod: 'cash', // cash, check, bank_transfer
    referenceNumber: '',
    notes: '',
    description: '',
    // حقول الشيك
    checkNumber: '',
    checkBank: '',
    checkBranch: '',
    checkDueDate: '',
    checkOwnerName: '',
    // حقول التحويل البنكي
    transferNumber: '',
    transferBankFrom: '',
    transferAccountFrom: '',
    transferBankTo: '',
    transferDate: ''
  });
  
  const [selectedSource, setSelectedSource] = useState(null);
  
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

  // حساب المبلغ المتبقي بعد الخصم من الدين
  const getRemainingAmount = () => {
    const currentBalance = getSourceCurrentBalance();
    const paymentAmount = parseFloat(formData.amount) || 0;
    
    if (currentBalance > 0) {
      // هناك دين - سيتم خصم من الدين
      return Math.max(0, paymentAmount - currentBalance);
    }
    // لا يوجد دين - كل المبلغ يذهب للخزينة
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

  // معلومات المعاملة المحسوبة
  const transactionInfo = useMemo(() => {
    const currentBalance = getSourceCurrentBalance();
    const paymentAmount = parseFloat(formData.amount) || 0;
    const remainingAmount = getRemainingAmount();
    const transactionType = getTransactionType();
    
    return {
      currentBalance,
      paymentAmount,
      remainingAmount,
      transactionType,
      willReduceBalance: currentBalance > 0,
      willIncreaseBalance: currentBalance <= 0,
      newBalanceAfterPayment: Math.max(0, currentBalance - paymentAmount)
    };
  }, [formData.fromType, formData.fromId, formData.amount, getCustomerBalance, getSupplierBalance]);

  // الحصول على قائمة المصادر بناءً على النوع
  const getSourceList = () => {
    if (formData.fromType === 'customer') {
      return customers;
    } else if (formData.fromType === 'supplier') {
      return suppliers;
    }
    return [];
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
      } else {
        setSelectedSource(null);
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
    
    // التحقق من حقول الشيك
    if (formData.paymentMethod === 'check') {
      if (!formData.checkNumber) newErrors.checkNumber = 'يرجى إدخال رقم الشيك';
      if (!formData.checkBank) newErrors.checkBank = 'يرجى إدخال اسم البنك';
      if (!formData.checkDueDate) newErrors.checkDueDate = 'يرجى إدخال تاريخ الاستحقاق';
      if (!formData.checkOwnerName) newErrors.checkOwnerName = 'يرجى إدخال اسم صاحب الشيك';
    }
    
    // التحقق من حقول التحويل البنكي
    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.transferNumber) newErrors.transferNumber = 'يرجى إدخال رقم الحوالة';
      if (!formData.transferBankFrom) newErrors.transferBankFrom = 'يرجى إدخال البنك المرسل';
      if (!formData.transferBankTo) newErrors.transferBankTo = 'يرجى إدخال البنك المستلم';
      if (!formData.transferDate) newErrors.transferDate = 'يرجى إدخال تاريخ التحويل';
    }
    
    // ✅ تصحيح: لا نحتاج للتحقق من الرصيد في حالة استلام النقدية
    // إذن الاستلام يزيد رصيد الخزينة وليس يقل منه
    // هذا التحقق مطلوب فقط في حالة صرف النقدية
    
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
        // معلومات إضافية لحركة الخزينة
        transactionInfo: {
          currentBalance: transactionInfo.currentBalance,
          paymentAmount: transactionInfo.paymentAmount,
          remainingAmount: transactionInfo.remainingAmount,
          transactionType: transactionInfo.transactionType,
          newBalanceAfterPayment: transactionInfo.newBalanceAfterPayment,
          willReduceBalance: transactionInfo.willReduceBalance,
          willIncreaseBalance: transactionInfo.willIncreaseBalance
        }
      };
      
      addCashReceipt(receiptData);
      
      // عرض رسالة تفصيلية حسب نوع المعاملة
      const { transactionType, currentBalance, remainingAmount, newBalanceAfterPayment } = transactionInfo;
      
      let successMessage = `تم إضافة إيصال الاستلام بنجاح!\n`;
      
      if (transactionType === 'دفع دين كامل') {
        successMessage += `تم سداد الدين بالكامل (${formatCurrency(currentBalance)})`;
        if (remainingAmount > 0) {
          successMessage += ` وإضافة ${formatCurrency(remainingAmount)} للخزينة`;
        }
        successMessage += `\nالرصيد الجديد: ${formatCurrency(newBalanceAfterPayment)}`;
      } else if (transactionType === 'دفع دين جزئي') {
        successMessage += `تم خصم ${formatCurrency(transactionInfo.paymentAmount)} من الدين`;
        successMessage += `\nالرصيد المتبقي: ${formatCurrency(newBalanceAfterPayment)}`;
      } else {
        successMessage += `تم إضافة ${formatCurrency(transactionInfo.paymentAmount)} للخزينة`;
        if (currentBalance < 0) {
          successMessage += `\nالرصيد المتوفر: ${formatCurrency(Math.abs(currentBalance))} كرصيد مسبق`;
        }
      }
      
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
    <div className="space-y-3">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* الصف الأول: البيانات الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">رقم الإيصال</label>
              <input
                type="text"
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded bg-gray-50"
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                المبلغ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">التاريخ</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">الوقت</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">نوع المصدر</label>
              <select
                name="fromType"
                value={formData.fromType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              >
                <option value="customer">عميل</option>
                <option value="supplier">مورد</option>
                <option value="other">أخرى</option>
              </select>
            </div>
              
              {formData.fromType !== 'other' ? (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  {formData.fromType === 'customer' ? 'العميل' : 'المورد'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="fromId"
                  value={formData.fromId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${
                    errors.fromId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر</option>
                  {getSourceList().map(source => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  اسم المصدر <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fromName"
                  value={formData.fromName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${
                    errors.fromName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="اسم المصدر"
                />
              </div>
            )}
          </div>

          {/* معلومات المصدر المختار */}
          {selectedSource && formData.fromType !== 'other' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">معلومات المصدر</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">الاسم:</span> <span className="font-medium">{selectedSource.name}</span></div>
                  <div><span className="text-gray-600">هاتف:</span> <span className="font-medium">{selectedSource.phone1 || '-'}</span></div>
                  <div className="col-span-2"><span className="text-gray-600">عنوان:</span> <span className="font-medium">{selectedSource.address || '-'}</span></div>
                </div>
              </div>
              
              {formData.amount && (
                <div className={`border rounded p-3 ${transactionInfo.currentBalance > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                  <h4 className="text-sm font-semibold mb-2 ${transactionInfo.currentBalance > 0 ? 'text-orange-800' : 'text-green-800'}">حالة الرصيد</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-600">الرصيد:</span><br/><span className={`font-bold ${transactionInfo.currentBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatCurrency(transactionInfo.currentBalance)}</span></div>
                    <div><span className="text-gray-600">الدفع:</span><br/><span className="font-bold text-blue-600">{formatCurrency(transactionInfo.paymentAmount)}</span></div>
                    <div><span className="text-gray-600">بعد:</span><br/><span className={`font-bold ${transactionInfo.newBalanceAfterPayment > 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatCurrency(transactionInfo.newBalanceAfterPayment)}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* الصف الثاني: طريقة الدفع والمعلومات الإضافية */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">طريقة الدفع</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">رقم المرجع</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                placeholder="رقم المرجع"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">الوصف</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                placeholder="وصف مختصر"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">ملاحظات</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                placeholder="ملاحظات إضافية"
              />
            </div>
          </div>
            
          {/* حقول الشيك */}
          {formData.paymentMethod === 'check' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="text-sm font-semibold mb-3 text-yellow-800">معلومات الشيك</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    رقم الشيك <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="checkNumber"
                    value={formData.checkNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${errors.checkNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="رقم الشيك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    اسم البنك <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="checkBank"
                    value={formData.checkBank}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${errors.checkBank ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="اسم البنك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">فرع البنك</label>
                  <input
                    type="text"
                    name="checkBranch"
                    value={formData.checkBranch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="اسم الفرع"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    تاريخ الاستحقاق <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkDueDate"
                    value={formData.checkDueDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${errors.checkDueDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    اسم صاحب الشيك <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="checkOwnerName"
                    value={formData.checkOwnerName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${errors.checkOwnerName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="اسم صاحب الشيك"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* حقول التحويل البنكي */}
          {formData.paymentMethod === 'bank_transfer' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="text-sm font-semibold mb-3 text-blue-800">معلومات التحويل البنكي</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    رقم الحوالة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="transferNumber"
                    value={formData.transferNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${errors.transferNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="رقم الحوالة/المرجع"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    البنك المرسل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="transferBankFrom"
                    value={formData.transferBankFrom}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${errors.transferBankFrom ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="اسم البنك المرسل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">رقم الحساب المرسل</label>
                  <input
                    type="text"
                    name="transferAccountFrom"
                    value={formData.transferAccountFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="رقم الحساب"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    البنك المستلم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="transferBankTo"
                    value={formData.transferBankTo}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${errors.transferBankTo ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="اسم البنك المستلم"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    تاريخ التحويل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="transferDate"
                    value={formData.transferDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${errors.transferDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* أزرار التحكم */}
          <div className="flex justify-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleOpenReceiptsRecord}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              <FaList /> سجل الإيصالات
            </button>
            <Button type="submit" variant="primary" icon={<FaSave />} size="md" disabled={processing}>
              {processing ? 'جارِ الحفظ...' : 'حفظ الإيصال'}
            </Button>
            <Button type="button" variant="secondary" icon={<FaTimes />} onClick={handleCancel} size="md">
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewCashReceipt;