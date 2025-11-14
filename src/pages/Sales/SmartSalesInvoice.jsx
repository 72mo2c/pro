// ======================================
// Smart Sales Invoice - فاتورة مبيعات ذكية مع التحويل التلقائي
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useTab } from '../../contexts/TabContext';
import { FaSave, FaPrint, FaSearch, FaTrash, FaPercent, FaMoneyBillWave, FaExclamationTriangle, FaInfoCircle, FaCalculator, FaCheckCircle, FaUserPlus, FaTimes, FaList } from 'react-icons/fa';
import { 
  calculateTotalSubQuantity, 
  convertSubToMain, 
  isSubQuantityAvailable,
  getStockDetail 
} from '../../utils/unitConversion';
import { checkStockAvailability, updateStockWithConversion } from '../../utils/dataContextUpdates';

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

const SmartSalesInvoice = () => {
  const { customers, products, warehouses, addSalesInvoice, getCustomerBalance, addCustomer } = useData();
  const { showSuccess, showError, showWarning } = useNotification();
  const { openTab } = useTab();
  
  // دالة لفتح سجل المبيعات في تبويبة جديدة
  const handleOpenSalesRecord = () => {
    openTab('/sales/manage', 'سجل فواتير المبيعات', '📋');
  };
  
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    paymentType: 'main',
    saleType: 'retail', // نوع البيع: retail, wholesale, bulk
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

  // التحقق من توفر الكمية
  const [stockWarnings, setStockWarnings] = useState({});

  // البحث في العملاء والمنتجات
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [productSearches, setProductSearches] = useState(['']);
  const [showProductSuggestions, setShowProductSuggestions] = useState([false]);
  
  // حالات الخطأ
  const [validationErrors, setValidationErrors] = useState({});

  // التركيز التلقائي
  const customerInputRef = useRef(null);

  // ===== Quick Customer States =====
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [quickCustomerForm, setQuickCustomerForm] = useState({
    name: '',
    phone1: '',
    phone2: '',
    address: '',
    agentType: 'general'
  });
  const [quickCustomerLoading, setQuickCustomerLoading] = useState(false);
  const [quickCustomerErrors, setQuickCustomerErrors] = useState({});

  useEffect(() => {
    customerInputRef.current?.focus();
  }, []);

  // عرض رصيد العميل المحدد
  const getSelectedCustomerBalance = () => {
    if (!formData.customerId) return null;
    return getCustomerBalance(parseInt(formData.customerId));
  };

  // الحصول على تفاصيل المنتج المحدد
  const getSelectedProduct = (item) => {
    return products.find(p => p.id === parseInt(item.productId)) || null;
  };

  // التحقق من توفر الكمية عند إدخالها
  const checkStockAvailabilityForItem = (index, item) => {
    const product = getSelectedProduct(item);
    if (!product) return;

    const totalSubQuantity = (item.mainQuantity || 0) * (product.unitsInMain || 0) + (item.subQuantity || 0);
    const currentStock = {
      mainQuantity: product.mainQuantity || 0,
      subQuantity: product.subQuantity || 0,
      unitsInMain: product.unitsInMain || 0
    };

    const isAvailable = checkStockAvailability(currentStock, totalSubQuantity, 'sub');
    
    setStockWarnings(prev => ({
      ...prev,
      [index]: isAvailable ? null : 'الكمية المطلوبة غير متوفرة في المخزون'
    }));
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
    const newStockWarnings = {...stockWarnings};
    delete newStockWarnings[index];
    
    setItems(newItems);
    setProductSearches(newProductSearches);
    setShowProductSuggestions(newShowProductSuggestions);
    setStockWarnings(newStockWarnings);
  };

  // البحث في المنتجات
  const searchProducts = (query) => {
    if (!query.trim()) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  // تحديد السعر حسب نوع البيع
  const getPriceForSaleType = (product, saleType) => {
    if (product.tierPrices) {
      // استخدام الشرائح السعرية
      const tierPrice = product.tierPrices[saleType];
      if (tierPrice) {
        return {
          price: tierPrice.basicPrice || 0,
          subPrice: tierPrice.subPrice || 0
        };
      }
    }
    // النظام القديم - استخدام الأسعار الأساسية
    return {
      price: product.mainPrice || 0,
      subPrice: product.subPrice || 0
    };
  };

  // تحديد المنتج مع السعر المناسب حسب نوع البيع
  const selectProduct = (index, product) => {
    const newItems = [...items];
    
    // تحديد السعر حسب نوع البيع المحدد
    const priceData = getPriceForSaleType(product, formData.saleType);
    
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      price: priceData.price,
      subPrice: priceData.subPrice
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

  // تحديث أسعار جميع المنتجات عند تغيير نوع البيع
  const updateAllPricesForSaleType = (newSaleType) => {
    const updatedItems = items.map(item => {
      if (!item.productId) return item;
      
      const product = getSelectedProduct(item);
      if (!product) return item;
      
      const priceData = getPriceForSaleType(product, newSaleType);
      return {
        ...item,
        price: priceData.price,
        subPrice: priceData.subPrice
      };
    });
    
    setItems(updatedItems);
  };

  // تحديث عنصر مع فحص المخزون
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);

    // فحص المخزون إذا تم تحديث الكمية
    if (field === 'mainQuantity' || field === 'subQuantity') {
      setTimeout(() => checkStockAvailabilityForItem(index, newItems[index]), 100);
    }
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const errors = {};
    
    if (!formData.customerId) {
      errors.customerId = 'يجب اختيار عميل';
    }
    
    items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_productId`] = 'يجب اختيار منتج';
      }
      if ((item.mainQuantity || 0) <= 0 && (item.subQuantity || 0) <= 0) {
        errors[`item_${index}_quantity`] = 'يجب إدخال كمية';
      }
      
      // التحقق من توفر المخزون باستخدام المنطق الذكي
      const product = getSelectedProduct(item);
      if (product) {
        const mainQty = item.mainQuantity || 0;
        const subQty = item.subQuantity || 0;
        const unitsInMain = product.unitsInMain || 0;
        
        // حساب الكمية المطلوبة بالوحدات الفرعية
        const requiredSubQuantity = mainQty * unitsInMain + subQty;
        
        // حساب الكمية المتاحة بالوحدات الفرعية
        const totalAvailableSub = (product.mainQuantity || 0) * unitsInMain + (product.subQuantity || 0);
        
        if (requiredSubQuantity > totalAvailableSub) {
          errors[`item_${index}_stock`] = `الكمية المطلوبة من ${product.name} غير متوفرة.\n` +
            `إجمالي المتوفر: ${totalAvailableSub} قطعة، المطلوب: ${requiredSubQuantity} قطعة`;
        }
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
        customerId: parseInt(formData.customerId),
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

      const newInvoice = addSalesInvoice(invoiceData);
      showSuccess('تم حفظ الفاتورة بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        paymentType: 'main',
        saleType: 'retail',
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

  // فلترة العملاء
  const filteredCustomers = customers.filter(c => {
    const searchTerm = customerSearch.toLowerCase().trim();
    const customerName = c.name ? c.name.toLowerCase() : '';
    const customerPhone = c.phone ? c.phone.toLowerCase() : '';
    const customerPhone1 = c.phone1 ? c.phone1.toLowerCase() : '';
    
    return customerName.includes(searchTerm) || 
           customerPhone.includes(searchTerm) || 
           customerPhone1.includes(searchTerm);
  });

  // ===== دوال العميل السريع =====
  // فتح modal إضافة العميل السريع
  const openQuickCustomerModal = () => {
    setQuickCustomerForm({
      name: '',
      phone1: '',
      phone2: '',
      address: '',
      agentType: 'general'
    });
    setShowQuickCustomerModal(true);
  };

  // إغلاق modal العميل السريع
  const closeQuickCustomerModal = () => {
    setShowQuickCustomerModal(false);
    setQuickCustomerLoading(false);
    setQuickCustomerErrors({}); // مسح الأخطاء
  };

  // تحديث بيانات نموذج العميل السريع
  const handleQuickCustomerChange = (e) => {
    const { name, value } = e.target;
    
    setQuickCustomerForm({
      ...quickCustomerForm,
      [name]: value
    });
    
    // التحقق من أرقام الهواتف عند التغيير
    if (name === 'phone1' || name === 'phone2') {
      const validation = validatePhoneNumber(value);
      setQuickCustomerErrors(prev => ({
        ...prev,
        [name]: validation.error
      }));
    }
  };

  // إضافة عميل سريع جديد
  const handleAddQuickCustomer = async () => {
    // التحقق من صحة البيانات
    const newErrors = {};
    
    // التحقق من إدخال رقم هاتف واحد على الأقل
    const phoneValidation = validateAtLeastOnePhone(quickCustomerForm.phone1, quickCustomerForm.phone2);
    if (!phoneValidation.isValid) {
      newErrors.phone1 = phoneValidation.error;
    }
    
    // التحقق من رقم الهاتف الأساسي
    if (quickCustomerForm.phone1) {
      const phone1Validation = validatePhoneNumber(quickCustomerForm.phone1);
      if (!phone1Validation.isValid) {
        newErrors.phone1 = phone1Validation.error;
      }
    }
    
    // التحقق من رقم الهاتف الثانوي (إذا تم إدخاله)
    if (quickCustomerForm.phone2) {
      const phone2Validation = validatePhoneNumber(quickCustomerForm.phone2);
      if (!phone2Validation.isValid) {
        newErrors.phone2 = phone2Validation.error;
      }
    }
    
    // إذا كان هناك أخطاء، عرضها وإيقاف الإرسال
    if (Object.keys(newErrors).length > 0) {
      setQuickCustomerErrors(newErrors);
      showError('يرجى تصحيح أرقام الهواتف قبل الإرسال');
      return;
    }
    
    if (!quickCustomerForm.name.trim()) {
      showError('يجب إدخال اسم العميل');
      return;
    }

    setQuickCustomerLoading(true);

    try {
      // إضافة العميل الجديد
      const newCustomer = addCustomer({
        ...quickCustomerForm,
        createdAt: new Date().toISOString(),
        status: 'active'
      });

      showSuccess(`تم إضافة العميل "${newCustomer.name}" بنجاح`);
      
      // اختيار العميل الجديد فوراً في الفاتورة
      setFormData({ 
        ...formData, 
        customerId: newCustomer.id
      });
      
      // تحديث نص البحث ليعكس اسم العميل الجديد
      setCustomerSearch(newCustomer.name);
      
      // إغلاق المودال
      closeQuickCustomerModal();

    } catch (error) {
      showError('حدث خطأ في إضافة العميل');
    } finally {
      setQuickCustomerLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* العنوان الرئيسي */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FaMoneyBillWave /> فاتورة مبيعات ذكية
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            نظام ذكي للتحقق من توفر المخزون والتحويل التلقائي بين الوحدات
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* معلومات الفاتورة */}
          <div className="mb-6">
            <div className="grid grid-cols-8 gap-3 items-end">
              {/* العميل مع زر عميل جديد */}
              <div className="col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">العميل *</label>
                <div className="flex gap-1">
                  <div className="relative flex-1">
                    <input
                      ref={customerInputRef}
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerSuggestions(true);
                      }}
                      onFocus={() => setShowCustomerSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      placeholder="ابحث بالاسم أو رقم الهاتف..."
                    />
                    {showCustomerSuggestions && filteredCustomers.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {filteredCustomers.map(customer => (
                          <div
                            key={customer.id}
                            onClick={() => {
                              setFormData({...formData, customerId: customer.id});
                              setCustomerSearch(customer.name);
                              setShowCustomerSuggestions(false);
                            }}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-medium">{customer.name}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  {customer.phone || customer.phone1}
                                </span>
                                <span className="text-sm text-gray-500">
                                  رصيد: {customer.balance || 0} ج.م
                                </span>
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openQuickCustomerModal}
                    className="px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                    title="إضافة عميل جديد سريع"
                  >
                    <FaUserPlus className="text-xs" />
                    جديد
                  </button>
                </div>
              </div>
              {validationErrors.customerId && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.customerId}</p>
              )}
            </div>

            {/* نوع الفاتورة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الفاتورة *</label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="main">اختر نوع الفاتورة</option>
                <option value="cash">نقدي</option>
                <option value="deferred">آجل</option>
                <option value="partial">جزئي</option>
              </select>
            </div>

            {/* الشاحنة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الشاحنة</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              >
                <option value="">اختر الشاحنة</option>
                <option value="vehicle1">شاحنة كبيرة - أ 1234 ب</option>
                <option value="vehicle2">فان - ج 5678 د</option>
                <option value="vehicle3">شاحنة صغيرة - ه 9012 و</option>
              </select>
            </div>

            {/* نوع البيع */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع البيع</label>
              <select
                name="saleType"
                value={formData.saleType}
                onChange={(e) => {
                  const newSaleType = e.target.value;
                  setFormData({...formData, saleType: newSaleType});
                  // تحديث أسعار جميع المنتجات المختارة
                  updateAllPricesForSaleType(newSaleType);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              >
                <option value="retail">البيع المباشر</option>
                <option value="wholesale">الجملة</option>
                <option value="bulk">جملة الجملة</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                سيتم تحديث أسعار جميع المنتجات المختارة تلقائياً
              </p>
            </div>

            {/* الوكيل/المندوب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوكيل/المندوب</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              >
                <option value="">اختر الوكيل</option>
                <option value="general">عام</option>
                <option value="fatora">فاتورة</option>
                <option value="kartona">كرتونة</option>
              </select>
            </div>

            {/* التاريخ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* الوقت */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوقت *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            </div>

          {/* عرض رصيد العميل */}
          {getSelectedCustomerBalance() !== null && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                <span className="text-sm font-medium text-blue-800">
                  رصيد العميل: {getSelectedCustomerBalance().toFixed(2)} ج.م
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
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded flex items-center gap-2"
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
                    <th className="p-2 text-right text-sm font-medium text-gray-700">المتاح</th>
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
                    const warning = stockWarnings[index];
                    
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
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
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
                                      {p.mainQuantity || 0} كرتونة متاحة
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* المخزون المتاح */}
                        <td className="p-2">
                          {product ? (
                            <div className="text-sm">
                              <div className="font-medium">{stockDetail?.display || 'غير محدد'}</div>
                              <div className="text-xs text-green-600">
                                {stockDetail?.totalDisplay || '0 قطعة'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>

                        {/* الكمية الأساسية */}
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.mainQuantity}
                            onChange={(e) => updateItem(index, 'mainQuantity', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
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
                              className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 ${
                                warning ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                              }`}
                              min="0"
                              placeholder="0"
                            />
                            {product && product.unitsInMain > 0 && (
                              <div className="text-xs text-blue-600">
                                = {((item.mainQuantity || 0) * (product.unitsInMain || 0) + (item.subQuantity || 0))} قطعة
                              </div>
                            )}
                            {warning && (
                              <div className="text-xs text-red-600 flex items-center gap-1">
                                <FaExclamationTriangle />
                                {warning}
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
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
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
            
            <div className="flex justify-between items-center text-lg font-bold text-orange-600 pt-2 border-t">
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              rows="3"
              placeholder="ملاحظات إضافية..."
            />
          </div>

          {/* أزرار الحفظ */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 border-t">
            {/* زر السجل */}
            <button
              type="button"
              onClick={handleOpenSalesRecord}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
              title="فتح سجل فواتير المبيعات في تبويبة جديدة"
            >
              <FaList /> سجل المبيعات
            </button>
            
            {/* زر الحفظ الرئيسي */}
            <button
              type="submit"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
              disabled={Object.keys(validationErrors).length > 0}
            >
              <FaSave /> حفظ الفاتورة
            </button>
          </div>
        </form>
      </div>

      {/* Modal إضافة العميل السريع */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            {/* رأس المودال المبسط */}
            <div className="flex items-center justify-between p-4 border-b bg-green-50">
              <div className="flex items-center gap-2">
                <FaUserPlus className="text-green-600 text-sm" />
                <h2 className="text-lg font-semibold text-gray-800">عميل جديد</h2>
              </div>
              <button
                onClick={closeQuickCustomerModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* محتوى المودال المبسط */}
            <div className="p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleAddQuickCustomer(); }} className="space-y-3">
                {/* اسم العميل */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    اسم العميل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={quickCustomerForm.name}
                    onChange={handleQuickCustomerChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="الاسم"
                    required
                    autoFocus
                  />
                </div>

                {/* رقم الهاتف الأول */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    رقم الهاتف الأول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone1"
                    value={quickCustomerForm.phone1}
                    onChange={handleQuickCustomerChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="مثال: 01012345678 (11 رقم)"
                    required
                  />
                </div>

                {/* رقم الهاتف الثاني */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    رقم الهاتف الثاني
                  </label>
                  <input
                    type="tel"
                    name="phone2"
                    value={quickCustomerForm.phone2}
                    onChange={handleQuickCustomerChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="مثال: 01112345678 (11 رقم)"
                  />
                </div>

                {/* العنوان */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={quickCustomerForm.address}
                    onChange={handleQuickCustomerChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="العنوان (اختياري)"
                  />
                </div>

                {/* نوع الوكيل */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    نوع الوكيل
                  </label>
                  <select
                    name="agentType"
                    value={quickCustomerForm.agentType}
                    onChange={handleQuickCustomerChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="general">عام</option>
                    <option value="fatora">فاتورة</option>
                    <option value="kartona">كرتونة</option>
                  </select>
                </div>

                {/* أزرار المودال المبسطة */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeQuickCustomerModal}
                    className="flex-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    disabled={quickCustomerLoading}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    disabled={quickCustomerLoading || !quickCustomerForm.name.trim() || !quickCustomerForm.phone1.trim()}
                  >
                    {quickCustomerLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="text-xs" />
                        إضافة
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSalesInvoice;
