
// ======================================
// New Purchase Invoice - فاتورة مشتريات جديدة (محسّنة ومحدثة بالخصم)
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useTab } from '../../contexts/TabContext';
import { FaSave, FaPrint, FaSearch, FaTrash, FaPercent, FaMoneyBillWave, FaExclamationTriangle, FaInfoCircle, FaList } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

const NewPurchaseInvoice = () => {
  const { suppliers, products, warehouses, addPurchaseInvoice, getSupplierBalance, updateProduct } = useData();
  const { showSuccess, showError } = useNotification();
  const { openTab } = useTab();
  
  // دالة لفتح سجل المشتريات في تبويبة جديدة
  const handleOpenPurchaseRecord = () => {
    openTab('/purchases/invoices', 'سجل فواتير المشتريات', '📋');
  };
  
  const [formData, setFormData] = useState({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    paymentType: 'main',
    notes: '',
    discountPercentage: 0, // نسبة الخصم المئوية
    discountFixed: 0 // مبلغ الخصم الثابت
  });

  const [items, setItems] = useState([{
    productId: '',
    productName: '',
    barcode: '',
    quantity: 1,
    subQuantity: 0,
    price: 0,
    subPrice: 0,
    discount: 0,
    discountType: 'fixed' // 'fixed' or 'percentage'
  }]);

  // البحث في الموردين والمنتجات
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [productSearches, setProductSearches] = useState(['']);
  const [showProductSuggestions, setShowProductSuggestions] = useState([false]);
  
  // حالات الخطأ
  const [supplierError, setSupplierError] = useState(false);
  const [productErrors, setProductErrors] = useState([false]);
  const [quantityErrors, setQuantityErrors] = useState([false]);
  const [priceErrors, setPriceErrors] = useState([false]);
  const [discountErrors, setDiscountErrors] = useState([false]);
  const [validationErrors, setValidationErrors] = useState({});

  // رسالة التأكيد عند تغيير السعر
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
  const [priceChangeData, setPriceChangeData] = useState({
    index: null,
    field: '',
    newPrice: 0,
    originalPrice: 0,
    productName: ''
  });

  // مراجع للتركيز التلقائي
  const supplierInputRef = useRef(null);
  const productInputRefs = useRef([]);
  const quantityInputRefs = useRef([]);
  const subQuantityInputRefs = useRef([]);
  const priceInputRefs = useRef([]);
  const subPriceInputRefs = useRef([]);
  const discountInputRefs = useRef([]);

  // دالة التنقل التلقائي عند الضغط على Enter
  const handleEnterPress = (currentIndex, field) => {
    console.log('Enter pressed in field:', field, 'index:', currentIndex);
    console.log('Current items length:', items.length);
    console.log('Items array:', items);
    setTimeout(() => {
      console.log('Processing navigation for field:', field, 'at index:', currentIndex);
      switch (field) {
        case 'product':
          console.log('Moving to quantity field');
          if (quantityInputRefs.current[currentIndex]) {
            quantityInputRefs.current[currentIndex].focus();
          }
          break;
        case 'quantity':
          console.log('Moving to subQuantity field - attempting to focus subQuantity input at index:', currentIndex);
          console.log('subQuantityInputRefs current:', subQuantityInputRefs.current);
          if (subQuantityInputRefs.current[currentIndex]) {
            console.log('Focusing subQuantity input at index:', currentIndex);
            subQuantityInputRefs.current[currentIndex].focus();
          } else {
            console.log('ERROR: subQuantityInputRefs for index', currentIndex, 'is null/undefined');
          }
          break;
        case 'subQuantity':
          console.log('Moving to price field');
          if (priceInputRefs.current[currentIndex]) {
            priceInputRefs.current[currentIndex].focus();
          }
          break;
        case 'price':
          console.log('Moving to subPrice field');
          if (subPriceInputRefs.current[currentIndex]) {
            subPriceInputRefs.current[currentIndex].focus();
          }
          break;
        case 'subPrice':
          console.log('Moving to discount field');
          if (discountInputRefs.current[currentIndex]) {
            discountInputRefs.current[currentIndex].focus();
          }
          break;
        case 'discount':
          console.log('Adding new item or moving to next product');
          console.log('Current index:', currentIndex, 'Items length:', items.length);
          if (currentIndex === items.length - 1) {
            console.log('Adding new item - calling addItem()');
            addItem();
          } else {
            console.log('Moving to next product');
            if (productInputRefs.current[currentIndex + 1]) {
              productInputRefs.current[currentIndex + 1].focus();
            }
          }
          break;
        default:
          console.log('Unknown field:', field);
          break;
      }
    }, 100);
  };

  // التركيز التلقائي عند التحميل
  useEffect(() => {
    supplierInputRef.current?.focus();
  }, []);

  // عرض رصيد المورد المحدد
  const getSelectedSupplierBalance = () => {
    if (!formData.supplierId) return null;
    return getSupplierBalance(parseInt(formData.supplierId));
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
    let itemDiscount = 0;
    
    if (item.discountType === 'percentage') {
      // خصم نسبة مئوية
      itemDiscount = (totalWithoutDiscount * (item.discount || 0)) / 100;
    } else {
      // خصم مبلغ ثابت
      itemDiscount = item.discount || 0;
    }
    
    return Math.max(0, totalWithoutDiscount - itemDiscount);
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  // حساب قيمة الخصم
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

  // تحديث سعر الشراء فقط بدون تطبيق الفرق على الشرائح السعرية
  const calculateAndApplyPriceDifference = (product, field, newPrice) => {
    // إنشاء نسخة جديدة من المنتج
    const updatedProduct = { ...product };
    
    // تحديث سعر الشراء فقط
    updatedProduct.purchasePrices = {
      ...product.purchasePrices,
      [field === 'price' ? 'basicPrice' : 'subPrice']: newPrice
    };
    
    return updatedProduct;
  };

  // تأكيد تغيير السعر
  const confirmPriceChange = () => {
    const { index, field, newPrice, productId } = priceChangeData;
    
    // جلب المنتج من قاعدة البيانات للحصول على أحدث البيانات
    const currentProduct = products.find(p => p.id === parseInt(productId));
    if (!currentProduct) {
      showError('لم يتم العثور على المنتج');
      setShowPriceChangeModal(false);
      return;
    }
    
    // حساب الفرق وتطبيقه على الشرائح
    const updatedProduct = calculateAndApplyPriceDifference(currentProduct, field, newPrice);
    
    // تحديث المنتج في قاعدة البيانات
    try {
      if (productId && updateProduct) {
        // تحديث المنتج بدون الشرائح السعرية
        updateProduct(parseInt(productId), updatedProduct);
      }
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      showError('حدث خطأ في تحديث المنتج');
    }
    
    // تحديث العنصر في الفاتورة
    const newItems = [...items];
    newItems[index][field] = newPrice;
    newItems[index].purchasePrices = updatedProduct.purchasePrices;
    // newItems[index].tierPrices = updatedProduct.tierPrices; // لا نحتاج لتحديث الشرائح
    setItems(newItems);
    
    // تحديث أخطاء السعر
    const newPriceErrors = [...priceErrors];
    newPriceErrors[index] = newPrice < 0;
    setPriceErrors(newPriceErrors);
    
    setShowPriceChangeModal(false);
    showSuccess(`تم تحديث ${field === 'price' ? 'السعر الأساسي' : 'السعر الفرعي'} للمنتج بنجاح (بدون تأثير على الشرائح السعرية)`);
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

  // تحذير عند عدم كفاية الرصيد
  const getPaymentTypeWarning = () => {
    // تم إخفاء التحذيرات المالية لحماية المعلومات
    return null;
  };

  const paymentWarning = getPaymentTypeWarning();
  const supplierBalance = getSelectedSupplierBalance();

  // معالجة اختصارات الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S للحفظ
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(e);
      }
      // إزالة handler Enter لحقول الكمية لأنه يديره onKeyPress handlers
      // if (e.key === 'Enter' && e.target.name?.startsWith('quantity-')) {
      //   const index = parseInt(e.target.name.split('-')[1]);
      //   if (index === items.length - 1) {
      //     e.preventDefault();
      //     addItem();
      //   }
      // }
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

  // البحث في الموردين
  const handleSupplierSearch = (value) => {
    setSupplierSearch(value);
    // إظهار القائمة فقط عند وجود نص
    setShowSupplierSuggestions(value.trim().length > 0);
  };

  const selectSupplier = (supplier) => {
    const supplierBalance = supplier.balance || 0;
    setFormData({ 
      ...formData, 
      supplierId: supplier.id,
      supplierBalance: supplierBalance // إضافة رصيد المورد
    });
    setSupplierSearch(supplier.name);
    setShowSupplierSuggestions(false);
    
    // إظهار رسالة برصيد المورد
    if (supplierBalance !== 0) {
      const balanceText = supplierBalance > 0 ? `رصيد المورد: ${supplierBalance.toFixed(2)} ج.م (له)` : `رصيد المورد: ${Math.abs(supplierBalance).toFixed(2)} ج.م (عليه)`;
      setTimeout(() => showSuccess(balanceText), 500);
    }
  };
  
  // إخفاء قائمة الموردين عند الخروج من الحقل
  const handleSupplierBlur = () => {
    setTimeout(() => {
      setShowSupplierSuggestions(false);
    }, 200);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

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
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      barcode: product.barcode || '',
      price: parseFloat(product.purchasePrices?.basicPrice) || 0,
      subPrice: parseFloat(product.purchasePrices?.subPrice) || 0,
      purchasePrices: {
        basicPrice: parseFloat(product.purchasePrices?.basicPrice) || 0,
        subPrice: parseFloat(product.purchasePrices?.subPrice) || 0
      },
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

  // تحديث فوري للعنصر (يستخدم مع onChange)
  const handleImmediateUpdate = (index, field, value) => {
    const newItems = [...items];
    
    // التأكد من صحة قيم الخصم
    if (field === 'discount' && newItems[index].discountType === 'percentage') {
      if (value > 100) {
        value = 100;
      } else if (value < 0) {
        value = 0;
      }
    } else if (field === 'discount' && newItems[index].discountType === 'fixed') {
      if (value < 0) {
        value = 0;
      }
    }
    
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
      const originalAutoPrice = field === 'price' 
        ? parseFloat(currentItem.purchasePrices?.basicPrice) || 0 
        : parseFloat(currentItem.purchasePrices?.subPrice) || 0;
      
      if (originalAutoPrice !== 0 && newValue !== originalAutoPrice) {
        // تم تغيير السعر، أظهر رسالة التأكيد
        setPriceChangeData({
          index,
          field,
          newPrice: newValue,
          originalPrice: originalAutoPrice,
          productName: currentItem.productName || 'المنتج المحدد',
          productId: currentItem.productId || null
        });
        setShowPriceChangeModal(true);
      }
    }
  };

  // دالة للتعامل مع تغيير العنصر (تستخدم للحقول غير السعر)
  const handleItemChange = (index, field, value) => {
    handleImmediateUpdate(index, field, value);
  };

  const addItem = () => {
    setItems([...items, { 
      productId: '', 
      productName: '',
      barcode: '',
      quantity: 1, 
      subQuantity: 0,
      price: 0,
      subPrice: 0,
      discount: 0,
      discountType: 'fixed'
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

  // التحقق الشامل من البيانات
  const validateForm = () => {
    const errors = {};
    
    // التحقق من المورد
    if (!formData.supplierId) {
      errors.supplier = 'يجب اختيار المورد';
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
      errors.discount = 'قيمة الخصم لا يمكن أن تزيد عن المجموع الكلي';
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
        newQuantityErrors[index] = false;
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
      const discountAmount = calculateDiscountAmount();
      
      const invoiceData = {
        ...formData,
        date: `${formData.date}T${formData.time}:00`,
        items,
        subtotal: calculateSubTotal(),
        discountAmount: discountAmount,
        total: calculateTotal(),
        status: 'completed'
      };

      const newInvoice = addPurchaseInvoice(invoiceData);
      showSuccess('تم حفظ فاتورة المشتريات بنجاح');

      if (shouldPrint) {
        // الطباعة المباشرة
        const supplier = suppliers.find(s => s.id === parseInt(formData.supplierId));
        printInvoiceDirectly({
          formData: newInvoice,
          items: newInvoice.items,
          subtotal: newInvoice.subtotal,
          discountAmount: newInvoice.discountAmount,
          total: newInvoice.total,
          supplier,
          suppliers,
          products,
          warehouses
        }, 'purchase');
      }

      resetForm();
    } catch (error) {
      // عرض رسالة الخطأ الفعلية للمستخدم
      showError(error.message || 'حدث خطأ في حفظ الفاتورة');
      console.error('خطأ في حفظ فاتورة المشتريات:', error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      supplierId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentType: 'main',
      notes: '',
      discountPercentage: 0,
      discountFixed: 0
    });
    setItems([{ 
      productId: '', 
      productName: '',
      barcode: '',
      quantity: 1, 
      subQuantity: 0,
      price: 0,
      subPrice: 0,
      discount: 0
    }]);
    setSupplierSearch('');
    setProductSearches(['']);
    setShowSupplierSuggestions(false);
    setShowProductSuggestions([false]);
    setSupplierError(false);
    setProductErrors([false]);
    setQuantityErrors([false]);
    setPriceErrors([false]);
    setDiscountErrors([false]);
    setValidationErrors({});
    supplierInputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">

      
      {/* تحذير نوع الدفع */}
      {paymentWarning && (
        <div className={`p-4 rounded-lg mb-4 ${
          paymentWarning.type === 'error' ? 'bg-red-100 border border-red-300 text-red-700' :
          'bg-yellow-100 border border-yellow-300 text-yellow-700'
        }`}>
          <div className="flex items-center gap-2">
            {paymentWarning.type === 'error' ? <FaExclamationTriangle /> : <FaInfoCircle />}
            <span className="font-semibold">{paymentWarning.message}</span>
          </div>
        </div>
      )}
      


      {/* البطاقة الرئيسية */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* الصف العلوي: معلومات الفاتورة */}
        <div className="grid grid-cols-12 gap-3 mb-4 pb-4 border-b">
          {/* المورد */}
          <div className="col-span-5 relative">
            <div className="relative">
              <input
                ref={supplierInputRef}
                type="text"
                value={supplierSearch}
                onChange={(e) => handleSupplierSearch(e.target.value)}
                onBlur={handleSupplierBlur}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ابحث عن المورد..."
              />
              <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-xs" />
            </div>
            {showSupplierSuggestions && supplierSearch.trim().length > 0 && filteredSuppliers.length > 0 && (
              <div className="absolute z-[9999] w-full mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    onClick={() => selectSupplier(supplier)}
                    className="px-4 py-2.5 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-800">{supplier.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{supplier.phone}</span>
                        {supplier.balance !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            supplier.balance > 0 ? 'text-blue-600 bg-blue-100' : 
                            supplier.balance < 0 ? 'text-red-600 bg-red-100' : 
                            'text-green-600 bg-green-100'
                          }`}>
                            {supplier.balance === 0 ? 'متزن' : 
                             supplier.balance > 0 ? `له: ${supplier.balance.toFixed(2)}` : 
                             `عليه: ${Math.abs(supplier.balance).toFixed(2)}`} ج.م
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
          <div className="col-span-4">
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="main">اختر نوع الفاتورة</option>
              <option value="cash">نقدي</option>
              <option value="deferred">آجل</option>
            </select>
          </div>

          {/* التاريخ */}
          <div className="col-span-2">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* الوقت */}
          <div className="col-span-1">
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* جدول المنتجات */}
        <div className="mb-4 relative">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-700">المنتج</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-24">الباركود</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-16">الكمية الأساسية</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-16">الكمية الفرعية</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-20">السعر الأساسي</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-20">السعر الفرعي</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-20">الخصم</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-20">الإجمالي</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-12">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {/* المنتج */}
                  <td className="px-2 py-1 static">
                    <div className="relative z-[10]">
                      <input
                        ref={(el) => (productInputRefs.current[index] = el)}
                        type="text"
                        value={productSearches[index] || ''}
                        onChange={(e) => handleProductSearch(index, e.target.value)}
                        onBlur={() => handleProductBlur(index)}
                        onKeyPress={(e) => {
                          console.log('Product field key pressed:', e.key, 'at index:', index);
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            console.log('About to call handleEnterPress for product field');
                            handleEnterPress(index, 'product');
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="ابحث عن المنتج..."
                      />
                      <FaSearch className="absolute left-2 top-2 text-gray-400 text-xs" />
                    </div>
                    {showProductSuggestions[index] && productSearches[index]?.trim().length > 0 && getFilteredProducts(index).length > 0 && (
                      <div className="absolute z-[9999] left-0 w-full mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                        {getFilteredProducts(index).map((product) => {
                          const warehouse = warehouses.find(w => w.id === product.warehouseId);
                          return (
                            <div
                              key={product.id}
                              onClick={() => selectProduct(index, product)}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <span className="font-semibold text-sm text-gray-800">{product.name}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-600">({warehouse?.name || 'غير محدد'} - {product.category})</span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">أساسي: {product.mainQuantity || 0}, فرعي: {product.subQuantity || 0}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  {/* الباركود */}
                  <td className="px-2 py-1 text-center">
                    {item.barcode && (
                      <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded border">
                        {item.barcode}
                      </span>
                    )}
                  </td>

                  {/* الكمية الأساسية */}
                  <td className="px-2 py-1">
                    <input
                      ref={(el) => {
                        quantityInputRefs.current[index] = el;
                      }}
                      type="number"
                      name={`quantity-${index}`}
                      value={item.quantity > 0 ? item.quantity : ''}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      onKeyPress={(e) => {
                        console.log('Quantity field key pressed:', e.key, 'at index:', index);
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          console.log('About to call handleEnterPress for quantity field');
                          handleEnterPress(index, 'quantity');
                        }
                      }}
                      className={`w-full px-2 py-1 text-sm text-center border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        quantityErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      style={{appearance: 'none', '-moz-appearance': 'textfield', '::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 }, '::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 }}}
                      min="0"
                      placeholder="0"
                    />
                  </td>

                  {/* الكمية الفرعية */}
                  <td className="px-2 py-1">
                    <input
                      ref={(el) => (subQuantityInputRefs.current[index] = el)}
                      type="number"
                      value={item.subQuantity > 0 ? item.subQuantity : ''}
                      onChange={(e) => handleItemChange(index, 'subQuantity', parseInt(e.target.value) || 0)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEnterPress(index, 'subQuantity');
                        }
                      }}
                      className="w-full px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      style={{appearance: 'none', '-moz-appearance': 'textfield', '::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 }, '::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 }}}
                      min="0"
                      placeholder="0"
                    />
                  </td>

                  {/* السعر الأساسي */}
                  <td className="px-2 py-1">
                    <input
                      ref={(el) => (priceInputRefs.current[index] = el)}
                      type="number"
                      step="0.01"
                      value={item.price > 0 ? item.price : ''}
                      onChange={(e) => handleImmediateUpdate(index, 'price', parseFloat(e.target.value) || 0)}
                      onBlur={(e) => handlePriceBlur(index, 'price', e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEnterPress(index, 'price');
                        }
                      }}
                      className={`w-full px-2 py-1 text-sm text-center border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        priceErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      style={{appearance: 'none', '-moz-appearance': 'textfield', '::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 }, '::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 }}}
                      min="0"
                      placeholder="0.00"
                    />
                  </td>

                  {/* السعر الفرعي */}
                  <td className="px-2 py-1">
                    <input
                      ref={(el) => (subPriceInputRefs.current[index] = el)}
                      type="number"
                      step="0.01"
                      value={item.subPrice > 0 ? item.subPrice : ''}
                      onChange={(e) => handleImmediateUpdate(index, 'subPrice', parseFloat(e.target.value) || 0)}
                      onBlur={(e) => handlePriceBlur(index, 'subPrice', e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEnterPress(index, 'subPrice');
                        }
                      }}
                      className="w-full px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      style={{appearance: 'none', '-moz-appearance': 'textfield', '::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 }, '::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 }}}
                      min="0"
                      placeholder="0.00"
                    />
                  </td>
                  {/* الخصم */}
                  <td className="px-2 py-1 w-20">
                    {/* الخصم أفقي - في صف واحد */}
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-1">
                        <input
                          ref={(el) => (discountInputRefs.current[index] = el)}
                          type="number"
                          step="0.01"
                          value={item.discount > 0 ? item.discount : ''}
                          onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleEnterPress(index, 'discount');
                            }
                          }}
                          className={`flex-1 px-2 py-1 text-xs text-center border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            discountErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          style={{appearance: 'none', '-moz-appearance': 'textfield', '::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 }, '::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 }}}
                          min="0"
                          placeholder="0.00"
                        />
                        <select
                          value={item.discountType}
                          onChange={(e) => handleItemChange(index, 'discountType', e.target.value)}
                          className="w-14 px-1 py-1 text-xs text-center border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        >
                          <option value="fixed">💰</option>
                          <option value="percentage">%</option>
                        </select>
                      </div>
                    </div>
                  </td>

                  {/* الإجمالي */}
                  <td className="px-2 py-1 text-center">
                    <span className="font-semibold text-blue-600 text-xs">
                      {calculateItemTotal(item).toFixed(2)}
                    </span>
                  </td>

                  {/* حذف */}
                  <td className="px-2 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed p-1"
                    >
                      <FaTrash className="text-xs" />
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
            {/* المجموع ورصيد المورد */}
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
                
                <div className="flex justify-between items-center pt-1 border-t border-blue-300">
                  <span className="text-xs font-bold text-gray-700">الإجمالي:</span>
                  <span className="text-sm font-bold text-blue-700">{calculateTotal().toFixed(2)}</span>
                </div>
                
                {/* عرض رصيد المورد */}
                {getSelectedSupplierBalance() !== null && getSelectedSupplierBalance() !== undefined && (
                  <div className="mt-1 pt-1 border-t border-blue-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">رصيد المورد:</span>
                      <span className={`text-xs font-bold ${
                        getSelectedSupplierBalance() > 0 ? 'text-blue-600' : 
                        getSelectedSupplierBalance() < 0 ? 'text-red-600' : 
                        'text-green-600'
                      }`}>
                        {getSelectedSupplierBalance() === 0 ? '0.00' : getSelectedSupplierBalance().toFixed(2)}
                        {getSelectedSupplierBalance() > 0 && ' ج.م (له)'}
                        {getSelectedSupplierBalance() < 0 && ' ج.م (عليه)'}
                        {getSelectedSupplierBalance() === 0 && ' ج.م (متزن)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                {items.length} منتج
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex flex-col gap-1">
              {/* سجل المشتريات */}
              <button
                type="button"
                onClick={handleOpenPurchaseRecord}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded transition-colors text-xs font-medium w-full"
                title="سجل المشتريات"
              >
                <FaList /> سجل المشتريات
              </button>
              
              {/* زر الحفظ المميز */}
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg transition-all font-bold text-sm shadow-lg transform hover:scale-105"
                title="حفظ الفاتورة"
              >
                <FaSave className="text-base" /> حفظ الفاتورة
              </button>
              
              {/* الأزرار الثانوية */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded transition-colors text-xs"
                  title="طباعة وحفظ"
                >
                  <FaPrint /> طباعة
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1.5 rounded transition-colors text-xs"
                  title="إعادة تعيين"
                >
                  <FaTrash /> إعادة تعيين
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal رسالة تأكيد تغيير السعر */}
        {showPriceChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-t-2xl text-white">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <FaExclamationTriangle size={32} />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-center">تأكيد تغيير السعر</h2>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="text-center">
                  <div className="bg-yellow-50 p-3 rounded-lg border-r-4 border-yellow-500 mb-3">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      المنتج: {priceChangeData.productName}
                    </p>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">السعر الحالي:</span>
                        <span className="text-green-600 font-medium">{priceChangeData.originalPrice.toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">السعر الجديد:</span>
                        <span className="text-orange-600 font-medium">{priceChangeData.newPrice.toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-gray-600">الفرق:</span>
                        <span className={`font-bold ${priceChangeData.newPrice > priceChangeData.originalPrice ? 'text-red-600' : 'text-green-600'}`}>
                          {priceChangeData.newPrice > priceChangeData.originalPrice ? '+' : ''}
                          {(priceChangeData.newPrice - priceChangeData.originalPrice).toFixed(2)} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    سيتم تحديث سعر الشراء ({priceChangeData.field === 'price' ? 'الأساسي' : 'الفرعي'}) فقط - لن يتم تغيير الشرائح السعرية
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 rounded-b-2xl flex gap-3">
                <button
                  onClick={cancelPriceChange}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmPriceChange}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* اختصارات الكيبورد */}
        <div className="mt-2 pt-2 border-t text-xs text-gray-400 text-center">
          Ctrl+S: حفظ | Enter: صف جديد | Tab: تنقل
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseInvoice;