// ======================================
// Manage Products - إدارة وسجل البضائع (محسّنة)
// الميزات:
// - النقر المزدوج على المنتج لفتح نافذة التعديل مباشرة
// - البحث والفلترة المتقدمة
// - التعديل المباشر في الجدول
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { 
  FaBox, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaSearch,
  FaFilter,
  FaWarehouse,
  FaBarcode,
  FaExclamationTriangle,
  FaDollarSign,
  FaTags,
  FaInfoCircle
} from 'react-icons/fa';

const ManageProducts = () => {
  const { 
    products, 
    categories, 
    warehouses, 
    updateProduct, 
    deleteProduct,
    getMainCategories,
    getSubcategories 
  } = useData();
  const { showSuccess, showError, showConfirm } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();
  
  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // State للتعديل
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySelectionStep, setCategorySelectionStep] = useState('main');
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categoryPath, setCategoryPath] = useState([]); // مسار الفئة الحالي
  const [currentRowId, setCurrentRowId] = useState(null); // معرف الصف الحالي

  // جلب جميع الفئات
  const mainCategories = getMainCategories?.() || [];
  const allCategories = [...mainCategories, 
    ...mainCategories.flatMap(mainCat => 
      (getSubcategories?.(mainCat.id) || []).map(sub => ({ ...sub, parentId: mainCat.id }))
    )
  ];

  // دالة الحصول على الفئات الفرعية للمستوى الحالي
  const getCurrentSubcategories = () => {
    if (categorySelectionStep === 'main') {
      return mainCategories;
    }
    
    const currentParentId = categoryPath.length > 0 
      ? categoryPath[categoryPath.length - 1].id 
      : selectedMainCategory;
      
    return getSubcategories?.(currentParentId) || [];
  };

  // دالة للتحقق من وجود فئات فرعية
  const hasSubcategories = (categoryId) => {
    return (getSubcategories?.(categoryId) || []).length > 0;
  };

  // دالة الحصول على مسار الفئة الكامل
  const getCategoryFullPath = (categoryId) => {
    // البحث في الفئات الرئيسية
    const mainCategory = mainCategories.find(c => c.id === categoryId);
    if (mainCategory) {
      return [mainCategory];
    }
    
    // البحث في الفئات الفرعية
    const findInSubcategories = (parentId, targetId, currentPath = []) => {
      const subcategories = getSubcategories?.(parentId) || [];
      
      for (const subcategory of subcategories) {
        const newPath = [...currentPath, subcategory];
        
        if (subcategory.id === targetId) {
          return newPath;
        }
        
        // البحث في المستويات الأعمق
        const deeperPath = findInSubcategories(subcategory.id, targetId, newPath);
        if (deeperPath) {
          return deeperPath;
        }
      }
      
      return null;
    };
    
    // البحث في جميع الفئات الرئيسية
    for (const mainCategory of mainCategories) {
      const path = findInSubcategories(mainCategory.id, categoryId, [mainCategory]);
      if (path) {
        return path;
      }
    }
    
    return [];
  };

  // دالة تنسيق العملة باستخدام إعدادات النظام
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // دالة للحصول على السعر المناسب للعرض حسب نوع الشريحة
  const getPriceForDisplay = (product, tier = 'wholesale') => {
    // إذا كان المنتج يستخدم الشرائح السعرية الجديدة
    if (product.tierPrices && product.tierPrices[tier]) {
      return product.tierPrices[tier].basicPrice || 0;
    }
    // إذا كان المنتج يستخدم النظام القديم
    return product.mainPrice || 0;
  };

  // فحص الصلاحيات
  const canEdit = hasPermission('edit_product');
  const canDelete = hasPermission('delete_product');

  // دالة للحصول على اسم الفئة (رئيسية أو فرعية) - محدثة لدعم المستويات العميقة
  const getCategoryDisplayName = (product) => {
    try {
      // استخدام الفئات المعرفة مسبقاً
      const allSubcategories = mainCategories.flatMap(mainCat => 
        (getSubcategories?.(mainCat.id) || []).map(sub => ({ ...sub, parentId: mainCat.id }))
      );
      
      // دعم الفئات العميقة - البحث أولاً عن الفئة العميقة
      const categoryId = product.selectedCategory || product.categoryId;
      if (categoryId) {
        const categoryPath = getCategoryFullPath(parseInt(categoryId));
        if (categoryPath.length > 0) {
          // عرض المسار الكامل للفئة العميقة
          return categoryPath.map(pathItem => pathItem.name).join(' → ');
        }
      }
      
      // إذا كان المنتج يستخدم النظام الجديد (مستوى واحد أو مستويين)
      if (product.mainCategoryId) {
        const mainCategory = mainCategories.find(c => c.id === product.mainCategoryId);
        if (product.subcategoryId) {
          const subcategory = allSubcategories.find(c => c.id === product.subcategoryId);
          return subcategory && mainCategory 
            ? `${mainCategory.name} → ${subcategory.name}` 
            : mainCategory?.name || 'غير محدد';
        }
        return mainCategory?.name || 'غير محدد';
      }
      
      // النظام القديم (التوافق)
      if (product.category) {
        return product.category;
      }
      
      // إذا لم توجد بيانات فئة
      return 'غير محدد';
    } catch (error) {
      console.error('خطأ في getCategoryDisplayName:', error);
      return 'خطأ في عرض الفئة';
    }
  };

  // دالة للحصول على لون الفئة (محدثة لدعم المستويات العميقة)
  const getCategoryColor = (product) => {
    try {
      // استخدام الفئات المعرفة مسبقاً
      const allSubcategories = mainCategories.flatMap(mainCat => 
        (getSubcategories?.(mainCat.id) || []).map(sub => ({ ...sub, parentId: mainCat.id }))
      );
      
      // البحث في المستويات العميقة
      const categoryId = product.selectedCategory || product.categoryId;
      if (categoryId) {
        const categoryPath = getCategoryFullPath(categoryId);
        if (categoryPath.length > 0) {
          // استخدام لون الفئة الأخيرة في المسار
          return categoryPath[categoryPath.length - 1].color || '#fb923c';
        }
      }
      
      if (product.subcategoryId) {
        const subcategory = allSubcategories.find(c => c.id === product.subcategoryId);
        return subcategory?.color || '#fb923c';
      } else if (product.mainCategoryId) {
        const mainCategory = mainCategories.find(c => c.id === product.mainCategoryId);
        return mainCategory?.color || '#fb923c';
      }
      return '#fb923c';
    } catch (error) {
      console.error('خطأ في getCategoryColor:', error);
      return '#fb923c'; // لون افتراضي
    }
  };

  // فلترة المنتجات
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryDisplayName = getCategoryDisplayName(product);
      const matchSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryDisplayName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = !filterCategory || 
        (product.mainCategoryId === parseInt(filterCategory)) ||
        (product.subcategoryId === parseInt(filterCategory)) ||
        (product.selectedCategory === filterCategory) ||
        (product.categoryId === filterCategory) ||
        (product.category === filterCategory); // للتوافق مع النظام القديم
      
      const matchWarehouse = !filterWarehouse || product.warehouseId === parseInt(filterWarehouse);
      
      return matchSearch && matchCategory && matchWarehouse;
    });
  }, [products, searchTerm, filterCategory, filterWarehouse]);

  // دوال التعديل
  const handleEdit = (product) => {
    if (!canEdit) {
      showError('ليس لديك صلاحية لتعديل المنتجات');
      return;
    }
    setEditingId(product.id);
    
    // إنشاء نسخة من بيانات المنتج للتعديل
    const editData = { ...product };
    
    // إعداد بيانات الشرائح السعرية للتعديل
    if (product.tierPrices) {
      editData.tierPrices = { ...product.tierPrices };
    } else {
      // إذا كان المنتج قديم، قم بإنشاء هيكل الشرائح السعرية
      editData.tierPrices = {
        retail: { basicPrice: '', subPrice: '' },
        wholesale: { basicPrice: product.mainPrice || '', subPrice: '' },
        bulk: { basicPrice: '', subPrice: '' }
      };
    }
    
    // إعداد selectedCategory بناءً على النظام المستخدم
    if (product.subcategoryId) {
      editData.selectedCategory = product.subcategoryId.toString();
    } else if (product.mainCategoryId) {
      editData.selectedCategory = product.mainCategoryId.toString();
    } else {
      editData.selectedCategory = null;
    }
    
    setEditFormData(editData);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // التعامل مع أسعار الشراء
    if (name.startsWith('purchase_')) {
      const priceType = name.replace('purchase_', '');
      setEditFormData({
        ...editFormData,
        purchasePrices: {
          ...editFormData.purchasePrices,
          [priceType]: value
        }
      });
    }
    // التعامل مع خانات الشرائح السعرية
    else if (name.startsWith('tier_')) {
      const [_, tier, priceType] = name.split('_'); // tier_retail_basicPrice
      setEditFormData({
        ...editFormData,
        tierPrices: {
          ...editFormData.tierPrices,
          [tier]: {
            ...editFormData.tierPrices[tier],
            [priceType]: value
          }
        }
      });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };

  const handleSaveEdit = () => {
    try {
      const currentProduct = products.find(p => p.id === editingId);
      
      // معالجة أسعار الشراء
      const processedPurchasePrices = {
        basicPrice: parseFloat(editFormData.purchasePrices?.basicPrice) || 0,
        subPrice: parseFloat(editFormData.purchasePrices?.subPrice) || 0
      };

      // معالجة الشرائح السعرية
      const processedTierPrices = {};
      if (editFormData.tierPrices) {
        Object.keys(editFormData.tierPrices).forEach(tier => {
          processedTierPrices[tier] = {
            basicPrice: parseFloat(editFormData.tierPrices[tier].basicPrice) || 0,
            subPrice: parseFloat(editFormData.tierPrices[tier].subPrice) || 0
          };
        });
      }

      // معالجة الفئة المختارة (محدثة لدعم المستويات العميقة)
      let categoryData = {};
      if (editFormData.selectedCategory) {
        try {
          // استخدام دالة المسار الكامل لفهم هيكل الفئة
          const categoryPath = getCategoryFullPath(editFormData.selectedCategory);
          
          if (categoryPath.length > 0) {
            // النظام الجديد - حفظ الفئة الأخيرة في المسار
            categoryData = {
              mainCategoryId: categoryPath[0].id, // الفئة الرئيسية
              subcategoryId: categoryPath.length > 1 ? categoryPath[1].id : null, // الفئة الفرعية (إن وجدت)
              selectedCategory: editFormData.selectedCategory, // الفئة النهائية (يمكن أن تكون عميقة)
            };
          } else {
            // في حالة عدم العثور على المسار، استخدام الطريقة القديمة للتوافق
            const mainCats = getMainCategories?.() || [];
            const allSubcategories = mainCats.flatMap(mainCat => 
              (getSubcategories?.(mainCat.id) || []).map(sub => ({ ...sub, parentId: mainCat.id }))
            );
            const isSubcategory = allSubcategories.some(sub => sub.id === parseInt(editFormData.selectedCategory));
            
            categoryData = {
              mainCategoryId: isSubcategory 
                ? allSubcategories.find(sub => sub.id === parseInt(editFormData.selectedCategory)).parentId
                : parseInt(editFormData.selectedCategory),
              subcategoryId: isSubcategory ? parseInt(editFormData.selectedCategory) : null,
              selectedCategory: editFormData.selectedCategory,
            };
          }
        } catch (error) {
          console.error('خطأ في معالجة الفئة:', error);
          categoryData = {
            selectedCategory: editFormData.selectedCategory,
          };
        }
      }
      
      const updatedData = {
        ...editFormData,
        ...categoryData,
        purchasePrices: processedPurchasePrices,
        tierPrices: processedTierPrices,
        mainQuantity: parseInt(editFormData.mainQuantity) || 0,
        subQuantity: parseInt(editFormData.subQuantity) || 0,
        unitsInMain: parseInt(editFormData.unitsInMain) || 0,
        warehouseId: parseInt(editFormData.warehouseId),
        // احتفاظ بالسعر الأساسي القديم للتوافق
        mainPrice: processedTierPrices.wholesale?.basicPrice || 0,
        subPrice: processedTierPrices.wholesale?.subPrice || 0,
      };
      
      updateProduct(editingId, updatedData);
      showSuccess('تم تحديث المنتج بنجاح');
      setEditingId(null);
      setEditFormData({});
    } catch (error) {
      showError('حدث خطأ في التحديث');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
    setShowCategoryModal(false);
    setCategorySelectionStep('main');
    setSelectedMainCategory(null);
    setCategorySearchTerm('');
  };

  const handleDelete = (id, name) => {
    if (!canDelete) {
      showError('ليس لديك صلاحية لحذف المنتجات');
      return;
    }
    
    showConfirm(
      'حذف المنتج',
      `هل أنت متأكد من حذف المنتج "${name}"؟ سيتم حذف جميع البيانات المرتبطة به.`,
      () => {
        try {
          deleteProduct(id);
          showSuccess('تم حذف المنتج بنجاح');
        } catch (error) {
          showError('حدث خطأ في الحذف');
        }
      },
      {
        type: 'danger',
        confirmText: 'حذف المنتج',
        cancelText: 'إلغاء'
      }
    );
  };

  // الحصول على اسم المخزن
  const getWarehouseName = (warehouseId) => {
    const id = typeof warehouseId === 'string' ? parseInt(warehouseId) : warehouseId;
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : '-';
  };

  // خيارات الفلترة
  // استخدام الفئات المعرفة مسبقاً في السطر 61
  const allSubcategories = mainCategories.flatMap(mainCat => 
    (getSubcategories?.(mainCat.id) || []).map(sub => ({ ...sub, parentId: mainCat.id }))
  );

  const categoryOptions = [
    { value: '', label: 'جميع الفئات' },
    // الفئات الرئيسية
    ...mainCategories.map(c => ({ 
      value: c.id.toString(), 
      label: c.name,
      type: 'main'
    })),
    // الفئات الفرعية
    ...allSubcategories.map(sub => {
      const parentCat = mainCategories.find(c => c.id === sub.parentId);
      return {
        value: sub.id.toString(),
        label: `${parentCat?.name} → ${sub.name}`,
        type: 'sub'
      };
    }),
    // للتوافق مع النظام القديم
    ...categories.filter(oldCat => 
      !mainCategories.some(c => c.name === oldCat.name) &&
      !allSubcategories.some(sub => sub.name === oldCat.name)
    ).map(c => ({ 
      value: c.name, 
      label: c.name,
      type: 'legacy'
    }))
  ];

  const warehouseOptions = [
    { value: '', label: 'جميع المخازن' },
    ...warehouses.map(w => ({ value: w.id.toString(), label: w.name }))
  ];

  // دوال اختيار الفئة المحدثة (مطابقة لواجهة إضافة المنتج)
  const openCategoryModal = () => {
    setShowCategoryModal(true);
    setCategorySelectionStep('main');
    setSelectedMainCategory(null);
    setCategoryPath([]); // إعادة تعيين مسار الفئة
    setCategorySearchTerm('');
  };

  // اختيار فئة رئيسية
  const selectMainCategory = (categoryId) => {
    const categoryIdNum = parseInt(categoryId);
    setSelectedMainCategory(categoryIdNum);
    
    // تحديث مسار الفئة
    const newPath = [...categoryPath];
    const selectedCategory = allCategories.find(c => c.id === categoryIdNum);
    if (selectedCategory) {
      newPath.push({
        id: selectedCategory.id,
        name: selectedCategory.name,
        color: selectedCategory.color
      });
      setCategoryPath(newPath);
    }
    
    const subcategories = getSubcategories?.(categoryIdNum) || [];
    
    if (subcategories.length > 0) {
      // الانتقال إلى اختيار الفئة الفرعية
      setCategorySelectionStep('sub');
    } else {
      // لا توجد فئات فرعية، اختيار الفئة الرئيسية مباشرة
      setEditFormData({
        ...editFormData,
        selectedCategory: categoryId.toString()
      });
      setShowCategoryModal(false);
    }
  };

  // اختيار فئة فرعية
  const selectSubcategory = (subcategoryId) => {
    const subcategoryIdNum = parseInt(subcategoryId);
    
    // تحديث مسار الفئة
    const newPath = [...categoryPath];
    const selectedSubcategory = allCategories.find(c => c.id === subcategoryIdNum);
    if (selectedSubcategory) {
      newPath.push({
        id: selectedSubcategory.id,
        name: selectedSubcategory.name,
        color: selectedSubcategory.color
      });
      setCategoryPath(newPath);
    }
    
    // البحث عن فئات فرعية إضافية
    const deeperSubcategories = getSubcategories?.(subcategoryIdNum) || [];
    
    if (deeperSubcategories.length > 0) {
      // توجد فئات أعمق، الانتقال إليها (البقاء في step الفرعية)
      setSelectedMainCategory(subcategoryIdNum);
      // البقاء في المودال لعرض الفئات الفرعية الجديدة
      return;
    } else {
      // لا توجد فئات أعمق، اختيار هذه الفئة
      setEditFormData({
        ...editFormData,
        selectedCategory: subcategoryId.toString()
      });
      setShowCategoryModal(false);
    }
  };

  // التنقل في الفئات الفرعية (تصفح عميق)
  const handleCategoryNavigation = (categoryId) => {
    const categoryIdNum = parseInt(categoryId);
    
    // تحديث مسار الفئة
    const newPath = [...categoryPath];
    const selectedCategory = allCategories.find(c => c.id === categoryIdNum);
    if (selectedCategory) {
      newPath.push({
        id: selectedCategory.id,
        name: selectedCategory.name,
        color: selectedCategory.color
      });
      setCategoryPath(newPath);
    }
    
    // البقاء في المودال لعرض الفئات الفرعية (لا اختيار نهائي)
    return;
  };

  // اختيار فئة مباشرة باستخدام Radio Button
  const handleSelectCategory = (categoryId) => {
    setEditFormData({
      ...editFormData,
      selectedCategory: categoryId.toString()
    });
    setShowCategoryModal(false);
  };

  // النقر على body الفئة
  const handleCategoryBodyClick = (categoryId, hasSubcategories) => {
    if (hasSubcategories) {
      handleCategoryNavigation(categoryId);
    } else {
      handleSelectCategory(categoryId);
    }
  };

  const cancelCategorySelection = () => {
    setShowCategoryModal(false);
    setCategorySelectionStep('main');
    setSelectedMainCategory(null);
    setCategoryPath([]);
    setCategorySearchTerm('');
  };

  const backToMainCategories = () => {
    if (categoryPath.length > 1) {
      // العودة إلى المستوى السابق
      const newPath = categoryPath.slice(0, -1);
      setCategoryPath(newPath);
      setSelectedMainCategory(newPath[newPath.length - 1]?.id);
    } else {
      // العودة إلى الفئات الرئيسية
      setCategorySelectionStep('main');
      setSelectedMainCategory(null);
      setCategoryPath([]);
    }
  };

  // البحث في الفئات
  const searchCategories = (categories, searchTerm) => {
    if (!searchTerm.trim()) return categories;
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
          

      {/* البحث والفلترة */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="ابحث عن منتج (الاسم، الباركود، الفئة)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                showFilters 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <FaFilter /> فلاتر متقدمة
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">فلترة حسب الفئة</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">فلترة حسب المخزن</label>
                <select
                  value={filterWarehouse}
                  onChange={(e) => setFilterWarehouse(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {warehouseOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>عرض {filteredProducts.length} من {products.length} منتج</span>
              <span className="text-blue-600 font-medium">💡 نصيحة: انقر مزدوجاً على أي منتج للتعديل</span>
            </div>
            {(searchTerm || filterCategory || filterWarehouse) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterWarehouse('');
                }}
                className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
              >
                <FaTimes /> إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 p-4">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || filterCategory || filterWarehouse 
                ? 'لا توجد منتجات مطابقة للبحث' 
                : 'لا توجد منتجات بعد، قم بإضافة منتج جديد!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">المنتج</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الفئة</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">المخزن</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الكمية</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">سعر التجزئة</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">سعر الجملة</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">سعر جملة الجملة</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">القيمة الإجمالية</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الباركود</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  editingId === product.id ? (
                    // صف التعديل
                    <tr key={product.id} className="bg-blue-50 border-b">
                      <td className="px-3 py-3" colSpan="10">
                        <div className="space-y-3">
                          {/* تذكير نظام الأسعار */}
                          {product.tierPrices ? (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                              <div className="flex items-center gap-2">
                                <FaDollarSign className="text-blue-500" />
                                <p className="text-sm font-medium text-blue-700">
                                  هذا المنتج يستخدم نظام الشرائح السعرية الجديد
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded">
                              <div className="flex items-center gap-2">
                                <FaDollarSign className="text-gray-500" />
                                <p className="text-sm font-medium text-gray-600">
                                  هذا المنتج يستخدم النظام التقليدي للأسعار
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">اسم المنتج *</label>
                              <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الفئة *</label>
                              <button
                                type="button"
                                onClick={openCategoryModal}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 text-right transition-colors"
                              >
                                {editFormData.selectedCategory ? (
                                  <div className="flex items-center justify-between">
                                    <FaBox className="text-blue-500" />
                                    <span>
                                      {(() => {
                                        try {
                                          // استخدام دالة المسار الكامل لعرض الفئات العميقة
                                          const categoryPath = getCategoryFullPath(editFormData.selectedCategory);
                                          if (categoryPath.length > 0) {
                                            return (
                                              <>
                                                {categoryPath.map((pathItem, index) => (
                                                  <span key={pathItem.id} className="inline-flex items-center">
                                                    {index > 0 && <span className="mx-1 text-gray-400">→</span>}
                                                    <span 
                                                      className="inline-block w-3 h-3 rounded-full mr-1" 
                                                      style={{ backgroundColor: pathItem.color }}
                                                    ></span>
                                                    {pathItem.name}
                                                  </span>
                                                ))}
                                              </>
                                            );
                                          }
                                          // في حالة عدم وجود مسار، البحث بطريقة قديمة للتوافق
                                          const mainCats = getMainCategories?.() || [];
                                          const allSubs = mainCats.flatMap(mainCat => 
                                            (getSubcategories?.(mainCat.id) || []).map(sub => ({ ...sub, parentId: mainCat.id }))
                                          );
                                          const allCategories = mainCats.concat(allSubs);
                                          const selectedCat = allCategories.find(c => c.id === parseInt(editFormData.selectedCategory));
                                          return selectedCat ? (
                                            <>
                                              <span 
                                                className="inline-block w-3 h-3 rounded-full mr-2" 
                                                style={{ backgroundColor: selectedCat.color }}
                                              ></span>
                                              {selectedCat.name}
                                            </>
                                          ) : (
                                            <span className="text-gray-500">فئة غير معروفة</span>
                                          );
                                        } catch (error) {
                                          console.error('خطأ في عرض الفئة:', error);
                                          return <span className="text-red-500">خطأ في تحميل الفئة</span>;
                                        }
                                      })()}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between text-gray-500">
                                    <FaBox />
                                    <span>اختر الفئة</span>
                                  </div>
                                )}
                              </button>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">المخزن *</label>
                              <select
                                name="warehouseId"
                                value={editFormData.warehouseId}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                {warehouses.map(w => (
                                  <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* أسعار الشراء */}
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="text-sm font-semibold text-green-700 mb-3">أسعار الشراء</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">سعر الشراء الأساسي</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  name="purchase_basicPrice"
                                  value={editFormData.purchasePrices?.basicPrice || ''}
                                  onChange={handleEditChange}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                  placeholder="0.00"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">سعر الشراء الفرعي</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  name="purchase_subPrice"
                                  value={editFormData.purchasePrices?.subPrice || ''}
                                  onChange={handleEditChange}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                  placeholder="0.00"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* الشرائح السعرية */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700">الشرائح السعرية</h4>
                            
                            {/* البيع المباشر */}
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <h5 className="text-xs font-semibold text-orange-700 mb-2">البيع المباشر (تجزئة)</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name="tier_retail_basicPrice"
                                    value={editFormData.tierPrices?.retail?.basicPrice || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                    placeholder="0.00"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">السعر الفرعي</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name="tier_retail_subPrice"
                                    value={editFormData.tierPrices?.retail?.subPrice || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                    placeholder="0.00"
                                    min="0"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* الجملة */}
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <h5 className="text-xs font-semibold text-blue-700 mb-2">الجملة</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name="tier_wholesale_basicPrice"
                                    value={editFormData.tierPrices?.wholesale?.basicPrice || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">السعر الفرعي</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name="tier_wholesale_subPrice"
                                    value={editFormData.tierPrices?.wholesale?.subPrice || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    min="0"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* جملة الجملة */}
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <h5 className="text-xs font-semibold text-purple-700 mb-2">جملة الجملة</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name="tier_bulk_basicPrice"
                                    value={editFormData.tierPrices?.bulk?.basicPrice || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                    placeholder="0.00"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">السعر الفرعي</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name="tier_bulk_subPrice"
                                    value={editFormData.tierPrices?.bulk?.subPrice || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                    placeholder="0.00"
                                    min="0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div style={{ display: "none" }}>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الكمية الأساسية (كرتونة) *</label>
                              <input
                                type="number"
                                name="mainQuantity"
                                value={editFormData.mainQuantity}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="0"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">المعامل*</label>
                              <input
                                type="number"
                                name="unitsInMain"
                                value={editFormData.unitsInMain}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="مثال: 12"
                                min="1"
                                required
                              />
                            </div>
                            <div style={{ display: "none" }}>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الكمية الفرعية (قطع إضافية)</label>
                              <input
                                type="number"
                                name="subQuantity"
                                value={editFormData.subQuantity}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الباركود *</label>
                              <input
                                type="text"
                                name="barcode"
                                value={editFormData.barcode || ''}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                              <input
                                type="text"
                                name="description"
                                value={editFormData.description || ''}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {canEdit && (
                              <>
                                <button
                                  onClick={handleSaveEdit}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold"
                                >
                                  <FaSave /> حفظ التعديلات
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold"
                                >
                                  <FaTimes /> إلغاء
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // صف عادي
                    <tr 
                      key={product.id} 
                      className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                        product.mainQuantity < 10 ? 'bg-yellow-50' : ''
                      }`}
                      onDoubleClick={() => handleEdit(product)}
                      title="انقر مزدوجاً لتعديل المنتج"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded flex items-center justify-center text-white text-sm">
                            <FaBox />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-gray-500">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: getCategoryColor(product) }}
                        >
                          {getCategoryDisplayName(product)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FaWarehouse className="text-gray-400 text-xs" />
                          <span className="text-sm">{getWarehouseName(product.warehouseId)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div>
                            <p className="font-semibold text-sm">
                              {product.mainQuantity} {product.unitsInMain ? `كرتونة (${product.unitsInMain} قطع/كرتونة)` : 'وحدة أساسية'}
                            </p>
                            {product.subQuantity > 0 && (
                              <p className="text-xs text-gray-500">+ {product.subQuantity} قطعة فرعية</p>
                            )}
                            {product.unitsInMain > 0 && (
                              <p className="text-xs text-blue-600 font-medium">
                                = {((product.mainQuantity || 0) * product.unitsInMain + (product.subQuantity || 0))} قطعة إجمالية
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-semibold text-sm text-orange-600">
                            {formatCurrency(getPriceForDisplay(product, 'retail'))}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-semibold text-sm text-blue-600">
                            {formatCurrency(getPriceForDisplay(product, 'wholesale'))}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-semibold text-sm text-purple-600">
                            {formatCurrency(getPriceForDisplay(product, 'bulk'))}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-bold text-green-600 text-sm">
                          {(() => {
                          const totalSubQuantity = (product.mainQuantity || 0) * (product.unitsInMain || 0) + (product.subQuantity || 0);
                          // استخدام سعر الجملة للحساب
                          const priceToUse = getPriceForDisplay(product, 'wholesale');
                          return formatCurrency(priceToUse * totalSubQuantity);
                        })()}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        {product.barcode ? (
                          <div className="flex items-center gap-1">
                            <FaBarcode className="text-gray-400 text-xs" />
                            <span className="text-xs font-mono">{product.barcode}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 justify-center">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="تعديل"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="حذف"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                          {!canEdit && !canDelete && (
                            <span className="text-xs text-gray-400">غير متوفر</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal اختيار الفئة المحدث */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-t-2xl text-white relative">
              <button
                onClick={cancelCategorySelection}
                className="absolute top-3 left-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all"
              >
                <FaTimes />
              </button>
              <h3 className="text-lg font-semibold text-center">
                {categorySelectionStep === 'main' ? 'اختر الفئة' : 
                 categoryPath.length > 0 ? `فئات فرعية في "${categoryPath[categoryPath.length - 1].name}"` :
                 `فئات فرعية في "${mainCategories.find(c => c.id === selectedMainCategory)?.name}"`}
              </h3>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* حقل البحث */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن فئة..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                  />
                  <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {categorySelectionStep === 'main' ? (
                // عرض الفئات الرئيسية
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchCategories(mainCategories, categorySearchTerm).map(category => (
                    <button
                      key={category.id}
                      onClick={() => selectMainCategory(category.id)}
                      className="w-full p-3 text-right border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: category.color }}
                          ></span>
                          <span className="font-medium text-gray-800">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(getSubcategories?.(category.id) || []).length > 0 && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {(getSubcategories?.(category.id) || []).length} فرعية
                            </span>
                          )}
                          <FaBox className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // عرض الفئات الفرعية (مع دعم المستويات العميقة)
                (() => {
                  const currentSubcategories = getCurrentSubcategories();
                  const currentParentId = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].id : selectedMainCategory;
                  
                  return (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {/* عرض مسار الفئة الحالي */}
                      {categoryPath.length > 0 && (
                        <div className="bg-gray-50 p-2 rounded-lg mb-3">
                          <div className="text-xs text-gray-600 mb-1">المسار:</div>
                          <div className="flex items-center gap-1 text-xs">
                            {categoryPath.map((pathItem, index) => (
                              <React.Fragment key={pathItem.id}>
                                <span 
                                  className="w-2 h-2 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: pathItem.color }}
                                ></span>
                                <span className="font-medium text-gray-800">{pathItem.name}</span>
                                {index < categoryPath.length - 1 && (
                                  <span className="text-gray-400 mx-1">→</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* زر اختيار الفئة الحالية (إذا لم تكن فئة رئيسية) */}
                      {currentParentId && categoryPath.length > 1 && (
                        <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                          <div className="flex items-center gap-3">
                            {/* Radio Button للتحديد */}
                            <input
                              type="radio"
                              name="categorySelection"
                              value={currentParentId}
                              onChange={() => selectSubcategory(currentParentId)}
                              className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2"
                            />
                            
                            {/* معلومات الفئة */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span 
                                  className="w-4 h-4 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: allCategories.find(c => c.id === currentParentId)?.color }}
                                ></span>
                                <span className="font-medium text-blue-800">
                                  {allCategories.find(c => c.id === currentParentId)?.name} (الفئة الحالية)
                                </span>
                                <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
                                  اختر هذه الفئة
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* عرض الفئات الفرعية */}
                      {currentSubcategories.length > 0 ? (
                        searchCategories(currentSubcategories, categorySearchTerm).map(subcategory => {
                          const subcategoryHasSubcategories = hasSubcategories(subcategory.id);
                          return (
                            <div key={subcategory.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-all">
                              <div className="flex items-center gap-3">
                                {/* Radio Button للتحديد */}
                                <input
                                  type="radio"
                                  name="categorySelection"
                                  value={subcategory.id}
                                  onChange={() => handleSelectCategory(subcategory.id)}
                                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                                />
                                
                                {/* معلومات الفئة */}
                                <div 
                                  className="flex-1 cursor-pointer"
                                  onClick={() => handleCategoryBodyClick(subcategory.id, subcategoryHasSubcategories)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span 
                                        className="w-4 h-4 rounded-full flex-shrink-0" 
                                        style={{ backgroundColor: subcategory.color }}
                                      ></span>
                                      <span className="font-medium text-gray-800">{subcategory.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {subcategoryHasSubcategories ? (
                                        <>
                                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                            {(getSubcategories?.(subcategory.id) || []).length} فرعية
                                          </span>
                                          <FaBox className="text-gray-400" />
                                        </>
                                      ) : (
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                          فئة نهائية
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* تلميح للمستخدم */}
                              <div className="mt-2 text-xs text-gray-500">
                                {subcategoryHasSubcategories ? (
                                  <span>انقر على اسم الفئة لعرض الفئات الفرعية • أو استخدم الزر للتحديد المباشر</span>
                                ) : (
                                  <span>انقر على اسم الفئة للتحديد المباشر • أو استخدم الزر</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <FaBox className="mx-auto mb-2 text-gray-400" size={24} />
                          <p>لا توجد فئات فرعية في هذا المستوى</p>
                          {currentParentId && categoryPath.length > 1 && (
                            <p className="text-sm mt-2">يمكنك اختيار الفئة الحالية أعلاه</p>
                          )}
                        </div>
                      )}
                      
                      {/* شرح الاستخدام */}
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-2">
                          <FaInfoCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium mb-1">طريقة الاستخدام الجديدة:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• <strong>Radio Button:</strong> اختر الفئة مباشرة</li>
                              <li>• <strong>النقر على اسم الفئة:</strong></li>
                              <li className="mr-4">- إذا كان بها فئات فرعية → عرض الفئات الفرعية</li>
                              <li className="mr-4">- إذا كانت فئة نهائية → اختيارها مباشرة</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer */}
            {categorySelectionStep === 'sub' && (
              <div className="p-4 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={backToMainCategories}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                >
                  {categoryPath.length > 1 ? 'العودة إلى المستوى السابق' : 'العودة إلى الفئات الرئيسية'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
