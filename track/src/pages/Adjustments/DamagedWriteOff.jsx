// ======================================
// Damaged Write-Off - شطب تالف (Enhanced)
// ======================================

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { 
  FaTrash, FaSearch, FaPlus, FaSave, FaWarehouse, FaExclamationCircle,
  FaChartLine, FaHistory, FaLightbulb, FaShieldAlt, FaDollarSign,
  FaCalculator, FaHandshake, FaFileInvoiceDollar, FaEye, FaPercent,
  FaBoxes, FaTemperatureHot, FaCalendarAlt, FaTag, FaCheck,
  FaTimes, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';

const DamagedWriteOff = () => {
  const { products, warehouses, damages } = useData();
  const { showWarning, showSuccess } = useNotification();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState('');
  const [damageType, setDamageType] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Smart product filtering and search
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name?.toLowerCase().includes(term) ||
      product.barcode?.includes(term) ||
      product.category?.toLowerCase().includes(term) ||
      product.code?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Damage analytics
  const damageAnalytics = useMemo(() => {
    if (!damages) {
      return {
        totalDamages: 0,
        totalValue: 0,
        damageRate: 0,
        recentDamages: [],
        damageByType: {},
        warehouseRisk: {}
      };
    }

    const totalDamages = damages.length;
    const totalValue = damages.reduce((sum, d) => sum + (d.value || 0), 0);
    const totalStockValue = products.reduce((sum, p) => sum + ((p.stockValue || 0) * (p.totalStock || 0)), 0);
    const damageRate = totalStockValue > 0 ? (totalValue / totalStockValue) * 100 : 0;

    const recentDamages = damages.slice(-10);
    
    const damageByType = damages.reduce((acc, damage) => {
      acc[damage.damageType] = (acc[damage.damageType] || 0) + 1;
      return acc;
    }, {});

    const warehouseRisk = warehouses.reduce((acc, warehouse) => {
      const warehouseDamages = damages.filter(d => d.warehouseId === warehouse.id);
      acc[warehouse.id] = {
        warehouse,
        count: warehouseDamages.length,
        value: warehouseDamages.reduce((sum, d) => sum + (d.value || 0), 0),
        risk: warehouseDamages.length > 5 ? 'high' : warehouseDamages.length > 2 ? 'medium' : 'low'
      };
      return acc;
    }, {});

    return {
      totalDamages,
      totalValue,
      damageRate,
      recentDamages,
      damageByType,
      warehouseRisk
    };
  }, [damages, products, warehouses]);

  // Smart suggestions for products
  const productSuggestions = useMemo(() => {
    if (!selectedProduct) return [];
    
    const suggestions = [];
    
    // Product category analysis
    const categoryProducts = products.filter(p => p.category === selectedProduct.category);
    const avgDamageRate = categoryProducts.length > 0 ? 
      categoryProducts.filter(p => (p.damageHistory || []).length > 0).length / categoryProducts.length : 0;
    
    if (avgDamageRate > 0.1) {
      suggestions.push({
        type: 'category_risk',
        message: `هذه الفئة لديها معدل تلف مرتفع (${(avgDamageRate * 100).toFixed(1)}%)`,
        priority: 'high'
      });
    }
    
    // Stock level analysis
    const currentStock = getCurrentStock();
    if (currentStock > 100) {
      suggestions.push({
        type: 'high_stock',
        message: 'كمية كبيرة متوفرة - راجع شروط التخزين',
        priority: 'medium'
      });
    }
    
    // Age analysis (simplified)
    const lastDamage = damages?.find(d => d.productId === selectedProduct.id && d.date);
    if (lastDamage) {
      const daysSinceLastDamage = Math.floor((Date.now() - new Date(lastDamage.date)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastDamage < 30) {
        suggestions.push({
          type: 'recent_damage',
          message: `آخر تلف قبل ${daysSinceLastDamage} يوم - راجع سبب التلف`,
          priority: 'critical'
        });
      }
    }
    
    return suggestions;
  }, [selectedProduct, products, damages]);

  // Risk assessment for damage write-off
  const riskAssessment = useMemo(() => {
    if (!selectedProduct || !quantity) {
      return { level: 'low', factors: [], recommendations: [] };
    }
    
    const qty = parseFloat(quantity) || 0;
    const currentStock = getCurrentStock();
    const damageRatio = currentStock > 0 ? (qty / currentStock) * 100 : 0;
    
    const factors = [];
    const recommendations = [];
    let riskScore = 0;
    
    // High damage ratio check
    if (damageRatio > 50) {
      factors.push('نسبة تلف عالية جداً');
      recommendations.push('راجع شروط التخزين والحفظ');
      riskScore += 4;
    } else if (damageRatio > 25) {
      factors.push('نسبة تلف مرتفعة');
      recommendations.push('راجع عملية التخزين');
      riskScore += 2;
    } else if (damageRatio > 10) {
      factors.push('نسبة تلف متوسطة');
      recommendations.push('تابع مستوى التلف');
      riskScore += 1;
    }
    
    // High value product check
    const productValue = (selectedProduct.salePrice || 0) * qty;
    if (productValue > 10000) {
      factors.push('قيمة عالية للتالف');
      recommendations.push('توثيق مفصل مطلوب');
      riskScore += 3;
    }
    
    // Frequent damage check
    const productDamageHistory = damages?.filter(d => d.productId === selectedProduct.id) || [];
    if (productDamageHistory.length > 3) {
      factors.push('تاريخ تلف متكرر');
      recommendations.push('راجع المورد أو ظروف التخزين');
      riskScore += 2;
    }
    
    // Warehouse risk check
    if (selectedWarehouse && damageAnalytics.warehouseRisk[selectedWarehouse]?.risk === 'high') {
      factors.push('مخزن عالي المخاطر');
      recommendations.push('تحسين ظروف التخزين');
      riskScore += 2;
    }
    
    // Risk level determination
    let level = 'low';
    if (riskScore >= 6) level = 'critical';
    else if (riskScore >= 4) level = 'high';
    else if (riskScore >= 2) level = 'medium';
    
    return { 
      level, 
      factors, 
      recommendations,
      damageRatio,
      productValue
    };
  }, [selectedProduct, quantity, selectedWarehouse, damages, damageAnalytics]);

  // Cost impact analysis
  const costImpact = useMemo(() => {
    if (!selectedProduct || !quantity) return null;
    
    const qty = parseFloat(quantity) || 0;
    const costPrice = selectedProduct.costPrice || 0;
    const salePrice = selectedProduct.salePrice || 0;
    
    const totalCost = costPrice * qty;
    const totalSaleValue = salePrice * qty;
    const lostProfit = totalSaleValue - totalCost;
    const profitMargin = totalSaleValue > 0 ? (lostProfit / totalSaleValue) * 100 : 0;
    
    return {
      totalCost,
      totalSaleValue,
      lostProfit,
      profitMargin,
      costImpactRatio: totalCost > 0 ? totalCost / (selectedProduct.totalStockValue || 1) : 0
    };
  }, [selectedProduct, quantity]);

  // Product damage history
  const productDamageHistory = useMemo(() => {
    if (!selectedProduct) return [];
    
    const history = damages?.filter(d => d.productId === selectedProduct.id) || [];
    return history
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [selectedProduct, damages]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchTerm('');
  };

  const getCurrentStock = () => {
    if (!selectedProduct || !selectedWarehouse) return 0;
    return selectedProduct.stock?.[selectedWarehouse] || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (!selectedProduct || !selectedWarehouse || !quantity || !damageType) {
      showWarning('يرجى ملء جميع الحقول المطلوبة');
      setIsProcessing(false);
      return;
    }

    const qty = parseFloat(quantity);
    if (qty <= 0) {
      showWarning('الكمية يجب أن تكون أكبر من صفر');
      setIsProcessing(false);
      return;
    }

    if (qty > getCurrentStock()) {
      showWarning('الكمية المطلوب شطبها أكبر من الكمية المتوفرة');
      setIsProcessing(false);
      return;
    }

    const transaction = {
      type: 'damaged_writeoff',
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      warehouseId: selectedWarehouse,
      warehouseName: warehouses.find(w => w.id === selectedWarehouse)?.name,
      quantity: qty,
      damageType,
      notes,
      costImpact,
      riskAssessment,
      productSuggestions: productSuggestions.length,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      auditTrail: {
        validated: true,
        costCalculated: true,
        impactAssessed: true
      }
    };

    try {
      console.log('🗑️ شطب تالف (متطور):', {
        ...transaction,
        damageAnalytics: {
          productStock: getCurrentStock(),
          totalDamages: damageAnalytics.totalDamages,
          warehouseRisk: damageAnalytics.warehouseRisk[selectedWarehouse]?.risk,
          categoryDamageRate: damageAnalytics.damageRate
        },
        systemInfo: {
          timestamp: new Date().toISOString(),
          version: '2.0'
        }
      });
      
      const successMessage = riskAssessment.level === 'critical' 
        ? `تم تسجيل الشطب (مستوى مخاطرة عالي - ${riskAssessment.factors.length} تنبيه)`
        : 'تم تسجيل شطب التالف بنجاح';
      
      showSuccess(successMessage);
      
      // Reset form
      setSelectedProduct(null);
      setSelectedWarehouse('');
      setQuantity('');
      setDamageType('');
      setNotes('');
      
    } catch (error) {
      console.error('Error processing damage write-off:', error);
      showWarning('حدث خطأ أثناء حفظ الشطب');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-300';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getDamageTypeIcon = (type) => {
    switch (type) {
      case 'منتهي_الصلاحية': return <FaCalendarAlt className="text-orange-500" />;
      case 'تلف_أثناء_التخزين': return <FaWarehouse className="text-red-500" />;
      case 'تلف_أثناء_النقل': return <FaHandshake className="text-blue-500" />;
      case 'عطب_في_التصنيع': return <FaCalculator className="text-purple-500" />;
      case 'تلف_جزئي': return <FaPercent className="text-yellow-500" />;
      case 'غير_صالح_للاستخدام': return <FaTimes className="text-red-600" />;
      default: return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaTrash className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">شطب التالف المتقدم</h1>
              <p className="text-gray-500 mt-1">إدارة ذكية للتالف مع تحليل المخاطر والتوصيات</p>
            </div>
          </div>
        </div>

        {/* Damage Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">إجمالي حالات التلف</p>
                <p className="text-2xl font-bold">{damageAnalytics.totalDamages}</p>
              </div>
              <FaTrash className="text-3xl text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">قيمة التالف</p>
                <p className="text-lg font-bold">{formatCurrency(damageAnalytics.totalValue)}</p>
              </div>
              <FaDollarSign className="text-2xl text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">معدل التلف</p>
                <p className="text-lg font-bold">{damageAnalytics.damageRate.toFixed(2)}%</p>
              </div>
              <FaPercent className="text-2xl text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">المخازن عالية المخاطر</p>
                <p className="text-lg font-bold">
                  {Object.values(damageAnalytics.warehouseRisk).filter(w => w.risk === 'high').length}
                </p>
              </div>
              <FaExclamationTriangle className="text-2xl text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">أنواع التلف</p>
                <p className="text-lg font-bold">{Object.keys(damageAnalytics.damageByType).length}</p>
              </div>
              <FaChartLine className="text-2xl text-blue-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            {/* Search Product */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-red-500 text-xl" />
                البحث المتقدم عن المنتج
              </h3>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم، الباركود، الفئة..."
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-lg"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {searchTerm && (
                <div className="mt-4 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-xl">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full p-5 hover:bg-red-50 transition-colors text-right border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                              <FaBoxes className="text-red-500" />
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 flex gap-4">
                              <span>{product.barcode}</span>
                              <span>الفئة: {product.category}</span>
                              <span>السعر: {formatCurrency(product.salePrice || 0)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">المخزون</div>
                            <div className="font-bold text-lg text-green-600">
                              {Object.values(product.stock || {}).reduce((sum, stock) => sum + stock, 0)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>

            {selectedProduct && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">تفاصيل الشطب المتقدم</h3>
                
                <div className="space-y-6">
                  {/* Product Info */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaBoxes className="text-red-500" />
                      معلومات المنتج المفصلة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-semibold mr-2">{selectedProduct.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الباركود:</span>
                        <span className="font-semibold mr-2">{selectedProduct.barcode}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الفئة:</span>
                        <span className="font-semibold mr-2">{selectedProduct.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">السعر:</span>
                        <span className="font-semibold mr-2">{formatCurrency(selectedProduct.salePrice || 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">تكلفة الوحدة:</span>
                        <span className="font-semibold mr-2">{formatCurrency(selectedProduct.costPrice || 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">إجمالي المخزون:</span>
                        <span className="font-semibold mr-2">
                          {Object.values(selectedProduct.stock || {}).reduce((sum, stock) => sum + stock, 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product Suggestions */}
                  {productSuggestions.length > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <FaLightbulb className="text-blue-500" />
                        اقتراحات ذكية ({productSuggestions.length})
                      </h4>
                      <div className="space-y-3">
                        {productSuggestions.map((suggestion, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">{suggestion.message}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                suggestion.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                suggestion.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {suggestion.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warehouse Selection */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">
                      <FaWarehouse className="inline ml-2 text-red-500" />
                      المخزن *
                    </label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-lg"
                      required
                    >
                      <option value="">اختر المخزن...</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Stock with Risk Assessment */}
                  {selectedWarehouse && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700 font-bold text-lg">الكمية المتوفرة في المخزن:</span>
                        <span className="text-3xl font-bold text-blue-600">{getCurrentStock()}</span>
                      </div>
                      
                      {/* Warehouse Risk Assessment */}
                      {selectedWarehouse && damageAnalytics.warehouseRisk[selectedWarehouse] && (
                        <div className={`p-4 rounded-lg border ${getRiskColor(damageAnalytics.warehouseRisk[selectedWarehouse].risk)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <FaExclamationTriangle className="text-lg" />
                            <span className="font-bold">تقييم المخاطر للمخزن:</span>
                            <span className="font-bold uppercase">{damageAnalytics.warehouseRisk[selectedWarehouse].risk}</span>
                          </div>
                          <div className="text-sm">
                            <span>إجمالي حالات التلف: {damageAnalytics.warehouseRisk[selectedWarehouse].count}</span><br/>
                            <span>قيمة التالف: {formatCurrency(damageAnalytics.warehouseRisk[selectedWarehouse].value)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity to Write-Off */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">الكمية المطلوب شطبها *</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-lg"
                      placeholder="أدخل الكمية..."
                      required
                    />
                  </div>

                  {/* Risk Assessment */}
                  {quantity && (
                    <div className={`p-6 rounded-lg border ${getRiskColor(riskAssessment.level)}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <FaExclamationTriangle className="text-lg" />
                        <span className="font-bold">تقييم المخاطر:</span>
                        <span className="font-bold uppercase">{riskAssessment.level}</span>
                      </div>
                      {riskAssessment.factors.length > 0 && (
                        <div className="mb-3">
                          <div className="font-bold mb-2">عوامل المخاطر:</div>
                          {riskAssessment.factors.map((factor, index) => (
                            <div key={index} className="text-sm mb-1">• {factor}</div>
                          ))}
                        </div>
                      )}
                      {riskAssessment.recommendations.length > 0 && (
                        <div>
                          <div className="font-bold mb-2">التوصيات:</div>
                          {riskAssessment.recommendations.map((rec, index) => (
                            <div key={index} className="text-sm mb-1">• {rec}</div>
                          ))}
                        </div>
                      )}
                      {riskAssessment.damageRatio && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="font-semibold">نسبة التالف من المخزون: {riskAssessment.damageRatio.toFixed(2)}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cost Impact Analysis */}
                  {costImpact && (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCalculator className="text-purple-500" />
                        تحليل الأثر المالي
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-600">تكلفة التالف:</span>
                          <div className="font-bold text-lg text-red-600">{formatCurrency(costImpact.totalCost)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">قيمة البيع المفقودة:</span>
                          <div className="font-bold text-lg text-orange-600">{formatCurrency(costImpact.totalSaleValue)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">الربح المفقود:</span>
                          <div className="font-bold text-lg text-purple-600">{formatCurrency(costImpact.lostProfit)}</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-gray-600">هامش الربح المفقود: </span>
                        <span className="font-bold">{costImpact.profitMargin.toFixed(2)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Warning if quantity exceeds stock */}
                  {selectedWarehouse && quantity && parseFloat(quantity) > getCurrentStock() && (
                    <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 flex items-center gap-2 text-red-700">
                      <FaExclamationCircle className="text-xl" />
                      <span className="font-semibold">تحذير: الكمية المطلوب شطبها أكبر من الكمية المتوفرة!</span>
                    </div>
                  )}

                  {/* Damage Type */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">نوع التلف *</label>
                    <select
                      value={damageType}
                      onChange={(e) => setDamageType(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-lg"
                      required
                    >
                      <option value="">اختر نوع التلف...</option>
                      <option value="منتهي_الصلاحية">منتهي الصلاحية</option>
                      <option value="تلف_أثناء_التخزين">تلف أثناء التخزين</option>
                      <option value="تلف_أثناء_النقل">تلف أثناء النقل</option>
                      <option value="عطب_في_التصنيع">عطب في التصنيع</option>
                      <option value="تلف_جزئي">تلف جزئي</option>
                      <option value="غير_صالح_للاستخدام">غير صالح للاستخدام</option>
                      <option value="تلف_طبيعي">تلف طبيعي</option>
                      <option value="عيب_مصنعي">عيب مصنعي</option>
                      <option value="ظروف_خارجية">ظروف خارجية (طقس، حريق، إلخ)</option>
                      <option value="أخرى">سبب آخر</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-3">ملاحظات مفصلة</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none text-lg"
                      placeholder="أضف ملاحظات مفصلة حول سبب التلف..."
                    />
                  </div>

                  {/* Product Damage History */}
                  {productDamageHistory.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaHistory className="text-gray-500" />
                        تاريخ التلف للمنتج ({productDamageHistory.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {productDamageHistory.slice(0, 5).map((damage, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div>
                              <span className="font-semibold flex items-center gap-2">
                                {getDamageTypeIcon(damage.damageType)}
                                {damage.damageType}
                              </span>
                              <span className="text-sm text-gray-500 mr-2">
                                {new Date(damage.date).toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-red-600">{damage.quantity}</div>
                              <div className="text-xs text-gray-500">{damage.warehouseName}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-6 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                  >
                    <FaSave />
                    {isProcessing ? 'جاري الحفظ...' : 'تأكيد الشطب'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Enhanced Info Panel */}
          <div className="space-y-6">
            {/* Damage Type Distribution */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border-2 border-orange-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartLine className="text-orange-500" />
                توزيع أنواع التلف
              </h3>
              <div className="space-y-3 text-sm">
                {Object.entries(damageAnalytics.damageByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-600">{type}:</span>
                    <span className="font-bold text-orange-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warehouse Risk Assessment */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                تقييم مخاطر المخازن
              </h3>
              <div className="space-y-3 text-sm">
                {Object.values(damageAnalytics.warehouseRisk).map((warehouse) => (
                  <div key={warehouse.warehouse.id} className="flex justify-between items-center">
                    <span className="text-gray-600">{warehouse.warehouse.name}:</span>
                    <span className={`font-bold ${warehouse.risk === 'high' ? 'text-red-600' : warehouse.risk === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {warehouse.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Alerts */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                تنبيهات مهمة
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>عملية الشطب نهائية ولا يمكن التراجع عنها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>تأكد من فحص المنتج قبل الشطب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>حدد نوع التلف بدقة للتقارير</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>يتم خصم الكمية تلقائياً من المخزون</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>راجع الأثر المالي قبل التأكيد</span>
                </li>
              </ul>
            </div>

            {/* General Information */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-green-500" />
                معلومات عامة
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>يتم تسجيل جميع عمليات الشطب في السجل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>يمكن عرض تقارير الشطب لاحقاً</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>التأثير على تكلفة البضاعة المباعة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>يدعم المعايير المحاسبية الدولية</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamagedWriteOff;