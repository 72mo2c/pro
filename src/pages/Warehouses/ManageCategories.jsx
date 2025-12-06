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
import { 
  FaTags, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaLock, 
  FaSitemap, 
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaIndent
} from 'react-icons/fa';

const ManageCategories = () => {
  const { 
    categories, 
    addCategory, 
    addCategoryWithSubcategories,
    updateCategory, 
    deleteCategory,
    getMainCategories,
    getSubcategories,
    getCategoryTree,
    addSubcategory,
    moveCategory
  } = useData();
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

  // دوال مساعدة لإدارة المجموعات الفرعية
  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddSubcategory = (parentId) => {
    setFormData({
      name: '',
      description: '',
      color: '#fb923c',
      parentId: parentId
    });
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMoveCategory = (categoryId, newParentId) => {
    try {
      moveCategory(categoryId, newParentId);
      showSuccess('تم نقل الفئة بنجاح');
    } catch (error) {
      showError(error.message);
    }
  };

  // الحصول على الفئات الرئيسية والمجموعات الفرعية
  const mainCategories = getMainCategories();
  const categoryTree = getCategoryTree();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#fb923c', // اللون البرتقالي الافتراضي
    parentId: null // دعم الفئات المتداخلة
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set()); // للفئات المتوسعة
  const [viewMode, setViewMode] = useState('tree'); // 'tree' أو 'list'
  
  // حالة النافذة المنبثقة للفئات الفرعية
  const [showSubcategoriesModal, setShowSubcategoriesModal] = useState(false);
  const [subcategoriesData, setSubcategoriesData] = useState([
    { name: '', description: '', color: '#fb923c' }
  ]);

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
        // إضافة فئة رئيسية (مع أو بدون مجموعات فرعية)
        const validSubcategories = subcategoriesData.filter(sub => sub.name && sub.name.trim());
        
        console.log('محاولة إضافة فئة مع مجموعات فرعية:', {
          mainCategory: formData,
          validSubcategories: validSubcategories
        });
        
        if (validSubcategories.length > 0) {
          // تنظيف بيانات الفئات الفرعية
          const cleanedSubcategories = validSubcategories.map(sub => ({
            name: sub.name.trim(),
            description: sub.description || '',
            color: sub.color || '#fb923c'
          }));
          
          // استخدام الدالة الجديدة لإنشاء فئة مع مجموعاتها الفرعية
          const result = addCategoryWithSubcategories({
            name: formData.name.trim(),
            description: formData.description || '',
            color: formData.color
          }, cleanedSubcategories);
          
          showSuccess(`تم إنشاء الفئة "${result.mainCategory.name}" مع ${result.subcategories.length} مجموعات فرعية بنجاح`);
        } else {
          // إضافة فئة رئيسية فقط
          addCategory(formData);
          showSuccess('تم إضافة الفئة بنجاح');
        }
      }
      
      // إعادة تعيين النماذج
      setFormData({
        name: '',
        description: '',
        color: '#fb923c',
        parentId: null
      });
      setSubcategoriesData([{ name: '', description: '', color: '#fb923c' }]);
    } catch (error) {
      console.error('خطأ في إضافة الفئة:', error);
      showError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
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
      color: category.color || '#fb923c',
      parentId: category.parentId || null
    });
    setEditingId(category.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    if (!hasPermission('delete_category')) {
      showError('ليس لديك صلاحية حذف الفئات');
      return;
    }
    
    const subcategories = getSubcategories(id);
    const hasSubcategories = subcategories.length > 0;
    
    if (hasSubcategories) {
      showError(`لا يمكن حذف الفئة "${name}" لأنها تحتوي على ${subcategories.length} مجموعة فرعية. يرجى حذف المجموعات الفرعية أولاً.`);
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
          showError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
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
      color: '#fb923c',
      parentId: null
    });
    setSubcategoriesData([{ name: '', description: '', color: '#fb923c' }]);
  };

  // دوال إدارة النافذة المنبثقة للفئات الفرعية
  const handleAddSubcategoryField = () => {
    setSubcategoriesData([...subcategoriesData, { 
      name: '', 
      description: '', 
      color: '#fb923c' 
    }]);
  };

  const handleRemoveSubcategoryField = (index) => {
    if (subcategoriesData.length > 1) {
      const updated = subcategoriesData.filter((_, i) => i !== index);
      setSubcategoriesData(updated);
    }
  };

  const handleSubcategoryChange = (index, field, value) => {
    const updated = subcategoriesData.map((sub, i) => 
      i === index ? { ...sub, [field]: value } : sub
    );
    setSubcategoriesData(updated);
  };

  const handleOpenSubcategoriesModal = () => {
    setShowSubcategoriesModal(true);
  };

  const handleSaveSubcategories = () => {
    // إغلاق النافذة (البيانات محفوظة بالفعل في subcategoriesData)
    setShowSubcategoriesModal(false);
  };

  const handleCloseSubcategoriesModal = () => {
    setShowSubcategoriesModal(false);
    setSubcategoriesData([{ name: '', description: '', color: '#fb923c' }]);
  };

  // فلترة الفئات حسب البحث
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // دالة رسم عنصر الفئة
  const renderCategoryItem = (category, level = 0, isSubcategory = false) => {
    const subcategories = getSubcategories(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const marginClass = level > 0 ? `mr-${level * 2}` : '';

    return (
      <div key={category.id} className={`${marginClass} mb-1`}>
        <div className="flex items-center justify-between p-1.5 rounded border border-gray-200 hover:border-gray-300 transition-all bg-white">
          <div className="flex items-center gap-2 flex-1">
            {/* أيقونة التوسيع */}
            {subcategories.length > 0 ? (
              <button
                onClick={() => toggleCategoryExpansion(category.id)}
                className="p-0.5 hover:bg-gray-100 rounded text-xs"
              >
                {isExpanded ? 
                  <FaChevronDown className="text-gray-600 text-xs" /> : 
                  <FaChevronRight className="text-gray-600 text-xs" />
                }
              </button>
            ) : (
              <div className="w-3"></div>
            )}

            {/* أيقونة الفئة */}
            <div
              className="w-4 h-4 rounded flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: category.color || '#fb923c' }}
            >
              {isExpanded && subcategories.length > 0 ? <FaFolderOpen /> : <FaFolder />}
            </div>

            {/* معلومات الفئة */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{new Date(category.createdAt).toLocaleDateString('ar-EG')}</span>
                {isSubcategory && <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">فرعية</span>}
                {subcategories.length > 0 && (
                  <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                    {subcategories.length} فرعية
                  </span>
                )}
              </div>
              {category.description && (
                <p className="text-xs text-gray-600">{category.description}</p>
              )}
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-1">
            {hasPermission('edit_category') && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FaPlus />}
                  onClick={() => handleAddSubcategory(category.id)}
                  title="إضافة مجموعة فرعية"
                  className="text-xs px-1 py-0.5"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FaEdit />}
                  onClick={() => handleEdit(category)}
                  title="تعديل"
                  className="text-xs px-1 py-0.5"
                />
              </>
            )}
            {hasPermission('delete_category') && (
              <Button
                variant="danger"
                size="sm"
                icon={<FaTrash />}
                onClick={() => handleDelete(category.id, category.name)}
                title="حذف"
                className="text-xs px-1 py-0.5"
              />
            )}
            {!hasPermission('edit_category') && !hasPermission('delete_category') && (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <FaLock className="text-xs" />
              </div>
            )}
          </div>
        </div>

        {/* المجموعات الفرعية */}
        {isExpanded && subcategories.length > 0 && (
          <div className="mt-1 border-l-2 border-gray-200 pl-2">
            {subcategories.map(subcategory => 
              renderCategoryItem(subcategory, level + 1, true)
            )}
          </div>
        )}
      </div>
    );
  };

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
    <div className="p-2">
      {/* نموذج إضافة/تعديل الفئة */}
      {hasPermission('manage_categories') && (
        <div className="bg-white border border-gray-300 rounded-sm p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <FaTags className="text-sm text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              {editingId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="اسم الفئة..."
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:border-blue-400 focus:outline-none"
                required
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<FaFolder />}
                onClick={handleOpenSubcategoriesModal}
                disabled={!formData.name.trim() || editingId !== null}
                className="px-2 py-1 text-xs"
              >
                فئات فرعية
              </Button>
            </div>
            
            {/* عرض الفئات الفرعية المحددة */}
            {subcategoriesData.some(sub => sub.name.trim()) && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-1 mb-1">
                  <FaIndent className="text-xs text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">
                    {subcategoriesData.filter(sub => sub.name.trim()).length} مجموعات فرعية
                  </span>
                </div>
                <div className="space-y-0.5">
                  {subcategoriesData
                    .filter(sub => sub.name.trim())
                    .map((sub, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: sub.color }}
                        ></div>
                        <span>{sub.name}</span>
                      </div>
                    ))
                  }
                </div>
                <button
                  type="button"
                  onClick={() => setSubcategoriesData([{ name: '', description: '', color: '#fb923c' }])}
                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                >
                  مسح الكل
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                type="submit" 
                variant={editingId ? "primary" : "success"} 
                size="sm" 
                icon={editingId ? <FaEdit /> : <FaPlus />}
                className="px-2 py-1 text-xs"
              >
                {editingId ? 'تحديث' : 'إضافة'}
              </Button>
              <Button type="button" variant="secondary" size="sm" icon={<FaTimes />} onClick={handleCancel} className="px-2 py-1 text-xs">
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة الفئات */}
      <div className="bg-white border border-gray-300 rounded-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-800">
              الفئات ({categories.length})
            </h2>
            <div className="flex gap-1 text-xs text-gray-600">
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                {mainCategories.length} رئيسية
              </span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                {categories.filter(c => c.parentId).length} فرعية
              </span>
            </div>
          </div>
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-32 px-2 py-1 border border-gray-300 rounded text-xs focus:border-blue-400 focus:outline-none"
          />
        </div>

        {viewMode === 'tree' ? (
          /* العرض الشجري */
          <div className="space-y-1 p-2">
            {mainCategories
              .filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .length === 0 ? (
              <div className="text-center py-8">
                <FaSitemap className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'لا توجد فئات مطابقة' : 'لا توجد فئات بعد!'}
                </p>
              </div>
            ) : (
              mainCategories
                .filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(category => renderCategoryItem(category))
            )}
          </div>
        ) : (
          /* العرض العادي */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <FaTags className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'لا توجد فئات مطابقة' : 'لا توجد فئات بعد!'}
                </p>
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSubcategory = category.parentId;
                return (
                  <div
                    key={category.id}
                    className={`p-2 rounded border transition-all ${
                      isSubcategory 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: category.color || '#fb923c' }}
                      >
                        {isSubcategory ? <FaIndent /> : <FaTags />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>{new Date(category.createdAt).toLocaleDateString('ar-EG')}</span>
                          {isSubcategory && (
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              فرعية
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                    )}

                    <div className="flex gap-1">
                      {hasPermission('edit_category') && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<FaPlus />}
                            onClick={() => handleAddSubcategory(category.id)}
                            className="flex-1 text-xs px-1 py-0.5"
                            title="إضافة مجموعة فرعية"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<FaEdit />}
                            onClick={() => handleEdit(category)}
                            className="flex-1 text-xs px-1 py-0.5"
                          />
                        </>
                      )}
                      {hasPermission('delete_category') && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<FaTrash />}
                          onClick={() => handleDelete(category.id, category.name)}
                          className="flex-1 text-xs px-1 py-0.5"
                        />
                      )}
                      {!hasPermission('edit_category') && !hasPermission('delete_category') && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs w-full justify-center py-1">
                          <FaLock className="text-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* النافذة المنبثقة للفئات الفرعية */}
      {showSubcategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded border border-gray-400 shadow-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
            {/* رأس النافذة */}
            <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100">
              <div className="flex items-center gap-2">
                <FaFolder className="text-sm text-gray-600" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">المجموعات الفرعية</h3>
                  <p className="text-xs text-gray-600">{formData.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseSubcategoriesModal}
                className="text-gray-500 hover:text-gray-700 text-sm w-5 h-5 flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            {/* محتوى النافذة */}
            <div className="p-2 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                يمكنك إضافة عدة مجموعات فرعية. الحقول الفارغة ستهمل.
              </div>

              {/* قائمة الفئات الفرعية */}
              <div className="space-y-2">
                {subcategoriesData.map((subcategory, index) => (
                  <div key={index} className="border border-gray-200 rounded p-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800 text-xs">
                        المجموعة {index + 1}
                      </h4>
                      {subcategoriesData.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategoryField(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          <FaTrash className="inline mr-1" />
                          حذف
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium mb-1 block">الاسم</label>
                        <input
                          type="text"
                          value={subcategory.name}
                          onChange={(e) => handleSubcategoryChange(index, 'name', e.target.value)}
                          placeholder="اسم المجموعة..."
                          className="w-full px-2 py-1 border rounded text-xs"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium mb-1 block">اللون</label>
                          <div className="flex gap-1">
                            <input
                              type="color"
                              value={subcategory.color}
                              onChange={(e) => handleSubcategoryChange(index, 'color', e.target.value)}
                              className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={subcategory.color}
                              onChange={(e) => handleSubcategoryChange(index, 'color', e.target.value)}
                              className="flex-1 px-2 py-1 border rounded text-xs"
                              placeholder="#fb923c"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium mb-1 block">الوصف</label>
                          <input
                            type="text"
                            value={subcategory.description}
                            onChange={(e) => handleSubcategoryChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="وصف مختصر..."
                          />
                        </div>
                      </div>

                      {/* ألوان مقترحة */}
                      <div>
                        <label className="text-xs font-medium mb-1 block">ألوان</label>
                        <div className="flex flex-wrap gap-1">
                          {suggestedColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => handleSubcategoryChange(index, 'color', color.value)}
                              className="px-2 py-0.5 rounded border text-xs"
                              style={{
                                backgroundColor: color.value,
                                borderColor: subcategory.color === color.value ? '#000' : 'transparent',
                                color: '#fff'
                              }}
                              title={color.name}
                            >
                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* زر إضافة مجموعة فرعية جديدة */}
              <div className="mt-2 text-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<FaPlus />}
                  onClick={handleAddSubcategoryField}
                  className="px-2 py-1 text-xs"
                >
                  إضافة مجموعة أخرى
                </Button>
              </div>
            </div>

            {/* أزرار النافذة */}
            <div className="flex items-center justify-end gap-2 p-2 border-t border-gray-300 bg-gray-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<FaTimes />}
                onClick={handleCloseSubcategoriesModal}
                className="px-2 py-1 text-xs"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                variant="success"
                size="sm"
                icon={<FaSave />}
                onClick={handleSaveSubcategories}
                className="px-2 py-1 text-xs"
              >
                حفظ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
