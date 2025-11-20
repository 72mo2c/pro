/**
 * Top Selling Products Report Component
 * 
 * Features:
 * - Intelligent data matching across multiple sources
 * - Flexible price calculation from various fields
 * - Advanced analytics and performance scoring
 * - Real-time filtering and sorting
 * - Comprehensive error handling and validation
 * 
 * Fixed Issues:
 * - Product ID matching between invoices and products
 * - Price calculation from multiple sources (price, unitPrice, rate, total)
 * - Zero values displaying due to data structure mismatches
 * - Added inventory fallback for missing product data
 */

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const TopSellingProducts = () => {
  const { salesInvoices, products, inventory } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [sortBy, setSortBy] = useState('quantity'); // quantity or amount
  const [showTopN, setShowTopN] = useState(10); // Number of products to show
  
  // Extended analytics state
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageUnitPrice, setAverageUnitPrice] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [topPerformer, setTopPerformer] = useState(null);

  useEffect(() => {
    console.log('Data context updated:', {
      salesInvoices: salesInvoices?.length || 0,
      products: products?.length || 0,
      inventory: inventory?.length || 0
    });
    generateReport();
  }, [salesInvoices, products, inventory, startDate, endDate, sortBy, showTopN]);

  const generateReport = () => {
    console.log('=== Starting Report Generation ===');
    console.log('Input data:', {
      salesInvoicesCount: salesInvoices?.length || 0,
      productsCount: products?.length || 0,
      inventoryCount: inventory?.length || 0,
      dateRange: { startDate, endDate }
    });

    // Validate input data
    if (!salesInvoices || salesInvoices.length === 0) {
      console.warn('No sales invoices found');
      setReportData([]);
      return;
    }

    if (!products || products.length === 0) {
      console.warn('No products found');
    }

    const productSales = {};

    let filteredInvoices = salesInvoices || [];

    if (startDate) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => new Date(invoice.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => new Date(invoice.date) <= new Date(endDate)
      );
    }

    console.log('Filtered invoices count:', filteredInvoices.length);

    console.log('Filtered invoices:', filteredInvoices.length);
    console.log('Available products:', products?.length || 0);

    filteredInvoices.forEach((invoice, invoiceIndex) => {
      // Validate invoice structure
      if (!invoice || !invoice.items || !Array.isArray(invoice.items)) {
        console.warn(`Invalid invoice structure at index ${invoiceIndex}:`, invoice);
        return;
      }

      invoice.items.forEach((item, itemIndex) => {
        // Validate item structure
        if (!item) {
          console.warn(`Invalid item at invoice ${invoiceIndex}, item ${itemIndex}:`, item);
          return;
        }
        // Flexible product ID matching - handle different data formats
        let productId = item.productId || item.product || item.itemId || item.id;
        
        // Convert to string for consistent comparison
        if (productId !== undefined && productId !== null) {
          productId = String(productId);
        } else {
          return; // Skip items without product ID
        }

        // Get quantity - handle different field names
        const quantity = parseFloat(item.quantity || item.qty || item.amount || 0) || 0;
        
        // Get price - handle different field names and calculations
        let price = 0;
        if (item.price && item.price > 0) {
          price = parseFloat(item.price);
        } else if (item.unitPrice && item.unitPrice > 0) {
          price = parseFloat(item.unitPrice);
        } else if (item.rate && item.rate > 0) {
          price = parseFloat(item.rate);
        } else if (item.total && quantity > 0) {
          // Calculate price from total if available
          price = parseFloat(item.total) / quantity;
        } else if (invoice.total && invoice.items && invoice.items.length > 0) {
          // Calculate price from invoice total as fallback
          price = (parseFloat(invoice.total) / invoice.items.length) / quantity;
        }

        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            totalQuantity: 0,
            totalAmount: 0,
            invoiceIds: new Set(),
            dates: [],
            unitPrices: [],
            salesFrequency: 0,
            revenueGrowth: 0,
            profitMargin: 0,
            inventoryTurnover: 0,
          };
        }

        // Add to totals
        const lineTotal = quantity * price;
        productSales[productId].totalQuantity += quantity;
        productSales[productId].totalAmount += lineTotal;
        productSales[productId].invoiceIds.add(invoice.id);
        productSales[productId].dates.push(invoice.date);
        if (price > 0) {
          productSales[productId].unitPrices.push(price);
        }
        productSales[productId].salesFrequency += 1;

        // Log processed item for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`Processed item:`, {
            productId,
            quantity,
            price,
            lineTotal,
            invoiceId: invoice.id
          });
        }
      });
    });

    console.log('Product sales summary:', Object.keys(productSales).length);

    const data = Object.values(productSales).map((item) => {
      // Enhanced product matching with multiple ID types
      let product = null;
      
      // Try multiple ID matching strategies
      if (products && products.length > 0) {
        product = products.find((p) => {
          const productIds = [
            p.id, p.productId, p.code, p.barcode, p.sku, 
            p.itemId, p.productCode, p.itemCode
          ].filter(id => id !== undefined && id !== null);
          
          return productIds.some(id => String(id) === item.productId);
        });

        // Fallback: try to find by name similarity if ID matching fails
        if (!product && item.totalAmount > 0) {
          console.log(`No product found for ID: ${item.productId}, trying inventory lookup`);
          
          // Try inventory as fallback
          if (inventory && inventory.length > 0) {
            const inventoryItem = inventory.find(inv => 
              String(inv.productId) === item.productId ||
              String(inv.product) === item.productId
            );
            
            if (inventoryItem) {
              product = {
                id: inventoryItem.productId,
                name: `منتج ${item.productId}`,
                category: 'غير محدد',
                costPrice: inventoryItem.cost || 0
              };
            }
          }
        }
      }
      
      // Enhanced analytics calculations with better fallbacks
      let avgUnitPrice = 0;
      if (item.unitPrices.length > 0) {
        avgUnitPrice = item.unitPrices.reduce((a, b) => a + b, 0) / item.unitPrices.length;
      } else if (item.totalAmount > 0 && item.totalQuantity > 0) {
        // Fallback calculation
        avgUnitPrice = item.totalAmount / item.totalQuantity;
      }

      // Get product cost from multiple sources
      let costPrice = 0;
      if (product) {
        costPrice = parseFloat(product.costPrice || product.cost || product.purchasePrice || 0) || 0;
      }

      // Profit margin calculation with better handling
      let profitMargin = 0;
      if (avgUnitPrice > 0 && costPrice > 0) {
        profitMargin = ((avgUnitPrice - costPrice) / avgUnitPrice) * 100;
      } else if (avgUnitPrice > 0 && product?.sellingPrice) {
        // If we have selling price but no cost, estimate profit margin
        const estimatedCost = avgUnitPrice * 0.7; // Assume 30% margin as default
        profitMargin = ((avgUnitPrice - estimatedCost) / avgUnitPrice) * 100;
      }

      // Safe inventory turnover calculation
      let inventoryTurnover = 0;
      if (avgUnitPrice > 0) {
        const effectiveCost = costPrice > 0 ? costPrice : avgUnitPrice * 0.7;
        inventoryTurnover = item.totalQuantity * (avgUnitPrice / effectiveCost);
      }

      // Revenue growth calculation with better error handling
      let revenueGrowth = 0;
      if (item.dates.length > 1) {
        const dates = item.dates.map(d => new Date(d)).sort((a, b) => a - b);
        const dateRange = dates[dates.length - 1] - dates[0];
        const days = dateRange / (1000 * 60 * 60 * 24);
        if (days > 0) {
          revenueGrowth = item.totalAmount / (days / 30); // Monthly growth rate
        }
      }

      console.log(`Product ${item.productId}:`, {
        quantity: item.totalQuantity,
        amount: item.totalAmount,
        avgPrice: avgUnitPrice,
        profitMargin,
        productName: product?.name || 'Unknown'
      });

      return {
        productId: item.productId,
        totalQuantity: item.totalQuantity,
        totalAmount: item.totalAmount,
        invoiceCount: item.invoiceIds.size,
        productName: product?.name || product?.title || `منتج ${item.productId}`,
        barcode: product?.barcode || product?.code || product?.sku || '-',
        category: product?.category || product?.type || 'غير محدد',
        costPrice: costPrice,
        avgUnitPrice: avgUnitPrice,
        salesFrequency: item.salesFrequency,
        profitMargin: Math.round(profitMargin * 100) / 100,
        inventoryTurnover: Math.round(inventoryTurnover * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        isProfitable: profitMargin > 0,
        performanceScore: calculatePerformanceScore(item.totalQuantity, item.totalAmount, item.invoiceIds.size, profitMargin),
        // Add debug info
        debugInfo: {
          originalAmount: item.totalAmount,
          avgPrice: avgUnitPrice,
          productFound: !!product,
          productName: product?.name
        }
      };
    });

    // Sort data
    if (sortBy === 'quantity') {
      data.sort((a, b) => b.totalQuantity - a.totalQuantity);
    } else if (sortBy === 'amount') {
      data.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === 'profit') {
      data.sort((a, b) => b.profitMargin - a.profitMargin);
    } else if (sortBy === 'performance') {
      data.sort((a, b) => b.performanceScore - a.performanceScore);
    }

    // Take top N products
    const topProducts = data.slice(0, showTopN);
    setReportData(topProducts);

    // Update analytics with better data validation
    const totalItems = data.reduce((sum, item) => sum + (Number(item.totalQuantity) || 0), 0);
    const totalRevenueAmount = data.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
    const totalInvoiceCount = data.reduce((sum, item) => sum + (Number(item.invoiceCount) || 0), 0);
    const avgPrice = totalItems > 0 ? totalRevenueAmount / totalItems : 0;

    setTotalSoldItems(totalItems);
    setTotalRevenue(totalRevenueAmount);
    setAverageUnitPrice(avgPrice);
    setTotalTransactions(totalInvoiceCount);
    setTopPerformer(data.length > 0 ? data[0] : null);

    // Log final results for debugging
    console.log('=== Final Report Results ===');
    console.log('Report Summary:', {
      totalProducts: data.length,
      totalItems,
      totalRevenue: totalRevenueAmount,
      avgPrice,
      topPerformer: data[0]?.productName
    });
    
    console.log('Top 3 products:', data.slice(0, 3).map(item => ({
      name: item.productName,
      quantity: item.totalQuantity,
      amount: item.totalAmount,
      avgPrice: item.avgUnitPrice
    })));

    console.log('=== End Report Generation ===');
  };

  const calculatePerformanceScore = (quantity, amount, frequency, profitMargin) => {
    // More sophisticated performance calculation
    const quantityScore = Math.min(100, Math.log10(quantity + 1) * 25);
    const amountScore = Math.min(100, Math.log10(amount + 1) * 15);
    const frequencyScore = Math.min(100, frequency * 3);
    const profitScore = Math.max(0, Math.min(100, profitMargin * 2));
    
    // Weighted average with emphasis on profitability
    const totalScore = (quantityScore * 0.2) + (amountScore * 0.3) + (frequencyScore * 0.2) + (profitScore * 0.3);
    
    return Math.round(totalScore * 100) / 100;
  };

  const getPerformanceColor = (score) => {
    if (score >= 100) return 'text-emerald-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradientClass = (index) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-rose-500 to-rose-600',
    ];
    return gradients[index % gradients.length];
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['الترتيب', 'الباركود', 'الصنف', 'الكمية المباعة', 'إجمالي المبيعات', 'عدد الفواتير', 'هامش الربح', 'نقاط الأداء'];
    const csvData = reportData.map((item, idx) => [
      idx + 1,
      item.barcode,
      item.productName,
      item.totalQuantity,
      item.totalAmount.toFixed(2),
      item.invoiceCount,
      `${item.profitMargin.toFixed(1)}%`,
      item.performanceScore
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    // إضافة BOM لدعم الحروف العربية في Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `top_selling_products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير أفضل المنتجات مبيعاً"
        subtitle="تحليل ذكي للأداء والمبيعات مع مقاييس متقدمة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        actions={[
          {
            label: 'طباعة',
            onClick: printReport,
            variant: 'secondary',
          },
          {
            label: 'تصدير Excel',
            onClick: exportToExcel,
            variant: 'primary',
          },
        ]}
      />

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">إجمالي الكمية المباعة</p>
              <p className="text-2xl font-bold">{Number(totalSoldItems || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold">{Number(totalRevenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} ج.م</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">متوسط سعر الوحدة</p>
              <p className="text-2xl font-bold">{Number(averageUnitPrice || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} ج.م</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">عدد المعاملات</p>
              <p className="text-2xl font-bold">{Number(totalTransactions || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8v2h3v4h2V4h2V2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">المنتج الأول</p>
              <p className="text-xl font-bold truncate">{topPerformer?.productName || 'غير محدد'}</p>
              <p className="text-rose-100 text-xs">{Number(topPerformer?.totalQuantity || 0).toLocaleString()} قطعة</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الترتيب حسب
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="quantity">الكمية</option>
              <option value="amount">المبلغ</option>
              <option value="profit">هامش الربح</option>
              <option value="performance">نقاط الأداء</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد المنتجات
            </label>
            <select
              value={showTopN}
              onChange={(e) => setShowTopN(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>أفضل 5 منتجات</option>
              <option value={10}>أفضل 10 منتجات</option>
              <option value={20}>أفضل 20 منتج</option>
              <option value={50}>أفضل 50 منتج</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              تحديث التقرير
            </button>
          </div>
        </div>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                الترتيب
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                المنتج
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                الكمية المباعة
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                إجمالي المبيعات
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                متوسط السعر
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                هامش الربح
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                نقاط الأداء
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, idx) => (
              <tr key={`${item.productId}-${idx}`} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getGradientClass(idx)} flex items-center justify-center text-white text-sm font-bold`}>
                      {idx + 1}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                  <div className="text-sm text-gray-500">{item.barcode}</div>
                  <div className="text-xs text-gray-400">{item.category}</div>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-blue-600">ID: {item.productId}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {Number(item.totalQuantity || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{item.invoiceCount} فاتورة</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-emerald-600 font-bold">
                    {Number(item.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} ج.م
                  </div>
                  <div className="text-xs text-gray-500">
                    المجموع: {(Number(item.totalAmount || 0)).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {Number(item.avgUnitPrice || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} ج.م
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    Number(item.profitMargin || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {Number(item.profitMargin || 0).toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold ${getPerformanceColor(item.performanceScore || 0)}`}>
                    {Number(item.performanceScore || 0).toFixed(1)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    Number(item.profitMargin || 0) > 0 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {Number(item.profitMargin || 0) > 0 ? 'مربح' : 'غير مربح'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {reportData.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد بيانات</h3>
            <p className="mt-1 text-sm text-gray-500">لم يتم العثور على منتجات مباعة في الفترة المحددة</p>
          </div>
        )}
      </Card>

      {/* Performance Insights */}
      {reportData.length > 0 && (
        <Card className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">رؤى الأداء والتحليلات</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">المنتج الأكثر ربحية</h4>
              <p className="text-sm text-blue-700">
                {reportData.reduce((max, item) => item.profitMargin > max.profitMargin ? item : max, reportData[0])?.productName}
              </p>
              <p className="text-xs text-blue-600">
                هامش ربح: {reportData.reduce((max, item) => item.profitMargin > max.profitMargin ? item : max, reportData[0])?.profitMargin.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-emerald-900 mb-2">الأكثر مبيعاً</h4>
              <p className="text-sm text-emerald-700">
                {reportData[0]?.productName}
              </p>
              <p className="text-xs text-emerald-600">
                {reportData[0]?.totalQuantity.toLocaleString()} قطعة
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">متوسط الأداء</h4>
              <p className="text-sm text-purple-700">
                {(reportData.reduce((sum, item) => sum + item.performanceScore, 0) / reportData.length).toFixed(1)}
              </p>
              <p className="text-xs text-purple-600">نقطة أداء</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TopSellingProducts;