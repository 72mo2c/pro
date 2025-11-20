// ======================================
// Add Product - إضافة بضاعة إلى مخزن (محسّنة)
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaSave, FaCheckCircle, FaTimes, FaWarehouse, FaTags, FaDollarSign, FaCubes, FaBarcode, FaUndo, FaMoneyBillWave } from 'react-icons/fa';

const AddProduct = () => {
  const navigate = useNavigate();
  const { warehouses, categories, addProduct } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    // أسعار الشراء الجديدة
    purchasePrices: {
      basicPrice: '',
      subPrice: ''
    },
    // نظام الشرائح السعرية للبيع
    tierPrices: {
      retail: {
        basicPrice: '',
        subPrice: ''
      },
      wholesale: {
        basicPrice: '',
        subPrice: ''
      },
      bulk: {
        basicPrice: '',
        subPrice: ''
      }
    },
    // الكميات والوحدات (لم تتغير)
    mainQuantity: '',
    subQuantity: '',
    unitsInMain: '', // العدد في الوحدة الأساسية (مثل 12 قطعة في الكرتونة)
    warehouseId: '',
    barcode: '',
    description: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // التعامل مع أسعار الشراء
    if (name.startsWith('purchase_')) {
      const priceType = name.replace('purchase_', ''); // purchase_basicPrice
      setFormData({
        ...formData,
        purchasePrices: {
          ...formData.purchasePrices,
          [priceType]: value
        }
      });
    }
    // التعامل مع خانات الشرائح السعرية
    else if (name.startsWith('tier_')) {
      const [_, tier, priceType] = name.split('_'); // tier_retail_basicPrice
      setFormData({
        ...formData,
        tierPrices: {
          ...formData.tierPrices,
          [tier]: {
            ...formData.tierPrices[tier],
            [priceType]: value
          }
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // تحويل قيم أسعار الشراء إلى أرقام
      const processedPurchasePrices = {
        basicPrice: parseFloat(formData.purchasePrices.basicPrice) || 0,
        subPrice: parseFloat(formData.purchasePrices.subPrice) || 0
      };

      // تحويل قيم الشرائح السعرية إلى أرقام
      const processedTierPrices = {};
      Object.keys(formData.tierPrices).forEach(tier => {
        processedTierPrices[tier] = {
          basicPrice: parseFloat(formData.tierPrices[tier].basicPrice) || 0,
          subPrice: parseFloat(formData.tierPrices[tier].subPrice) || 0
        };
      });

      const productData = {
        ...formData,
        purchasePrices: processedPurchasePrices, // أسعار الشراء الجديدة
        tierPrices: processedTierPrices, // الشرائح السعرية الجديدة
        mainQuantity: parseInt(formData.mainQuantity) || 0,
        subQuantity: parseInt(formData.subQuantity) || 0,
        unitsInMain: parseInt(formData.unitsInMain) || 0, // العدد في الوحدة الأساسية
        warehouseId: parseInt(formData.warehouseId),
        createdAt: new Date().toISOString()
      };

      const newProduct = addProduct(productData);
      
      // حفظ بيانات المنتج المضاف للعرض في Modal
      setAddedProduct({
        ...newProduct,
        warehouseName: warehouses.find(w => w.id === parseInt(formData.warehouseId))?.name || 'غير محدد'
      });
      
      // إظهار Modal التأكيد
      setShowSuccessModal(true);
      showSuccess('تم إضافة المنتج بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        category: '',
        purchasePrices: { basicPrice: '', subPrice: '' },
        tierPrices: {
          retail: { basicPrice: '', subPrice: '' },
          wholesale: { basicPrice: '', subPrice: '' },
          bulk: { basicPrice: '', subPrice: '' }
        },
        mainQuantity: '',
        subQuantity: '',
        unitsInMain: '',
        warehouseId: '',
        barcode: '',
        description: ''
      });
    } catch (error) {
      showError('حدث خطأ في إضافة المنتج');
    }
  };

  const nameInputRef = useRef(null);

  // التركيز التلقائي عند التحميل
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // معالجة اختصارات الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
          form.dispatchEvent(submitEvent);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name
  }));

  const categoryOptions = categories.map(c => ({
    value: c.name,
    label: c.name
  }));

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      purchasePrices: { basicPrice: '', subPrice: '' },
      tierPrices: {
        retail: { basicPrice: '', subPrice: '' },
        wholesale: { basicPrice: '', subPrice: '' },
        bulk: { basicPrice: '', subPrice: '' }
      },
      mainQuantity: '',
      subQuantity: '',
      unitsInMain: '',
      warehouseId: '',
      barcode: '',
      description: ''
    });
    nameInputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto p-2">
      {/* Modal تأكيد إضافة المنتج بنجاح */}
      {showSuccessModal && addedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
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
              <h2 className="text-lg font-bold text-center">تم إضافة المنتج بنجاح!</h2>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* اسم المنتج */}
              <div className="bg-gradient-to-r from-orange-50 to-white p-3 rounded-lg border-r-4 border-orange-500">
                <div className="flex items-center gap-2">
                  <FaBox className="text-orange-500" size={18} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">اسم المنتج</p>
                    <p className="text-sm font-bold text-gray-800">{addedProduct.name}</p>
                  </div>
                </div>
              </div>

              {/* الفئة والمخزن */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FaTags className="text-blue-500" size={14} />
                    <p className="text-xs text-gray-500">الفئة</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{addedProduct.category}</p>
                </div>
                <div className="bg-purple-50 p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FaWarehouse className="text-purple-500" size={14} />
                    <p className="text-xs text-gray-500">المخزن</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{addedProduct.warehouseName}</p>
                </div>
              </div>

              {/* عرض أسعار الشراء */}
              <div className="space-y-2">
                <div className="bg-green-50 p-2.5 rounded-lg border-r-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">سعر الشراء الأساسي:</span>
                    <span className="text-xs font-bold text-green-600">
                      {addedProduct.purchasePrices?.basicPrice?.toFixed(2) || '0.00'} ج.م
                    </span>
                  </div>
                </div>
                
                {addedProduct.purchasePrices?.subPrice > 0 && (
                  <div className="bg-green-50 p-2.5 rounded-lg border-r-4 border-green-400">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700">سعر الشراء الفرعي:</span>
                      <span className="text-xs font-bold text-green-600">
                        {addedProduct.purchasePrices?.subPrice?.toFixed(2) || '0.00'} ج.م
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* عرض الشرائح السعرية للبيع */}
              <div className="space-y-2">
                <div className="bg-orange-50 p-2.5 rounded-lg border-r-4 border-orange-500">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">البيع المباشر:</span>
                    <span className="text-xs font-bold text-orange-600">
                      {addedProduct.tierPrices?.retail?.basicPrice?.toFixed(2) || '0.00'} ج.م
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-2.5 rounded-lg border-r-4 border-blue-500">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">الجملة:</span>
                    <span className="text-xs font-bold text-blue-600">
                      {addedProduct.tierPrices?.wholesale?.basicPrice?.toFixed(2) || '0.00'} ج.م
                    </span>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-2.5 rounded-lg border-r-4 border-purple-500">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">جملة الجملة:</span>
                    <span className="text-xs font-bold text-purple-600">
                      {addedProduct.tierPrices?.bulk?.basicPrice?.toFixed(2) || '0.00'} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              {addedProduct.barcode && (
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">الباركود</p>
                  <p className="font-mono text-xs font-semibold text-gray-800">{addedProduct.barcode}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 rounded-b-2xl flex gap-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                إضافة منتج آخر
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // توجيه المستخدم إلى صفحة عرض البضائع
                  navigate('/warehouses/manage-products');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                عرض البضاعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* البطاقة الرئيسية */}
      <div className="bg-white rounded-lg shadow-md">
        <form id="product-form" onSubmit={handleSubmit}>
          {/* معلومات أساسية + الباركود والوصف */}
          <div className="p-3 bg-gray-50 border-b">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaBox className="text-orange-500" /> معلومات المنتج الأساسية
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* اسم المنتج */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">اسم المنتج *</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="اسم المنتج"
                  required
                />
              </div>

              {/* الفئة */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الفئة *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* المخزن */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">المخزن *</label>
                <select
                  name="warehouseId"
                  value={formData.warehouseId}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">اختر المخزن</option>
                  {warehouseOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* رقم الباركود */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الباركود *</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="رقم الباركود"
                  required
                />
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="وصف مختصر"
                />
              </div>

              {/* الوحدة الأساسية */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوحدة</label>
                <input
                  type="text"
                  value="كرتونة/بلتة"
                  disabled
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* أسعار الشراء والكميات - جنبًا إلى جنب */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b">
            {/* أسعار الشراء */}
            <div className="p-3 border-b lg:border-b-0 lg:border-l">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-500" /> أسعار الشراء
              </h3>
              <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">سعر الشراء الأساسي *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="purchase_basicPrice"
                      value={formData.purchasePrices.basicPrice}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">سعر الشراء الفرعي</label>
                    <input
                      type="number"
                      step="0.01"
                      name="purchase_subPrice"
                      value={formData.purchasePrices.subPrice}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* الكميات */}
            <div className="p-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCubes className="text-blue-500" /> الكميات
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">العدد/وحدة *</label>
                  <input
                    type="number"
                    name="unitsInMain"
                    value={formData.unitsInMain}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    placeholder="12"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">كرتونة *</label>
                  <input
                    type="number"
                    name="mainQuantity"
                    value={formData.mainQuantity}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">قطع إضافية</label>
                  <input
                    type="number"
                    name="subQuantity"
                    value={formData.subQuantity}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              {/* عرض الكمية الإجمالية */}
              {formData.unitsInMain > 0 && (formData.mainQuantity || formData.subQuantity) && (
                <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
                  الإجمالي: <strong>{((parseInt(formData.mainQuantity) || 0) * formData.unitsInMain + (parseInt(formData.subQuantity) || 0))} قطعة</strong>
                </div>
              )}
            </div>
          </div>

          {/* الشرائح السعرية - 3 أعمدة */}
          <div className="p-3 border-b">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaDollarSign className="text-green-500" /> الشرائح السعرية للبيع
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* البيع المباشر */}
              <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="text-xs font-semibold text-orange-700 mb-2">البيع المباشر (تجزئة)</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="tier_retail_basicPrice"
                      value={formData.tierPrices.retail.basicPrice}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">السعر الفرعي</label>
                    <input
                      type="number"
                      step="0.01"
                      name="tier_retail_subPrice"
                      value={formData.tierPrices.retail.subPrice}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* الجملة */}
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-700 mb-2">الجملة</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="tier_wholesale_basicPrice"
                      value={formData.tierPrices.wholesale.basicPrice}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">السعر الفرعي</label>
                    <input
                      type="number"
                      step="0.01"
                      name="tier_wholesale_subPrice"
                      value={formData.tierPrices.wholesale.subPrice}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* جملة الجملة */}
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-700 mb-2">جملة الجملة</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="tier_bulk_basicPrice"
                      value={formData.tierPrices.bulk.basicPrice}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">السعر الفرعي</label>
                    <input
                      type="number"
                      step="0.01"
                      name="tier_bulk_subPrice"
                      value={formData.tierPrices.bulk.subPrice}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* الأزرار في الأسفل */}
          <div className="p-3 bg-gray-50 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span className="inline-block ml-3">Ctrl+S = حفظ</span>
              <span className="inline-block">Tab = التنقل</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                <FaUndo /> إعادة تعيين
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                <FaSave /> حفظ المنتج
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
