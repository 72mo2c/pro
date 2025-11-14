// ======================================
// Smart Purchase Invoice - فاتورة مشتريات ذكية مع التحويل التلقائي
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useTab } from '../../contexts/TabContext';
import { FaSave, FaPrint, FaSearch, FaTrash, FaPercent, FaMoneyBillWave, FaExclamationTriangle, FaInfoCircle, FaCalculator, FaList } from 'react-icons/fa';
import { 
  calculateTotalSubQuantity, 
  convertSubToMain, 
  isSubQuantityAvailable,
  getStockDetail 
} from '../../utils/unitConversion';
import { checkStockAvailability } from '../../utils/dataContextUpdates';

const SmartPurchaseInvoice = () => {
  const { suppliers, products, warehouses, addPurchaseInvoice, getSupplierBalance } = useData();
  const { showSuccess, showError } = useNotification();
  const { openTab } = useTab();
  
  // دالة لفتح سجل المشتريات في تبويبة جديدة
  const handleOpenPurchaseRecord = () => {
    openTab('/purchases/manage', 'سجل فواتير المشتريات', '📋');
  };
  
  const [formData, setFormData] = useState({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    paymentType: 'main',
    notes: '',
    discountType: 'percentage',
    discountValue: 0
  });

  const [items, setItems] = useState([{
    productId: '',
    productName: '',
    mainQuantity: 0,
    subQuantity: 0, // الكمية الإجمالية بالوحدات الفرعية
    price: 0,
    subPrice: 0,
    discount: 0
  }]);

  // البحث في الموردين والمنتجات
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [productSearches, setProductSearches] = useState(['']);
  const [showProductSuggestions, setShowProductSuggestions] = useState([false]);
  
  // حالات الخطأ
  const [validationErrors, setValidationErrors] = useState({});

  // التركيز التلقائي
  const supplierInputRef = useRef(null);
  const productInputRefs = useRef([]);

  useEffect(() => {
    supplierInputRef.current?.focus();
  }, []);

  // عرض رصيد المورد المحدد
  const getSelectedSupplierBalance = () => {
    if (!formData.supplierId) return null;
    return getSupplierBalance(parseInt(formData.supplierId));
  };

  // الحصول على تفاصيل المنتج المحدد
  const getSelectedProduct = (item) => {
    return products.find(p => p.id === parseInt(item.productId)) || null;
  };

  // حساب إجمالي العنصر
  const calculateItemTotal = (item) => {
    const product = getSelectedProduct(item);
    if (!product) return 0;
    
    // حساب إجمالي الكمية الفعلي
    const totalSubQuantity = (item.mainQuantity || 0) * (product.unitsInMain || 0) + (item.subQuantity || 0);
    
    // حساب القيمة: نستخدم السعر الأساسي للوحدة الفرعية إذا كان موجود
    const unitPrice = product.subPrice || product.mainPrice;
    
    return totalSubQuantity * unitPrice;
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateDiscountAmount = () => {
    const subTotal = calculateSubTotal();
    if (formData.discountType === 'percentage') {
      return (subTotal * (formData.discountValue / 100));
    } else {
      return parseFloat(formData.discountValue) || 0;
    }
  };

  const calculateTotal = () => {
    const subTotal = calculateSubTotal();
    const discountAmount = calculateDiscountAmount();
    return Math.max(0, subTotal - discountAmount);
  };

  // إدارة عناصر الفاتورة
  const addItem = () => {
    setItems([...items, {
      productId: '',
      productName: '',
      mainQuantity: 0,
      subQuantity: 0,
      price: 0,
      subPrice: 0,
      discount: 0
    }]);
    setProductSearches([...productSearches, '']);
    setShowProductSuggestions([...showProductSuggestions, false]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    const newProductSearches = productSearches.filter((_, i) => i !== index);
    const newShowProductSuggestions = showProductSuggestions.filter((_, i) => i !== index);
    
    setItems(newItems);
    setProductSearches(newProductSearches);
    setShowProductSuggestions(newShowProductSuggestions);
  };

  // البحث في المنتجات
  const searchProducts = (query) => {
    if (!query.trim()) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  // تحديد منتج
  const selectProduct = (index, product) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      price: product.mainPrice,
      subPrice: product.subPrice || 0
    };
    setItems(newItems);

    // تحديث البحث
    const newProductSearches = [...productSearches];
    newProductSearches[index] = product.name;
    setProductSearches(newProductSearches);

    // إخفاء الاقتراحات
    const newShowProductSuggestions = [...showProductSuggestions];
    newShowProductSuggestions[index] = false;
    setShowProductSuggestions(newShowProductSuggestions);
  };

  // تحديث عنصر
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const errors = {};
    
    if (!formData.supplierId) {
      errors.supplierId = 'يجب اختيار مورد';
    }
    
    items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_productId`] = 'يجب اختيار منتج';
      }
      if ((item.mainQuantity || 0) <= 0 && (item.subQuantity || 0) <= 0) {
        errors[`item_${index}_quantity`] = 'يجب إدخال كمية';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // حفظ الفاتورة
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('يرجى التحقق من البيانات المدخلة');
      return;
    }

    try {
      // تحضير البيانات للحفظ
      const invoiceData = {
        ...formData,
        supplierId: parseInt(formData.supplierId),
        items: items.map(item => ({
          ...item,
          productId: parseInt(item.productId),
          mainQuantity: parseInt(item.mainQuantity) || 0,
          subQuantity: parseInt(item.subQuantity) || 0,
          price: parseFloat(item.price) || 0,
          subPrice: parseFloat(item.subPrice) || 0,
          discount: parseFloat(item.discount) || 0
        })),
        total: calculateTotal(),
        createdAt: new Date().toISOString()
      };

      const newInvoice = addPurchaseInvoice(invoiceData);
      showSuccess('تم حفظ الفاتورة بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        supplierId: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        paymentType: 'main',
        notes: '',
        discountType: 'percentage',
        discountValue: 0
      });
      
      setItems([{
        productId: '',
        productName: '',
        mainQuantity: 0,
        subQuantity: 0,
        price: 0,
        subPrice: 0,
        discount: 0
      }]);
      
    } catch (error) {
      showError('حدث خطأ في حفظ الفاتورة');
      console.error('خطأ حفظ الفاتورة:', error);
    }
  };

  // فلترة الموردين
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* العنوان الرئيسي */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FaMoneyBillWave /> فاتورة مشتريات ذكية
          </h1>
          <p className="text-green-100 text-sm mt-1">
            نظام ذكي لإدارة التحويل التلقائي بين الوحدات الأساسية والفرعية
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* معلومات الفاتورة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* المورد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المورد *</label>
              <div className="relative">
                <input
                  ref={supplierInputRef}
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value);
                    setShowSupplierSuggestions(true);
                  }}
                  onFocus={() => setShowSupplierSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSupplierSuggestions(false), 200)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  placeholder="البحث عن مورد..."
                />
                {showSupplierSuggestions && filteredSuppliers.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredSuppliers.map(supplier => (
                      <div
                        key={supplier.id}
                        onClick={() => {
                          setFormData({...formData, supplierId: supplier.id});
                          setSupplierSearch(supplier.name);
                          setShowSupplierSuggestions(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-gray-500">
                          رصيد: {supplier.balance || 0} ج.م
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {validationErrors.supplierId && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.supplierId}</p>
              )}
            </div>

            {/* التاريخ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* وقت */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوقت *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* عرض رصيد المورد */}
          {getSelectedSupplierBalance() !== null && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                <span className="text-sm font-medium text-blue-800">
                  رصيد المورد: {getSelectedSupplierBalance().toFixed(2)} ج.م
                </span>
              </div>
            </div>
          )}

          {/* عناصر الفاتورة */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">عناصر الفاتورة</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-2"
              >
                <FaPlus /> إضافة عنصر
              </button>
            </div>

            {/* جدول العناصر */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-right text-sm font-medium text-gray-700">المنتج</th>
                    <th className="p-2 text-right text-sm font-medium text-gray-700">الكمية الأساسية</th>
                    <th className="p-2 text-right text-sm font-medium text-gray-700">الكمية الإجمالية</th>
                    <th className="p-2 text-right text-sm font-medium text-gray-700">السعر</th>
                    <th className="p-2 text-right text-sm font-medium text-gray-700">الإجمالي</th>
                    <th className="p-2 text-right text-sm font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const product = getSelectedProduct(item);
                    const stockDetail = product ? getStockDetail(product) : null;
                    
                    return (
                      <tr key={index} className="border-t">
                        {/* المنتج */}
                        <td className="p-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={productSearches[index]}
                              onChange={(e) => {
                                const newProductSearches = [...productSearches];
                                newProductSearches[index] = e.target.value;
                                setProductSearches(newProductSearches);
                                
                                const newShowProductSuggestions = [...showProductSuggestions];
                                newShowProductSuggestions[index] = true;
                                setShowProductSuggestions(newShowProductSuggestions);
                              }}
                              onFocus={() => {
                                const newShowProductSuggestions = [...showProductSuggestions];
                                newShowProductSuggestions[index] = true;
                                setShowProductSuggestions(newShowProductSuggestions);
                              }}
                              onBlur={() => setTimeout(() => {
                                const newShowProductSuggestions = [...showProductSuggestions];
                                newShowProductSuggestions[index] = false;
                                setShowProductSuggestions(newShowProductSuggestions);
                              }, 200)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                              placeholder="البحث عن منتج..."
                            />
                            
                            {showProductSuggestions[index] && productSearches[index] && (
                              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {searchProducts(productSearches[index]).map(p => (
                                  <div
                                    key={p.id}
                                    onClick={() => selectProduct(index, p)}
                                    className="px-2 py-1 hover:bg-gray-50 cursor-pointer text-sm"
                                  >
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {p.unitsInMain > 0 ? `${p.unitsInMain} قطعة/كرتونة` : 'بدون تحويل'}
                                      {stockDetail && ` | متاح: ${stockDetail.totalDisplay}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* الكمية الأساسية */}
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.mainQuantity}
                            onChange={(e) => updateItem(index, 'mainQuantity', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            min="0"
                            placeholder="0"
                          />
                        </td>

                        {/* الكمية الإجمالية */}
                        <td className="p-2">
                          <div className="space-y-1">
                            <input
                              type="number"
                              value={item.subQuantity}
                              onChange={(e) => updateItem(index, 'subQuantity', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              min="0"
                              placeholder="0"
                            />
                            {product && product.unitsInMain > 0 && (
                              <div className="text-xs text-blue-600">
                                = {((item.mainQuantity || 0) * (product.unitsInMain || 0) + (item.subQuantity || 0))} قطعة
                              </div>
                            )}
                          </div>
                        </td>

                        {/* السعر */}
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.subPrice || item.price}
                            onChange={(e) => {
                              if (item.subPrice) {
                                updateItem(index, 'subPrice', parseFloat(e.target.value) || 0);
                              } else {
                                updateItem(index, 'price', parseFloat(e.target.value) || 0);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            min="0"
                            placeholder="0.00"
                          />
                        </td>

                        {/* الإجمالي */}
                        <td className="p-2">
                          <div className="text-sm font-medium">
                            {calculateItemTotal(item).toFixed(2)} ج.م
                          </div>
                        </td>

                        {/* الإجراءات */}
                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                            disabled={items.length === 1}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ملخص الفاتورة */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">المجموع الفرعي:</span>
              <span className="font-medium">{calculateSubTotal().toFixed(2)} ج.م</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">الخصم:</span>
              <span className="font-medium">{calculateDiscountAmount().toFixed(2)} ج.م</span>
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold text-green-600 pt-2 border-t">
              <span>الإجمالي:</span>
              <span>{calculateTotal().toFixed(2)} ج.م</span>
            </div>
          </div>

          {/* ملاحظات */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="ملاحظات إضافية..."
            />
          </div>

          {/* أزرار الحفظ */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 border-t">
            {/* زر السجل */}
            <button
              type="button"
              onClick={handleOpenPurchaseRecord}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
              title="فتح سجل فواتير المشتريات في تبويبة جديدة"
            >
              <FaList /> سجل المشتريات
            </button>
            
            {/* زر الحفظ الرئيسي */}
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
            >
              <FaSave /> حفظ الفاتورة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartPurchaseInvoice;
