// ======================================
// Add Product - إضافة بضاعة إلى مخزن (جدول تفاعلي)
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaSave, FaCheckCircle, FaTimes, FaWarehouse, FaTags, FaDollarSign, FaCubes, FaBarcode, FaUndo, FaMoneyBillWave, FaPlus, FaTrash } from 'react-icons/fa';

const AddProduct = () => {
  const navigate = useNavigate();
  const { 
    warehouses, 
    categories, 
    addProduct, 
    getMainCategories,
    getSubcategories,
    units,
    getMainUnits,
    getSubUnits
  } = useData();
  const { showSuccess, showError } = useNotification();
  
  // دالة مساعدة لإنشاء صف جديد مع تحديد المخزن تلقائياً
  const createNewRow = () => {
    // التحقق من وجود مخزن واحد فقط وتحديده تلقائياً
    const defaultWarehouseId = warehouses.length === 1 ? warehouses[0].id.toString() : '';
    
    return {
      id: Date.now() + Math.random(),
      name: '',
      selectedCategory: null,
      warehouseId: defaultWarehouseId,
      barcode: '',
      multiplier: '',
      maxStock: '',
      mainUnitId: '',
      subUnitId: '',
      tierPrices: {
        retail: { basicPrice: '', subPrice: '' },
        wholesale: { basicPrice: '', subPrice: '' },
        bulk: { basicPrice: '', subPrice: '' }
      }
    };
  };

  // حالة الصفوف في الجدول
  const [productRows, setProductRows] = useState([createNewRow()]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // حالة حفظ المنتجات
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [addedProducts, setAddedProducts] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySelectionStep, setCategorySelectionStep] = useState('main'); // 'main' أو 'sub'
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  // Modal التأكيد المخصص
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({ title: '', message: '', onConfirm: () => {} });
  const [currentRowId, setCurrentRowId] = useState(null);

  // نافذة الشرائح السعرية
  const [showPricesModal, setShowPricesModal] = useState(false);
  const [currentRowPrices, setCurrentRowPrices] = useState(null);

  // إضافة صف جديد
  const addNewRow = () => {
    // التحقق من اكتمال جميع الصفوف الموجودة
    const incompleteRows = productRows.filter(row => !isRowValidForAddNew(row));
    
    if (incompleteRows.length > 0) {
      const incompleteCount = incompleteRows.length;
      showError(`لا يمكن إضافة صف جديد! يوجد ${incompleteCount} صف غير مكتمل البيانات. يرجى إكمال البيانات في جميع الصفوف أولاً.`);
      return;
    }
    
    setProductRows([...productRows, createNewRow()]);
  };

  // عرض Modal التأكيد المخصص
  const showConfirm = (title, message, onConfirm) => {
    setConfirmModalData({ title, message, onConfirm });
    setShowConfirmModal(true);
  };

  // حذف صف
  const removeRow = (rowId) => {
    if (productRows.length > 1) {
      showConfirm(
        'تأكيد الحذف',
        'هل تريد حذف هذا الصف؟',
        () => {
          setProductRows(productRows.filter(row => row.id !== rowId));
        }
      );
    } else {
      showError('يجب أن يبقى صف واحد على الأقل');
    }
  };



  // تحديث بيانات الصف
  const updateRow = (rowId, field, value) => {
    setProductRows(productRows.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value };
        
        // إذا تم تحديث المعامل، أعيد حساب جميع الأسعار الفرعية
        if (field === 'multiplier') {
          const newMultiplier = parseFloat(value) || 1;
          const updatedTierPrices = { ...row.tierPrices };
          
          Object.keys(updatedTierPrices).forEach(tier => {
            const basicPrice = parseFloat(updatedTierPrices[tier].basicPrice) || 0;
            if (basicPrice > 0 && newMultiplier > 0) {
              updatedTierPrices[tier].subPrice = (basicPrice / newMultiplier).toFixed(2);
            }
          });
          
          updatedRow.tierPrices = updatedTierPrices;
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  // فتح modal اختيار الفئة
  const openCategoryModal = (rowId) => {
    setCurrentRowId(rowId);
    setShowCategoryModal(true);
    setCategorySelectionStep('main');
    setSelectedMainCategory(null);
    setCategorySearchTerm('');
  };

  // اختيار فئة رئيسية
  const selectMainCategory = (categoryId) => {
    setSelectedMainCategory(parseInt(categoryId));
    const subcategories = getSubcategories(categoryId);
    
    if (subcategories.length > 0) {
      // الانتقال إلى اختيار الفئة الفرعية
      setCategorySelectionStep('sub');
    } else {
      // لا توجد فئات فرعية، اختيار الفئة الرئيسية مباشرة
      updateRow(currentRowId, 'selectedCategory', categoryId.toString());
      setShowCategoryModal(false);
    }
  };

  // اختيار فئة فرعية
  const selectSubcategory = (subcategoryId) => {
    updateRow(currentRowId, 'selectedCategory', subcategoryId.toString());
    setShowCategoryModal(false);
  };

  // العودة إلى اختيار الفئة الرئيسية
  const backToMainCategories = () => {
    setCategorySelectionStep('main');
    setSelectedMainCategory(null);
  };

  // إلغاء اختيار الفئة
  const cancelCategorySelection = () => {
    setShowCategoryModal(false);
    setCategorySelectionStep('main');
    setSelectedMainCategory(null);
    setCategorySearchTerm('');
    setCurrentRowId(null);
  };

  // البحث في الفئات
  const searchCategories = (categories, searchTerm) => {
    if (!searchTerm.trim()) return categories;
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // فتح نافذة الأسعار
  const openPricesModal = (row) => {
    // التحقق من اكتمال البيانات
    if (!isRowValidForAddNew(row)) {
      showError('لا يمكن إضافة الأسعار! يجب إكمال جميع البيانات في هذا الصف أولاً (الاسم، الفئة، المخزن، الباركود، المعامل، الوحدات).');
      return;
    }
    
    // إنشاء نسخة من بيانات الصف لضمان التحديث التلقائي
    setCurrentRowPrices({ ...row });
    setShowPricesModal(true);
  };

  // تحديث currentRowPrices مع المنتج المحدث
  const updateCurrentRowPrices = (updatedRow) => {
    setCurrentRowPrices({ ...updatedRow });
  };

  // التحقق من أن السعر الفرعي تم حسابه تلقائياً
  const isAutoCalculated = (row, tier) => {
    const basicPrice = parseFloat(row.tierPrices[tier]?.basicPrice) || 0;
    const subPrice = parseFloat(row.tierPrices[tier]?.subPrice) || 0;
    const multiplier = parseFloat(row.multiplier) || 1;
    
    return basicPrice > 0 && multiplier > 0 && 
           Math.abs(subPrice - (basicPrice / multiplier)) < 0.01;
  };

  // حساب الأسعار الفرعية تلقائياً
  const calculateSubPrices = (row, tier, basicPrice) => {
    const multiplier = parseFloat(row.multiplier) || 1;
    const subPrice = basicPrice && multiplier > 0 ? (parseFloat(basicPrice) / multiplier).toFixed(2) : '';
    
    return {
      ...row.tierPrices,
      [tier]: {
        ...row.tierPrices[tier],
        basicPrice: basicPrice,
        subPrice: subPrice
      }
    };
  };

  // تحديث أسعار الصف
  const updateRowPrices = (tier, priceType, value) => {
    // التعامل مع القيم الفارغة
    const cleanValue = value === '' ? '' : value;
    
    // تحديث البيانات في الجدول
    setProductRows(productRows.map(row => {
      if (row.id === currentRowPrices.id) {
        const updatedTierPrices = { ...row.tierPrices };
        
        // إذا تم تحديث السعر الأساسي، احسب السعر الفرعي تلقائياً
        if (priceType === 'basicPrice' && cleanValue !== '') {
          const multiplier = parseFloat(row.multiplier) || 1;
          const subPrice = multiplier > 0 ? (parseFloat(cleanValue) / multiplier).toFixed(2) : '';
          
          updatedTierPrices[tier] = {
            ...row.tierPrices[tier],
            basicPrice: cleanValue,
            subPrice: subPrice
          };
        } else {
          // تحديث السعر الفرعي فقط
          updatedTierPrices[tier] = {
            ...row.tierPrices[tier],
            [priceType]: cleanValue
          };
        }
        
        const updatedRow = {
          ...row,
          tierPrices: updatedTierPrices
        };
        
        // تحديث currentRowPrices أيضاً
        updateCurrentRowPrices(updatedRow);
        
        return updatedRow;
      }
      return row;
    }));
  };

  // حفظ نافذة الأسعار
  const savePrices = () => {
    setShowPricesModal(false);
    setCurrentRowPrices(null);
  };

  // التحقق من صحة البيانات
  const validateRow = (row) => {
    const errors = [];
    
    if (!row.name.trim()) errors.push('اسم المنتج مطلوب');
    if (!row.selectedCategory) errors.push('الفئة مطلوبة');
    if (!row.warehouseId) errors.push('المخزن مطلوب');
    if (!row.barcode.trim()) errors.push('الباركود مطلوب');
    if (!row.multiplier || parseInt(row.multiplier) <= 0) errors.push('المعامل يجب أن يكون أكبر من صفر');
    if (!row.mainUnitId) errors.push('الوحدة الأساسية مطلوبة');
    if (!row.subUnitId) errors.push('الوحدة الفرعية مطلوبة');
    
    // تحقق إضافي من صحة الباركود
    if (row.barcode.trim() && row.barcode.trim().length < 3) {
      errors.push('الباركود قصير جداً');
    }
    
    return errors;
  };

  // التحقق من اكتمال البيانات لإضافة صف جديد أو أسعار
  const isRowValidForAddNew = (row) => {
    return (
      row.name.trim() !== '' &&
      row.selectedCategory !== null &&
      row.selectedCategory !== '' &&
      row.warehouseId !== '' &&
      row.barcode.trim() !== '' &&
      row.multiplier !== '' &&
      parseInt(row.multiplier) > 0 &&
      row.mainUnitId !== '' &&
      row.subUnitId !== ''
    );
  };

  // حفظ جميع المنتجات
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setSaveProgress(0);
      
      const validRows = productRows.filter(row => {
        const errors = validateRow(row);
        return errors.length === 0;
      });

      if (validRows.length === 0) {
        showError('يرجى التحقق من البيانات المدخلة');
        setIsSaving(false);
        return;
      }

      const mainCategories = getMainCategories();
      const allSubcategories = mainCategories.flatMap(mainCat => 
        getSubcategories(mainCat.id).map(sub => ({ ...sub, parentId: mainCat.id }))
      );

      const newProducts = [];
      const addedProductsList = [];
      const failedProducts = [];

      // عرض رسالة بداية العملية
      showSuccess(`بدء حفظ ${validRows.length} منتج...`);

      // تجميع بيانات جميع المنتجات أولاً
      const productsToAdd = validRows.map(row => {
        // تحديد إذا كانت الفئة المختارة رئيسية أم فرعية
        const isSubcategory = allSubcategories.some(sub => sub.id === parseInt(row.selectedCategory));
        const selectedMainCategory = isSubcategory 
          ? mainCategories.find(c => c.id === allSubcategories.find(sub => sub.id === parseInt(row.selectedCategory)).parentId)
          : mainCategories.find(c => c.id === parseInt(row.selectedCategory));
        const selectedSubcategory = isSubcategory 
          ? allSubcategories.find(sub => sub.id === parseInt(row.selectedCategory))
          : null;

        // تحويل قيم الشرائح السعرية إلى أرقام
        const processedTierPrices = {};
        Object.keys(row.tierPrices).forEach(tier => {
          processedTierPrices[tier] = {
            basicPrice: parseFloat(row.tierPrices[tier].basicPrice) || 0,
            subPrice: parseFloat(row.tierPrices[tier].subPrice) || 0
          };
        });

        return {
          row: row,
          productData: {
            name: row.name,
            selectedCategory: row.selectedCategory,
            mainCategoryId: isSubcategory 
              ? allSubcategories.find(sub => sub.id === parseInt(row.selectedCategory)).parentId
              : parseInt(row.selectedCategory),
            subcategoryId: isSubcategory ? parseInt(row.selectedCategory) : null,
            category: row.selectedCategory,
            tierPrices: processedTierPrices,
            multiplier: parseInt(row.multiplier),
            maxStock: parseInt(row.maxStock) || 0,
            mainQuantity: 0,
            subQuantity: 0,
            unitsInMain: parseInt(row.multiplier),
            mainUnitId: row.mainUnitId,
            subUnitId: row.subUnitId,
            warehouseId: parseInt(row.warehouseId),
            barcode: row.barcode,
            description: '',
            purchasePrices: { basicPrice: 0, subPrice: 0 },
            createdAt: new Date().toISOString()
          },
          selectedMainCategory,
          selectedSubcategory
        };
      });

      // حفظ المنتجات واحداً تلو الآخر مع تتبع التقدم
      for (let i = 0; i < productsToAdd.length; i++) {
        const { row, productData, selectedMainCategory, selectedSubcategory } = productsToAdd[i];
        const progressPercent = Math.round(((i + 1) / productsToAdd.length) * 100);
        setSaveProgress(progressPercent);

        try {
          const newProduct = addProduct(productData);
          newProducts.push(newProduct);
          
          // حفظ بيانات المنتج المضاف للعرض في Modal
          addedProductsList.push({
            ...newProduct,
            warehouseName: warehouses.find(w => w.id === parseInt(row.warehouseId))?.name || 'غير محدد',
            categoryDisplay: selectedSubcategory ? 
              `${selectedMainCategory?.name} > ${selectedSubcategory.name}` : 
              selectedMainCategory?.name || 'غير محدد'
          });
        } catch (error) {
          failedProducts.push({
            row: row,
            error: error.message || 'خطأ غير معروف'
          });
          console.error(`خطأ في حفظ المنتج ${row.name}:`, error);
        }
      }
      
      setAddedProducts(addedProductsList);
      
      if (addedProductsList.length > 0) {
        setShowSuccessModal(true);
        const successMessage = `تم إضافة ${addedProductsList.length} منتج بنجاح`;
        if (failedProducts.length > 0) {
          showSuccess(`${successMessage}. فشل في حفظ ${failedProducts.length} منتج`);
        } else {
          showSuccess(successMessage);
        }
      }
      
      if (failedProducts.length > 0) {
        showError(`فشل في حفظ ${failedProducts.length} منتج من أصل ${validRows.length}`);
        console.log('المنتجات التي فشل حفظها:', failedProducts);
      }
      
      // إعادة تعيين الجدول فقط إذا تم حفظ منتج واحد على الأقل
      if (addedProductsList.length > 0) {
        setProductRows([createNewRow()]);
      }
      
    } catch (error) {
      console.error('خطأ عام في حفظ المنتجات:', error);
      showError('حدث خطأ عام في حفظ المنتجات');
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name
  }));

  // الفئات للـ modal
  const mainCategories = getMainCategories();
  const subcategories = selectedMainCategory ? getSubcategories(selectedMainCategory) : [];

  // إضافة اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (!isSaving) {
          const form = document.getElementById('product-form');
          if (form) {
            form.dispatchEvent(new Event('submit'));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving]);

  return (
    <div className="w-full">
      {/* Modal التأكيد المخصص */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-t-2xl text-white relative">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-3 left-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all"
              >
                <FaTimes size={16} />
              </button>
              <div className="flex items-center justify-center mb-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2.5">
                  <FaTrash size={24} />
                </div>
              </div>
              <h2 className="text-lg font-bold text-center">{confirmModalData.title}</h2>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <FaTrash className="text-red-600" size={20} />
                  </div>
                </div>
                <p className="text-gray-700 text-lg font-medium mb-6">{confirmModalData.message}</p>
                <p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  confirmModalData.onConfirm();
                  setShowConfirmModal(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal تأكيد إضافة المنتجات بنجاح */}
      {showSuccessModal && addedProducts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-t-2xl text-white relative">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-3 left-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all"
              >
                <FaTimes size={16} />
              </button>
              <div className="flex items-center justify-center mb-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2.5">
                  <FaCheckCircle size={32} />
                </div>
              </div>
              <h2 className="text-lg font-bold text-center">تم إضافة المنتجات بنجاح!</h2>
              <div className="text-center mt-2">
                <span className="inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                  {addedProducts.length} منتج تم إضافته بنجاح
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* إحصائيات سريعة */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{addedProducts.length}</div>
                    <div className="text-xs text-green-700">منتج مضاف</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{[...new Set(addedProducts.map(p => p.warehouseId))].length}</div>
                    <div className="text-xs text-blue-700">مخزن مختلف</div>
                  </div>
                </div>
              </div>

              {addedProducts.map((product, index) => (
                <div key={index} className="bg-gradient-to-r from-orange-50 to-white p-3 rounded-lg border-r-4 border-orange-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaBox className="text-orange-500" size={18} />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">اسم المنتج</p>
                        <p className="text-sm font-bold text-gray-800">{product.name}</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      تم الإضافة
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">الفئة:</span>
                      <span className="mr-1 font-medium">{product.categoryDisplay}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">المخزن:</span>
                      <span className="mr-1 font-medium">{product.warehouseName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">المعامل:</span>
                      <span className="mr-1 font-medium">{product.multiplier}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">الحد الأقصى:</span>
                      <span className="mr-1 font-medium">{product.maxStock || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ملخص المنتجات المضافة */}
            <div className="p-3 bg-blue-50 border-t">
              <div className="text-center text-sm text-blue-700">
                <p className="font-semibold mb-2">ملخص عملية الإضافة</p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="font-bold text-blue-800">{addedProducts.length}</div>
                    <div>منتج تم إضافته</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-800">{[...new Set(addedProducts.map(p => p.warehouseId))].length}</div>
                    <div>مخزن مستخدم</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-800">{[...new Set(addedProducts.map(p => p.mainCategoryId))].length}</div>
                    <div>فئة مختلفة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 rounded-b-2xl flex gap-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                إضافة منتجات أخرى
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/warehouses/manage-products');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                عرض المنتجات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* البطاقة الرئيسية */}
      <div className="bg-white rounded-lg shadow-md w-full">
        <form id="product-form" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-2 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaBox className="text-orange-500" /> توصيف منتجات جديدة
               
              </h3>
            </div>
          </div>
          
          {/* زر إضافة صف */}
          <div className="p-2">
            <button
              type="button"
              onClick={addNewRow}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              title="إضافة منتج جديد جديد"
            >
              <FaPlus /> منتج جديد
            </button>
          </div>

          {/* الجدول */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center">الاسم</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center">الفئة</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center">المخزن</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center">الباركود</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center w-20">المعامل</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center w-20">الحد الأقصى</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center w-24">الوحدة الأساسية</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center w-24">الوحدة الفرعية</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center">الأسعار</th>
                  <th className="px-2 py-1 text-xs font-medium text-gray-700 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((row, index) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    {/* اسم المنتج */}
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                        placeholder="اسم المنتج"
                        required
                      />
                    </td>

                    {/* الفئة */}
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() => openCategoryModal(row.id)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right transition-colors"
                      >
                        {row.selectedCategory ? (
                          <div className="flex items-center justify-between">
                            <FaTags className="text-blue-500" />
                            <span>
                              {(() => {
                                const allCategories = mainCategories.concat(
                                  mainCategories.flatMap(mainCat => 
                                    getSubcategories(mainCat.id).map(sub => ({ ...sub, parentId: mainCat.id }))
                                  )
                                );
                                const selectedCat = allCategories.find(c => c.id === parseInt(row.selectedCategory));
                                if (selectedCat && selectedCat.parentId) {
                                  const parentCat = mainCategories.find(c => c.id === selectedCat.parentId);
                                  return (
                                    <>
                                      <span 
                                        className="inline-block w-2 h-2 rounded-full mr-1" 
                                        style={{ backgroundColor: parentCat?.color }}
                                      ></span>
                                      {parentCat?.name} → 
                                      <span 
                                        className="inline-block w-2 h-2 rounded-full mr-1 ml-1" 
                                        style={{ backgroundColor: selectedCat.color }}
                                      ></span>
                                      {selectedCat.name}
                                    </>
                                  );
                                }
                                return (
                                  <>
                                    <span 
                                      className="inline-block w-2 h-2 rounded-full mr-1" 
                                      style={{ backgroundColor: selectedCat.color }}
                                    ></span>
                                    {selectedCat.name}
                                  </>
                                );
                              })()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-gray-500">
                            <FaTags />
                            <span>اختر الفئة</span>
                          </div>
                        )}
                      </button>
                    </td>

                    {/* المخزن */}
                    <td className="px-2 py-1">
                      <select
                        value={row.warehouseId}
                        onChange={(e) => updateRow(row.id, 'warehouseId', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">اختر</option>
                        {warehouseOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* الباركود */}
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={row.barcode}
                        onChange={(e) => updateRow(row.id, 'barcode', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="الباركود"
                        required
                      />
                    </td>

                    {/* المعامل */}
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={row.multiplier}
                        onChange={(e) => updateRow(row.id, 'multiplier', e.target.value)}
                        className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                        placeholder="12"
                        min="1"
                        required
                        title="عند تغيير المعامل، سيتم إعادة حساب جميع الأسعار الفرعية تلقائياً"
                      />
                    </td>

                    {/* الحد الأقصى */}
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={row.maxStock}
                        onChange={(e) => updateRow(row.id, 'maxStock', e.target.value)}
                        className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                        placeholder="100"
                        min="0"
                      />
                    </td>

                    {/* الوحدة الأساسية */}
                    <td className="px-2 py-1">
                      <select
                        value={row.mainUnitId}
                        onChange={(e) => updateRow(row.id, 'mainUnitId', e.target.value)}
                        className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                        required
                      >
                        <option value="">اختر الوحدة</option>
                        {getMainUnits().map(unit => (
                          <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* الوحدة الفرعية */}
                    <td className="px-2 py-1">
                      <select
                        value={row.subUnitId}
                        onChange={(e) => updateRow(row.id, 'subUnitId', e.target.value)}
                        className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                        required
                      >
                        <option value="">اختر الوحدة</option>
                        {getSubUnits().map(unit => (
                          <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* زر الأسعار */}
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() => openPricesModal(row)}
                        className="w-full px-2 py-1 text-xs bg-green-100 text-green-700 border border-green-300 rounded hover:bg-green-200 focus:ring-2 focus:ring-green-500 transition-colors"
                        title="إضافة الأسعار"
                      >
                        <FaDollarSign className="inline mr-1" />
                        الأسعار
                      </button>
                    </td>

                    {/* الإجراءات */}
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={productRows.length === 1}
                        className="w-full px-2 py-1 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaTrash className="inline mr-1" />
                        حذف
                      </button>
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* الأزرار في الأسفل */}
          <div className="p-2 bg-gray-50 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span className="inline-block ml-3">عدد الصفوف: {productRows.length}</span>
              <span className="inline-block">Ctrl+S = حفظ</span>
              {isSaving && (
                <div className="inline-block ml-4 text-blue-600">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                    <span>جاري الحفظ... {saveProgress}%</span>
                  </div>
                  <div className="w-32 h-1 bg-gray-200 rounded mt-1">
                    <div 
                      className="h-1 bg-blue-600 rounded transition-all duration-300" 
                      style={{ width: `${saveProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setProductRows([createNewRow()]);
                }}
                disabled={isSaving}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaUndo /> إعادة تعيين
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave /> {isSaving ? 'جاري الحفظ...' : 'حفظ جميع المنتجات'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal اختيار الفئة */}
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
                {categorySelectionStep === 'main' ? 'اختر الفئة الرئيسية' : `فئات فرعية في "${mainCategories.find(c => c.id === selectedMainCategory)?.name}"`}
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
                          {getSubcategories(category.id).length > 0 && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {getSubcategories(category.id).length} فرعية
                            </span>
                          )}
                          <FaBox className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // عرض الفئات الفرعية
                (() => {
                  const subcategories = selectedMainCategory ? getSubcategories(selectedMainCategory) : [];
                  return (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <button
                        onClick={() => selectSubcategory(selectedMainCategory)}
                        className="w-full p-3 text-right border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span 
                              className="w-4 h-4 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: mainCategories.find(c => c.id === selectedMainCategory)?.color }}
                            ></span>
                            <span className="font-medium text-gray-800">
                              {mainCategories.find(c => c.id === selectedMainCategory)?.name}
                            </span>
                          </div>
                          <FaBox className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                      </button>
                      
                      {searchCategories(subcategories, categorySearchTerm).map(subcategory => (
                        <button
                          key={subcategory.id}
                          onClick={() => selectSubcategory(subcategory.id)}
                          className="w-full p-3 text-right border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span 
                                className="w-4 h-4 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: subcategory.color }}
                              ></span>
                              <span className="font-medium text-gray-800">{subcategory.name}</span>
                            </div>
                            <FaBox className="text-gray-400 group-hover:text-blue-500" />
                          </div>
                        </button>
                      ))}
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
                  العودة إلى الفئات الرئيسية
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal الشرائح السعرية */}
      {showPricesModal && currentRowPrices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-t-2xl text-white relative">
              <button
                onClick={() => setShowPricesModal(false)}
                className="absolute top-3 left-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all"
              >
                <FaTimes />
              </button>
              <h3 className="text-lg font-semibold text-center">
                الشرائح السعرية - {currentRowPrices.name}
              </h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* البيع المباشر */}
                <div key="retail" className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-semibold text-orange-700 mb-3 text-center">البيع المباشر</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي</label>
                      <input
                        type="number"
                        step="0.01"
                        value={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row?.tierPrices?.retail?.basicPrice || '';
                        })()}
                        onChange={(e) => updateRowPrices('retail', 'basicPrice', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">السعر الفرعي</label>
                        {(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row && isAutoCalculated(row, 'retail') && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                              محسوب تلقائياً
                            </span>
                          );
                        })()}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row?.tierPrices?.retail?.subPrice || '';
                        })()}
                        onChange={(e) => updateRowPrices('retail', 'subPrice', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                        min="0"
                        title={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row && isAutoCalculated(row, 'retail') 
                            ? `تم حسابه تلقائياً: ${row.tierPrices.retail.basicPrice} ÷ ${row.multiplier || 1}`
                            : '';
                        })()}
                      />
                    </div>
                  </div>
                </div>

                {/* الجملة */}
                <div key="wholesale" className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-700 mb-3 text-center">الجملة</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي</label>
                      <input
                        type="number"
                        step="0.01"
                        value={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row?.tierPrices?.wholesale?.basicPrice || '';
                        })()}
                        onChange={(e) => updateRowPrices('wholesale', 'basicPrice', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">السعر الفرعي</label>
                        {(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row && isAutoCalculated(row, 'wholesale') && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              محسوب تلقائياً
                            </span>
                          );
                        })()}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row?.tierPrices?.wholesale?.subPrice || '';
                        })()}
                        onChange={(e) => updateRowPrices('wholesale', 'subPrice', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        min="0"
                        title={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row && isAutoCalculated(row, 'wholesale') 
                            ? `تم حسابه تلقائياً: ${row.tierPrices.wholesale.basicPrice} ÷ ${row.multiplier || 1}`
                            : '';
                        })()}
                      />
                    </div>
                  </div>
                </div>

                {/* جملة الجملة */}
                <div key="bulk" className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3 text-center">جملة الجملة</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي</label>
                      <input
                        type="number"
                        step="0.01"
                        value={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row?.tierPrices?.bulk?.basicPrice || '';
                        })()}
                        onChange={(e) => updateRowPrices('bulk', 'basicPrice', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">السعر الفرعي</label>
                        {(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row && isAutoCalculated(row, 'bulk') && (
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                              محسوب تلقائياً
                            </span>
                          );
                        })()}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row?.tierPrices?.bulk?.subPrice || '';
                        })()}
                        onChange={(e) => updateRowPrices('bulk', 'subPrice', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0.00"
                        min="0"
                        title={(() => {
                          const row = productRows.find(r => r.id === currentRowPrices?.id);
                          return row && isAutoCalculated(row, 'bulk') 
                            ? `تم حسابه تلقائياً: ${row.tierPrices.bulk.basicPrice} ÷ ${row.multiplier || 1}`
                            : '';
                        })()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-2">
              <button
                onClick={() => setShowPricesModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={savePrices}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                حفظ الأسعار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;