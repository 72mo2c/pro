// ======================================
// Add Customer - إضافة عميل جديد
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import { Select } from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaUserPlus, FaSave, FaCheckCircle, FaPlus, FaList, FaExclamationTriangle } from 'react-icons/fa';

// دالة للتحقق من أرقام الهواتف المصرية (11 رقم بالضبط)
const validatePhoneNumber = (phone) => {
  if (!phone) return { isValid: true, error: null };
  
  // إزالة المسافات والشرطات
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // التحقق من أن الرقم يبدأ برقم مصري (010, 011, 012, 015, 0100-0199)
  const egyptianPhoneRegex = /^(010|011|012|015|0100|0101|0102|0103|0104|0105|0106|0107|0108|0109|0110|0111|0112|0113|0114|0115|0116|0117|0118|0119|0120|0121|0122|0123|0124|0125|0126|0127|0128|0129|0150|0151|0152|0153|0154|0155|0156|0157|0158|0159)[0-9]{7}$/;
  
  if (!cleanPhone.match(/^[0-9]{11}$/)) {
    return {
      isValid: false,
      error: 'رقم الهاتف يجب أن يكون 11 رقم بالضبط (مثال: 01012345678)',
    };
  }
  
  if (!egyptianPhoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'رقم الهاتف يجب أن يبدأ برقم مصري صحيح (010, 011, 012, 015)',
    };
  }
  
  return { isValid: true, error: null };
};

// دالة للتحقق من إدخال رقم هاتف واحد على الأقل
const validateAtLeastOnePhone = (phone1, phone2) => {
  if (!phone1 && !phone2) {
    return {
      isValid: false,
      error: 'يجب إدخال رقم هاتف واحد على الأقل',
    };
  }
  return { isValid: true, error: null };
};

const AddCustomer = () => {
  const { addCustomer } = useData();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastAddedCustomer, setLastAddedCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    area: '',
    phone1: '',
    phone2: '',
    agentType: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      area: '',
      phone1: '',
      phone2: '',
      agentType: ''
    });
    setErrors({}); // مسح الأخطاء
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // التحقق من أرقام الهواتف عند التغيير
    if (name === 'phone1' || name === 'phone2') {
      const validation = validatePhoneNumber(value);
      setErrors(prev => ({
        ...prev,
        [name]: validation.error
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    const newErrors = {};
    
    // التحقق من إدخال رقم هاتف واحد على الأقل
    const phoneValidation = validateAtLeastOnePhone(formData.phone1, formData.phone2);
    if (!phoneValidation.isValid) {
      newErrors.phone1 = phoneValidation.error;
    }
    
    // التحقق من رقم الهاتف الأساسي
    if (formData.phone1) {
      const phone1Validation = validatePhoneNumber(formData.phone1);
      if (!phone1Validation.isValid) {
        newErrors.phone1 = phone1Validation.error;
      }
    }
    
    // التحقق من رقم الهاتف الثانوي (إذا تم إدخاله)
    if (formData.phone2) {
      const phone2Validation = validatePhoneNumber(formData.phone2);
      if (!phone2Validation.isValid) {
        newErrors.phone2 = phone2Validation.error;
      }
    }
    
    // إذا كان هناك أخطاء، عرضها وإيقاف الإرسال
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError('يرجى تصحيح أرقام الهواتف قبل الإرسال');
      return;
    }
    
    try {
      const customerData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const newCustomer = addCustomer(customerData);
      setLastAddedCustomer(newCustomer);
      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      showError('حدث خطأ في إضافة العميل');
    }
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    setLastAddedCustomer(null);
    setErrors({}); // مسح الأخطاء
  };

  const handleGoToList = () => {
    navigate('/customers/manage');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">إضافة عميل جديد</h1>

      <Card icon={<FaUserPlus />}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="اسم العميل"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم العميل"
              required
            />

            <Input
              label="العنوان"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="أدخل العنوان"
              required
            />
            <Select
              label="نوع الوكيل / المندوب"
              name="agentType"
              value={formData.agentType}
              onChange={handleChange}
              options={[
                { value: '', label: 'اختر نوع الوكيل / المندوب' },
                { value: 'general', label: 'عام' },
                { value: 'fatora', label: 'فاتورة' },
                { value: 'kartona', label: 'كرتونة' },
              ]}
              required
            />
            <Input
              label="النطاق"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="مثال: مصر ,القاهرة..."
            />

            <Input
              label="رقم الهاتف 1"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              placeholder="مثال: 01012345678 (11 رقم)"
              required
              error={errors.phone1}
            />

            <Input
              label="رقم الهاتف 2 (اختياري)"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              placeholder="مثال: 01112345678 (11 رقم)"
              error={errors.phone2}
            />

          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="success" icon={<FaSave />} className="px-4 py-2 text-sm">
              حفظ العميل
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={resetForm}
              className="px-4 py-2 text-sm"
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Card>

      {/* نافذة النجاح */}
      {showSuccessModal && lastAddedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            {/* رمز النجاح */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4">
                <FaCheckCircle className="text-5xl text-green-600" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
              تمت الإضافة بنجاح! ✓
            </h2>

            <div className="bg-green-50 p-3 rounded-lg mb-3 border border-green-200">
              <p className="text-gray-700 text-center text-sm">
                تم إضافة العميل <span className="font-bold">"{lastAddedCustomer.name}"</span> بنجاح
              </p>
            </div>

            {/* تفاصيل العميل */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">تفاصيل العميل المضاف:</h3>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-600">الاسم: </span>
                  <span className="font-semibold">{lastAddedCustomer.name}</span>
                </div>
                {lastAddedCustomer.address && (
                  <div>
                    <span className="text-gray-600">العنوان: </span>
                    <span className="font-semibold">{lastAddedCustomer.address}</span>
                  </div>
                )}
                {lastAddedCustomer.area && (
                  <div>
                    <span className="text-gray-600">النطاق: </span>
                    <span className="font-semibold">{lastAddedCustomer.area}</span>
                  </div>
                )}
                {lastAddedCustomer.phone1 && (
                  <div>
                    <span className="text-gray-600">الهاتف: </span>
                    <span className="font-semibold">{lastAddedCustomer.phone1}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-center mb-3 text-sm">ماذا تريد أن تفعل الآن؟</p>

            {/* الأزرار */}
            <div className="flex gap-2">
              <button
                onClick={handleAddAnother}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <FaPlus className="text-xs" />
                إضافة عميل آخر
              </button>
              <button
                onClick={handleGoToList}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <FaList className="text-xs" />
                عرض القائمة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCustomer;
