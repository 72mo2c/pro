// ======================================
// Manage Categories - إدارة الفئات
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { FaTags, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaLock } from 'react-icons/fa';

const ManageCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const { showSuccess, showError, showConfirm } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // دالة تنسيق العملة (للاستخدام المستقبلي)
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#fb923c' // اللون البرتقالي الافتراضي
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!hasPermission(editingId ? 'edit_category' : 'add_category')) {
      showError(`ليس لديك صلاحية ${editingId ? 'تعديل' : 'إضافة'} الفئات`);
      return;
    }
    
    if (!formData.name.trim()) {
      showError('يرجى إدخال اسم الفئة');
      return;
    }

    try {
      if (editingId) {
        updateCategory(editingId, formData);
        showSuccess('تم تحديث الفئة بنجاح');
        setEditingId(null);
      } else {
        addCategory(formData);
        showSuccess('تم إضافة الفئة بنجاح');
      }
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        description: '',
        color: '#fb923c'
      });
    } catch (error) {
      showError('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
  };

  const handleEdit = (category) => {
    if (!hasPermission('edit_category')) {
      showError('ليس لديك صلاحية تعديل الفئات');
      return;
    }
    
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#fb923c'
    });
    setEditingId(category.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    if (!hasPermission('delete_category')) {
      showError('ليس لديك صلاحية حذف الفئات');
      return;
    }
    
    showConfirm(
      'حذف الفئة',
      `هل أنت متأكد من حذف الفئة "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
      () => {
        try {
          deleteCategory(id);
          showSuccess('تم حذف الفئة بنجاح');
        } catch (error) {
          showError('حدث خطأ، يرجى المحاولة مرة أخرى');
        }
      },
      {
        type: 'danger',
        confirmText: 'حذف الفئة',
        cancelText: 'إلغاء'
      }
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      color: '#fb923c'
    });
  };

  // فلترة الفئات حسب البحث
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ألوان مقترحة
  const suggestedColors = [
    { name: 'برتقالي', value: '#fb923c' },
    { name: 'أزرق', value: '#3b82f6' },
    { name: 'أخضر', value: '#10b981' },
    { name: 'أحمر', value: '#ef4444' },
    { name: 'بنفسجي', value: '#8b5cf6' },
    { name: 'وردي', value: '#ec4899' },
    { name: 'أصفر', value: '#f59e0b' },
    { name: 'رمادي', value: '#6b7280' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">إدارة الفئات</h1>
        {!hasPermission('manage_categories') && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            <FaLock className="text-sm" />
            <span className="text-sm font-medium">عرض فقط - ليس لديك صلاحيات الإدارة</span>
          </div>
        )}
      </div>

      {/* نموذج إضافة/تعديل الفئة */}
      {hasPermission('manage_categories') && (
        <Card icon={<FaTags />} className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            {editingId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">اسم الفئة</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: إلكترونيات، أغذية، ملابس..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">اللون المميز</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-9 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  placeholder="#fb923c"
                />
              </div>
            </div>
          </div>

          {/* ألوان مقترحة */}
          <div>
            <label className="text-sm font-medium mb-1 block">ألوان مقترحة</label>
            <div className="flex flex-wrap gap-2">
              {suggestedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className="px-3 py-1.5 rounded-lg border transition-all hover:scale-105 text-xs"
                  style={{
                    backgroundColor: color.value,
                    borderColor: formData.color === color.value ? '#000' : 'transparent',
                    color: '#fff'
                  }}
                  title={color.name}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">وصف الفئة (اختياري)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="أدخل وصف مختصر للفئة..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant={editingId ? "primary" : "success"} size="sm" icon={editingId ? <FaEdit /> : <FaPlus />}>
              {editingId ? 'تحديث الفئة' : 'إضافة الفئة'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" size="sm" icon={<FaTimes />} onClick={handleCancel}>
                إلغاء
              </Button>
            )}
          </div>
          </form>
        </Card>
      )}

      {/* قائمة الفئات */}
      <Card icon={<FaTags />}>
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">
            الفئات المتاحة ({categories.length})
          </h2>
          <input
            type="text"
            placeholder="بحث عن فئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-48 px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <FaTags className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'لا توجد فئات مطابقة للبحث' : 'لا توجد فئات بعد، قم بإضافة الفئة الأولى!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="p-3 rounded-lg border border-gray-200 hover:border-orange-300 transition-all bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg text-sm"
                      style={{ backgroundColor: category.color || '#fb923c' }}
                    >
                      <FaTags />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-xs text-gray-600 mb-2 pr-1">{category.description}</p>
                )}

                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                  {hasPermission('edit_category') && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<FaEdit />}
                      onClick={() => handleEdit(category)}
                      className="flex-1"
                    >
                      تعديل
                    </Button>
                  )}
                  {hasPermission('delete_category') && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<FaTrash />}
                      onClick={() => handleDelete(category.id, category.name)}
                      className="flex-1"
                    >
                      حذف
                    </Button>
                  )}
                  {!hasPermission('edit_category') && !hasPermission('delete_category') && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm w-full justify-center py-1">
                      <FaLock className="text-xs" />
                      <span>عرض فقط</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageCategories;
