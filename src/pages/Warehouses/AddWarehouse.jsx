// ======================================
// Add Warehouse - إضافة مخزن جديد
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { PhoneInput } from '../../components/Common/Input';
import { FaWarehouse, FaSave, FaArrowLeft } from 'react-icons/fa';

const AddWarehouse = () => {
  const navigate = useNavigate();
  const { addWarehouse, warehouses } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // التحقق من اسم المخزن
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المخزن مطلوب';
    } else {
      // التحقق من عدم تكرار الاسم
      const duplicateName = warehouses?.some(
        w => w.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      if (duplicateName) {
        newErrors.name = 'اسم المخزن موجود مسبقاً';
      }
    }

    // التحقق من العنوان
    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    // التحقق من رقم الهاتف (إذا تم إدخاله)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\+20(10|11|12|15)[0-9]{8}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ +20 ويتبعه 10 أرقام';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // إزالة رسالة الخطأ عند التعديل
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      const warehouseData = {
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        manager: formData.manager.trim(),
        description: formData.description.trim(),
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      addWarehouse(warehouseData);
      showSuccess('تم إضافة المخزن بنجاح');
      
      // الانتقال إلى صفحة إدارة المخازن
      setTimeout(() => {
        navigate('/warehouses/manage');
      }, 1000);
    } catch (error) {
      showError('حدث خطأ في إضافة المخزن');
      console.error('Error adding warehouse:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      manager: '',
      description: ''
    });
    setErrors({});
  };

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaWarehouse className="text-orange-500" />
            إضافة مخزن جديد
          </h1>
          <p className="text-gray-600 text-sm mt-1">أدخل معلومات المخزن الجديد</p>
        </div>
        <Button
          variant="secondary"
          icon={<FaArrowLeft />}
          onClick={() => navigate('/warehouses/manage')}
        >
          العودة
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المخزن
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: المخزن الرئيسي - القاهرة"
                required
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="أدخل عنوان المخزن في مصر"
                required
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                  errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <PhoneInput
              label="رقم الهاتف"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="1012345678"
              error={errors.phone}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مدير المخزن
              </label>
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                placeholder="اسم المدير المسؤول"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وصف المخزن (اختياري)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              placeholder="أدخل وصف المخزن، الموقع، المميزات، إلخ..."
            />
          </div>

          <div className="flex gap-3 pt-3 border-t">
            <Button type="submit" variant="success" icon={<FaSave />} size="sm">
              حفظ المخزن
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={handleReset}
              size="sm"
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Card>

      {/* نصائح */}
      <Card className="mt-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 text-lg">💡</div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1 text-sm">نصائح مهمة:</h3>
            <ul className="text-xs text-blue-800 space-y-0.5">
              <li>• تأكد من إدخال اسم فريد لكل مخزن</li>
              <li>• العنوان يجب أن يكون دقيقاً لسهولة التوصيل</li>
              <li>• رقم الهاتف يجب أن يكون مصري ويبدأ بـ +20</li>
              <li>• يمكنك تعيين مدير مسؤول لكل مخزن</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddWarehouse;