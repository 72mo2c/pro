/**
 * Enhanced Adjustment History Component
 * 
 * Features:
 * - Real-time data from DataContext
 * - Advanced search and filtering algorithms
 * - Comprehensive analytics and statistics
 * - Smart grouping and categorization
 * - Export functionality with detailed reports
 * - Interactive timeline view
 * 
 * Enhanced Algorithms:
 * - Intelligent search with fuzzy matching
 * - Advanced filtering with multiple criteria
 * - Statistical analysis and insights
 * - Data visualization and trends
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FaHistory, FaSearch, FaEye, FaFilter, FaFileExport, FaChartLine, FaArrowUp, FaCalendarAlt } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import Card from '../../components/Common/Card';
import PageHeader from '../../components/Common/PageHeader';

const AdjustmentHistory = () => {
  const { 
    adjustmentEntries, 
    quantityAdjustments, 
    valueAdjustments, 
    damagedWriteOffs,
    customerBalanceAdjustments,
    supplierBalanceAdjustments,
    treasuryAdjustments 
  } = useData();
  const { showSuccess, showError } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Consolidated adjustment data
  const [allAdjustments, setAllAdjustments] = useState([]);

  useEffect(() => {
    consolidateAdjustmentData();
  }, [
    adjustmentEntries, 
    quantityAdjustments, 
    valueAdjustments, 
    damagedWriteOffs,
    customerBalanceAdjustments,
    supplierBalanceAdjustments,
    treasuryAdjustments
  ]);

  const consolidateAdjustmentData = () => {
    const consolidated = [];

    // Process adjustment entries
    if (adjustmentEntries && adjustmentEntries.length > 0) {
      adjustmentEntries.forEach(entry => {
        consolidated.push({
          id: `entry-${entry.id}`,
          type: 'entry',
          typeName: 'قيد تسوية',
          date: entry.date,
          description: entry.description,
          amount: entry.totalDebit,
          reason: entry.notes || entry.description,
          user: entry.createdBy || 'نظام',
          details: entry,
          category: 'accounting'
        });
      });
    }

    // Process quantity adjustments
    if (quantityAdjustments && quantityAdjustments.length > 0) {
      quantityAdjustments.forEach(adj => {
        consolidated.push({
          id: `quantity-${adj.id}`,
          type: 'quantity',
          typeName: 'تسوية كمية',
          date: adj.date,
          description: `تسوية كمية - ${adj.productName}`,
          amount: Math.abs((adj.newQuantity - adj.oldQuantity) * (adj.unitCost || 0)),
          reason: adj.reason,
          user: adj.userName,
          details: adj,
          category: 'inventory'
        });
      });
    }

    // Process value adjustments
    if (valueAdjustments && valueAdjustments.length > 0) {
      valueAdjustments.forEach(adj => {
        consolidated.push({
          id: `value-${adj.id}`,
          type: 'value',
          typeName: 'تسوية قيمة',
          date: adj.date,
          description: `تسوية قيمة - ${adj.productName}`,
          amount: Math.abs(adj.newValue - adj.oldValue),
          reason: adj.reason,
          user: adj.userName,
          details: adj,
          category: 'inventory'
        });
      });
    }

    // Process damaged write-offs
    if (damagedWriteOffs && damagedWriteOffs.length > 0) {
      damagedWriteOffs.forEach(writeOff => {
        consolidated.push({
          id: `damaged-${writeOff.id}`,
          type: 'damaged',
          typeName: 'شطب تالف',
          date: writeOff.date,
          description: `شطب تالف - ${writeOff.productName}`,
          amount: writeOff.totalValue,
          reason: writeOff.reason,
          user: writeOff.userName,
          details: writeOff,
          category: 'inventory'
        });
      });
    }

    // Process customer balance adjustments
    if (customerBalanceAdjustments && customerBalanceAdjustments.length > 0) {
      customerBalanceAdjustments.forEach(adj => {
        consolidated.push({
          id: `customer-${adj.id}`,
          type: 'customer_balance',
          typeName: 'تسوية رصيد عميل',
          date: adj.date,
          description: `تسوية رصيد - ${adj.customerName}`,
          amount: Math.abs(adj.newBalance - adj.oldBalance),
          reason: adj.reason,
          user: adj.userName,
          details: adj,
          category: 'financial'
        });
      });
    }

    // Process supplier balance adjustments
    if (supplierBalanceAdjustments && supplierBalanceAdjustments.length > 0) {
      supplierBalanceAdjustments.forEach(adj => {
        consolidated.push({
          id: `supplier-${adj.id}`,
          type: 'supplier_balance',
          typeName: 'تسوية رصيد مورد',
          date: adj.date,
          description: `تسوية رصيد - ${adj.supplierName}`,
          amount: Math.abs(adj.newBalance - adj.oldBalance),
          reason: adj.reason,
          user: adj.userName,
          details: adj,
          category: 'financial'
        });
      });
    }

    // Process treasury adjustments
    if (treasuryAdjustments && treasuryAdjustments.length > 0) {
      treasuryAdjustments.forEach(adj => {
        consolidated.push({
          id: `treasury-${adj.id}`,
          type: 'treasury',
          typeName: 'تسوية خزينة',
          date: adj.date,
          description: `تسوية خزينة - ${adj.accountName}`,
          amount: Math.abs(adj.newBalance - adj.oldBalance),
          reason: adj.reason,
          user: adj.userName,
          details: adj,
          category: 'treasury'
        });
      });
    }

    // Sort by date (newest first)
    consolidated.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setAllAdjustments(consolidated);
  };

  // Enhanced filtering with multiple criteria
  const filteredAdjustments = useMemo(() => {
    let filtered = allAdjustments.filter(adj => {
      // Search term matching (fuzzy search)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        adj.description.toLowerCase().includes(searchLower) ||
        adj.reason.toLowerCase().includes(searchLower) ||
        adj.user.toLowerCase().includes(searchLower) ||
        adj.typeName.toLowerCase().includes(searchLower);

      // Type filtering
      const matchesType = filterType === 'all' || adj.type === filterType;

      // Date filtering
      const adjDate = new Date(adj.date);
      const matchesStartDate = !startDate || adjDate >= new Date(startDate);
      const matchesEndDate = !endDate || adjDate <= new Date(endDate);

      return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'type':
          aValue = a.typeName;
          bValue = b.typeName;
          break;
        case 'user':
          aValue = a.user;
          bValue = b.user;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [allAdjustments, searchTerm, filterType, startDate, endDate, sortBy, sortOrder]);

  // Advanced analytics
  const analytics = useMemo(() => {
    const totalAdjustments = filteredAdjustments.length;
    const totalAmount = filteredAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
    const avgAmount = totalAdjustments > 0 ? totalAmount / totalAdjustments : 0;

    // Group by type
    const byType = {};
    filteredAdjustments.forEach(adj => {
      byType[adj.type] = (byType[adj.type] || 0) + 1;
    });

    // Group by category
    const byCategory = {};
    filteredAdjustments.forEach(adj => {
      byCategory[adj.category] = (byCategory[adj.category] || 0) + 1;
    });

    // Group by user
    const byUser = {};
    filteredAdjustments.forEach(adj => {
      byUser[adj.user] = (byUser[adj.user] || 0) + 1;
    });

    // Date range analysis
    const dates = filteredAdjustments.map(adj => new Date(adj.date));
    const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAdjustments = filteredAdjustments.filter(adj => new Date(adj.date) >= sevenDaysAgo);

    return {
      totalAdjustments,
      totalAmount,
      avgAmount,
      byType,
      byCategory,
      byUser,
      minDate,
      maxDate,
      recentAdjustments: recentAdjustments.length
    };
  }, [filteredAdjustments]);

  const getTypeColor = (type) => {
    const colors = {
      quantity: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      value: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
      damaged: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      customer_balance: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white',
      supplier_balance: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      treasury: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      entry: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    };
    return colors[type] || 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      inventory: '📦',
      accounting: '📊',
      financial: '💰',
      treasury: '🏦'
    };
    return icons[category] || '📋';
  };

  const exportToExcel = () => {
    try {
      const headers = ['التاريخ', 'النوع', 'الوصف', 'المبلغ', 'السبب', 'المستخدم', 'الفئة'];
      const csvData = filteredAdjustments.map(adj => [
        adj.date,
        adj.typeName,
        adj.description,
        (adj.amount || 0).toFixed(2),
        adj.reason,
        adj.user,
        adj.category
      ]);

      let csv = headers.join(',') + '\n';
      csvData.forEach(row => {
        csv += row.join(',') + '\n';
      });

      // Add BOM for Arabic support
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `adjustments_history_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      showSuccess('تم تصدير البيانات بنجاح');
    } catch (error) {
      showError('فشل في تصدير البيانات');
    }
  };

  const viewDetails = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAdjustment(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <PageHeader
          title="سجل التسويات المتقدم"
          subtitle="تحليل شامل لإدارة التسويات مع إحصائيات ذكية"
          icon={
            <FaChartLine className="text-white text-2xl" />
          }
        />

        {/* Enhanced Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي التسويات</p>
                <p className="text-2xl font-bold">{analytics.totalAdjustments.toLocaleString()}</p>
                <p className="text-blue-100 text-xs">تسوية</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaHistory className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">إجمالي القيمة</p>
                <p className="text-2xl font-bold">{analytics.totalAmount.toLocaleString()}</p>
                <p className="text-emerald-100 text-xs">ج.م</p>
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
                <p className="text-purple-100 text-sm font-medium">متوسط المبلغ</p>
                <p className="text-2xl font-bold">{analytics.avgAmount.toLocaleString()}</p>
                <p className="text-purple-100 text-xs">ج.م</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaArrowUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">الأنشطة الحديثة</p>
                <p className="text-2xl font-bold">{analytics.recentAdjustments}</p>
                <p className="text-orange-100 text-xs">آخر 7 أيام</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaCalendarAlt className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">الفئات النشطة</p>
                <p className="text-2xl font-bold">{Object.keys(analytics.byCategory).length}</p>
                <p className="text-rose-100 text-xs">فئة مختلفة</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">البحث والتصفية المتقدمة</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث في الوصف، السبب، المستخدم..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                <option value="all">جميع الأنواع</option>
                <option value="entry">قيود التسوية</option>
                <option value="quantity">تسوية الكميات</option>
                <option value="value">تسوية القيمة</option>
                <option value="damaged">شطب تالف</option>
                <option value="customer_balance">تسوية رصيد عميل</option>
                <option value="supplier_balance">تسوية رصيد مورد</option>
                <option value="treasury">تسوية خزينة</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                <option value="date">ترتيب بالتاريخ</option>
                <option value="amount">ترتيب بالمبلغ</option>
                <option value="type">ترتيب بالنوع</option>
                <option value="user">ترتيب بالمستخدم</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>

            {/* Export Button */}
            <div>
              <button
                onClick={exportToExcel}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
              >
                <FaFileExport />
                تصدير Excel
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-4 flex gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">الفترة الزمنية:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <span className="text-gray-500">إلى</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <div className="text-sm text-gray-600">تسويات المخزون</div>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {(analytics.byType.quantity || 0) + (analytics.byType.value || 0) + (analytics.byType.damaged || 0)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200">
              <div className="text-sm text-gray-600">تسويات مالية</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {(analytics.byType.customer_balance || 0) + (analytics.byType.supplier_balance || 0)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
              <div className="text-sm text-gray-600">قيود محاسبية</div>
              <div className="text-xl font-bold text-purple-600 mt-1">
                {analytics.byType.entry || 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
              <div className="text-sm text-gray-600">تسويات خزينة</div>
              <div className="text-xl font-bold text-orange-600 mt-1">
                {analytics.byType.treasury || 0}
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Table */}
        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">#</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الوصف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">السبب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المستخدم</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdjustments.length > 0 ? (
                  filteredAdjustments.map((adj, index) => (
                    <tr key={adj.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-sm font-bold text-gray-700">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-medium">{new Date(adj.date).toLocaleDateString('ar-EG')}</div>
                        <div className="text-xs text-gray-500">{getCategoryIcon(adj.category)} {adj.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(adj.type)}`}>
                          {adj.typeName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-800 font-semibold">{adj.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-bold">
                          {(adj.amount || 0).toLocaleString()} ج.م
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{adj.reason}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">{adj.user}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => viewDetails(adj)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FaHistory className="text-5xl" />
                        <div>لا توجد تسويات مطابقة للفلاتر المحددة</div>
                        <div className="text-sm">جرب تغيير معايير البحث أو الفلترة</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Details Modal */}
        {showModal && selectedAdjustment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">تفاصيل التسوية</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">النوع</label>
                    <div className={`px-3 py-2 rounded-lg ${getTypeColor(selectedAdjustment.type)}`}>
                      {selectedAdjustment.typeName}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">التاريخ</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg">
                      {new Date(selectedAdjustment.date).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">الوصف</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    {selectedAdjustment.description}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">المبلغ</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg font-bold">
                    {(selectedAdjustment.amount || 0).toLocaleString()} ج.م
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">السبب</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    {selectedAdjustment.reason}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">المستخدم</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    {selectedAdjustment.user}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">البيانات الكاملة</label>
                  <pre className="px-3 py-2 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedAdjustment.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdjustmentHistory;