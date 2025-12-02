// ======================================
// Group Modal - نافذة إضافة/تعديل المجموعات
// ======================================

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { HiX, HiSave } from 'react-icons/hi';

const GroupModal = ({ isOpen, onClose, onSave, group, parentGroup, existingGroups }) => {
  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#5C9CFF', // لون افتراضي
    parentId: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ملء النموذج عند التعديل
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        color: group.color || '#5C9CFF',
        parentId: group.parentId || null
      });
    } else {
      // تحديد لون تلقائي حسب المستوى
      const level = parentGroup ? parentGroup.level + 1 : 1;
      const color = generateLevelColor(level);
      setFormData({
        name: '',
        description: '',
        color: color,
        parentId: parentGroup ? parentGroup.id : null
      });
    }
    setErrors({});
  }, [group, parentGroup, isOpen]);

  // توليد لون للمستوى
  const generateLevelColor = (level) => {
    const hue = (level * 137.508) % 360; // Golden angle
    return `hsl(${hue}, 70%, 60%)`;
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المجموعة مطلوب';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'اسم المجموعة يجب أن يكون حرفين على الأقل';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'اسم المجموعة يجب ألا يزيد عن 50 حرف';
    } else {
      // التحقق من عدم تكرار الاسم في نفس المستوى
      const isDuplicate = existingGroups.some(existing => 
        existing.id !== group?.id && 
        existing.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        existing.parentId === formData.parentId
      );
      if (isDuplicate) {
        newErrors.name = 'يوجد مجموعة بنفس الاسم في هذا المستوى';
      }
    }

    if (formData.description.length > 200) {
      newErrors.description = 'الوصف يجب ألا يزيد عن 200 حرف';
    }

    if (!formData.color) {
      newErrors.color = 'يرجى اختيار لون للمجموعة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالجة تغيير الحقول
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // إزالة رسالة الخطأ عند التحرير
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // معالجة الإرسال
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const groupData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        updatedAt: new Date().toISOString()
      };

      await onSave(groupData);
    } catch (error) {
      console.error('خطأ في حفظ المجموعة:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ألوان مقترحة
  const suggestedColors = [
    { name: 'أزرق', value: 'hsl(210, 70%, 60%)', rgb: '#5C9CFF' },
    { name: 'أخضر', value: 'hsl(150, 70%, 60%)', rgb: '#52E89D' },
    { name: 'برتقالي', value: 'hsl(30, 70%, 60%)', rgb: '#FFB452' },
    { name: 'بنفسجي', value: 'hsl(280, 70%, 60%)', rgb: '#C56BFF' },
    { name: 'أحمر', value: 'hsl(0, 70%, 60%)', rgb: '#FF6B6B' },
    { name: 'سماوي', value: 'hsl(180, 70%, 60%)', rgb: '#6DD5FA' },
    { name: 'وردي', value: 'hsl(320, 70%, 60%)', rgb: '#F093FB' },
    { name: 'أصفر', value: 'hsl(50, 70%, 60%)', rgb: '#FFD93D' }
  ];

  // تحديث لون ديناميكي
  const updateColor = (color) => {
    setFormData(prev => ({
      ...prev,
      color: color
    }));
    
    if (errors.color) {
      setErrors(prev => ({
        ...prev,
        color: ''
      }));
    }
  };

  // إنشاء لون عشوائي
  const generateRandomColor = () => {
    const level = parentGroup ? parentGroup.level + 1 : 1;
    const randomColor = generateLevelColor(level + Math.floor(Math.random() * 5));
    updateColor(randomColor);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {group ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
            </h2>
            {parentGroup && (
              <p className="text-sm text-gray-600 mt-1">
                المجموعة الأب: <span className="font-medium">{parentGroup.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتوى النافذة */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم المجموعة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المجموعة *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: إلكترونيات، أغذية، ملابس..."
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.name 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                dir="rtl"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* وصف المجموعة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المجموعة (اختياري)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="أدخل وصف مختصر للمجموعة..."
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.description 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                dir="rtl"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 حرف
              </p>
            </div>

            {/* اختيار اللون */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                اللون المميز للمجموعة
              </label>
              
              {/* اللون المحدد */}
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 shadow-sm"
                  style={{ backgroundColor: formData.color }}
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => updateColor(e.target.value)}
                    placeholder="hsl(h, s, l)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateRandomColor}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  لون عشوائي
                </button>
              </div>

              {/* ألوان مقترحة */}
              <div>
                <p className="text-xs text-gray-600 mb-2">ألوان مقترحة:</p>
                <div className="grid grid-cols-4 gap-3">
                  {suggestedColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateColor(color.value)}
                      className="p-3 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-md"
                      style={{
                        backgroundColor: color.value,
                        borderColor: formData.color === color.value ? '#000' : '#E5E7EB'
                      }}
                      title={`${color.name} - ${color.rgb}`}
                    >
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {errors.color && (
                <p className="text-red-500 text-xs mt-2">{errors.color}</p>
              )}
            </div>

            {/* معلومات المستوى */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-lg"
                  style={{ backgroundColor: formData.color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    مستوى المجموعة: {parentGroup ? parentGroup.level + 1 : 1}
                  </p>
                  <p className="text-xs text-gray-600">
                    {parentGroup 
                      ? `مجموعة فرعية لـ "${parentGroup.name}"`
                      : 'مجموعة رئيسية'
                    }
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* أزرار النافذة */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {group ? 'تحديث' : 'إضافة'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;