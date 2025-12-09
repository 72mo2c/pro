// ======================================
// Inventory - جرد المخازن (محسّنة)
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/Common/Card';
import Select from '../../components/Common/Select';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { 
  FaList, 
  FaSearch, 
  FaWarehouse, 
  FaFilter,
  FaBox,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCheckCircle,
  FaTimes,
  FaDollarSign,
  FaInfoCircle
} from 'react-icons/fa';

const Inventory = () => {
  const { products, warehouses, getCategoryPath } = useData();
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // نافذة تفاصيل المنتج
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // تصفية المنتجات
  const filteredProducts = () => {
    return products.filter(product => {
      // البحث بالاسم أو الباركود أو الفئة
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // فلترة المخزن
      const matchesWarehouse = selectedWarehouse === '' || 
                              product.warehouseId === parseInt(selectedWarehouse);

      // فلترة الفئة
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

      // فلترة الحالة
      const matchesStatus = () => {
        const mainQuantity = product.mainQuantity || 0;
        const subQuantity = product.subQuantity || 0;
        const totalQuantity = mainQuantity + subQuantity; // إجمالي الكميات للتصفية
        
        if (filterStatus === 'all') return true;
        if (filterStatus === 'out') return totalQuantity === 0;
        if (filterStatus === 'low') return totalQuantity > 0 && totalQuantity < 10;
        if (filterStatus === 'available') return totalQuantity >= 10;
        return true;
      };

      // فلترة الشريحة السعرية
      const matchesTier = () => {
        if (selectedTierFilter === '') return true;
        
        switch (selectedTierFilter) {
          case 'purchase':
            return product.purchasePrices && (product.purchasePrices.basicPrice > 0 || product.purchasePrices.subPrice > 0);
          case 'retail':
            return product.tierPrices?.retail && (product.tierPrices.retail.basicPrice > 0 || product.tierPrices.retail.subPrice > 0);
          case 'wholesale':
            return product.tierPrices?.wholesale && (product.tierPrices.wholesale.basicPrice > 0 || product.tierPrices.wholesale.subPrice > 0);
          case 'bulk':
            return product.tierPrices?.bulk && (product.tierPrices.bulk.basicPrice > 0 || product.tierPrices.bulk.subPrice > 0);
          default:
            return true;
        }
      };

      return matchesSearch && matchesWarehouse && matchesCategory && matchesStatus() && matchesTier();
    });
  };

  // دالة الحصول على اسم المخزن
  const getWarehouseName = (warehouseId) => {
    const id = typeof warehouseId === 'string' ? parseInt(warehouseId) : warehouseId;
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : '-';
  };

  // دالة الحصول على مسار الفئة الكامل
  const getCategoryDisplayPath = (categoryId) => {
    if (!categoryId) return '-';
    
    const categoryIdNum = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    const categoryPath = getCategoryPath(categoryIdNum);
    
    if (!categoryPath || categoryPath.length === 0) return '-';
    
    // إرجاع مسار الفئة مفصول بعلامة السهم
    return categoryPath.map(cat => cat.name).join(' > ');
  };

  // دالة إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedWarehouse('');
    setSelectedCategory('');
    setSelectedTierFilter('');
    setFilterStatus('all');
  };

  // دالة فتح نافذة تفاصيل المنتج
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // دالة إغلاق نافذة تفاصيل المنتج
  const closeProductModal = () => {
    setSelectedProduct(null);
    setShowProductModal(false);
  };

  // دالة طباعة تفاصيل المنتج
  const printProductDetails = () => {
    if (!selectedProduct) return;
    
    const printWindow = window.open('', '_blank');
    const product = selectedProduct;
    
    // تنسيق التاريخ
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // الحصول على السعر المعروض
    const getDisplayPrice = (price) => {
      return price ? price.toLocaleString('ar-EG') : '0';
    };

    // بناء محتوى الطباعة
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تفاصيل المنتج - ${product.name}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            margin: 20px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .report-title {
            font-size: 18px;
            color: #666;
          }
          .product-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-section {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
          }
          .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
            border-bottom: 1px dotted #eee;
          }
          .info-label {
            font-weight: 600;
            color: #555;
          }
          .info-value {
            color: #333;
            text-align: left;
          }
          .price-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .price-table th,
          .price-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          .price-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">نظام إدارة المخازن</div>
          <div class="report-title">تقرير تفاصيل المنتج</div>
        </div>

        <div class="product-info">
          <div class="info-section">
            <div class="section-title">معلومات أساسية</div>
            <div class="info-row">
              <span class="info-label">اسم المنتج:</span>
              <span class="info-value">${product.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">الباركود:</span>
              <span class="info-value">${product.barcode || '-'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">الفئة:</span>
              <span class="info-value">${getCategoryDisplayPath(product.category)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">المخزن:</span>
              <span class="info-value">${getWarehouseName(product.warehouseId)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">الكمية الأساسية:</span>
              <span class="info-value">${product.mainQuantity || 0}</span>
            </div>
            <div class="info-row">
              <span class="info-label">الكمية الفرعية:</span>
              <span class="info-value">${product.subQuantity || 0}</span>
            </div>
            <div class="info-row">
              <span class="info-label">إجمالي الكمية:</span>
              <span class="info-value">${(product.mainQuantity || 0) + (product.subQuantity || 0)}</span>
            </div>
          </div>

          <div class="info-section">
            <div class="section-title">أسعار الشراء</div>
            <div class="info-row">
              <span class="info-label">سعر الشراء الأساسي:</span>
              <span class="info-value">${getDisplayPrice(product.purchasePrices?.basicPrice)} ج.م</span>
            </div>
            <div class="info-row">
              <span class="info-label">سعر الشراء الفرعي:</span>
              <span class="info-value">${getDisplayPrice(product.purchasePrices?.subPrice)} ج.م</span>
            </div>
            <div class="info-row">
              <span class="info-label">آخر تحديث:</span>
              <span class="info-value">${formatDate(product.updatedAt || product.createdAt)}</span>
            </div>
          </div>
        </div>

        <div class="info-section" style="margin-bottom: 20px;">
          <div class="section-title">أسعار الشرائح</div>
          ${product.tierPrices ? `
            <table class="price-table">
              <thead>
                <tr>
                  <th>الشريحة</th>
                  <th>سعر أساسي</th>
                  <th>سعر فرعي</th>
                </tr>
              </thead>
              <tbody>
                ${product.tierPrices.retail ? `
                  <tr>
                    <td>البيع المباشر</td>
                    <td>${getDisplayPrice(product.tierPrices.retail.basicPrice)} ج.م</td>
                    <td>${getDisplayPrice(product.tierPrices.retail.subPrice)} ج.م</td>
                  </tr>
                ` : ''}
                ${product.tierPrices.wholesale ? `
                  <tr>
                    <td>الجملة</td>
                    <td>${getDisplayPrice(product.tierPrices.wholesale.basicPrice)} ج.م</td>
                    <td>${getDisplayPrice(product.tierPrices.wholesale.subPrice)} ج.م</td>
                  </tr>
                ` : ''}
                ${product.tierPrices.bulk ? `
                  <tr>
                    <td>جملة الجملة</td>
                    <td>${getDisplayPrice(product.tierPrices.bulk.basicPrice)} ج.م</td>
                    <td>${getDisplayPrice(product.tierPrices.bulk.subPrice)} ج.م</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          ` : '<p style="text-align: center; color: #999;">لا توجد شرائح سعرية</p>'}
        </div>

        <div class="footer">
          <p>تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-EG')}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // الحصول على قائمة الفئات الفريدة
  const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean).sort();

  // دالة للحصول على السعر المناسب حسب الفلتر المحدد
  const getProductPrice = (product) => {
    // إذا كان هناك فلتر للشريحة السعرية، استخدم سعر الشريحة المحدد
    if (selectedTierFilter !== '') {
      switch (selectedTierFilter) {
        case 'purchase':
          return product.purchasePrices?.basicPrice || 0;
        case 'retail':
          return product.tierPrices?.retail?.basicPrice || 0;
        case 'wholesale':
          return product.tierPrices?.wholesale?.basicPrice || 0;
        case 'bulk':
          return product.tierPrices?.bulk?.basicPrice || 0;
        default:
          break;
      }
    }
    
    // النظام الجديد: الشرائح السعرية (الجملة كافتراضي)
    if (product.tierPrices?.wholesale?.basicPrice) {
      return product.tierPrices.wholesale.basicPrice;
    }
    // النظام القديم: السعر الأساسي
    return product.mainPrice || 0;
  };

  // دالة للحصول على سعر الوحدة الفرعية
  const getProductSubPrice = (product) => {
    // إذا كان هناك فلتر للشريحة السعرية، استخدم سعر الشريحة المحدد
    if (selectedTierFilter !== '') {
      switch (selectedTierFilter) {
        case 'purchase':
          return product.purchasePrices?.subPrice || 0;
        case 'retail':
          return product.tierPrices?.retail?.subPrice || 0;
        case 'wholesale':
          return product.tierPrices?.wholesale?.subPrice || 0;
        case 'bulk':
          return product.tierPrices?.bulk?.subPrice || 0;
        default:
          break;
      }
    }
    
    // النظام الجديد: الشرائح السعرية (الجملة كافتراضي)
    if (product.tierPrices?.wholesale?.subPrice) {
      return product.tierPrices.wholesale.subPrice;
    }
    // النظام القديم: السعر الفرعي
    return product.subPrice || 0;
  };

  // دالة للحصول على معامل التحويل
  const getUnitsMultiplier = (product) => {
    return product.unitsInMain || product.multiplier || 1;
  };

  // دالة لحساب القيمة الإجمالية الصحيحة للمنتج
  const getProductTotalValue = (product) => {
    const mainQuantity = product.mainQuantity || 0;
    const subQuantity = product.subQuantity || 0;
    const unitsMultiplier = getUnitsMultiplier(product);
    const mainPrice = getProductPrice(product);
    const subPrice = getProductSubPrice(product);
    
    // حساب القيمة الإجمالية: (كمية أساسية × سعر أساسي) + (كمية فرعية × سعر فرعي)
    const mainValue = mainQuantity * mainPrice;
    const subValue = subQuantity * subPrice;
    
    return mainValue + subValue;
  };

  const warehouseOptions = [
    { value: '', label: 'جميع المخازن' },
    ...warehouses.map(w => ({ value: w.id, label: w.name }))
  ];

  const categoryOptions = [
    { value: '', label: 'جميع الفئات' },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
  ];

  const tierFilterOptions = [
    { value: '', label: 'جميع الشرائح' },
    { value: 'purchase', label: 'سعر الشراء' },
    { value: 'retail', label: 'البيع المباشر' },
    { value: 'wholesale', label: 'الجملة' },
    { value: 'bulk', label: 'جملة الجملة' },
  ];

  const statusOptions = [
    { value: 'all', label: 'جميع المنتجات' },
    { value: 'available', label: 'متاح (≥ 10)' },
    { value: 'low', label: 'منخفض (1-9)' },
    { value: 'out', label: 'منتهي (0)' },
  ];

  // دالة لتحديد اللون حسب الحالة
  const getStatusColor = (totalQuantity) => {
    if (totalQuantity === 0) return 'text-red-600';
    if (totalQuantity < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (totalQuantity) => {
    if (totalQuantity === 0) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
          <FaTimesCircle /> منتهي
        </span>
      );
    }
    if (totalQuantity < 10) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
          <FaExclamationTriangle /> منخفض
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
        <FaCheckCircle /> متاح
      </span>
    );
  };

  const hasActiveFilters = searchQuery || selectedWarehouse || selectedCategory || selectedTierFilter || filterStatus !== 'all';

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">

      {/* البحث والفلترة */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الباركود أو الفئة..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg border">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">تصفية حسب المخزن</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {warehouseOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">تصفية حسب الفئة</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">تصفية حسب الشريحة السعرية</label>
                <select
                  value={selectedTierFilter}
                  onChange={(e) => setSelectedTierFilter(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {tierFilterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">تصفية حسب الحالة</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>عرض {filteredProducts().length} من {products.length} منتج</span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
              >
                <FaTimes /> إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* جدول الجرد */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FaInfoCircle className="text-xs" />
            <span>انقر مزدوجاً على أي صف لعرض تفاصيل المنتج الكاملة</span>
          </div>
        </div>
        {filteredProducts().length === 0 ? (
          <div className="text-center py-12 p-4">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {hasActiveFilters 
                ? 'لا توجد منتجات مطابقة للبحث' 
                : 'لا توجد منتجات في المخازن'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">المنتج</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الفئة</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الباركود</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">المخزن</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                    الكمية
                    <span className="block text-xs text-gray-500 font-normal">(إجمالي)</span>
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                    السعر
                    {selectedTierFilter && (
                      <span className="block text-xs text-blue-600 font-medium">
                        ({tierFilterOptions.find(t => t.value === selectedTierFilter)?.label})
                      </span>
                    )}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts().map((product, index) => {
                  const mainQuantity = product.mainQuantity || 0;
                  const subQuantity = product.subQuantity || 0;
                  const totalQuantity = mainQuantity + subQuantity; // إجمالي الكميات
                  const productPrice = getProductPrice(product);
                  
                  return (
                    <tr 
                      key={product.id} 
                      className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                        totalQuantity === 0 ? 'bg-red-50' : totalQuantity < 10 ? 'bg-yellow-50' : ''
                      }`}
                      onDoubleClick={() => openProductModal(product)}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded flex items-center justify-center text-white text-sm">
                            <FaBox />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                              {product.tierPrices && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                                  نظام متقدم
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="max-w-xs">
                          <span className="text-sm text-gray-700 font-medium leading-tight">
                            {getCategoryDisplayPath(product.category)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-600 font-mono">
                          {product.barcode || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FaWarehouse className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-700">{getWarehouseName(product.warehouseId)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          <span className={`text-lg font-bold ${getStatusColor(totalQuantity)}`}>
                            {totalQuantity}
                          </span>
                          {subQuantity > 0 && (
                            <div className="text-xs text-gray-500">
                              <div>{mainQuantity} أساسية</div>
                              <div>{subQuantity} فرعية</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          {/* السعر الأساسي */}
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-700 font-semibold">
                              {productPrice.toLocaleString('ar-EG')} ج.م
                            </span>
                            {selectedTierFilter ? (
                              <span className="text-xs text-blue-600 flex items-center gap-1">
                                <FaDollarSign className="text-xs" />
                                {tierFilterOptions.find(t => t.value === selectedTierFilter)?.label}
                              </span>
                            ) : product.tierPrices ? (
                              <span className="text-xs text-blue-600 flex items-center gap-1">
                                <FaDollarSign className="text-xs" />
                                جملة
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">سعر أساسي</span>
                            )}
                          </div>
                          
                          {/* السعر الفرعي إذا كان مختلفاً */}
                          {getProductSubPrice(product) > 0 && getProductSubPrice(product) !== productPrice && (
                            <div className="text-xs text-orange-600 border-t pt-1">
                              <div>فرعي: {getProductSubPrice(product).toLocaleString('ar-EG')} ج.م</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {getStatusBadge(totalQuantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة تفاصيل المنتج */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* رأس النافذة */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">تفاصيل المنتج</h2>
                <p className="text-gray-600 mt-1">{selectedProduct.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={printProductDetails}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FaDollarSign className="text-sm" />
                  طباعة
                </button>
                <button
                  onClick={closeProductModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <FaTimes className="text-sm" />
                  إغلاق
                </button>
              </div>
            </div>

            {/* محتوى النافذة */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* معلومات أساسية */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaBox className="text-blue-600" />
                      معلومات أساسية
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">اسم المنتج:</span>
                        <span className="font-semibold">{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الباركود:</span>
                        <span className="font-mono text-sm">{selectedProduct.barcode || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الفئة:</span>
                        <span className="font-semibold text-right max-w-xs leading-tight">
                          {getCategoryDisplayPath(selectedProduct.category)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">المخزن:</span>
                        <span className="font-semibold">{getWarehouseName(selectedProduct.warehouseId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الكمية الأساسية:</span>
                        <span className="font-semibold text-green-600">{selectedProduct.mainQuantity || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الكمية الفرعية:</span>
                        <span className="font-semibold text-blue-600">{selectedProduct.subQuantity || 0}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600 font-semibold">إجمالي الكمية:</span>
                        <span className="font-bold text-lg text-purple-600">
                          {(selectedProduct.mainQuantity || 0) + (selectedProduct.subQuantity || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* أسعار الشراء */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaDollarSign className="text-green-600" />
                      أسعار الشراء
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">سعر الشراء الأساسي:</span>
                        <span className="font-semibold text-green-700">
                          {(selectedProduct.purchasePrices?.basicPrice || 0).toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">سعر الشراء الفرعي:</span>
                        <span className="font-semibold text-green-700">
                          {(selectedProduct.purchasePrices?.subPrice || 0).toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">آخر تحديث:</span>
                        <span className="text-sm text-gray-500">
                          {selectedProduct.updatedAt ? 
                            new Date(selectedProduct.updatedAt).toLocaleDateString('ar-EG') :
                            selectedProduct.createdAt ?
                            new Date(selectedProduct.createdAt).toLocaleDateString('ar-EG') :
                            '-'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* أسعار الشرائح */}
                <div className="space-y-6">
                  {selectedProduct.tierPrices && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaDollarSign className="text-blue-600" />
                        أسعار الشرائح
                      </h3>
                      
                      {selectedProduct.tierPrices.retail && (
                        <div className="mb-4 p-3 bg-white rounded border">
                          <h4 className="font-semibold text-gray-800 mb-2">البيع المباشر</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span>أساسي:</span>
                              <span className="font-semibold">
                                {(selectedProduct.tierPrices.retail.basicPrice || 0).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>فرعي:</span>
                              <span className="font-semibold">
                                {(selectedProduct.tierPrices.retail.subPrice || 0).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProduct.tierPrices.wholesale && (
                        <div className="mb-4 p-3 bg-white rounded border">
                          <h4 className="font-semibold text-gray-800 mb-2">الجملة</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span>أساسي:</span>
                              <span className="font-semibold">
                                {(selectedProduct.tierPrices.wholesale.basicPrice || 0).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>فرعي:</span>
                              <span className="font-semibold">
                                {(selectedProduct.tierPrices.wholesale.subPrice || 0).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProduct.tierPrices.bulk && (
                        <div className="mb-4 p-3 bg-white rounded border">
                          <h4 className="font-semibold text-gray-800 mb-2">جملة الجملة</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span>أساسي:</span>
                              <span className="font-semibold">
                                {(selectedProduct.tierPrices.bulk.basicPrice || 0).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>فرعي:</span>
                              <span className="font-semibold">
                                {(selectedProduct.tierPrices.bulk.subPrice || 0).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ملاحظة */}
                  {!selectedProduct.tierPrices && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaInfoCircle className="text-yellow-600" />
                        ملاحظة
                      </h3>
                      <p className="text-gray-600">لا توجد شرائح سعرية محددة لهذا المنتج</p>
                    </div>
                  )}

                  {/* ملخص القيم */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaDollarSign className="text-purple-600" />
                      ملخص القيم
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">قيمة الشراء الإجمالية:</span>
                        <span className="font-bold text-green-700">
                          {(
                            ((selectedProduct.mainQuantity || 0) * (selectedProduct.purchasePrices?.basicPrice || 0)) +
                            ((selectedProduct.subQuantity || 0) * (selectedProduct.purchasePrices?.subPrice || 0))
                          ).toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                      {selectedProduct.tierPrices?.wholesale?.basicPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">قيمة البيع بالجملة:</span>
                          <span className="font-bold text-blue-700">
                            {(
                              ((selectedProduct.mainQuantity || 0) + (selectedProduct.subQuantity || 0)) * 
                              selectedProduct.tierPrices.wholesale.basicPrice
                            ).toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
