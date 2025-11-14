// ======================================
// New Simple Cash Receipt - إضافة إذن استلام نقدي مبسط
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
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
  FaCalculator,
  FaCheckCircle
} from 'react-icons/fa';

const NewSimpleCashReceipt = () => {
  const navigate = useNavigate();
  const { addCashReceipt, customers, treasuryBalance } = useData();
  const { showError, showSuccess } = useNotification();
  const { openTab } = useTab();
  
  const [formData, setFormData] = useState({
    receiptNumber: `REC-${Date.now()}`,
    amount: '',
    fromType: 'customer', // customer, supplier, other
    fromId: '',
    fromName: '',
    paymentMethod: 'cash', // cash, check, bank_transfer
    referenceNumber: '',
    notes: '',
    description: ''
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  
  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;
    return numericAmount.toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ج.م';
  };

  // دالة فتح سجل إيصالات الاستلام
  const openReceiptsList = () => {
    openTab('/treasury/receipts', 'سجل إيصالات الاستلام', '💰');
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'يرجى إدخال مبلغ صحيح';
    }
    
    if (formData.fromType === 'customer' && !formData.fromId) {
      newErrors.fromId = 'يرجى اختيار عميل';
    }
    
    if (formData.fromType === 'other' && !formData.fromName.trim()) {
      newErrors.fromName = 'يرجى إدخال اسم الجهة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالجة اختيار العميل
  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    setFormData(prev => ({
      ...prev,
      fromId: customerId || '',
      fromName: customer ? customer.name : ''
    }));
  };

  // حساب رصيد العميل بعد الدفع
  const getCustomerBalanceAfterPayment = () => {
    if (!selectedCustomer) return null;
    
    const currentBalance = parseFloat(selectedCustomer.balance) || 0;
    const paymentAmount = parseFloat(formData.amount) || 0;
    const newBalance = currentBalance - paymentAmount;
    
    return {
      current: currentBalance,
      payment: paymentAmount,
      new: newBalance,
      isOverPayment: paymentAmount > currentBalance,
      overPayment: paymentAmount > currentBalance ? paymentAmount - currentBalance : 0
    };
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('يرجى تصحيح الأخطاء أولاً');
      return;
    }
    
    try {
      const receiptData = {
        receiptNumber: formData.receiptNumber,
        amount: parseFloat(formData.amount),
        fromType: formData.fromType,
        fromId: formData.fromId || null,
        fromName: formData.fromName || formData.fromId ? 
          (selectedCustomer ? selectedCustomer.name : formData.fromName) : 'غير محدد',
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
        description: formData.description,
        date: new Date().toISOString().split('T')[0]
      };
      
      const result = addCashReceipt(receiptData);
      
      const balanceInfo = getCustomerBalanceAfterPayment();
      let successMessage = 'تم تسجيل إيصال الاستلام بنجاح!';
      
      if (balanceInfo) {
        if (balanceInfo.new > 0) {
          successMessage += `\nالعميل ما زال مدين بـ: ${formatCurrency(balanceInfo.new)}`;
        } else if (balanceInfo.new === 0) {
          successMessage += `\nتم سداد الدين بالكامل للعميل`;
        } else {
          successMessage += `\nتم إنشاء رصيد مسبق للعميل: ${formatCurrency(Math.abs(balanceInfo.new))}`;
        }
      }
      
      successMessage += `\nرصيد الخزينة الجديد: ${formatCurrency(result.treasuryBalanceAfter)}`;
      
      showSuccess(successMessage);
      
      // إعادة تعيين النموذج
      setFormData({
        receiptNumber: `REC-${Date.now()}`,
        amount: '',
        fromType: 'customer',
        fromId: '',
        fromName: '',
        paymentMethod: 'cash',
        referenceNumber: '',
        notes: '',
        description: ''
      });
      setSelectedCustomer(null);
      
    } catch (error) {
      console.error('خطأ في تسجيل الإيصال:', error);
      showError(error.message || 'حدث خطأ أثناء تسجيل الإيصال');
    }
  };

  const balanceInfo = getCustomerBalanceAfterPayment();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* رأس الصفحة */}
        <PageHeader 
          title="إيصال استلام نقدي"
          subtitle="تسجيل مبالغ نقدية مستلمة مع إدارة أرصدة العملاء"
          actions={
            <Button
              variant="secondary"
              onClick={openReceiptsList}
              className="ml-3"
            >
              <FaList className="ml-2" />
              سجل الإيصالات
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* النموذج الرئيسي */}
          <div className="lg:col-span-2">
            <Card>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  رصيد الخزينة الحالي: {formatCurrency(treasuryBalance)}
                </h3>
                <p className="text-blue-600 text-sm">
                  سيتم إضافة المبلغ المستلم إلى هذا الرصيد
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* رقم الإيصال والمبلغ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الإيصال *
                    </label>
                    <input
                      type="text"
                      value={formData.receiptNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المبلغ *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      required
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                  </div>
                </div>

                {/* نوع الجهة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الجهة *
                  </label>
                  <select
                    value={formData.fromType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="customer">عميل</option>
                    <option value="supplier">مورد</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                {/* اختيار العميل أو إدخال اسم الجهة */}
                {formData.fromType === 'customer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العميل *
                    </label>
                    <select
                      value={formData.fromId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fromId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">اختر العميل</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - الرصيد: {formatCurrency(customer.balance || 0)}
                        </option>
                      ))}
                    </select>
                    {errors.fromId && <p className="text-red-500 text-xs mt-1">{errors.fromId}</p>}
                  </div>
                )}

                {(formData.fromType === 'supplier' || formData.fromType === 'other') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.fromType === 'supplier' ? 'المورد' : 'اسم الجهة'} *
                    </label>
                    <input
                      type="text"
                      value={formData.fromName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fromName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={formData.fromType === 'supplier' ? 'اسم المورد' : 'اسم الجهة'}
                      required
                    />
                    {errors.fromName && <p className="text-red-500 text-xs mt-1">{errors.fromName}</p>}
                  </div>
                )}

                {/* طريقة الدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة الدفع
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">نقداً</option>
                    <option value="check">شيك</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>

                {/* رقم مرجعي */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم مرجعي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="رقم الشيك أو التحويل"
                  />
                </div>

                {/* الوصف */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف المبلغ
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="سبب الاستلام"
                  />
                </div>

                {/* ملاحظات */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أي ملاحظات إضافية"
                  />
                </div>

                {/* أزرار التحكم */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/treasury/receipts')}
                  >
                    <FaTimes className="ml-2" />
                    إلغاء
                  </Button>
                  
                  <Button type="submit" variant="primary">
                    <FaSave className="ml-2" />
                    حفظ الإيصال
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* معلومات العميل والنتائج */}
          <div className="lg:col-span-1">
            
            {/* معلومات العميل */}
            {selectedCustomer && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUser className="ml-2 text-blue-600" />
                  معلومات العميل
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">الاسم:</span>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">الرصيد الحالي:</span>
                    <p className={`font-medium ${(selectedCustomer.balance || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedCustomer.balance || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">الهاتف:</span>
                    <p className="font-medium">{selectedCustomer.phone || 'غير محدد'}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* نتائج المعاملة */}
            {formData.amount && selectedCustomer && balanceInfo && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCalculator className="ml-2 text-green-600" />
                  نتائج المعاملة
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">الرصيد الحالي:</div>
                    <div className="font-semibold text-red-600">{formatCurrency(balanceInfo.current)}</div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600">المبلغ المدفوع:</div>
                    <div className="font-semibold text-blue-700">{formatCurrency(balanceInfo.payment)}</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    balanceInfo.new > 0 ? 'bg-red-50' : 
                    balanceInfo.new < 0 ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <div className="text-sm text-gray-600">الرصيد الجديد:</div>
                    <div className={`font-semibold ${
                      balanceInfo.new > 0 ? 'text-red-600' : 
                      balanceInfo.new < 0 ? 'text-green-600' : 'text-gray-700'
                    }`}>
                      {formatCurrency(Math.abs(balanceInfo.new))}
                      {balanceInfo.new > 0 && ' (مدين)'}
                      {balanceInfo.new < 0 && ' (رصيد مسبق)'}
                    </div>
                  </div>
                  
                  {balanceInfo.isOverPayment && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-600">الفائض (رصيد مسبق):</div>
                      <div className="font-semibold text-green-700">{formatCurrency(balanceInfo.overPayment)}</div>
                    </div>
                  )}
                  
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600">سيتم إضافته للخزينة:</div>
                    <div className="font-semibold text-green-700 text-lg">{formatCurrency(balanceInfo.payment)}</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSimpleCashReceipt;
