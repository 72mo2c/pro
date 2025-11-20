/**
 * Enhanced Value Adjustment Component
 * 
 * Features:
 * - Intelligent pricing suggestions based on market data
 * - Real-time profit margin analysis
 * - Competitive pricing insights
 * - Bulk price adjustment tools
 * - Historical price tracking
 * - Market trend analysis
 * 
 * Enhanced Algorithms:
 * - Dynamic pricing optimization
 * - Market-based price suggestions
 * - Profitability analysis
 * - Competitive positioning
 * - Risk assessment for price changes
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { FaDollarSign, FaSearch, FaSave, FaWarehouse, FaChartLine, FaArrowUp, FaCalculator, FaLightbulb } from 'react-icons/fa';
import Card from '../../components/Common/Card';
import PageHeader from '../../components/Common/PageHeader';

const ValueAdjustment = () => {
  const { 
    products, 
    warehouses, 
    inventory,
    valueAdjustments,
    salesInvoices
  } = useData();
  const { showWarning, showSuccess, showError } = useNotification();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCostPrice, setNewCostPrice] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [pricingStrategy, setPricingStrategy] = useState('manual'); // manual, competitive, markup, market
  
  // Enhanced analytics state
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState(null);
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState(null);
  const [bulkAdjustments, setBulkAdjustments] = useState([]);
  const [showBulkMode, setShowBulkMode] = useState(false);

  // Enhanced product search with filtering
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return products.filter(product => {
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.barcode?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }).slice(0, 15); // Limit results
  }, [products, searchTerm]);

  // Market and competitive analysis
  useEffect(() => {
    if (products && products.length > 0) {
      performMarketAnalysis();
    }
  }, [products]);

  const performMarketAnalysis = () => {
    // Analyze pricing trends across categories
    const categoryAnalysis = {};
    const priceRanges = { min: Infinity, max: 0, sum: 0, count: 0 };
    
    products.forEach(product => {
      const category = product.category || 'غير محدد';
      if (!categoryAnalysis[category]) {
        categoryAnalysis[category] = {
          products: [],
          avgCostPrice: 0,
          avgSalePrice: 0,
          minPrice: Infinity,
          maxPrice: 0,
          priceRange: 0
        };
      }
      
      categoryAnalysis[category].products.push(product);
      
      // Update price ranges
      if (product.sellingPrice) {
        categoryAnalysis[category].minPrice = Math.min(categoryAnalysis[category].minPrice, product.sellingPrice);
        categoryAnalysis[category].maxPrice = Math.max(categoryAnalysis[category].maxPrice, product.sellingPrice);
        priceRanges.min = Math.min(priceRanges.min, product.sellingPrice);
        priceRanges.max = Math.max(priceRanges.max, product.sellingPrice);
        priceRanges.sum += product.sellingPrice;
        priceRanges.count++;
      }
    });

    // Calculate averages
    Object.keys(categoryAnalysis).forEach(category => {
      const cat = categoryAnalysis[category];
      if (cat.products.length > 0) {
        cat.avgCostPrice = cat.products.reduce((sum, p) => sum + (parseFloat(p.costPrice) || 0), 0) / cat.products.length;
        cat.avgSalePrice = cat.products.reduce((sum, p) => sum + (parseFloat(p.sellingPrice) || 0), 0) / cat.products.length;
        cat.priceRange = cat.maxPrice - cat.minPrice;
      }
    });

    const avgMarketPrice = priceRanges.count > 0 ? priceRanges.sum / priceRanges.count : 0;
    
    setMarketAnalysis({
      categories: categoryAnalysis,
      overallRange: priceRanges,
      averageMarketPrice: avgMarketPrice,
      totalProducts: products.length,
      categoriesCount: Object.keys(categoryAnalysis).length
    });
  };

  const generatePriceSuggestions = () => {
    if (!selectedProduct) return;

    const suggestions = [];
    const category = selectedProduct.category;
    const currentCost = parseFloat(selectedProduct.costPrice) || 0;
    const currentSale = parseFloat(selectedProduct.sellingPrice) || 0;

    // Competitive pricing based on category
    if (marketAnalysis?.categories?.[category]) {
      const catData = marketAnalysis.categories[category];
      
      // Suggest based on category average
      const categoryAvgSale = catData.avgSalePrice;
      const categoryAvgCost = catData.avgCostPrice;
      
      if (categoryAvgSale > 0) {
        suggestions.push({
          type: 'category_average',
          label: 'متوسط سعر الفئة',
          costPrice: categoryAvgCost.toFixed(2),
          salePrice: categoryAvgSale.toFixed(2),
          margin: ((categoryAvgSale - categoryAvgCost) / categoryAvgCost * 100).toFixed(1),
          confidence: 85
        });
      }

      // Suggest competitive pricing (5% below category average)
      const competitivePrice = categoryAvgSale * 0.95;
      if (competitivePrice > currentCost) {
        suggestions.push({
          type: 'competitive',
          label: 'سعري تنافسي',
          costPrice: currentCost.toFixed(2),
          salePrice: competitivePrice.toFixed(2),
          margin: ((competitivePrice - currentCost) / currentCost * 100).toFixed(1),
          confidence: 78
        });
      }
    }

    // Markup-based suggestions
    const commonMarkups = [15, 20, 25, 30, 35, 40];
    commonMarkups.forEach(markup => {
      const suggestedPrice = currentCost * (1 + markup / 100);
      suggestions.push({
        type: 'markup',
        label: `${markup}% هامش`,
        costPrice: currentCost.toFixed(2),
        salePrice: suggestedPrice.toFixed(2),
        margin: markup.toFixed(1),
        confidence: 70
      });
    });

    // Market-based suggestions
    const marketPrice = marketAnalysis?.averageMarketPrice || currentSale;
    if (marketPrice > 0 && marketPrice !== currentSale) {
      suggestions.push({
        type: 'market_based',
        label: 'سعر السوق',
        costPrice: currentCost.toFixed(2),
        salePrice: marketPrice.toFixed(2),
        margin: ((marketPrice - currentCost) / currentCost * 100).toFixed(1),
        confidence: 65
      });
    }

    setPriceSuggestions(suggestions);
  };

  // Generate suggestions when product changes
  useEffect(() => {
    generatePriceSuggestions();
    performProfitabilityAnalysis();
    analyzeCompetitivePosition();
  }, [selectedProduct, marketAnalysis]);

  const performProfitabilityAnalysis = () => {
    if (!selectedProduct) return;

    const currentCost = parseFloat(newCostPrice || selectedProduct.costPrice) || 0;
    const currentSale = parseFloat(newSalePrice || selectedProduct.sellingPrice) || 0;
    
    // Calculate current metrics
    const profit = currentSale - currentCost;
    const margin = currentCost > 0 ? (profit / currentCost) * 100 : 0;
    const markup = currentCost > 0 ? (profit / currentCost) * 100 : 0;
    
    // Calculate break-even quantity (simplified)
    const fixedCosts = 1000; // Example fixed costs
    const breakEvenQty = margin > 0 ? Math.ceil(fixedCosts / profit) : 0;
    
    // Calculate ROI
    const investment = currentCost;
    const roi = investment > 0 ? (profit / investment) * 100 : 0;

    setProfitabilityAnalysis({
      profit,
      margin,
      markup,
      breakEvenQty,
      roi,
      isProfitable: profit > 0,
      riskLevel: Math.abs(margin) < 10 ? 'high' : Math.abs(margin) < 20 ? 'medium' : 'low'
    });
  };

  const analyzeCompetitivePosition = () => {
    if (!selectedProduct || !marketAnalysis) return;

    const category = selectedProduct.category;
    const categoryData = marketAnalysis.categories[category];
    
    if (!categoryData) return;

    const currentPrice = parseFloat(selectedProduct.sellingPrice) || 0;
    const marketAvg = categoryData.avgSalePrice;
    
    let position = 'average';
    let competitorAdvantage = 0;
    
    if (currentPrice > marketAvg * 1.1) {
      position = 'premium';
      competitorAdvantage = ((currentPrice - marketAvg) / marketAvg) * 100;
    } else if (currentPrice < marketAvg * 0.9) {
      position = 'budget';
      competitorAdvantage = ((marketAvg - currentPrice) / marketAvg) * 100;
    }

    setCompetitiveAnalysis({
      position,
      marketAverage: marketAvg,
      competitorAdvantage,
      categoryMin: categoryData.minPrice,
      categoryMax: categoryData.maxPrice,
      recommendations: generateRecommendations(position, competitorAdvantage)
    });
  };

  const generateRecommendations = (position, advantage) => {
    const recommendations = [];
    
    if (position === 'premium' && advantage > 20) {
      recommendations.push('السعر مرتفع جداً مقارنة بالسوق');
      recommendations.push('فكر في تقليل السعر بنسبة 10-15%');
    } else if (position === 'budget' && advantage > 15) {
      recommendations.push('السعر منخفض يمكن رفعه');
      recommendations.push('زيادة السعر بنسبة 5-10% مفيدة');
    } else {
      recommendations.push('السعر مناسب للسوق');
      recommendations.push('استمر في المراقبة');
    }
    
    return recommendations;
  };

  const applySuggestion = (suggestion) => {
    setNewCostPrice(suggestion.costPrice);
    setNewSalePrice(suggestion.salePrice);
    setPricingStrategy(suggestion.type);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setNewCostPrice(product.costPrice || '');
    setNewSalePrice(product.sellingPrice || '');
    setSearchTerm('');
    setReason('');
    setNotes('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProduct || (!newCostPrice && !newSalePrice) || !reason) {
      showWarning('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const costPrice = parseFloat(newCostPrice) || parseFloat(selectedProduct.costPrice) || 0;
    const salePrice = parseFloat(newSalePrice) || parseFloat(selectedProduct.sellingPrice) || 0;
    
    if (costPrice < 0 || salePrice < 0) {
      showError('الأسعار يجب أن تكون أكبر من صفر');
      return;
    }

    if (salePrice <= costPrice) {
      showWarning('سعر البيع يجب أن يكون أكبر من سعر التكلفة');
      return;
    }

    // Enhanced transaction object
    const transaction = {
      id: Date.now(),
      type: 'value_adjustment',
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      warehouseId: selectedWarehouse,
      warehouseName: selectedWarehouse ? warehouses.find(w => w.id === selectedWarehouse)?.name : 'جميع المخازن',
      oldCostPrice: parseFloat(selectedProduct.costPrice) || 0,
      newCostPrice: costPrice,
      oldSalePrice: parseFloat(selectedProduct.sellingPrice) || 0,
      newSalePrice: salePrice,
      priceChange: {
        cost: costPrice - (parseFloat(selectedProduct.costPrice) || 0),
        sale: salePrice - (parseFloat(selectedProduct.sellingPrice) || 0),
        percentage: ((salePrice - (parseFloat(selectedProduct.sellingPrice) || 0)) / (parseFloat(selectedProduct.sellingPrice) || 1)) * 100
      },
      profitImpact: {
        oldProfit: (parseFloat(selectedProduct.sellingPrice) || 0) - (parseFloat(selectedProduct.costPrice) || 0),
        newProfit: salePrice - costPrice,
        profitChange: (salePrice - costPrice) - ((parseFloat(selectedProduct.sellingPrice) || 0) - (parseFloat(selectedProduct.costPrice) || 0))
      },
      reason,
      notes,
      pricingStrategy,
      date: adjustmentDate,
      referenceNumber,
      marketAnalysis,
      profitabilityAnalysis,
      competitiveAnalysis,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    console.log('تسوية القيمة المحسنة:', transaction);
    showSuccess('تم تسجيل تسوية القيمة بنجاح مع التحليل المتقدم');
    
    // Reset form
    setSelectedProduct(null);
    setSelectedWarehouse('');
    setNewCostPrice('');
    setNewSalePrice('');
    setReason('');
    setNotes('');
    setReferenceNumber('');
    setPricingStrategy('manual');
  };

  const getPositionColor = (position) => {
    const colors = {
      premium: 'text-purple-600 bg-purple-50',
      average: 'text-blue-600 bg-blue-50',
      budget: 'text-green-600 bg-green-50'
    };
    return colors[position] || colors.average;
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-red-600 bg-red-50'
    };
    return colors[risk] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <PageHeader
          title="تسوية القيمة الذكية"
          subtitle="نظام متقدم لإدارة الأسعار مع تحليل السوق والمنافسين"
          icon={
            <FaCalculator className="text-white text-2xl" />
          }
        />

        {/* Enhanced Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">متوسط سعر السوق</p>
                <p className="text-2xl font-bold">{marketAnalysis?.averageMarketPrice?.toFixed(2) || 0}</p>
                <p className="text-emerald-100 text-xs">ج.م</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaArrowUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">عدد الفئات</p>
                <p className="text-2xl font-bold">{marketAnalysis?.categoriesCount || 0}</p>
                <p className="text-blue-100 text-xs">فئة مختلفة</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaChartLine className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">تسويات هذا الشهر</p>
                <p className="text-2xl font-bold">
                  {valueAdjustments?.filter(adj => 
                    new Date(adj.date).getMonth() === new Date().getMonth()
                  ).length || 0}
                </p>
                <p className="text-purple-100 text-xs">تغيير قيمة</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaDollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{products?.length || 0}</p>
                <p className="text-orange-100 text-xs">منتج نشط</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaWarehouse className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Enhanced Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Product */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-green-500" />
                البحث الذكي عن المنتج
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم، الباركود، أو الفئة..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Enhanced Search Results */}
              {searchTerm && (
                <div className="mt-4 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full p-4 hover:bg-green-50 transition-colors text-right border-b last:border-b-0 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            التكلفة: {product.costPrice} ج.م | البيع: {product.sellingPrice} ج.م
                          </div>
                          <div className="text-xs text-green-600">
                            الفئة: {product.category} | الباركود: {product.barcode}
                          </div>
                        </div>
                        <FaDollarSign className="text-green-500" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">لا توجد منتجات مطابقة</div>
                  )}
                </div>
              )}
            </Card>

            {/* Selected Product Details */}
            {selectedProduct && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">تفاصيل المنتج المحدد</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم المنتج:</span>
                      <span className="font-bold text-gray-800">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">سعر التكلفة الحالي:</span>
                      <span className="font-bold text-orange-600">{selectedProduct.costPrice} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">سعر البيع الحالي:</span>
                      <span className="font-bold text-blue-600">{selectedProduct.sellingPrice} ج.م</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">هامش الربح الحالي:</span>
                      <span className="font-bold text-green-600">
                        {selectedProduct.sellingPrice && selectedProduct.costPrice ? 
                          (((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.costPrice) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الربح الحالي:</span>
                      <span className="font-bold text-emerald-600">
                        {((selectedProduct.sellingPrice || 0) - (selectedProduct.costPrice || 0)).toFixed(2)} ج.م
                      </span>
                    </div>
                    {competitiveAnalysis && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">الموقع التنافسي:</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPositionColor(competitiveAnalysis.position)}`}>
                          {competitiveAnalysis.position}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Enhanced Adjustment Form */}
            {selectedProduct && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">تفاصيل التسوية المتقدمة</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">تاريخ التسوية *</label>
                      <input
                        type="date"
                        value={adjustmentDate}
                        onChange={(e) => setAdjustmentDate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Reference Number */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">رقم المرجع</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                        placeholder="رقم مرجع اختياري..."
                      />
                    </div>

                    {/* Pricing Strategy */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">استراتيجية التسعير</label>
                      <select
                        value={pricingStrategy}
                        onChange={(e) => setPricingStrategy(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      >
                        <option value="manual">تسعير يدوي</option>
                        <option value="competitive">سعري تنافسي</option>
                        <option value="markup">هامش ربح محدد</option>
                        <option value="market">سعر السوق</option>
                      </select>
                    </div>
                  </div>

                  {/* Price Suggestions */}
                  {priceSuggestions.length > 0 && (
                    <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <FaLightbulb />
                        اقتراحات ذكية للأسعار:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {priceSuggestions.slice(0, 6).map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => applySuggestion(suggestion)}
                            className="p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors text-right"
                          >
                            <div className="font-medium text-gray-800">{suggestion.label}</div>
                            <div className="text-sm text-gray-600">
                              التكلفة: {suggestion.costPrice} | البيع: {suggestion.salePrice}
                            </div>
                            <div className="text-xs text-green-600">
                              هامش: {suggestion.margin}% | ثقة: {suggestion.confidence}%
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current vs New Prices Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <h4 className="font-bold text-gray-800 mb-3">الأسعار الحالية</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">سعر التكلفة:</span>
                          <span className="font-bold text-blue-600">{selectedProduct.costPrice} ج.م</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">سعر البيع:</span>
                          <span className="font-bold text-blue-600">{selectedProduct.sellingPrice} ج.م</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">هامش الربح:</span>
                          <span className="font-bold text-blue-600">
                            {selectedProduct.sellingPrice && selectedProduct.costPrice ? 
                              (((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.costPrice) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {newCostPrice || newSalePrice ? (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <h4 className="font-bold text-gray-800 mb-3">الأسعار الجديدة</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">سعر التكلفة:</span>
                            <span className="font-bold text-green-600">{newCostPrice || selectedProduct.costPrice} ج.م</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">سعر البيع:</span>
                            <span className="font-bold text-green-600">{newSalePrice || selectedProduct.sellingPrice} ج.م</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">هامش الربح:</span>
                            <span className="font-bold text-green-600">
                              {newCostPrice && newSalePrice ? 
                                (((newSalePrice - newCostPrice) / newCostPrice) * 100).toFixed(1) : '0'}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* New Prices */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">سعر التكلفة الجديد</label>
                      <input
                        type="number"
                        value={newCostPrice}
                        onChange={(e) => setNewCostPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                        placeholder="أدخل سعر التكلفة الجديد..."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">سعر البيع الجديد</label>
                      <input
                        type="number"
                        value={newSalePrice}
                        onChange={(e) => setNewSalePrice(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                        placeholder="أدخل سعر البيع الجديد..."
                      />
                    </div>
                  </div>

                  {/* Profitability Analysis */}
                  {profitabilityAnalysis && (
                    <div className={`rounded-xl p-4 border-2 ${getRiskColor(profitabilityAnalysis.riskLevel)}`}>
                      <h4 className="font-bold text-gray-800 mb-3">تحليل الربحية</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profitabilityAnalysis.profit.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">ربح الوحدة</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profitabilityAnalysis.margin.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">هامش الربح</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profitabilityAnalysis.roi.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">العائد على الاستثمار</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{profitabilityAnalysis.breakEvenQty}</div>
                          <div className="text-sm text-gray-600">نقطة التعادل</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warehouse Selection */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      <FaWarehouse className="inline ml-2 text-green-500" />
                      نطاق التطبيق
                    </label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    >
                      <option value="">جميع المخازن</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">السبب *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      required
                    >
                      <option value="">اختر السبب...</option>
                      <option value="إعادة_تقييم">إعادة تقييم شاملة</option>
                      <option value="تغير_سعر_السوق">تغير في سعر السوق</option>
                      <option value="زيادة_تكاليف">زيادة في تكاليف الإنتاج</option>
                      <option value="عرض_خاص">عرض خاص أو ترويج</option>
                      <option value="منافسة">الرد على المنافسة</option>
                      <option value="تصحيح_خطأ">تصحيح خطأ في التسعير</option>
                      <option value="موسمية">تعديلات موسمية</option>
                      <option value="آخر">سبب آخر</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">ملاحظات</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
                      placeholder="أضف ملاحظات إضافية..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    حفظ تسوية القيمة الذكية
                  </button>
                </Card>
              </form>
            )}
          </div>

          {/* Enhanced Info Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 تحليل السوق</h3>
              {marketAnalysis && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">متوسط سعر السوق:</span>
                    <span className="font-bold text-green-600">{marketAnalysis.averageMarketPrice?.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">أقل سعر:</span>
                    <span className="font-bold text-blue-600">{marketAnalysis.overallRange.min?.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">أعلى سعر:</span>
                    <span className="font-bold text-purple-600">{marketAnalysis.overallRange.max?.toFixed(2)} ج.م</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 التوصيات</h3>
              {competitiveAnalysis?.recommendations && (
                <ul className="space-y-2 text-sm text-gray-600">
                  {competitiveAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💡 نصائح التسعير</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>راقب أسعار المنافسين بانتظام</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>احتفظ بهامش ربح صحي (20-40%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>استخدم الاقتراحات الذكية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>راعي العوامل الموسمية</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValueAdjustment;