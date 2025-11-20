// ======================================
// New Sales Invoice - فاتورة مبيعات جديدة (مُحدَّث ليشمل الخصم)
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useTab } from '../../contexts/TabContext';
import { PhoneInput } from '../../components/Common/Input';
import { FaSave, FaPrint, FaSearch, FaTrash, FaPercent, FaMoneyBillWave, FaInfoCircle, FaExclamationTriangle, FaUserPlus, FaTimes, FaList } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

// دالة للتحقق من أرقام الهواتف المصرية
const validatePhoneNumber = (phone) => {
  if (!phone) return { isValid: true, error: null };
  
  // إزالة المسافات والشرطات
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // التحقق من أن الرقم يبدأ بـ +20 ويتبعه 10 أرقام
  const egyptianPhoneRegex = /^\+20(10|11|12|15)[0-9]{8}$/;
  
  if (!egyptianPhoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'رقم الهاتف يجب أن يبدأ بـ +20 ويتبعه 10 أرقام (مثال: +201012345678)',
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

const NewSalesInvoice = () => {
  const { customers, products, warehouses, shippingVehicles, addSalesInvoice, getCustomerBalance, addCustomer, updateProduct } = useData();
  const { showSuccess, showError } = useNotification();
  const { openTab } = useTab();

  // دالة لفتح سجل المبيعات في تبويبة جديدة
  const handleOpenSalesRecord = () => {
    openTab('/sales/invoices', 'سجل فواتير المبيعات', '📋');
  };

  // قائمة الشاحنات المتاحة من نظام الشحن المتكامل
  const availableVehicles = [
    { id: '', name: 'اختر الشاحنة', driver: '', status: 'غير متاح' },
    ...shippingVehicles.map(vehicle => ({
      id: vehicle.id,
      name: `${vehicle.vehicleType} - ${vehicle.vehicleNumber}`,
      driver: vehicle.driver,
      status: vehicle.status
    }))
  ];


  
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    paymentType: 'main',
    agentType: 'main',
    notes: '',
    discountPercentage: 0, // نسبة الخصم المئوية
    discountFixed: 0, // مبلغ الخصم الثابت
    // بيانات الشحن
    selectedVehicle: '',
    // نوع البيع للشرائح السعرية
    saleType: 'retail' // retail, wholesale, bulk
  });

  const [items, setItems] = useState([{
    productId: '',
    productName: '',
    quantity: 0,
    subQuantity: 0,
    price: 0,
    subPrice: 0,
    discount: 0
  }]);

  // البحث في العملاء والمنتجات
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [productSearches, setProductSearches] = useState(['']);
  const [showProductSuggestions, setShowProductSuggestions] = useState([false]);
  
  // حالات الخطأ
  const [customerError, setCustomerError] = useState(false);
  const [productErrors, setProductErrors] = useState([false]);
  const [quantityErrors, setQuantityErrors] = useState([false]);
  const [priceErrors, setPriceErrors] = useState([false]);
  const [discountErrors, setDiscountErrors] = useState([false]);
  const [validationErrors, setValidationErrors] = useState({});

  // رسالة التأكيد عند تغيير السعر في المبيعات
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
  const [priceChangeData, setPriceChangeData] = useState({
    index: null,
    field: '',
    newPrice: 0,
    originalPrice: 0,
    productName: '',
    productId: null,
    saleType: '',
    tierName: ''
  });

  // مراجع للتركيز التلقائي
  const customerInputRef = useRef(null);
  const productInputRefs = useRef([]);
  const quantityInputRefs = useRef([]);

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

  // الحصول على رصيد العميل المحدد
  const getSelectedCustomerBalance = () => {
    if (!formData.customerId) return null;
    return getCustomerBalance(parseInt(formData.customerId));
  };

  // حساب الإجمالي قبل خصم العنصر
  const calculateItemTotalWithoutDiscount = (item) => {
    const mainTotal = (item.quantity || 0) * (item.price || 0);
    const subTotal = (item.subQuantity || 0) * (item.subPrice || 0);
    return mainTotal + subTotal;
  };

  // حساب إجمالي العنصر بعد الخصم
  const calculateItemTotal = (item) => {
    const totalWithoutDiscount = calculateItemTotalWithoutDiscount(item);
    const itemDiscount = item.discount || 0;
    return Math.max(0, totalWithoutDiscount - itemDiscount);
  };

  // حساب الفرق وتطبيقه على الشريحة السعرية المحددة
  const calculateAndApplyPriceDifference = (product, field, newPrice, saleType) => {
    const tierPrice = product.tierPrices?.[saleType];
    if (!tierPrice) return product;

    // تحويل اسم الحقل إلى الاسم الصحيح في tierPrices
    const actualField = field === 'price' ? 'basicPrice' : 'subPrice';
    const originalPrice = parseFloat(tierPrice[actualField]) || 0;
    const priceDifference = newPrice - originalPrice;

    if (priceDifference === 0) return product; // لا يوجد فرق

    // إنشاء نسخة جديدة من المنتج
    const updatedProduct = { ...product };

    // تحديث الشريحة السعرية المحددة فقط
    updatedProduct.tierPrices = {
      ...product.tierPrices,
      [saleType]: {
        ...tierPrice,
        [actualField]: newPrice
      }
    };

    // تحديث السعر الأساسي للتوافق مع النظام القديم
    updatedProduct.mainPrice = updatedProduct.tierPrices.wholesale?.basicPrice || 0;
    updatedProduct.subPrice = updatedProduct.tierPrices.wholesale?.subPrice || 0;

    return updatedProduct;
  };

  // تأكيد تغيير السعر في المبيعات
  const confirmPriceChange = () => {
    const { index, field, newPrice, productId, saleType, tierName } = priceChangeData;
    
    // جلب المنتج من قاعدة البيانات للحصول على أحدث البيانات
    const currentProduct = products.find(p => p.id === parseInt(productId));
    if (!currentProduct) {
      showError('لم يتم العثور على المنتج');
      setShowPriceChangeModal(false);
      return;
    }

    // حساب الفرق وتطبيقه على الشريحة المحددة
    const updatedProduct = calculateAndApplyPriceDifference(currentProduct, field, newPrice, saleType);

    // تحديث المنتج في قاعدة البيانات
    try {
      if (productId && updateProduct) {
        updateProduct(parseInt(productId), updatedProduct);
        const priceType = field === 'price' ? 'السعر الأساسي' : 'السعر الفرعي';
        showSuccess(`تم تحديث ${tierName} - ${priceType} بنجاح!`);
      }
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      showError('حدث خطأ في تحديث المنتج');
    }

    // تحديث العنصر في الفاتورة
    const newItems = [...items];
    newItems[index][field] = newPrice;
    setItems(newItems);

    // تحديث أخطاء السعر
    const newPriceErrors = [...priceErrors];
    newPriceErrors[index] = newPrice < 0;
    setPriceErrors(newPriceErrors);

    setShowPriceChangeModal(false);
  };

  // إلغاء تغيير السعر
  const cancelPriceChange = () => {
    setShowPriceChangeModal(false);
    // إعادة تعيين الحقل للقيمة الأصلية
    const { index, field, originalPrice } = priceChangeData;
    const newItems = [...items];
    newItems[index][field] = originalPrice;
    setItems(newItems);
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  // حساب قيمة الخصم (النسبة المئوية + المبلغ الثابت)
  const calculateDiscountAmount = () => {
    const subTotal = calculateSubTotal();
    const percentageDiscount = (subTotal * (parseFloat(formData.discountPercentage) || 0) / 100);
    const fixedDiscount = parseFloat(formData.discountFixed) || 0;
    return percentageDiscount + fixedDiscount;
  };

  // حساب الإجمالي بعد الخصم
  const calculateTotal = () => {
    const subTotal = calculateSubTotal();
    const discountAmount = calculateDiscountAmount();
    return Math.max(0, subTotal - discountAmount);
  };

  // الحصول على تحذيرات نوع الدفع
  const getPaymentTypeWarning = () => {
    // تم إخفاء التحذيرات المالية لحماية المعلومات
    return null;
  };

  const paymentWarning = getPaymentTypeWarning();

  // التركيز التلقائي عند التحميل
  useEffect(() => {
    customerInputRef.current?.focus();
  }, []);

  // معالجة اختصارات الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S للحفظ
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(e);
      }
      // Enter لإضافة صف جديد (عند التركيز في حقل الكمية الأخير)
      if (e.key === 'Enter' && e.target.name?.startsWith('quantity-')) {
        const index = parseInt(e.target.name.split('-')[1]);
        if (index === items.length - 1) {
          e.preventDefault();
          addItem();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // البحث في العملاء
  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
    // إظهار القائمة فقط عند وجود نص
    setShowCustomerSuggestions(value.trim().length > 0);
  };

  const selectCustomer = (customer) => {
    setFormData({ 
      ...formData, 
      customerId: customer.id,
      agentType: customer.agentType || '' // تحديد الوكيل تلقائياً من بيانات العميل
    });
    setCustomerSearch(customer.name);
    setShowCustomerSuggestions(false);
  };
  
  // إخفاء قائمة العملاء عند الخروج من الحقل
  const handleCustomerBlur = () => {
    setTimeout(() => {
      setShowCustomerSuggestions(false);
    }, 200);
  };

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
        customerId: newCustomer.id,
        agentType: newCustomer.agentType || ''
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

  const filteredCustomers = customers.filter(c => {
    const searchTerm = customerSearch.toLowerCase().trim();
    const customerName = c.name ? c.name.toLowerCase() : '';
    const customerPhone = c.phone ? c.phone.toLowerCase() : '';
    const customerPhone1 = c.phone1 ? c.phone1.toLowerCase() : '';
    
    return customerName.includes(searchTerm) || 
           customerPhone.includes(searchTerm) || 
           customerPhone1.includes(searchTerm);
  });

  // دالة الحصول على اسم الشريحة
  const getTierName = (saleType) => {
    switch(saleType) {
      case 'retail': return 'التجزئة';
      case 'wholesale': return 'الجملة';
      case 'bulk': return 'جملة الجملة';
      default: return 'غير محدد';
    }
  };

  // دالة تحديد السعر حسب نوع البيع
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

  // تحديث أسعار جميع المنتجات عند تغيير نوع البيع
  const updateAllPricesForSaleType = (newSaleType) => {
    const updatedItems = items.map(item => {
      if (!item.productId) return item;
      
      const product = products.find(p => p.id === parseInt(item.productId));
      if (!product) return item;
      
      const priceData = getPriceForSaleType(product, newSaleType);
      return {
        ...item,
        price: priceData.price,
        subPrice: priceData.subPrice,
        saleType: newSaleType
      };
    });
    
    setItems(updatedItems);
  };

  // البحث في المنتجات
  const handleProductSearch = (index, value) => {
    const newSearches = [...productSearches];
    newSearches[index] = value;
    setProductSearches(newSearches);

    // إظهار القائمة فقط عند وجود نص
    const newShowSuggestions = [...showProductSuggestions];
    newShowSuggestions[index] = value.trim().length > 0;
    setShowProductSuggestions(newShowSuggestions);
  };

  const selectProduct = (index, product) => {
    const newItems = [...items];
    
    // تحديد السعر حسب نوع البيع المحدد
    const priceData = getPriceForSaleType(product, formData.saleType);
    
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      price: priceData.price,
      subPrice: priceData.subPrice,
      saleType: formData.saleType, // حفظ نوع البيع المختار
      discount: 0
    };
    setItems(newItems);

    const newSearches = [...productSearches];
    newSearches[index] = product.name;
    setProductSearches(newSearches);

    const newShowSuggestions = [...showProductSuggestions];
    newShowSuggestions[index] = false;
    setShowProductSuggestions(newShowSuggestions);

    // التركيز على حقل الكمية
    setTimeout(() => {
      quantityInputRefs.current[index]?.focus();
    }, 100);
  };

  // تحديث نوع البيع للمنتج المحدد
  const updateSaleType = (index) => {
    // قائمة منسدلة للاختيار (يمكن تحسينها لاحقاً)
    const saleTypes = [
      { value: 'retail', label: '🛒 البيع المباشر', color: 'orange' },
      { value: 'wholesale', label: '📦 الجملة', color: 'blue' },
      { value: 'bulk', label: '🚛 جملة الجملة', color: 'purple' }
    ];

    // إنشاء modal بسيط للاختيار
    const selectedType = window.prompt(
      'اختر نوع البيع:\n' + 
      saleTypes.map(t => `${t.value === 'retail' ? '1' : t.value === 'wholesale' ? '2' : '3'} - ${t.label}`).join('\n') + '\n\n(أدخل 1، 2، أو 3)'
    );

    let newSaleType = null;
    if (selectedType === '1') newSaleType = 'retail';
    else if (selectedType === '2') newSaleType = 'wholesale';
    else if (selectedType === '3') newSaleType = 'bulk';

    if (newSaleType && items[index].productId) {
      // العثور على المنتج وتحديث الأسعار
      const product = products.find(p => p.id === items[index].productId);
      if (product && product.tierPrices?.[newSaleType]) {
        const tierPrice = product.tierPrices[newSaleType];
        const newItems = [...items];
        newItems[index] = {
          ...newItems[index],
          saleType: newSaleType,
          price: parseFloat(tierPrice.basicPrice) || 0,
          subPrice: parseFloat(tierPrice.subPrice) || 0
        };
        setItems(newItems);
        showSuccess(`تم تحديث نوع البيع إلى ${saleTypes.find(t => t.value === newSaleType)?.label}`);
      }
    }
  };
  
  // إخفاء قائمة المنتجات عند الخروج من الحقل
  const handleProductBlur = (index) => {
    setTimeout(() => {
      const newShowSuggestions = [...showProductSuggestions];
      newShowSuggestions[index] = false;
      setShowProductSuggestions(newShowSuggestions);
    }, 200);
  };

  const getFilteredProducts = (index) => {
    const searchTerm = productSearches[index] || '';
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    
    // التحقق الفوري من الكميات والأسعار والخصم
    if (field === 'quantity' || field === 'subQuantity') {
      const newQuantityErrors = [...quantityErrors];
      if (field === 'quantity') {
        newQuantityErrors[index] = value < 0;
      }
      setQuantityErrors(newQuantityErrors);
    }
    
    if (field === 'price' || field === 'subPrice') {
      const newPriceErrors = [...priceErrors];
      if (field === 'price') {
        newPriceErrors[index] = value < 0;
      }
      setPriceErrors(newPriceErrors);
    }

    if (field === 'discount') {
      const newDiscountErrors = [...discountErrors];
      newDiscountErrors[index] = value < 0;
      setDiscountErrors(newDiscountErrors);
    }
  };

  // التحقق من السعر عند مغادرة الحقل (onBlur)
  const handlePriceBlur = (index, field, currentValue) => {
    const currentItem = items[index];
    const newValue = parseFloat(currentValue) || 0;
    
    // التحقق من تغيير السعر مع تحديد منتج
    if ((field === 'price' || field === 'subPrice') && currentItem.productId) {
      // تحقق من أن السعر تم تغييره من السعر الأصلي
      const product = products.find(p => p.id === parseInt(currentItem.productId));
      if (product && product.tierPrices && product.tierPrices[currentItem.saleType]) {
        const tierPrice = product.tierPrices[currentItem.saleType];
        // تحويل اسم الحقل إلى الاسم الصحيح في tierPrices
        const actualField = field === 'price' ? 'basicPrice' : 'subPrice';
        const originalAutoPrice = parseFloat(tierPrice[actualField]) || 0;
        
        if (originalAutoPrice !== 0 && newValue !== originalAutoPrice) {
          // تم تغيير السعر، أظهر رسالة التأكيد
          setPriceChangeData({
            index,
            field,
            newPrice: newValue,
            originalPrice: originalAutoPrice,
            productName: currentItem.productName || 'المنتج المحدد',
            productId: currentItem.productId || null,
            saleType: currentItem.saleType || 'retail',
            tierName: getTierName(currentItem.saleType)
          });
          setShowPriceChangeModal(true);
        }
      }
    }
  };

  const addItem = () => {
    setItems([...items, { 
      productId: '', 
      productName: '',
      quantity: 0, 
      subQuantity: 0,
      price: 0,
      subPrice: 0,
      saleType: formData.saleType,
      discount: 0
    }]);
    setProductSearches([...productSearches, '']);
    setShowProductSuggestions([...showProductSuggestions, false]);
    setProductErrors([...productErrors, false]);
    setQuantityErrors([...quantityErrors, false]);
    setPriceErrors([...priceErrors, false]);
    setDiscountErrors([...discountErrors, false]);

    // التركيز على حقل المنتج الجديد
    setTimeout(() => {
      const lastIndex = items.length;
      productInputRefs.current[lastIndex]?.focus();
    }, 100);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      setProductSearches(productSearches.filter((_, i) => i !== index));
      setShowProductSuggestions(showProductSuggestions.filter((_, i) => i !== index));
      setProductErrors(productErrors.filter((_, i) => i !== index));
      setQuantityErrors(quantityErrors.filter((_, i) => i !== index));
      setPriceErrors(priceErrors.filter((_, i) => i !== index));
      setDiscountErrors(discountErrors.filter((_, i) => i !== index));
    }
  };

  // الحصول على المخزون المتاح للمنتج
  const getAvailableQuantity = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { mainQuantity: 0, subQuantity: 0, total: 0 };
    
    return {
      mainQuantity: product.mainQuantity || 0,
      subQuantity: product.subQuantity || 0,
      total: (product.mainQuantity || 0) + (product.subQuantity || 0)
    };
  };

  // تحديث عنصر محدد في قائمة العناصر
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // فحص ذكي شامل للكمية المطلوبة
  const validateQuantityRequest = (product, requestedMainQty, requestedSubQty) => {
    if (!product) return { isValid: false, errors: [], suggestions: [] };
    
    const errors = [];
    const suggestions = [];
    const unitsInMain = product.unitsInMain || 0;
    const availableMainQty = product.mainQuantity || 0;
    const availableSubQty = product.subQuantity || 0;
    
    console.log(`🔍 فحص الكمية - منتج: ${product.name}`);
    console.log(`   المطلوب: ${requestedMainQty} أساسي + ${requestedSubQty} فرعي`);
    console.log(`   المتوفر: ${availableMainQty} أساسي + ${availableSubQty} فرعي`);
    console.log(`   الوحدات في الأساسية: ${unitsInMain}`);
    
    // القاعدة 1: منع طلب فرعية أكثر من العدد المسموح (أساسية × unitsInMain) + فرعية مباشرة
    const maxAllowedSubUnits = availableMainQty * unitsInMain + availableSubQty;
    console.log(`   الحد الأقصى للفرعية: ${maxAllowedSubUnits} (${availableMainQty}×${unitsInMain} + ${availableSubQty})`);
    
    if (requestedSubQty > maxAllowedSubUnits) {
      errors.push(`لا يمكن طلب ${requestedSubQty} قطعة فرعية. الحد الأقصى: ${maxAllowedSubUnits} قطعة`);
    }
    
    // القاعدة 2: اقتراح خصم 1 أساسية إذا طلبت فرعية تساوي العدد المسموح من الأساسية فقط
    const maxSubFromMainOnly = availableMainQty * unitsInMain;
    if (requestedSubQty === maxSubFromMainOnly && requestedSubQty > 0 && availableMainQty > 0) {
      suggestions.push({
        type: 'convert_main_unit',
        message: `💡 اقتراح ذكي: بدلاً من طلب ${requestedSubQty} قطعة فرعية، سيتم خصم 1 وحدة أساسية (${unitsInMain} قطعة)`,
        action: 'convertToMain'
      });
    }
    
    // القاعدة 3: فحص التحويل الذكي عند الطلب الأساسي + فرعي
    if (requestedMainQty > 0 && requestedSubQty > 0) {
      // تحويل المطلوب والمتوفر إلى فرعية لفحص الذكي
      const totalSubRequired = (requestedMainQty * unitsInMain) + requestedSubQty;
      const totalAvailableSubUnits = (availableMainQty * unitsInMain) + availableSubQty;
      
      console.log(`   إجمالي المطلوب: ${totalSubRequired} فرعية (${requestedMainQty}×${unitsInMain} + ${requestedSubQty})`);
      console.log(`   إجمالي متوفر: ${totalAvailableSubUnits} فرعية (${availableMainQty}×${unitsInMain} + ${availableSubQty})`);
      
      if (totalSubRequired > totalAvailableSubUnits) {
        errors.push(`الكمية المطلوبة غير متوفرة في المخزون`);
      } else {
        // اقتراح استخدام الفرعية المتوفرة أولاً
        if (availableSubQty > 0 && availableSubQty >= requestedSubQty) {
          suggestions.push({
            type: 'prefer_sub_quantity',
            message: `💡 لمعلومة: سيتم استخدام الفرعية المتوفرة (${availableSubQty} قطعة) أولاً قبل التحويل من الأساسية`,
            action: null
          });
        }
        
        // اقتراح التحويل الذكي إذا كان مطلوباً تحويل وحدات أساسية
        const mainUnitsEquivalent = Math.floor(requestedSubQty / unitsInMain);
        if (mainUnitsEquivalent > 0) {
          suggestions.push({
            type: 'convert_to_main',
            message: `💡 اقتراح: يمكن تحويل ${mainUnitsEquivalent} وحدة أساسية بدلاً من ${requestedSubQty} قطعة فرعية`,
            action: 'convertToMain'
          });
        }
      }
    }
    
    console.log(`   النتيجة: ${errors.length === 0 ? '✅ صحيح' : '❌ خطأ'} - الأخطاء: ${errors.length}, الاقتراحات: ${suggestions.length}`);
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  };

  // تطبيق اقتراح ذكي على عنصر محدد
  const applySmartSuggestion = (index, suggestionType) => {
    const item = items[index];
    if (!item.productId) return;
    
    const product = products.find(p => p.id === parseInt(item.productId));
    if (!product) return;
    
    const unitsInMain = product.unitsInMain || 0;
    const requestedSubQty = parseInt(item.subQuantity) || 0;
    const requestedMainQty = parseInt(item.quantity) || 0;
    
    if (suggestionType === 'convertToMain') {
      // تحويل إلى وحدة أساسية
      const newMainQty = requestedMainQty + 1;
      const newSubQty = 0;
      
      // تحديث العنصر
      const newItems = [...items];
      newItems[index].quantity = newMainQty;
      newItems[index].subQuantity = newSubQty;
      setItems(newItems);
      
      showSuccess(`تم تحويل الطلب إلى ${newMainQty} وحدة أساسية`);
    }
  };

  // عرض تحذير ونصائح ذكية للكمية المطلوبة
  const getQuantityWarning = (index) => {
    const item = items[index];
    if (!item.productId) return null;
    
    const product = products.find(p => p.id === parseInt(item.productId));
    if (!product) return null;
    
    const requestedMainQty = parseInt(item.quantity) || 0;
    const requestedSubQty = parseInt(item.subQuantity) || 0;
    
    const validation = validateQuantityRequest(product, requestedMainQty, requestedSubQty);
    
    if (!validation.isValid) {
      return (
        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          ❌ أخطاء التحقق:
          {validation.errors.map((error, i) => (
            <div key={i} className="mt-1">• {error}</div>
          ))}
        </div>
      );
    }
    
    if (validation.suggestions.length > 0) {
      return (
        <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs">
          💡 نصائح ذكية:
          {validation.suggestions.map((suggestion, i) => (
            <div key={i} className="mt-1">
              • {suggestion.message}
              {suggestion.action && (
                <button
                  onClick={() => applySmartSuggestion(index, suggestion.action)}
                  className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  تطبيق التحويل الذكي
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  // التحقق الشامل من البيانات
  const validateForm = () => {
    const errors = {};
    
    // التحقق من العميل
    if (!formData.customerId) {
      errors.customer = 'يجب اختيار العميل';
    }
    
    // التحقق من التاريخ
    if (!formData.date) {
      errors.date = 'يجب إدخال تاريخ الفاتورة';
    }
    
    // التحقق من الخصم
    if (formData.discountPercentage < 0 || formData.discountFixed < 0) {
      errors.discount = 'قيمة الخصم لا يمكن أن تكون سالبة';
    }
    
    if (formData.discountPercentage > 100) {
      errors.discount = 'نسبة الخصم لا يمكن أن تزيد عن 100%';
    }
    
    const discountAmount = calculateDiscountAmount();
    if (discountAmount > calculateSubTotal()) {
      errors.discount = 'قيمة الخصم الإجمالية لا يمكن أن تزيد عن المجموع الكلي';
    }
    
    // التحقق من المنتجات
    const newQuantityErrors = [];
    const newPriceErrors = [];
    const newDiscountErrors = [];
    
    items.forEach((item, index) => {
      // التحقق من اختيار المنتج
      if (!item.productId) {
        errors[`product_${index}`] = 'يجب اختيار المنتج';
      }
      
      // التحقق من الكمية
      if (item.quantity < 0) {
        errors[`quantity_${index}`] = 'الكمية الأساسية لا يمكن أن تكون سالبة';
        newQuantityErrors[index] = true;
      } else if (item.quantity === 0 && item.subQuantity === 0) {
        errors[`quantity_${index}`] = 'يجب إدخال كمية أساسية أو فرعية';
        newQuantityErrors[index] = true;
      } else {
        // فحص ذكي إضافي للمنتجات المختارة
        if (item.productId) {
          const product = products.find(p => p.id === parseInt(item.productId));
          if (product) {
            const requestedMainQty = parseInt(item.quantity) || 0;
            const requestedSubQty = parseInt(item.subQuantity) || 0;
            
            const validation = validateQuantityRequest(product, requestedMainQty, requestedSubQty);
            
            if (!validation.isValid) {
              errors[`quantity_${index}`] = validation.errors.join(', ');
              newQuantityErrors[index] = true;
            } else {
              newQuantityErrors[index] = false;
            }
          } else {
            newQuantityErrors[index] = false;
          }
        } else {
          newQuantityErrors[index] = false;
        }
      }
      
      // التحقق من السعر
      if (item.price < 0) {
        errors[`price_${index}`] = 'السعر الأساسي لا يمكن أن يكون سالباً';
        newPriceErrors[index] = true;
      } else if (item.price === 0 && item.quantity > 0) {
        errors[`price_${index}`] = 'يجب إدخال سعر أساسي للمنتج';
        newPriceErrors[index] = true;
      } else {
        newPriceErrors[index] = false;
      }
      
      // التحقق من السعر الفرعي
      if (item.subPrice < 0) {
        errors[`subPrice_${index}`] = 'السعر الفرعي لا يمكن أن يكون سالباً';
      } else if (item.subPrice === 0 && item.subQuantity > 0) {
        errors[`subPrice_${index}`] = 'يجب إدخال سعر فرعي عند وجود كمية فرعية';
      }

      // التحقق من خصم العنصر
      if (item.discount < 0) {
        errors[`discount_${index}`] = 'خصم العنصر لا يمكن أن يكون سالباً';
        newDiscountErrors[index] = true;
      } else if (item.discount > calculateItemTotalWithoutDiscount(item)) {
        errors[`discount_${index}`] = 'خصم العنصر لا يمكن أن يزيد عن إجماليه';
        newDiscountErrors[index] = true;
      } else {
        newDiscountErrors[index] = false;
      }

      // التحقق من توفر المخزون مع المنطق الذكي للتحويل
      const product = products.find(p => p.id === parseInt(item.productId));
      if (product) {
        const requestedMainQty = parseInt(item.quantity) || 0;
        const requestedSubQty = parseInt(item.subQuantity) || 0;
        
        const availableMainQty = product.mainQuantity || 0;
        const availableSubQty = product.subQuantity || 0;
        const unitsInMain = product.unitsInMain || 0; // عدد القطع في الوحدة الأساسية
        
        // استخدام المنطق الذكي للتحقق من توفر الكمية
        const totalRequestedSubUnits = (requestedMainQty * unitsInMain) + requestedSubQty;
        const totalAvailableSubUnits = (availableMainQty * unitsInMain) + availableSubQty;
        
        if (totalRequestedSubUnits > totalAvailableSubUnits) {
          // تحويل إجمالي المطلوب إلى وحدة أساسية + فرعية للرسالة
          const mainUnitsNeeded = Math.floor(totalRequestedSubUnits / unitsInMain);
          const subUnitsNeeded = totalRequestedSubUnits % unitsInMain;
          const mainUnitsAvailable = Math.floor(totalAvailableSubUnits / unitsInMain);
          const subUnitsAvailable = totalAvailableSubUnits % unitsInMain;
          
          errors[`stock_${index}`] = `الكمية المطلوبة إجمالاً: ${mainUnitsNeeded} وحدة أساسية + ${subUnitsNeeded} قطعة فرعية`;
          newQuantityErrors[index] = true;
        } else {
          newQuantityErrors[index] = false;
        }
      }
    });
    
    setQuantityErrors(newQuantityErrors);
    setPriceErrors(newPriceErrors);
    setDiscountErrors(newDiscountErrors);
    setValidationErrors(errors);
    
    // التحقق من المجموع الكلي
    const total = calculateTotal();
    if (total <= 0) {
      errors.total = 'المجموع الكلي يجب أن يكون أكبر من صفر';
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e, shouldPrint = false) => {
    if (e) e.preventDefault();

    // التحقق الشامل من البيانات
    if (!validateForm()) {
      showError('يرجى تصحيح الأخطاء قبل حفظ الفاتورة');
      
      // عرض أول خطأ
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        setTimeout(() => showError(firstError), 500);
      }
      return;
    }

    try {
      console.log('🚀 بدء حفظ الفاتورة...');
      console.log('📋 عناصر الفاتورة:', items);
      
      // تحويل البيانات للصيغة المتوافقة مع النظام مع الحفاظ على البيانات الفرعية
      const convertedItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity || 0,
        subQuantity: item.subQuantity || 0,
        mainPrice: item.price || 0,
        subPrice: item.subPrice || 0,
        discount: item.discount || 0,
        saleType: item.saleType || 'retail', // نوع البيع
        total: calculateItemTotal(item)
      }));
      
      console.log('📦 البيانات المحولة:', convertedItems);

      const discountAmount = calculateDiscountAmount();
      
      const invoiceData = {
        ...formData,
        date: `${formData.date}T${formData.time}:00`,
        items: convertedItems,
        subtotal: calculateSubTotal(),
        discountAmount: discountAmount,
        total: calculateTotal(),
        status: 'completed'
      };
      
      console.log('💾 بيانات الفاتورة النهائية:', invoiceData);
      console.log('📊 إحصائيات الفاتورة:', {
        عدد_العناصر: invoiceData.items.length,
        المجموع_الفرعي: invoiceData.subtotal,
        الخصم: invoiceData.discountAmount,
        الإجمالي: invoiceData.total
      });

      console.log('🔄 استدعاء addSalesInvoice...');
      const newInvoice = addSalesInvoice(invoiceData);
      console.log('✅ تم إنشاء الفاتورة بنجاح:', newInvoice.id);
      showSuccess(`تم حفظ فاتورة المبيعات بنجاح! الإجمالي: ${calculateTotal().toFixed(2)} ج.م`);

      if (shouldPrint) {
        // الطباعة المباشرة
        const customer = customers.find(c => c.id === parseInt(formData.customerId));
        printInvoiceDirectly({
          formData: newInvoice,
          items: newInvoice.items,
          subtotal: newInvoice.subtotal,
          discountAmount: newInvoice.discountAmount,
          total: newInvoice.total,
          customer,
          customers,
          products,
          warehouses
        }, 'sales');
      }
      resetForm();
    } catch (error) {
      console.error('💥 خطأ في حفظ الفاتورة:', error);
      console.error('📍 تفاصيل الخطأ:', {
        الرسالة: error.message,
        السبب: error.cause,
        المكدس: error.stack
      });
      // عرض رسالة الخطأ الفعلية للمستخدم
      showError(error.message || 'حدث خطأ في حفظ الفاتورة');
    }
  };
  
  const resetForm = () => {
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentType: 'main',
      agentType: '',
      notes: '',
      discountPercentage: 0,
      discountFixed: 0,
      selectedVehicle: '',
      saleType: 'retail'
    });
    setItems([{ 
      productId: '', 
      productName: '',
      quantity: 0, 
      subQuantity: 0,
      mainPrice: 0,
      subPrice: 0,
      discount: 0
    }]);
    setCustomerSearch('');
    setProductSearches(['']);
    setShowCustomerSuggestions(false);
    setShowProductSuggestions([false]);
    setCustomerError(false);
    setProductErrors([false]);
    setQuantityErrors([false]);
    setPriceErrors([false]);
    setDiscountErrors([false]);
    setValidationErrors({});
    customerInputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* البطاقة الرئيسية */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* الصف العلوي: معلومات الفاتورة */}
        <div className="mb-4 pb-4 border-b">
          <div className="grid grid-cols-8 gap-3 items-end">
            {/* العميل مع زر عميل جديد */}
            <div className="col-span-2 relative">
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <input
                    ref={customerInputRef}
                    type="text"
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onBlur={handleCustomerBlur}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                  />
                  <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-xs" />
                </div>
                <button
                  type="button"
                  onClick={openQuickCustomerModal}
                  className="px-2 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="إضافة عميل جديد سريع"
                >
                  <FaUserPlus className="text-xs" />
                </button>
              </div>
              {showCustomerSuggestions && customerSearch.trim().length > 0 && filteredCustomers.length > 0 && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="px-4 py-2.5 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-gray-800">{customer.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {customer.phone || customer.phone1}
                          </span>
                          {customer.balance && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              رصيد: {customer.balance.toFixed(2)} ج.م
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* نوع الفاتورة */}
            <div>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="main">اختر نوع الفاتورة</option>
                <option value="cash">نقدي</option>
                <option value="deferred">آجل</option>
                <option value="partial">جزئي</option>
              </select>
            </div>

            {/* نوع البيع */}
            <div>
              <select
                name="saleType"
                value={formData.saleType}
                onChange={(e) => {
                  const newSaleType = e.target.value;
                  setFormData({...formData, saleType: newSaleType});
                  // تحديث أسعار جميع المنتجات المختارة
                  updateAllPricesForSaleType(newSaleType);
                }}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="retail">البيع المباشر</option>
                <option value="wholesale">الجملة</option>
                <option value="bulk">جملة الجملة</option>
              </select>
            </div>

            {/* الشاحنة */}
            <div>
              <select
                name="selectedVehicle"
                value={formData.selectedVehicle}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="">اختر الشاحنة</option>
                {availableVehicles.filter(v => v.id).map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </div>

            {/* الوكيل/المندوب */}
            <div>
              <select
                name="agentType"
                value={formData.agentType}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الوكيل</option>
                <option value="general">عام</option>
                <option value="fatora">فاتورة</option>
                <option value="kartona">كرتونة</option>
              </select>
            </div>

            {/* التاريخ */}
            <div>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* الوقت */}
            <div>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* تحذيرات نوع الدفع */}
          {paymentWarning && (
            <div className={`mt-3 p-3 rounded-lg ${
              paymentWarning.type === 'error' ? 'bg-red-100 border border-red-300 text-red-700' :
              paymentWarning.type === 'warning' ? 'bg-yellow-100 border border-yellow-300 text-yellow-700' :
              'bg-blue-100 border border-blue-300 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {paymentWarning.type === 'error' && <FaExclamationTriangle />}
                {paymentWarning.type === 'warning' && <FaExclamationTriangle />}
                {paymentWarning.type === 'info' && <FaInfoCircle />}
                <span className="text-sm font-medium">{paymentWarning.message}</span>
              </div>
            </div>
          )}
        </div>
            

        {/* جدول المنتجات */}
        <div className="mb-4 relative">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-2 py-2 text-right text-xs font-semibold text-gray-700">المنتج</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-20">كمية أساسية</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-20">كمية فرعية</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-24">سعر أساسي</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-24">سعر فرعي</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-24">الخصم</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-24">الإجمالي</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-16">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* المنتج */}
                    <td className="px-2 py-2 static">
                      <div className="relative z-[10]">
                        <input
                          ref={(el) => (productInputRefs.current[index] = el)}
                          type="text"
                          value={productSearches[index] || ''}
                          onChange={(e) => handleProductSearch(index, e.target.value)}
                          onBlur={() => handleProductBlur(index)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="ابحث عن المنتج..."
                        />
                        <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-xs" />
                      </div>
                      {showProductSuggestions[index] && productSearches[index]?.trim().length > 0 && getFilteredProducts(index).length > 0 && (
                        <div className="absolute z-[9999] left-0 w-full mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                          {getFilteredProducts(index).map((product) => {
                            const warehouse = warehouses.find(w => w.id === product.warehouseId);
                            return (
                              <div
                                key={product.id}
                                onClick={() => selectProduct(index, product)}
                                className="px-4 py-2.5 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <span className="font-semibold text-sm text-gray-800">{product.name}</span>
                                    <span className="text-xs text-gray-600 mr-2">({warehouse?.name || 'غير محدد'} - {product.category})</span>
                                  </div>
                                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                                    أساسي: {product.mainQuantity || 0}, فرعي: {product.subQuantity || 0}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* رسالة تحذير المخزون */}
                      {getQuantityWarning(index)}
                    </td>

                    {/* الكمية الأساسية */}
                    <td className="px-2 py-2">
                      <input
                        ref={(el) => (quantityInputRefs.current[index] = el)}
                        type="number"
                        name={`quantity-${index}`}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className={`w-full px-2 py-1.5 text-sm text-center border rounded-md focus:ring-2 focus:ring-blue-500 ${
                          quantityErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        min="0"
                      />
                    </td>

                    {/* الكمية الفرعية */}
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={item.subQuantity}
                        onChange={(e) => handleItemChange(index, 'subQuantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </td>

                    {/* السعر الأساسي */}
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        onBlur={(e) => handlePriceBlur(index, 'price', e.target.value)}
                        className={`w-full px-2 py-1.5 text-sm text-center border rounded-md focus:ring-2 focus:ring-blue-500 ${
                          priceErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        min="0"
                      />
                    </td>

                    {/* السعر الفرعي */}
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.subPrice}
                        onChange={(e) => handleItemChange(index, 'subPrice', parseFloat(e.target.value) || 0)}
                        onBlur={(e) => handlePriceBlur(index, 'subPrice', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </td>
                    {/* الخصم  */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      className={`w-full px-2 py-1.5 text-sm text-center border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        discountErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                  </td>

                    {/* الإجمالي */}
                    <td className="px-2 py-2 text-center">
                      <span className="font-semibold text-blue-600">
                        {calculateItemTotal(item).toFixed(2)}
                      </span>
                    </td>

                    {/* حذف */}
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* زر إضافة منتج */}
        <button
          type="button"
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
        >
          + إضافة منتج جديد (Enter)
        </button>

        {/* الجزء السفلي */}
        <div className="mt-3 pt-3 border-t">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* ملاحظات */}
            <div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="1"
                className="w-full h-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="ملاحظات..."
              />
            </div>

            {/* الخصم */}
            <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-1 mb-1">
                <FaPercent className="text-yellow-600 text-xs" />
                <span className="text-xs font-semibold text-gray-700">الخصم</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1 mb-1">
                <div className="flex items-center gap-1 bg-white rounded border border-gray-300 px-1 py-1">
                  <FaPercent className="text-gray-400 text-xs" />
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    className="w-full text-xs text-center border-0 focus:ring-0 p-0"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="%"
                  />
                </div>
                
                <div className="flex items-center gap-1 bg-white rounded border border-gray-300 px-1 py-1">
                  <FaMoneyBillWave className="text-gray-400 text-xs" />
                  <input
                    type="number"
                    name="discountFixed"
                    value={formData.discountFixed}
                    onChange={handleChange}
                    className="w-full text-xs text-center border-0 focus:ring-0 p-0"
                    min="0"
                    step="0.01"
                    placeholder="ثابت"
                  />
                </div>
              </div>
              
              {(formData.discountPercentage > 0 || formData.discountFixed > 0) && (
                <div className="text-xs text-gray-600 text-center bg-white px-1 py-1 rounded border border-yellow-200">
                  <span className="font-semibold text-red-600">{calculateDiscountAmount().toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* المجموع */}
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700">الفرعي:</span>
                  <span className="text-xs font-medium text-gray-600">{calculateSubTotal().toFixed(2)}</span>
                </div>
                
                {(formData.discountPercentage > 0 || formData.discountFixed > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-700">الخصم:</span>
                    <span className="text-xs font-medium text-red-600">-{calculateDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-1 border-t border-blue-200">
                  <span className="text-xs font-semibold text-gray-700">الإجمالي:</span>
                  <span className="text-sm font-bold text-blue-700">{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                {items.length} منتج
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleOpenSalesRecord}
                className="flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1.5 rounded transition-colors text-xs font-medium"
                title="سجل المبيعات"
              >
                <FaList /> السجل
              </button>
              
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white px-1 py-1.5 rounded transition-colors text-xs"
                  title="إعادة تعيين"
                >
                  <FaTrash />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-1 py-1.5 rounded transition-colors text-xs"
                  title="حفظ"
                >
                  <FaSave />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-1 py-1.5 rounded transition-colors text-xs"
                  title="طباعة"
                >
                  <FaPrint />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* اختصارات الكيبورد */}
        <div className="mt-2 pt-2 border-t text-xs text-gray-400 text-center">
          Ctrl+S: حفظ | Enter: صف جديد | Tab: تنقل
        </div>
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
                  <PhoneInput
                    name="phone1"
                    value={quickCustomerForm.phone1}
                    onChange={handleQuickCustomerChange}
                    placeholder="1012345678"
                    required
                  />
                </div>

                {/* رقم الهاتف الثاني */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    رقم الهاتف الثاني
                  </label>
                  <PhoneInput
                    name="phone2"
                    value={quickCustomerForm.phone2}
                    onChange={handleQuickCustomerChange}
                    placeholder="1112345678"
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

      {/* Modal رسالة تأكيد تغيير السعر في المبيعات */}
      {showPriceChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <FaExclamationTriangle size={48} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-center">تأكيد تغيير سعر الشريحة</h2>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="text-center space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border-r-4 border-yellow-500">
                  <p className="text-sm text-gray-700 mb-2">
                    المنتج: <span className="font-semibold text-gray-900">{priceChangeData.productName}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    الشريحة: <span className="font-semibold text-blue-700">{priceChangeData.tierName}</span>
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">السعر الحالي:</span>
                      <span className="font-semibold text-green-600">{priceChangeData.originalPrice.toFixed(2)} ج.م</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">السعر الجديد:</span>
                      <span className="font-semibold text-blue-600">{priceChangeData.newPrice.toFixed(2)} ج.م</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm text-gray-600">الفرق:</span>
                      <span className={`font-bold ${priceChangeData.newPrice > priceChangeData.originalPrice ? 'text-red-600' : 'text-green-600'}`}>
                        {priceChangeData.newPrice > priceChangeData.originalPrice ? '+' : ''}
                        {(priceChangeData.newPrice - priceChangeData.originalPrice).toFixed(2)} ج.م
                      </span>
                    </div>
                    
                    <div className="bg-green-50 p-2 rounded border-r-2 border-green-400 mt-2">
                      <div className="flex items-center gap-1 mb-1">
                        <FaInfoCircle className="text-green-500 text-xs" />
                        <span className="text-xs font-semibold text-green-700">تحديث تلقائي</span>
                      </div>
                      <p className="text-xs text-green-600">
                        سيتم تحديث سعر {priceChangeData.tierName} فقط ({priceChangeData.field === 'price' ? 'السعر الأساسي' : 'السعر الفرعي'})
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaInfoCircle className="text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700">معلومة مهمة</span>
                  </div>
                  <p className="text-xs text-blue-600">
                    هذا السعر تم تحديده تلقائياً من الشريحة المحددة. هل تريد تحديث السعر فعلاً؟
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={cancelPriceChange}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                إلغاء التغيير
              </button>
              <button
                onClick={confirmPriceChange}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                تأكيد التغيير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSalesInvoice;