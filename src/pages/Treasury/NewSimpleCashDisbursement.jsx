// ======================================
// New Simple Cash Disbursement - إضافة إذن صرف نقدي مبسط
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { 
  FaSave, 
  FaTimes, 
  FaMoneyBillWave, 
  FaList,
  FaBuilding,
  FaExclamationTriangle
} from 'react-icons/fa';

const NewSimpleCashDisbursement = () => {
  const navigate = useNavigate();
  const { addCashDisbursement, suppliers, customers, treasuryBalance } = useData();
  const { showError, showSuccess } = useNotification();
  
  const [formData, setFormData] = useState({
    disbursementNumber: `DIS-${Date.now()}`,
    amount: '',
    toType: 'supplier', // supplier, customer, employee, other
    toId: '',
    toName: '',
    category: 'expenses', // expenses, salary, invoice_payment, bank, other
    paymentMethod: 'cash', // cash, check, bank_transfer
    referenceNumber: '',
    notes: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;
    return numericAmount.toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ج.م';
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'يرجى إدخال مبلغ صحيح';
    }
    
    if (parseFloat(formData.amount) > treasuryBalance) {
      newErrors.amount = `المبلغ أكبر من رصيد الخزينة المتوفر (${formatCurrency(treasuryBalance)})`;
    }
    
    if ((formData.toType === 'supplier' || formData.toType === 'customer') && !formData.toId) {
      newErrors.toId = `يرجى اختيار ${formData.toType === 'supplier' ? 'مورد' : 'عميل'}`;
    }
    
    if (formData.toType === 'other' && !formData.toName.trim()) {
      newErrors.toName = 'يرجى إدخال اسم الجهة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالجة اختيار المورد/العميل
  const handleRecipientChange = (recipientId) => {
    let recipient = null;
    
    if (formData.toType === 'supplier') {
      recipient = suppliers.find(s => s.id === recipientId);
    } else if (formData.toType === 'customer') {
      recipient = customers.find(c => c.id === recipientId);
    }
    
    setFormData(prev => ({
      ...prev,
      toId: recipientId || '',
      toName: recipient ? recipient.name : ''
    }));
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('يرجى تصحيح الأخطاء أولاً');
      return;
    }
    
    try {
      const disbursementData = {
        disbursementNumber: formData.disbursementNumber,
        amount: parseFloat(formData.amount),
        toType: formData.toType,
        toId: formData.toId || null,
        toName: formData.toName || formData.toId ? 
          ((formData.toType === 'supplier' && suppliers.find(s => s.id === formData.toId)) ? 
           suppliers.find(s => s.id === formData.toId).name :
           (formData.toType === 'customer' && customers.find(c => c.id === formData.toId)) ?
           customers.find(c => c.id === formData.toId).name : formData.toName) : 'غير محدد',
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
        description: formData.description,
        date: new Date().toISOString().split('T')[0]
      };
      
      const result = addCashDisbursement(disbursementData);
      
      const successMessage = `تم تسجيل إيصال الصرف بنجاح!\nرصيد الخزينة الجديد: ${formatCurrency(result.treasuryBalanceAfter)}`;
      
      showSuccess(successMessage);
      
      // إعادة تعيين النموذج
      setFormData({
        disbursementNumber: `DIS-${Date.now()}`,
        amount: '',
        toType: 'supplier',
        toId: '',
        toName: '',
        category: 'expenses',
        paymentMethod: 'cash',
        referenceNumber: '',
        notes: '',
        description: ''
      });
      
    } catch (error) {
      console.error('خطأ في تسجيل الإيصال:', error);
      showError(error.message || 'حدث خطأ أثناء تسجيل الإيصال');
    }
  };

  const paymentAmount = parseFloat(formData.amount) || 0;
  const remainingBalance = treasuryBalance - paymentAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* رأس الصفحة */}
        <PageHeader 
          title="إيصال صرف نقدي"
          subtitle="تسجيل مبالغ نقدية مدفوعة مع إدارة أرصدة الموردين"
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate('/treasury/disbursements')}
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
              <div className={`border rounded-lg p-4 mb-6 ${
                treasuryBalance >= paymentAmount ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 ${
                  treasuryBalance >= paymentAmount ? 'text-green-800' : 'text-red-800'
                }`}>
                  رصيد الخزينة الحالي: {formatCurrency(treasuryBalance)}
                </h3>
                <p className={`text-sm ${
                  treasuryBalance >= paymentAmount ? 'text-green-600' : 'text-red-600'
                }`}>
                  {treasuryBalance >= paymentAmount ? 
                    'يمكن تنفيذ العملية' : 
                    'الرصيد غير كافٍ للمبلغ المطلوب'
                  }
                </p>
                {paymentAmount > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <span className="text-sm text-gray-600">الرصيد بعد الصرف: </span>
                    <span className={`font-semibold ${
                      remainingBalance >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                )}
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
                      value={formData.disbursementNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, disbursementNumber: e.target.value }))}
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
                      max={treasuryBalance}
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
                    value={formData.toType}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      toType: e.target.value,
                      toId: '',
                      toName: ''
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="supplier">مورد</option>
                    <option value="customer">عميل</option>
                    <option value="employee">موظف</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                {/* اختيار المورد/العميل أو إدخال اسم الجهة */}
                {(formData.toType === 'supplier' || formData.toType === 'customer') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.toType === 'supplier' ? 'المورد' : 'العميل'} *
                    </label>
                    <select
                      value={formData.toId}
                      onChange={(e) => handleRecipientChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.toId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">اختر {formData.toType === 'supplier' ? 'المورد' : 'العميل'}</option>
                      {(formData.toType === 'supplier' ? suppliers : customers).map(recipient => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name}
                          {recipient.balance !== undefined && (
                            ` - الرصيد: ${formatCurrency(recipient.balance || 0)}`
                          )}
                        </option>
                      ))}
                    </select>
                    {errors.toId && <p className="text-red-500 text-xs mt-1">{errors.toId}</p>}
                  </div>
                )}

                {formData.toType === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الجهة *
                    </label>
                    <input
                      type="text"
                      value={formData.toName}
                      onChange={(e) => setFormData(prev => ({ ...prev, toName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.toName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="اسم الجهة"
                      required
                    />
                    {errors.toName && <p className="text-red-500 text-xs mt-1">{errors.toName}</p>}
                  </div>
                )}

                {/* فئة المصروف */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    فئة المصروف
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="expenses">مصاريف عامة</option>
                    <option value="salary">رواتب</option>
                    <option value="invoice_payment">سداد فاتورة مشتريات</option>
                    <option value="bank">إيداع في بنك</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

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
                    placeholder="سبب الصرف"
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
                    onClick={() => navigate('/treasury/disbursements')}
                  >
                    <FaTimes className="ml-2" />
                    إلغاء
                  </Button>
                  
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={treasuryBalance < paymentAmount}
                    className={treasuryBalance < paymentAmount ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <FaSave className="ml-2" />
                    حفظ الإيصال
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* معلومات الرصيد */}
          <div className="lg:col-span-1">
            
            {/* معلومات المورد/العميل */}
            {formData.toId && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaBuilding className="ml-2 text-blue-600" />
                  معلومات الجهة
                </h3>
                
                {(() => {
                  let recipient = null;
                  if (formData.toType === 'supplier') {
                    recipient = suppliers.find(s => s.id === formData.toId);
                  } else if (formData.toType === 'customer') {
                    recipient = customers.find(c => c.id === formData.toId);
                  }
                  
                  if (recipient) {
                    return (
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">الاسم:</span>
                          <p className="font-medium">{recipient.name}</p>
                        </div>
                        
                        {recipient.balance !== undefined && (
                          <div>
                            <span className="text-sm text-gray-600">الرصيد الحالي:</span>
                            <p className={`font-medium ${(recipient.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(recipient.balance || 0)}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-sm text-gray-600">الهاتف:</span>
                          <p className="font-medium">{recipient.phone || 'غير محدد'}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </Card>
            )}

            {/* ملخص العملية */}
            {paymentAmount > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaMoneyBillWave className="ml-2 text-green-600" />
                  ملخص العملية
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">الرصيد الحالي:</div>
                    <div className="font-semibold">{formatCurrency(treasuryBalance)}</div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-sm text-red-600">المبلغ المطلوب:</div>
                    <div className="font-semibold text-red-700">{formatCurrency(paymentAmount)}</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${
                    remainingBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-sm ${
                      remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>الرصيد الجديد:</div>
                    <div className={`font-semibold ${
                      remainingBalance >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(Math.abs(remainingBalance))}
                    </div>
                  </div>
                  
                  {treasuryBalance < paymentAmount && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex items-center text-red-700">
                        <FaExclamationTriangle className="ml-2" />
                        <span className="text-sm font-medium">الرصيد غير كافٍ</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        الفرق المطلوب: {formatCurrency(paymentAmount - treasuryBalance)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSimpleCashDisbursement;
