// ======================================
// Data Context - إدارة بيانات النظام
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateStockWithSmartPurchase } from '../utils/dataContextUpdates.js';

const DataContext = createContext();

// Hook لاستخدام Data Context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // ==================== دوال نظام الشحن (مُعرَّفة مبكراً للاستخدام) ====================
  
  // دالة حساب تكلفة الشحن
  const calculateShipmentCost = (shipmentData) => {
    const { vehicleId, totalWeight = 100, deliveryDays = 1, sameDay = false } = shipmentData;
    
    let baseCost = 50; // تكلفة أساسية
    
    // تكلفة حسب نوع الشاحنة (من البيانات المُخزنة)
    // سيتم حسابها بناءً على vehicleId لاحقاً
    if (vehicleId) {
      // استخدام تكلفة افتراضية للشاحنة
      baseCost = 60;
    }
    
    // تكلفة إضافية للوزن
    const weightCost = totalWeight > 100 ? (totalWeight - 100) * 0.5 : 0;
    
    // تكلفة إضافية للتسليم في نفس اليوم
    const sameDayCost = sameDay ? 25 : 0;
    
    return baseCost + weightCost + sameDayCost;
  };
  
  // ==================== بيانات المخازن ====================
  // بيانات المخازن
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]); // المجموعات الجديدة الهرمية
  
  // بيانات المشتريات
  const [purchases, setPurchases] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  
  // بيانات المبيعات
  const [sales, setSales] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [salesReturns, setSalesReturns] = useState([]);
  
  // بيانات الشركات والموردين
  const [suppliers, setSuppliers] = useState([]);
  
  // بيانات العملاء
  const [customers, setCustomers] = useState([]);
  
  // بيانات الخزينة الشاملة
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [cashReceipts, setCashReceipts] = useState([]); // إيصالات الاستلام النقدي
  const [cashDisbursements, setCashDisbursements] = useState([]); // إيصالات الصرف النقدي
  
  // بيانات التحويلات بين المخازن
  const [transfers, setTransfers] = useState([]);
  
  // بيانات نظام المحاسبة
  const [accounts, setAccounts] = useState([]);  // دليل الحسابات
  const [journalEntries, setJournalEntries] = useState([]);  // القيود اليومية

  // بيانات نظام الموارد البشرية
  const [employees, setEmployees] = useState([]);  // الموظفين
  const [departments, setDepartments] = useState([]);  // الأقسام  
  const [positions, setPositions] = useState([]);  // المناصب
  const [attendance, setAttendance] = useState([]);  // سجلات الحضور
  const [leaveTypes, setLeaveTypes] = useState([]);  // أنواع الإجازات
  const [employeeLeaves, setEmployeeLeaves] = useState([]);  // طلبات الإجازات
  const [employeeLeaveBalances, setEmployeeLeaveBalances] = useState([]);  // أرصدة الإجازات
  const [salaryComponents, setSalaryComponents] = useState([]);  // مكونات الراتب
  const [payrollPeriods, setPayrollPeriods] = useState([]);  // فترات الرواتب
  const [payrollDetails, setPayrollDetails] = useState([]);  // تفاصيل الرواتب
  const [performanceMetrics, setPerformanceMetrics] = useState([]);  // معايير التقييم
  const [performanceReviews, setPerformanceReviews] = useState([]);  // تقييمات الأداء

  // بيانات نظام الإنتاج
  const [productionOrders, setProductionOrders] = useState([]);  // أوامر الإنتاج
  const [bomItems, setBomItems] = useState([]);  // قوائم المواد (BOM)
  const [productionOperations, setProductionOperations] = useState([]);  // عمليات الإنتاج
  const [workCenters, setWorkCenters] = useState([]);  // مراكز العمل/الآلات
  const [productionPlans, setProductionPlans] = useState([]);  // خطط الإنتاج
  const [materialConsumption, setMaterialConsumption] = useState([]);  // استهلاك المواد
  const [productionWaste, setProductionWaste] = useState([]);  // الهدر في الإنتاج
  const [qualityControls, setQualityControls] = useState([]);  // ضوابط الجودة
  const [productionKPIs, setProductionKPIs] = useState([]);  // مؤشرات الأداء الإنتاجية

  // بيانات نظام الأصول الثابتة
  const [fixedAssets, setFixedAssets] = useState([]);  // الأصول الثابتة
  const [assetCategories, setAssetCategories] = useState([]);  // فئات الأصول
  const [assetLocations, setAssetLocations] = useState([]);  // مواقع الأصول
  const [depreciationMethods, setDepreciationMethods] = useState([]);  // طرق الإهلاك
  const [depreciationSchedules, setDepreciationSchedules] = useState([]);  // جداول الإهلاك
  const [depreciationEntries, setDepreciationEntries] = useState([]);  // قيود الإهلاك
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);  // جداول الصيانة
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);  // سجلات الصيانة
  const [maintenanceCosts, setMaintenanceCosts] = useState([]);  // تكاليف الصيانة
  const [assetInventory, setAssetInventory] = useState([]);  // جرد الأصول
  const [assetValuations, setAssetValuations] = useState([]);  // تقييمات الأصول
  const [assetDisposals, setAssetDisposals] = useState([]);  // التصرفات في الأصول
  const [assetTransfers, setAssetTransfers] = useState([]);  // نقل الأصول
  const [assetAcquisitions, setAssetAcquisitions] = useState([]);  // اقتناء الأصول

  // بيانات نظام الشحن والتوصيل
  const [shippingVehicles, setShippingVehicles] = useState([]);  // شاحنات الشحن
  const [shipments, setShipments] = useState([]);  // شحنات التوصيل
  const [shippingRecords, setShippingRecords] = useState([]);  // سجلات الشحن

  // ==================== نظام سلة المهملات ====================
  const [deletedItems, setDeletedItems] = useState([]);  // سجل المحذوفات

  // ==================== نظام تسجيل الأنشطة ====================
  const [dailyActivities, setDailyActivities] = useState([]);  // أنشطة الجلسة/اليوم الحالي
  const [activitiesArchive, setActivitiesArchive] = useState([]);  // أرشيف الأنشطة السابقة
  const [currentSessionDate, setCurrentSessionDate] = useState(new Date().toISOString().split('T')[0]);  // تاريخ الجلسة الحالية

  // تحميل البيانات من LocalStorage
  useEffect(() => {
    loadAllData();
  }, []);

  // دالة أرشفة الأنشطة السابقة (عند بداية يوم جديد)
  const archivePreviousActivities = () => {
    const storedActivities = localStorage.getItem('bero_daily_activities');
    const storedArchive = localStorage.getItem('bero_activities_archive');
    const storedSessionDate = localStorage.getItem('bero_session_date');
    
    if (storedActivities && storedSessionDate) {
      try {
        const activities = JSON.parse(storedActivities);
        if (activities.length > 0) {
          const archiveEntry = {
            id: Date.now(),
            date: storedSessionDate,
            activities: activities,
            archivedAt: new Date().toISOString(),
            totalActivities: activities.length
          };
          
          const currentArchive = storedArchive ? JSON.parse(storedArchive) : [];
          const updatedArchive = [...currentArchive, archiveEntry];
          
          localStorage.setItem('bero_activities_archive', JSON.stringify(updatedArchive));
          localStorage.setItem('bero_daily_activities', JSON.stringify([]));
        }
      } catch (error) {
        console.error('خطأ في أرشفة الأنشطة:', error);
      }
    }
  };

  // تحميل جميع البيانات
  const loadAllData = () => {
    const loadData = (key, setter, defaultValue = []) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setter(JSON.parse(stored));
        } catch (error) {
          console.error(`خطأ في تحميل ${key}:`, error);
          setter(defaultValue);
        }
      }
    };

    loadData('bero_warehouses', setWarehouses);
    loadData('bero_products', setProducts);
    loadData('bero_categories', setCategories);
    loadData('bero_groups', setGroups); // تحميل المجموعات الجديدة
    loadData('bero_purchases', setPurchases);
    loadData('bero_purchase_invoices', setPurchaseInvoices);
    loadData('bero_purchase_returns', setPurchaseReturns);
    loadData('bero_sales', setSales);
    loadData('bero_sales_invoices', setSalesInvoices);
    loadData('bero_sales_returns', setSalesReturns);
    loadData('bero_suppliers', setSuppliers);
    loadData('bero_customers', setCustomers);
    loadData('bero_treasury_balance', setTreasuryBalance, 0);
    loadData('bero_cash_receipts', setCashReceipts);
    loadData('bero_cash_disbursements', setCashDisbursements);
    loadData('bero_transfers', setTransfers);
    loadData('bero_accounts', setAccounts);
    loadData('bero_journal_entries', setJournalEntries);
    
    // تحميل بيانات الموارد البشرية
    loadData('bero_employees', setEmployees);
    loadData('bero_departments', setDepartments);
    loadData('bero_positions', setPositions);
    loadData('bero_attendance', setAttendance);
    loadData('bero_leave_types', setLeaveTypes);
    loadData('bero_employee_leaves', setEmployeeLeaves);
    loadData('bero_employee_leave_balances', setEmployeeLeaveBalances);
    loadData('bero_salary_components', setSalaryComponents);
    loadData('bero_payroll_periods', setPayrollPeriods);
    loadData('bero_payroll_details', setPayrollDetails);
    loadData('bero_performance_metrics', setPerformanceMetrics);
    loadData('bero_performance_reviews', setPerformanceReviews);

    // تحميل بيانات الإنتاج
    loadData('bero_production_orders', setProductionOrders);
    loadData('bero_bom_items', setBomItems);
    loadData('bero_production_operations', setProductionOperations);
    loadData('bero_work_centers', setWorkCenters);
    loadData('bero_production_plans', setProductionPlans);
    loadData('bero_material_consumption', setMaterialConsumption);
    loadData('bero_production_waste', setProductionWaste);
    loadData('bero_quality_controls', setQualityControls);
    loadData('bero_production_kpis', setProductionKPIs);

    // تحميل بيانات الأصول الثابتة
    loadData('bero_fixed_assets', setFixedAssets);
    loadData('bero_asset_categories', setAssetCategories);
    loadData('bero_asset_locations', setAssetLocations);
    loadData('bero_depreciation_methods', setDepreciationMethods);
    loadData('bero_depreciation_schedules', setDepreciationSchedules);
    loadData('bero_depreciation_entries', setDepreciationEntries);
    loadData('bero_maintenance_schedules', setMaintenanceSchedules);
    loadData('bero_maintenance_records', setMaintenanceRecords);
    loadData('bero_maintenance_costs', setMaintenanceCosts);
    loadData('bero_asset_inventory', setAssetInventory);
    loadData('bero_asset_valuations', setAssetValuations);
    loadData('bero_asset_disposals', setAssetDisposals);
    loadData('bero_asset_transfers', setAssetTransfers);
    loadData('bero_asset_acquisitions', setAssetAcquisitions);

    // تحميل بيانات نظام الشحن
    loadData('bero_shipping_vehicles', setShippingVehicles);
    loadData('bero_shipments', setShipments);
    loadData('bero_shipping_records', setShippingRecords);

    // تحميل سلة المهملات
    loadData('bero_deleted_items', setDeletedItems);
    loadData('bero_daily_activities', setDailyActivities);
    loadData('bero_activities_archive', setActivitiesArchive);
    
    // التحقق من تاريخ الجلسة
    const storedSessionDate = localStorage.getItem('bero_session_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (storedSessionDate !== today) {
      // يوم جديد - أرشفة الأنشطة السابقة
      archivePreviousActivities();
      setCurrentSessionDate(today);
      localStorage.setItem('bero_session_date', today);
    } else {
      setCurrentSessionDate(storedSessionDate);
    }

    // إضافة بيانات تجريبية للشاحنات إذا لم تكن موجودة
    if (!localStorage.getItem('bero_shipping_vehicles')) {
      const sampleVehicles = [
        {
          id: 1,
          vehicleType: 'شاحنة كبيرة',
          vehicleNumber: 'أ 1234 ب',
          driver: 'أحمد محمد',
          capacity: '5 طن',
          status: 'متاح',
          currentLocation: 'المخزن الرئيسي',
          phone: '01012345678',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          vehicleType: 'فان',
          vehicleNumber: 'ج 5678 د',
          driver: 'محمد علي',
          capacity: '2 طن',
          status: 'مشغول',
          currentLocation: 'العملاء - المنطقة الشمالية',
          phone: '01087654321',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          vehicleType: 'شاحنة صغيرة',
          vehicleNumber: 'ه 9012 و',
          driver: 'علي أحمد',
          capacity: '3 طن',
          status: 'صيانة',
          currentLocation: 'ورشة الصيانة',
          phone: '01012345679',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setShippingVehicles(sampleVehicles);
      saveData('bero_shipping_vehicles', sampleVehicles);
    }

    // إضافة بيانات تجريبية للشحنات إذا لم تكن موجودة
    if (!localStorage.getItem('bero_shipments')) {
      const sampleShipments = [
        {
          id: 1,
          invoiceId: 1001,
          customerId: 1,
          customerName: 'متجر الكبير للأثاث',
          customerPhone: '01012345678',
          customerAddress: 'شارع النيل - القاهرة',
          pickupAddress: 'المخزن الرئيسي',
          deliveryAddress: 'شارع النيل - القاهرة',
          vehicleId: 1,
          vehicleName: 'شاحنة كبيرة - أ 1234 ب',
          driverName: 'أحمد محمد',
          totalWeight: 500,
          deliveryDays: 1,
          sameDayDelivery: false,
          cost: 100,
          priority: 'عادي',
          specialInstructions: 'التسليم في الطابق الثالث',
          deliveryDate: new Date().toISOString().split('T')[0],
          status: 'awaiting_pickup',
          trackingNumber: 'SHIP-2025001',
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          actualDelivery: null,
          currentLocation: 'المخزن الرئيسي',
          history: [
            {
              status: 'awaiting_pickup',
              location: 'المخزن الرئيسي',
              timestamp: new Date().toISOString(),
              notes: 'تم إنشاء الشحنة'
            }
          ]
        },
        {
          id: 2,
          invoiceId: 1002,
          customerId: 2,
          customerName: 'معرض الزينة الذهبية',
          customerPhone: '01087654321',
          customerAddress: 'شارع التحرير - الجيزة',
          pickupAddress: 'المخزن الرئيسي',
          deliveryAddress: 'شارع التحرير - الجيزة',
          vehicleId: 2,
          vehicleName: 'فان - ج 5678 د',
          driverName: 'محمد علي',
          totalWeight: 200,
          deliveryDays: 2,
          sameDayDelivery: false,
          cost: 60,
          priority: 'سريع',
          specialInstructions: 'حذر من الهشاشة',
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'in_transit',
          trackingNumber: 'SHIP-2025002',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
          actualDelivery: null,
          currentLocation: 'طريق القاهرة - الجيزة',
          history: [
            {
              status: 'awaiting_pickup',
              location: 'المخزن الرئيسي',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              notes: 'تم إنشاء الشحنة'
            },
            {
              status: 'in_transit',
              location: 'تم تحميل الشحنة',
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              notes: 'تم تحميل الشحنة على الشاحنة'
            }
          ]
        }
      ];
      setShipments(sampleShipments);
      saveData('bero_shipments', sampleShipments);
    }
  };

  // حفض البيانات في LocalStorage
  const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  // ==================== دالة تسجيل النشاط ====================
  // دالة مساعدة لتسجيل الأنشطة (يمكن استخدامها من أي دالة)
  const logActivity = (activityType, details, relatedData = {}) => {
    const activity = {
      id: Date.now(),
      type: activityType,
      details: details,
      relatedData: relatedData,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('ar-EG'),
      time: new Date().toLocaleTimeString('ar-EG'),
      sessionDate: currentSessionDate
    };
    
    const updatedActivities = [...dailyActivities, activity];
    setDailyActivities(updatedActivities);
    saveData('bero_daily_activities', updatedActivities);
    
    return activity;
  };

  // ==================== دوال توليد أرقام الفواتير ====================
  
  // دالة للحصول على رقم فاتورة المشتريات التالي
  const getNextPurchaseInvoiceId = () => {
    if (purchaseInvoices.length === 0) return 1;
    const maxId = Math.max(...purchaseInvoices.map(inv => inv.id));
    return maxId + 1;
  };

  // دالة للحصول على رقم فاتورة المبيعات التالي
  const getNextSalesInvoiceId = () => {
    if (salesInvoices.length === 0) return 1;
    const maxId = Math.max(...salesInvoices.map(inv => inv.id));
    return maxId + 1;
  };

  // ==================== دوال المخازن ====================
  
  const addWarehouse = (warehouse) => {
    const newWarehouse = { id: Date.now(), ...warehouse };
    const updated = [...warehouses, newWarehouse];
    setWarehouses(updated);
    saveData('bero_warehouses', updated);
    logActivity('warehouse_add', `إضافة مخزن جديد: ${newWarehouse.name}`, { warehouseId: newWarehouse.id, warehouseName: newWarehouse.name });
    return newWarehouse;
  };

  const updateWarehouse = (id, updatedData) => {
    const warehouse = warehouses.find(w => w.id === id);
    const updated = warehouses.map(w => w.id === id ? { ...w, ...updatedData } : w);
    setWarehouses(updated);
    saveData('bero_warehouses', updated);
    if (warehouse) {
      logActivity('warehouse_edit', `تعديل مخزن: ${warehouse.name}`, { warehouseId: id, warehouseName: warehouse.name });
    }
  };

  const deleteWarehouse = (id) => {
    const warehouse = warehouses.find(w => w.id === id);
    
    // حفظ المخزن في سلة المهملات
    if (warehouse) {
      const deletedItem = {
        id: Date.now(),
        type: 'warehouse',
        data: { ...warehouse },
        deletedAt: new Date().toISOString(),
        deletedBy: 'system'
      };
      const updatedDeleted = [...deletedItems, deletedItem];
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
      
      logActivity('warehouse_delete', `حذف مخزن: ${warehouse.name}`, { warehouseId: id, warehouseName: warehouse.name });
    }
    
    const updated = warehouses.filter(w => w.id !== id);
    setWarehouses(updated);
    saveData('bero_warehouses', updated);
  };

  // ==================== دوال الفئات ====================
  
  const addCategory = (category) => {
    const newCategory = { id: Date.now(), createdAt: new Date().toISOString(), ...category };
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveData('bero_categories', updated);
    logActivity('category_add', `إضافة فئة جديدة: ${newCategory.name}`, { categoryId: newCategory.id, categoryName: newCategory.name });
    return newCategory;
  };

  const updateCategory = (id, updatedData) => {
    const category = categories.find(c => c.id === id);
    const updated = categories.map(c => c.id === id ? { ...c, ...updatedData } : c);
    setCategories(updated);
    saveData('bero_categories', updated);
    if (category) {
      logActivity('category_edit', `تعديل فئة: ${category.name}`, { categoryId: id, categoryName: category.name });
    }
  };

  const deleteCategory = (id) => {
    const category = categories.find(c => c.id === id);
    
    // حفظ الفئة في سلة المهملات
    if (category) {
      const deletedItem = {
        id: Date.now(),
        type: 'category',
        data: { ...category },
        deletedAt: new Date().toISOString(),
        deletedBy: 'system'
      };
      const updatedDeleted = [...deletedItems, deletedItem];
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
      
      logActivity('category_delete', `حذف فئة: ${category.name}`, { categoryId: id, categoryName: category.name });
    }
    
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveData('bero_categories', updated);
  };

  // ==================== دوال المجموعات الجديدة (الهرمية) ====================
  
  const addGroup = (group) => {
    const newGroup = { 
      id: Date.now(), 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...group
    };
    const updated = [...groups, newGroup];
    setGroups(updated);
    saveData('bero_groups', updated);
    logActivity('group_add', `إضافة مجموعة جديدة: ${newGroup.name}`, { groupId: newGroup.id, groupName: newGroup.name });
    return newGroup;
  };

  // دالة البحث عن مجموعة في الهيكل الهرمي
  const findGroupInHierarchy = (groups, targetId) => {
    for (const group of groups) {
      if (group.id === targetId) {
        return group;
      }
      if (group.children && group.children.length > 0) {
        const found = findGroupInHierarchy(group.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // دالة تحديث مجموعة في الهيكل الهرمي
  const updateGroupInHierarchy = (groups, targetId, updatedData) => {
    return groups.map(group => {
      if (group.id === targetId) {
        return {
          ...group,
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
      } else if (group.children && group.children.length > 0) {
        return {
          ...group,
          children: updateGroupInHierarchy(group.children, targetId, updatedData)
        };
      }
      return group;
    });
  };

  const updateGroup = (id, updatedData) => {
    const existingGroup = findGroupInHierarchy(groups, id);
    if (!existingGroup) {
      console.warn(`المجموعة بالمعرف ${id} غير موجودة`);
      return;
    }
    
    const updated = updateGroupInHierarchy(groups, id, updatedData);
    setGroups(updated);
    saveData('bero_groups', updated);
    
    logActivity('group_edit', `تعديل مجموعة: ${existingGroup.name}`, { 
      groupId: id, 
      groupName: existingGroup.name,
      changes: updatedData 
    });
  };

  // دالة حذف مجموعة من الهيكل الهرمي
  const deleteGroupFromHierarchy = (groups, targetId) => {
    return groups.filter(group => {
      if (group.id === targetId) {
        // حذف كامل للمجموعة وجميع مجلداتها الفرعية
        return false;
      }
      return true;
    }).map(group => {
      if (group.children && group.children.length > 0) {
        return {
          ...group,
          children: deleteGroupFromHierarchy(group.children, targetId)
        };
      }
      return group;
    });
  };

  const deleteGroup = (id) => {
    const group = findGroupInHierarchy(groups, id);
    
    if (!group) {
      console.warn(`المجموعة بالمعرف ${id} غير موجودة`);
      return;
    }
    
    // حفظ المجموعة في سلة المهملات
    const deletedItem = {
      id: Date.now(),
      type: 'group',
      data: { ...group },
      deletedAt: new Date().toISOString(),
      deletedBy: 'system'
    };
    const updatedDeleted = [...deletedItems, deletedItem];
    setDeletedItems(updatedDeleted);
    saveData('bero_deleted_items', updatedDeleted);
    
    const updated = deleteGroupFromHierarchy(groups, id);
    setGroups(updated);
    saveData('bero_groups', updated);
    
    logActivity('group_delete', `حذف مجموعة: ${group.name}`, { 
      groupId: id, 
      groupName: group.name,
      deletedWithChildren: group.children && group.children.length > 0 
    });
  };

  // ==================== دوال المنتجات ====================
  
  const addProduct = (product) => {
    const newProduct = { id: Date.now(), ...product };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveData('bero_products', updated);
    
    // تسجيل النشاط
    logActivity('product_add', `إضافة منتج جديد: ${newProduct.name}`, { productId: newProduct.id, productName: newProduct.name });
    
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    const product = products.find(p => p.id === id);
    const updated = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    setProducts(updated);
    saveData('bero_products', updated);
    
    // تسجيل النشاط
    if (product) {
      logActivity('product_edit', `تعديل منتج: ${product.name}`, { productId: id, productName: product.name });
    }
  };

  const deleteProduct = (id) => {
    // حفظ المنتج في سلة المهملات قبل الحذف
    const productToDelete = products.find(p => p.id === id);
    console.log('حذف منتج - المنتج المراد حذفه:', productToDelete);
    
    if (productToDelete) {
      const deletedItem = {
        id: Date.now(),
        type: 'product',
        data: { ...productToDelete },
        deletedAt: new Date().toISOString(),
        deletedBy: 'system'
      };
      const updatedDeleted = [...deletedItems, deletedItem];
      console.log('تم إضافة المنتج لسلة المهملات:', deletedItem);
      console.log('جميع العناصر المحذوفة بعد الإضافة:', updatedDeleted);
      
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
      
      // تسجيل النشاط
      logActivity('product_delete', `حذف منتج: ${productToDelete.name}`, { productId: id, productName: productToDelete.name });
    }
    
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveData('bero_products', updated);
  };

  // ==================== دوال الموردين ====================
  
  const addSupplier = (supplier) => {
    const newSupplier = { 
      id: Date.now(), 
      ...supplier,
      balance: supplier.balance !== undefined ? supplier.balance : 0,
      lastTransactionDate: null,
      lastTransactionType: null
    };
    const updated = [...suppliers, newSupplier];
    setSuppliers(updated);
    saveData('bero_suppliers', updated);
    
    // تسجيل النشاط
    logActivity('supplier_add', `إضافة مورد جديد: ${newSupplier.name}`, { supplierId: newSupplier.id, supplierName: newSupplier.name });
    
    return newSupplier;
  };

  const updateSupplier = (id, updatedData) => {
    const supplier = suppliers.find(s => s.id === id);
    const updated = suppliers.map(s => s.id === id ? { ...s, ...updatedData } : s);
    setSuppliers(updated);
    saveData('bero_suppliers', updated);
    
    // تسجيل النشاط
    if (supplier) {
      logActivity('supplier_edit', `تعديل مورد: ${supplier.name}`, { supplierId: id, supplierName: supplier.name });
    }
  };

  const deleteSupplier = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    
    // حفظ المورد في سلة المهملات
    if (supplier) {
      const deletedItem = {
        id: Date.now(),
        type: 'supplier',
        data: { ...supplier },
        deletedAt: new Date().toISOString(),
        deletedBy: 'system'
      };
      const updatedDeleted = [...deletedItems, deletedItem];
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
      
      logActivity('supplier_delete', `حذف مورد: ${supplier.name}`, { supplierId: id, supplierName: supplier.name });
    }
    
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    saveData('bero_suppliers', updated);
  };

  // ==================== دوال العملاء ====================
  
  const addCustomer = (customer) => {
    const newCustomer = { 
      id: Date.now(), 
      ...customer,
      balance: customer.balance !== undefined ? customer.balance : 0,
      lastTransactionDate: null,
      lastTransactionType: null
    };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    saveData('bero_customers', updated);
    
    // تسجيل النشاط
    logActivity('customer_add', `إضافة عميل جديد: ${newCustomer.name}`, { customerId: newCustomer.id, customerName: newCustomer.name });
    
    return newCustomer;
  };

  const updateCustomer = (id, updatedData) => {
    const customer = customers.find(c => c.id === id);
    const updated = customers.map(c => c.id === id ? { ...c, ...updatedData } : c);
    setCustomers(updated);
    saveData('bero_customers', updated);
    
    // تسجيل النشاط
    if (customer) {
      logActivity('customer_edit', `تعديل عميل: ${customer.name}`, { customerId: id, customerName: customer.name });
    }
  };

  const deleteCustomer = (id) => {
    // حفظ العميل في سلة المهملات قبل الحذف
    const customerToDelete = customers.find(c => c.id === id);
    console.log('حذف عميل - العميل المراد حذفه:', customerToDelete);
    
    if (customerToDelete) {
      const deletedItem = {
        id: Date.now(),
        type: 'customer',
        data: { ...customerToDelete },
        deletedAt: new Date().toISOString(),
        deletedBy: 'system'
      };
      const updatedDeleted = [...deletedItems, deletedItem];
      console.log('تم إضافة العميل لسلة المهملات:', deletedItem);
      console.log('جميع العناصر المحذوفة بعد الإضافة:', updatedDeleted);
      
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
      
      // تسجيل النشاط
      logActivity('customer_delete', `حذف عميل: ${customerToDelete.name}`, { customerId: id, customerName: customerToDelete.name });
    }
    
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveData('bero_customers', updated);
  };

  // ==================== دوال فواتير المشتريات ====================
  
  const addPurchaseInvoice = (invoice) => {
    // إثراء بيانات items بأسماء المنتجات
    const enrichedItems = invoice.items.map(item => {
      const product = products.find(p => p.id === parseInt(item.productId));
      return {
        ...item,
        productName: product?.name || item.productName || 'غير محدد'
      };
    });
    
    const newInvoice = { 
      id: getNextPurchaseInvoiceId(), 
      date: new Date().toISOString(), 
      ...invoice,
      items: enrichedItems,
      supplierId: parseInt(invoice.supplierId), // تحويل إلى رقم
      paid: invoice.paymentType === 'cash' ? invoice.total : 0, // إضافة حقل المدفوع
      remaining: invoice.paymentType === 'cash' ? 0 : invoice.total // إضافة حقل المتبقي
    };
    
    // === الكود الجديد: ربط المشتريات بالخزينة ===
    if (invoice.paymentType === 'cash') {
      // التحقق من الرصيد الكافي
      if (treasuryBalance < invoice.total) {
        throw new Error(`الرصيد المتوفر في الخزينة (${treasuryBalance.toFixed(2)}) غير كافٍ للفاتورة (${invoice.total.toFixed(2)})`);
      }
      
      // خصم من رصيد الخزينة
      const newBalance = treasuryBalance - invoice.total;
      setTreasuryBalance(newBalance);
      saveData('bero_treasury_balance', newBalance);
      
      // تسجيل حركة صرف نقدي
      const disbursementData = {
        amount: invoice.total,
        toType: 'supplier',
        toId: invoice.supplierId,
        description: `شراء نقدي من المورد - فاتورة رقم ${newInvoice.id}`,
        reference: `فاتورة مشتريات ${newInvoice.id}`,
        type: 'purchase_payment'
      };
      
      addCashDisbursement(disbursementData);
    }
    // === نهاية الكود الجديد ===
    
    const updated = [...purchaseInvoices, newInvoice];
    setPurchaseInvoices(updated);
    saveData('bero_purchase_invoices', updated);
    
    // تحديث كميات المنتجات مع المنطق الذكي للمشتريات
    if (invoice.items && Array.isArray(invoice.items)) {
      let updatedProducts = [...products];
      
      invoice.items.forEach(item => {
        // فصل الكميات
        const mainQty = parseInt(item.quantity) || 0;
        const subQty = parseInt(item.subQuantity) || 0;
        
        // التحقق من الكميات السالبة
        if (mainQty < 0 || subQty < 0) {
          const productName = updatedProducts.find(p => p.id === parseInt(item.productId))?.name || 'غير محدد';
          throw new Error(`الكمية لا يمكن أن تكون سالبة للمنتج: ${productName}`);
        }
        
        // استخدام المنطق الذكي للمشتريات
        updatedProducts = updateStockWithSmartPurchase(
          updatedProducts, 
          parseInt(item.productId), 
          { 
            mainPurchase: mainQty, 
            subPurchase: subQty 
          }
        );
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    // ✅ تم إزالة التحديث اليدوي للرصيد - سيتم حسابه تلقائياً من getSupplierBalance()
    
    // تسجيل النشاط
    const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
    logActivity('invoice_purchase_add', `فاتورة مشتريات جديدة #${newInvoice.id} - ${supplier?.name || 'غير محدد'} - ${newInvoice.total.toFixed(2)} ج.م`, { 
      invoiceId: newInvoice.id, 
      supplierId: invoice.supplierId, 
      total: newInvoice.total 
    });
    
    return newInvoice;
  };

  const updatePurchaseInvoice = (invoiceId, updatedData) => {
    // إيجاد الفاتورة القديمة
    const oldInvoice = purchaseInvoices.find(inv => inv.id === invoiceId);
    if (!oldInvoice) {
      throw new Error('الفاتورة غير موجودة');
    }

    // إعادة الكميات القديمة (عكس عملية الشراء القديمة) - فصل الكميات
    if (oldInvoice.items && Array.isArray(oldInvoice.items)) {
      const updatedProducts = [...products];
      
      oldInvoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          // فصل الكميات القديمة
          const oldMainQty = parseInt(item.quantity) || 0;
          const oldSubQty = parseInt(item.subQuantity) || 0;
          
          // إعادة الكميات للمخزون منفردة
          const newMainQty = (updatedProducts[productIndex].mainQuantity || 0) - oldMainQty;
          const newSubQty = (updatedProducts[productIndex].subQuantity || 0) - oldSubQty;
          
          // التحقق من عدم حدوث كميات سالبة
          if (newMainQty < 0 || newSubQty < 0) {
            throw new Error(`لا يمكن تحديث الفاتورة: الكمية المتوفرة غير كافية للمنتج ${updatedProducts[productIndex].name}`);
          }
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: newMainQty,
            subQuantity: newSubQty
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }

    // تحديث الفاتورة
    const updated = purchaseInvoices.map(inv => 
      inv.id === invoiceId ? { ...inv, ...updatedData } : inv
    );
    setPurchaseInvoices(updated);
    saveData('bero_purchase_invoices', updated);

    // إضافة الكميات الجديدة - فصل الكميات
    if (updatedData.items && Array.isArray(updatedData.items)) {
      const updatedProducts = [...products];
      
      updatedData.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          // فصل الكميات الجديدة
          const newMainQty = parseInt(item.quantity) || 0;
          const newSubQty = parseInt(item.subQuantity) || 0;
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: (updatedProducts[productIndex].mainQuantity || 0) + newMainQty,
            subQuantity: (updatedProducts[productIndex].subQuantity || 0) + newSubQty
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    // تسجيل النشاط
    const supplier = suppliers.find(s => s.id === parseInt(updatedData.supplierId || oldInvoice.supplierId));
    logActivity('invoice_purchase_edit', `تعديل فاتورة مشتريات #${invoiceId} - ${supplier?.name || 'غير محدد'}`, { 
      invoiceId: invoiceId,
      supplierId: updatedData.supplierId || oldInvoice.supplierId 
    });
  };

  const deletePurchaseInvoice = (invoiceId) => {
    // إيجاد الفاتورة المراد حذفها
    const invoice = purchaseInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      throw new Error('الفاتورة غير موجودة');
    }
    
    // التحقق من عدم وجود مرتجعات مرتبطة
    const hasReturns = purchaseReturns.some(ret => ret.invoiceId === invoiceId);
    if (hasReturns) {
      throw new Error('لا يمكن حذف الفاتورة: توجد مرتجعات مرتبطة بها');
    }
    
    // ==================== حفظ الفاتورة في سلة المهملات ====================
    const deletedItem = {
      id: Date.now(),
      type: 'invoice',
      invoiceType: 'purchase',
      data: { ...invoice },
      deletedAt: new Date().toISOString(),
      deletedBy: 'system'
    };
    const updatedDeleted = [...deletedItems, deletedItem];
    console.log('حذف فاتورة مشتريات - الفاتورة المراد حذفها:', invoice);
    console.log('تم إضافة الفاتورة لسلة المهملات:', deletedItem);
    console.log('جميع العناصر المحذوفة بعد الإضافة:', updatedDeleted);
    
    setDeletedItems(updatedDeleted);
    saveData('bero_deleted_items', updatedDeleted);
    
    // === الكود الجديد: إرجاع المبلغ للخزينة ===
    if (invoice.paymentType === 'cash') {
      // إرجاع المبلغ للخزينة
      const newBalance = treasuryBalance + invoice.total;
      setTreasuryBalance(newBalance);
      saveData('bero_treasury_balance', newBalance);
      
      // حذف حركة الصرف المرتبطة
      const disbursementToDelete = cashDisbursements.find(d => 
        d.description?.includes(`فاتورة مشتريات ${invoiceId}`)
      );
      if (disbursementToDelete) {
        deleteCashDisbursement(disbursementToDelete.id);
      }
    }
    
    // ✅ تم إزالة التحديث اليدوي للرصيد - سيتم حسابه تلقائياً من getSupplierBalance()
    
    // إعادة الكميات من المخزون (عكس عملية الشراء) مع المنطق الذكي
    if (invoice.items && Array.isArray(invoice.items)) {
      let updatedProducts = [...products];
      
      invoice.items.forEach(item => {
        // فصل الكميات
        const mainQty = parseInt(item.quantity) || 0;
        const subQty = parseInt(item.subQuantity) || 0;
        
        // خصم الكمية من المخزون مع المنطق الذكي
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          const currentProduct = updatedProducts[productIndex];
          const unitsInMain = currentProduct.unitsInMain || 0;
          
          // خصم الكمية الأساسية أولاً
          let newMainQty = (currentProduct.mainQuantity || 0) - mainQty;
          let newSubQty = currentProduct.subQuantity || 0;
          
          // إذا احتاجنا لخصم فرعي من كرتونات
          if (subQty > 0) {
            if (newSubQty >= subQty) {
              newSubQty -= subQty;
            } else {
              // أخذ من الأساسي
              const subShortage = subQty - newSubQty;
              const additionalMainNeeded = Math.ceil(subShortage / unitsInMain);
              
              if (newMainQty >= additionalMainNeeded) {
                newMainQty -= additionalMainNeeded;
                newSubQty = newSubQty + (additionalMainNeeded * unitsInMain) - subQty;
              } else {
                throw new Error(`لا يمكن حذف الفاتورة: سيؤدي ذلك إلى كمية سالبة للمنتج ${currentProduct.name}`);
              }
            }
          }
          
          // التحقق النهائي من عدم حدوث كميات سالبة
          if (newMainQty < 0 || newSubQty < 0) {
            throw new Error(`لا يمكن حذف الفاتورة: سيؤدي ذلك إلى كمية سالبة للمنتج ${currentProduct.name}`);
          }
          
          updatedProducts[productIndex] = {
            ...currentProduct,
            mainQuantity: newMainQty,
            subQuantity: newSubQty,
            updatedAt: new Date().toISOString()
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    // حذف الفاتورة
    const updated = purchaseInvoices.filter(inv => inv.id !== invoiceId);
    setPurchaseInvoices(updated);
    saveData('bero_purchase_invoices', updated);
    
    // تسجيل النشاط
    const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
    logActivity('invoice_delete', `حذف فاتورة مشتريات #${invoiceId} - ${supplier?.name || 'غير محدد'} - ${invoice.total.toFixed(2)} ج.م`, { 
      invoiceId: invoiceId, 
      invoiceType: 'purchase',
      supplierId: invoice.supplierId, 
      total: invoice.total 
    });
  };

  // ==================== دوال مرتجعات المشتريات ====================
  
  const addPurchaseReturn = (returnData) => {
    const { invoiceId, items, reason, notes } = returnData;
    
    // التحقق من وجود الفاتورة
    const invoice = purchaseInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      throw new Error('الفاتورة غير موجودة');
    }
    
    // حساب إجمالي المبلغ المرتجع
    let totalAmount = 0;
    
    // التحقق من الكميات المرتجعة وتحديث المخزون
    const updatedProducts = [...products];
    
    items.forEach(item => {
      // إضافة التحقق من وجود المنتج في النظام
      const product = products.find(p => p.id === parseInt(item.productId));
      if (!product) {
        throw new Error(`المنتج برقم ${item.productId} غير موجود في النظام`);
      }
      
      // البحث عن المنتج في الفاتورة الأصلية
      const originalItem = invoice.items.find(i => i.productId === item.productId);
      if (!originalItem) {
        throw new Error('المنتج غير موجود في الفاتورة الأصلية');
      }
      
      // حساب الكميات المرتجعة مسبقاً (فصل أساسي وفرعي)
      const previousReturns = purchaseReturns.filter(ret => 
        ret.invoiceId === invoiceId && ret.status !== 'cancelled'
      );
      
      let totalReturnedMainQty = 0;
      let totalReturnedSubQty = 0;
      previousReturns.forEach(ret => {
        const retItem = ret.items.find(i => i.productId === item.productId);
        if (retItem) {
          totalReturnedMainQty += (retItem.quantity || 0);
          totalReturnedSubQty += (retItem.subQuantity || 0);
        }
      });
      
      // الكمية المتاحة للإرجاع (فصل أساسي وفرعي)
      const originalMainQty = (originalItem.quantity || 0);
      const originalSubQty = (originalItem.subQuantity || 0);
      const returnMainQty = (item.quantity || 0);
      const returnSubQty = (item.subQuantity || 0);
      
      if (returnMainQty > (originalMainQty - totalReturnedMainQty) || 
          returnSubQty > (originalSubQty - totalReturnedSubQty)) {
        throw new Error(`الكمية المرتجعة تتجاوز الكمية المتاحة للمنتج: ${product.name}`);
      }
      
      // خصم الكميات المرتجعة من المخزون (فصل أساسي وفرعي)
      const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
      if (productIndex !== -1) {
        const newMainQty = (updatedProducts[productIndex].mainQuantity || 0) - returnMainQty;
        const newSubQty = (updatedProducts[productIndex].subQuantity || 0) - returnSubQty;
        
        if (newMainQty < 0 || newSubQty < 0) {
          throw new Error(`الكمية المتوفرة في المخزون غير كافية للمنتج: ${product.name}`);
        }
        
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          mainQuantity: newMainQty,
          subQuantity: newSubQty
        };
      }
      
      // حساب المبلغ المرتجع لهذا العنصر
      const itemAmount = (item.quantity || 0) * (originalItem.price || 0) + 
                        (item.subQuantity || 0) * (originalItem.subPrice || 0);
      totalAmount += itemAmount;
    });
    
    // إنشاء سجل المرتجع
    const newReturn = {
      id: Date.now(),
      invoiceId,
      date: new Date().toISOString(),
      items,
      reason,
      notes,
      totalAmount,
      status: 'completed' // completed, pending, cancelled
    };
    
    // === الكود الجديد: ربط المرتجع بالخزينة ===
    if (invoice.paymentType === 'cash') {
      // إضافة للرصيد
      const newBalance = treasuryBalance + totalAmount;
      setTreasuryBalance(newBalance);
      saveData('bero_treasury_balance', newBalance);
      
      // تسجيل إيصال استلام نقدي
      const receiptData = {
        amount: totalAmount,
        fromType: 'supplier',
        fromId: invoice.supplierId,
        description: `مرتجع مشتريات نقدية - فاتورة رقم ${invoiceId}`,
        reference: `مرتجع مشتريات ${newReturn.id}`,
        type: 'purchase_return'
      };
      
      addCashReceipt(receiptData);
    }
    
    // ✅ تحديث رصيد المورد (تخفيض الدين)
    const supplierId = parseInt(invoice.supplierId);
    const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
    
    if (supplierIndex !== -1) {
      const currentBalance = suppliers[supplierIndex].balance || 0;
      const newBalance = currentBalance - parseFloat(totalAmount);
      
      // ✅ تم إزالة التحديث اليدوي للرصيد - سيتم حسابه تلقائياً من getSupplierBalance()
      console.log(`✅ مرتجع مشتريات: سيتم حساب رصيد المورد تلقائياً`);
    }
    // === نهاية الكود الجديد ===
    
    // حفظ المرتجع
    const updatedReturns = [newReturn, ...purchaseReturns];
    setPurchaseReturns(updatedReturns);
    saveData('bero_purchase_returns', updatedReturns);
    
    // تحديث المخزون
    setProducts(updatedProducts);
    saveData('bero_products', updatedProducts);
    
    // تحديث حالة الفاتورة الأصلية
    const updatedInvoices = purchaseInvoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, hasReturns: true };
      }
      return inv;
    });
    setPurchaseInvoices(updatedInvoices);
    saveData('bero_purchase_invoices', updatedInvoices);
    
    // تسجيل النشاط
    const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
    logActivity('return_purchase_add', `إضافة مرتجع مشتريات #${newReturn.id} - فاتورة #${invoiceId} - ${supplier?.name || 'غير محدد'} - ${totalAmount.toFixed(2)} ج.م`, { 
      returnId: newReturn.id,
      invoiceId: invoiceId,
      supplierId: invoice.supplierId, 
      totalAmount: totalAmount 
    });
    
    return newReturn;
  };
  
  const deletePurchaseReturn = (returnId) => {
    // البحث عن المرتجع
    const returnRecord = purchaseReturns.find(ret => ret.id === returnId);
    if (!returnRecord) {
      throw new Error('المرتجع غير موجود');
    }
    
    // الحصول على الفاتورة الأصلية
    const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
    if (!invoice) {
      throw new Error('الفاتورة الأصلية غير موجودة');
    }
    
    // حفظ المرتجع في سلة المهملات
    const deletedItem = {
      id: Date.now(),
      type: 'purchase_return',
      data: { ...returnRecord },
      deletedAt: new Date().toISOString(),
      deletedBy: 'system'
    };
    const updatedDeleted = [...deletedItems, deletedItem];
    setDeletedItems(updatedDeleted);
    saveData('bero_deleted_items', updatedDeleted);
    
    // === الكود الجديد: خصم المبلغ من الخزينة ===
    if (invoice.paymentType === 'cash') {
      // خصم المبلغ المرتجع من الخزينة
      const newBalance = treasuryBalance - returnRecord.totalAmount;
      if (newBalance < 0) {
        throw new Error('لا يمكن حذف المرتجع: سيؤدي إلى رصيد سالب في الخزينة');
      }
      
      setTreasuryBalance(newBalance);
      saveData('bero_treasury_balance', newBalance);
      
      // حذف إيصال الاستلام المرتبط
      const receiptToDelete = cashReceipts.find(r => 
        r.description?.includes(`مرتجع مشتريات ${returnId}`)
      );
      if (receiptToDelete) {
        deleteCashReceipt(receiptToDelete.id);
      }
    }
    
    // ✅ تم إزالة التحديث اليدوي للرصيد - سيتم حسابه تلقائياً من getSupplierBalance()
    
    // إعادة الكميات المرتجعة للمخزون (فصل أساسي وفرعي)
    const updatedProducts = [...products];
    
    returnRecord.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
      if (productIndex !== -1) {
        const returnMainQty = (item.quantity || 0);
        const returnSubQty = (item.subQuantity || 0);
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          mainQuantity: (updatedProducts[productIndex].mainQuantity || 0) + returnMainQty,
          subQuantity: (updatedProducts[productIndex].subQuantity || 0) + returnSubQty
        };
      }
    });
    
    setProducts(updatedProducts);
    saveData('bero_products', updatedProducts);
    
    // حذف المرتجع
    const updated = purchaseReturns.filter(ret => ret.id !== returnId);
    setPurchaseReturns(updated);
    saveData('bero_purchase_returns', updated);
    
    // تسجيل النشاط
    const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
    logActivity('return_purchase_delete', `حذف مرتجع مشتريات #${returnId} - فاتورة #${returnRecord.invoiceId} - ${supplier?.name || 'غير محدد'}`, { 
      returnId: returnId,
      invoiceId: returnRecord.invoiceId 
    });
  };

  // ==================== دوال فواتير المبيعات ====================
  
  const addSalesInvoice = (invoice) => {
    // التحقق من توفر الكميات قبل البيع (القواعد الذكية)
    if (invoice.items && Array.isArray(invoice.items)) {
      for (const item of invoice.items) {
        const product = products.find(p => p.id === parseInt(item.productId));
        if (!product) {
          throw new Error(`المنتج غير موجود`);
        }
        
        // فصل الكميات (يدعم mainQuantity و quantity)
        const mainQty = parseInt(item.mainQuantity || item.quantity) || 0;
        const subQty = parseInt(item.subQuantity) || 0;
        const availableMainQty = product.mainQuantity || 0;
        const availableSubQty = product.subQuantity || 0;
        const unitsInMain = product.unitsInMain || 0;
        
        // القاعدة الذكية 1: منع طلب فرعية أكثر من العدد المسموح
        const maxAllowedSubUnits = availableMainQty * unitsInMain;
        if (subQty > maxAllowedSubUnits) {
          throw new Error(
            `لا يمكن طلب ${subQty} قطعة فرعية من "${product.name}". ` +
            `الحد الأقصى المسموح: ${maxAllowedSubUnits} قطعة (${availableMainQty} وحدة أساسية × ${unitsInMain} قطعة/وحدة)`
          );
        }
        
        // القاعدة الذكية 2: المنطق الذكي للتحقق من توفر المخزون
        let requiredSubQty = 0;
        if (mainQty > 0) {
          // تحويل الكمية المباعة من أساسي إلى فرعي
          const mainToSub = mainQty * unitsInMain;
          requiredSubQty = subQty + mainToSub;
        } else {
          requiredSubQty = subQty;
        }
        
        // حساب الكمية الإجمالية بالوحدات الفرعية
        const totalAvailableSub = (availableMainQty * unitsInMain) + availableSubQty;
        
        if (requiredSubQty > totalAvailableSub) {
          throw new Error(
            `الكمية المطلوبة من "${product.name}" غير متوفرة.\n` +
            `إجمالي المتوفر: ${totalAvailableSub} قطعة، المطلوب: ${requiredSubQty} قطعة`
          );
        }
      }
    }
    
    // إثراء بيانات items بأسماء المنتجات
    const enrichedItems = invoice.items.map(item => {
      const product = products.find(p => p.id === parseInt(item.productId));
      return {
        ...item,
        productName: product?.name || item.productName || 'غير محدد'
      };
    });
    
    const newInvoice = { 
      id: getNextSalesInvoiceId(), 
      date: new Date().toISOString(), 
      ...invoice,
      items: enrichedItems,
      customerId: parseInt(invoice.customerId) // تحويل إلى رقم
    };

    // ==================== إضافة: إنشاء سجل الشحن إذا تم اختيار شاحنة ====================
    
    // إذا تم اختيار شاحنة للفاتورة، قم بإنشاء سجل شحن
    let shippingRecord = null;
    if (invoice.selectedVehicle && invoice.selectedVehicle !== '') {
      try {
        // الحصول على بيانات العميل والشاحنة
        const customer = customers.find(c => c.id === parseInt(invoice.customerId));
        const vehicle = shippingVehicles.find(v => v.id === invoice.selectedVehicle);
        
        if (customer && vehicle) {
          // حساب تكلفة الشحن
          const weight = invoice.totalWeight || 100;
          let shipmentCost = 50; // تكلفة أساسية
          
          // تكلفة حسب نوع الشاحنة
          if (vehicle.vehicleType === 'شاحنة كبيرة') shipmentCost = 100;
          else if (vehicle.vehicleType === 'فان') shipmentCost = 60;
          
          // تكلفة إضافية للوزن
          const weightCost = weight > 100 ? (weight - 100) * 0.5 : 0;
          
          // تكلفة إضافية للتسليم في نفس اليوم
          const sameDayCost = invoice.sameDayDelivery ? 25 : 0;
          
          const totalCost = shipmentCost + weightCost + sameDayCost;
          
          // إنشاء سجل الشحن
          const shipmentData = {
            invoiceId: newInvoice.id,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone || '',
            customerAddress: customer.address || '',
            pickupAddress: 'المخزن الرئيسي',
            deliveryAddress: customer.address || '',
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            driverName: vehicle.driver,
            totalWeight: invoice.totalWeight || 100,
            deliveryDays: 1,
            sameDayDelivery: invoice.sameDayDelivery || false,
            cost: totalCost,
            priority: 'عادي', // عادي، سريع، طارئ
            specialInstructions: invoice.shippingNotes || '',
            deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
          
          // استخدام دالة إضافة الشحنة
          const newShipment = {
            id: Date.now(),
            ...shipmentData,
            status: 'awaiting_pickup',
            trackingNumber: `SHIP-${Date.now()}`,
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            actualDelivery: null,
            currentLocation: 'المخزن الرئيسي',
            history: [
              {
                status: 'awaiting_pickup',
                location: 'المخزن الرئيسي',
                timestamp: new Date().toISOString(),
                notes: 'تم إنشاء الشحنة'
              }
            ]
          };
          
          const updatedShipments = [...shipments, newShipment];
          setShipments(updatedShipments);
          saveData('bero_shipments', updatedShipments);
          shippingRecord = newShipment;
          
          console.log('✅ تم إنشاء سجل الشحن:', shippingRecord);
        }
      } catch (shippingError) {
        console.error('⚠️ خطأ في إنشاء سجل الشحن:', shippingError);
        // لا تفشل العملية بسبب فشل إنشاء الشحن
      }
    }
    
    // ==================== نهاية إضافة الشحن ====================
    
    const updated = [...salesInvoices, newInvoice];
    
    // تحديث كميات المنتجات (الذكي - يحول من أساسي عند الحاجة)
    if (invoice.items && Array.isArray(invoice.items)) {
      const updatedProducts = [...products];
      
      invoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          const product = updatedProducts[productIndex];
          const { mainQuantity = 0, subQuantity = 0, unitsInMain = 0 } = product;
          const mainSale = parseInt(item.mainQuantity || item.quantity) || 0; // الكمية الأساسية المباعة
          const subSale = parseInt(item.subQuantity) || 0; // الكمية الفرعية المباعة
          
          console.log(`📋 منتج: ${product.name}`);
          console.log(`📦 المتوفر: ${mainQuantity} أساسي + ${subQuantity} فرعي (${unitsInMain} في الوحدة)`);
          console.log(`🛒 المطلوب: ${mainSale} أساسي + ${subSale} فرعي`);
          
          let newMainQuantity = mainQuantity;
          let newSubQuantity = subQuantity;
          
          // تطبيق المنطق الذكي للخصم المحسن
          if (mainSale > 0 && subSale > 0) {
            // بيع أساسي وفرعي معاً - مع معالجة مبسطة
            console.log(`🔄 معالجة بيع أساسي وفرعي معاً...`);
            
            // إجمالي المطلوب والمتوفر بالوحدات الفرعية
            const totalSubRequired = (mainSale * unitsInMain) + subSale;
            const totalAvailableSubUnits = (mainQuantity * unitsInMain) + subQuantity;
            
            console.log(`📊 إجمالي المطلوب: ${totalSubRequired} فرعية (${mainSale}×${unitsInMain} + ${subSale})`);
            console.log(`📊 إجمالي متوفر: ${totalAvailableSubUnits} فرعية (${mainQuantity}×${unitsInMain} + ${subQuantity})`);
            
            if (totalSubRequired > totalAvailableSubUnits) {
              console.log(`❌ فشل: المطلوب (${totalSubRequired}) > متوفر (${totalAvailableSubUnits})`);
              throw new Error(
                `الكمية غير كافية في المخزون للمنتج "${product.name}"`
              );
            }
            
            // الكمية كافية - حساب المتبقي
            const totalRemainingSubUnits = totalAvailableSubUnits - totalSubRequired;
            newMainQuantity = Math.floor(totalRemainingSubUnits / unitsInMain);
            newSubQuantity = totalRemainingSubUnits % unitsInMain;
            
            console.log(`✅ تم خصم الكمية بنجاح. المتبقي: ${newMainQuantity} أساسي + ${newSubQuantity} فرعي`);
          } else if (mainSale > 0 && subSale === 0) {
            // بيع أساسي فقط
            newMainQuantity = Math.max(0, mainQuantity - mainSale);
            newSubQuantity = subQuantity; // لا تغيير في الفرعي
          } else if (mainSale === 0 && subSale > 0) {
            // بيع فرعي فقط - معالجة مبسطة
            console.log(`🔄 معالجة بيع فرعي فقط...`);
            
            const totalAvailableSubUnits = (mainQuantity * unitsInMain) + subQuantity;
            
            console.log(`📊 إجمالي المطلوب: ${subSale} فرعية`);
            console.log(`📊 إجمالي متوفر: ${totalAvailableSubUnits} فرعية`);
            
            if (subSale > totalAvailableSubUnits) {
              console.log(`❌ فشل: المطلوب (${subSale}) > متوفر (${totalAvailableSubUnits})`);
              throw new Error(
                `الكمية غير كافية في المخزون للمنتج "${product.name}"`
              );
            }
            
            // حساب المتبقي
            const totalRemainingSubUnits = totalAvailableSubUnits - subSale;
            newMainQuantity = Math.floor(totalRemainingSubUnits / unitsInMain);
            newSubQuantity = totalRemainingSubUnits % unitsInMain;
            
            console.log(`✅ تم خصم الفرعية بنجاح. المتبقي: ${newMainQuantity} أساسي + ${newSubQuantity} فرعي`);
          }
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: newMainQuantity,
            subQuantity: newSubQuantity
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    // ==================== إضافة: التكامل المالي الكامل ====================
    
    // 1. تسجيل Cash Receipt للدفع النقدي
    if (invoice.paymentType === 'cash') {
      const receiptData = {
        amount: newInvoice.total,
        fromType: 'customer',
        fromId: newInvoice.customerId,
        description: `مبيعات نقدية - فاتورة رقم ${newInvoice.id}`,
        reference: `فاتورة مبيعات ${newInvoice.id}`,
        type: 'sales_payment'
      };
      
      try {
        const receipt = addCashReceipt(receiptData);
        console.log('تم تسجيل إيصال استلام نقدي:', receipt);
      } catch (error) {
        console.error('خطأ في تسجيل الإيصال النقدي:', error);
        // يجب أن تفشل العملية إذا فشل تسجيل الإيصال
        throw new Error(`فشل في تسجيل المعاملة المالية: ${error.message}`);
      }
    }
    
    // 2. تسجيل دين العميل للدفع الآجل والجزئي
    if (invoice.paymentType === 'deferred' || invoice.paymentType === 'partial') {
      // ✅ تحديث رصيد العميل مباشرة
      const customerId = parseInt(invoice.customerId);
      const customerIndex = customers.findIndex(c => c.id === customerId);
      
      // ✅ تم إزالة التحديث اليدوي للرصيد - سيتم حسابه تلقائياً من getCustomerBalance()
      console.log(`✅ فاتورة آجلة: سيتم حساب الرصيد تلقائياً`);
    }
    
    // تحديث حالة الفاتورة
    const invoiceWithStatus = {
      ...newInvoice,
      paymentStatus: invoice.paymentType === 'cash' ? 'paid' : 'pending',
      paid: invoice.paymentType === 'cash' ? newInvoice.total : 0,
      remaining: invoice.paymentType === 'cash' ? 0 : newInvoice.total
    };
    
    // تحديث قاعدة البيانات
    const updatedInvoices = [...salesInvoices, invoiceWithStatus];
    setSalesInvoices(updatedInvoices);
    saveData('bero_sales_invoices', updatedInvoices);
    
    // تسجيل النشاط
    const customer = customers.find(c => c.id === parseInt(invoice.customerId));
    logActivity('invoice_sales_add', `فاتورة مبيعات جديدة #${invoiceWithStatus.id} - ${customer?.name || 'غير محدد'} - ${invoiceWithStatus.total.toFixed(2)} ج.م`, { 
      invoiceId: invoiceWithStatus.id, 
      customerId: invoice.customerId, 
      total: invoiceWithStatus.total 
    });
    
    return invoiceWithStatus;
  };
  
  const deleteSalesInvoice = (invoiceId) => {
    // إيجاد الفاتورة المراد حذفها
    const invoice = salesInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      throw new Error('الفاتورة غير موجودة');
    }
    
    // التحقق من عدم وجود مرتجعات مرتبطة
    const hasReturns = salesReturns.some(ret => ret.invoiceId === invoiceId);
    if (hasReturns) {
      throw new Error('لا يمكن حذف الفاتورة: توجد مرتجعات مرتبطة بها');
    }
    
    // ==================== حفظ الفاتورة في سلة المهملات ====================
    const deletedItem = {
      id: Date.now(),
      type: 'invoice',
      invoiceType: 'sales',
      data: { ...invoice },
      deletedAt: new Date().toISOString(),
      deletedBy: 'system'
    };
    const updatedDeleted = [...deletedItems, deletedItem];
    console.log('حذف فاتورة مبيعات - الفاتورة المراد حذفها:', invoice);
    console.log('تم إضافة الفاتورة لسلة المهملات:', deletedItem);
    console.log('جميع العناصر المحذوفة بعد الإضافة:', updatedDeleted);
    
    setDeletedItems(updatedDeleted);
    saveData('bero_deleted_items', updatedDeleted);
    
    // ==================== إضافة: عكس المعاملات المالية ====================
    
    // 1. عكس تسجيل Cash Receipt للدفع النقدي
    if (invoice.paymentType === 'cash') {
      // البحث عن الإيصال المرتبط مع تحسين منطق البحث
      const invoiceIdStr = invoiceId.toString();
      const customerIdNum = parseInt(invoice.customerId);
      
      console.log('البحث عن الإيصال المرتبط للفاتورة:', {
        invoiceId: invoiceId,
        invoiceIdStr: invoiceIdStr,
        customerId: invoice.customerId,
        customerIdNum: customerIdNum,
        paymentType: invoice.paymentType
      });
      
      // البحث المحسن: البحث عن جميع الإيصالات المتعلقة بهذا العميل
      const possibleReceipts = cashReceipts.filter(r => 
        r.fromType === 'customer' && 
        r.type === 'sales_payment' &&
        (r.fromId === customerIdNum || r.fromId === invoice.customerId)
      );
      
      console.log('الإيصالات المحتملة:', possibleReceipts);
      
      // البحث عن الإيصال المحدد للفاتورة
      const relatedReceipt = possibleReceipts.find(r => 
        r.reference === `فاتورة مبيعات ${invoiceIdStr}` ||
        r.reference === `فاتورة مبيعات ${invoiceId}` ||
        r.description.includes(`فاتورة رقم ${invoiceIdStr}`) ||
        r.description.includes(`فاتورة رقم ${invoiceId}`)
      );
      
      console.log('الإيصال المرتبط الموجود:', relatedReceipt);
      
      if (relatedReceipt) {
        try {
          console.log('حذف الإيصال المرتبط:', relatedReceipt.id);
          
          // حذف الإيصال
          const updatedReceipts = cashReceipts.filter(r => r.id !== relatedReceipt.id);
          setCashReceipts(updatedReceipts);
          saveData('bero_cash_receipts', updatedReceipts);
          
          // خصم من رصيد الخزينة
          const receiptAmount = parseFloat(relatedReceipt.amount) || 0;
          const newBalance = treasuryBalance - receiptAmount;
          setTreasuryBalance(newBalance);
          saveData('bero_treasury_balance', newBalance);
          
          console.log('✅ تم حذف الإيصال المرتبط وعكس المبلغ من الخزينة:', {
            receiptId: relatedReceipt.id,
            amount: receiptAmount,
            oldBalance: treasuryBalance,
            newBalance: newBalance
          });
        } catch (error) {
          console.error('خطأ في حذف الإيصال المرتبط:', error);
          throw new Error(`فشل في حذف المعاملة المالية: ${error.message}`);
        }
      } else {
        console.warn('⚠️ لم يتم العثور على إيصال مرتبط للفاتورة:', invoiceId);
      }
    }
    
    // 2. عكس دين العميل للدفع الآجل والجزئي
    if (invoice.paymentType === 'deferred' || invoice.paymentType === 'partial') {
      // سيتم تحديث رصيد العميل تلقائياً بعد حذف الفاتورة
    }
    
    // ==================== إضافة: حذف سجل الشحن المرتبط ====================
    
    // حذف سجل الشحن المرتبط بالفاتورة
    if (invoice.selectedVehicle && invoice.selectedVehicle !== '') {
      try {
        const relatedShipments = shipments.filter(shipment => shipment.invoiceId === invoiceId);
        
        relatedShipments.forEach(shipment => {
          // تحديث حالة الشاحنة إلى متاح
          if (shipment.vehicleId) {
            const updatedVehicles = shippingVehicles.map(v => 
              v.id === shipment.vehicleId ? { ...v, status: 'متاح', updatedAt: new Date().toISOString() } : v
            );
            setShippingVehicles(updatedVehicles);
            saveData('bero_shipping_vehicles', updatedVehicles);
          }
          
          console.log('🗑️ حذف سجل الشحن المرتبط:', shipment.id, shipment.trackingNumber);
        });
        
        // حذف الشحنات المرتبطة
        const updatedShipments = shipments.filter(shipment => shipment.invoiceId !== invoiceId);
        setShipments(updatedShipments);
        saveData('bero_shipments', updatedShipments);
        
        console.log('✅ تم حذف جميع سجلات الشحن المرتبطة بالفاتورة');
      } catch (shippingError) {
        console.error('⚠️ خطأ في حذف سجل الشحن:', shippingError);
        // لا تفشل العملية بسبب فشل حذف الشحن
      }
    }
    
    // ==================== نهاية إضافة حذف الشحن ====================
    
    // إعادة الكميات إلى المخزون (عكس عملية البيع) - فصل الكميات
    if (invoice.items && Array.isArray(invoice.items)) {
      const updatedProducts = [...products];
      
      invoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          // فصل الكميات
          const mainQty = parseInt(item.quantity) || 0;
          const subQty = parseInt(item.subQuantity) || 0;
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: (updatedProducts[productIndex].mainQuantity || 0) + mainQty,
            subQuantity: (updatedProducts[productIndex].subQuantity || 0) + subQty
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    // حذف الفاتورة
    const updated = salesInvoices.filter(inv => inv.id !== invoiceId);
    setSalesInvoices(updated);
    saveData('bero_sales_invoices', updated);
    
    // تسجيل النشاط
    const customer = customers.find(c => c.id === parseInt(invoice.customerId));
    logActivity('invoice_delete', `حذف فاتورة مبيعات #${invoiceId} - ${customer?.name || 'غير محدد'} - ${invoice.total.toFixed(2)} ج.م`, { 
      invoiceId: invoiceId, 
      invoiceType: 'sales',
      customerId: invoice.customerId, 
      total: invoice.total 
    });
  };

  // ==================== دوال مرتجعات المبيعات ====================
  
  const addSalesReturn = (returnData) => {
    const { invoiceId, items, reason, notes } = returnData;
    
    // التحقق من وجود الفاتورة
    const invoice = salesInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      throw new Error('الفاتورة غير موجودة');
    }
    
    // حساب إجمالي المبلغ المرتجع
    let totalAmount = 0;
    
    // التحقق من الكميات المرتجعة وتحديث المخزون
    const updatedProducts = [...products];
    
    items.forEach(item => {
      // البحث عن المنتج في الفاتورة الأصلية
      const originalItem = invoice.items.find(i => i.productId === item.productId);
      if (!originalItem) {
        throw new Error('المنتج غير موجود في الفاتورة الأصلية');
      }
      
      // حساب الكميات المرتجعة مسبقاً (فصل أساسي وفرعي)
      const previousReturns = salesReturns.filter(ret => 
        ret.invoiceId === invoiceId && ret.status !== 'cancelled'
      );
      
      let totalReturnedMainQty = 0;
      let totalReturnedSubQty = 0;
      previousReturns.forEach(ret => {
        const retItem = ret.items.find(i => i.productId === item.productId);
        if (retItem) {
          totalReturnedMainQty += (retItem.quantity || 0);
          totalReturnedSubQty += (retItem.subQuantity || 0);
        }
      });
      
      // الكمية المتاحة للإرجاع (فصل أساسي وفرعي)
      const originalMainQty = parseInt(originalItem.quantity) || 0;
      const originalSubQty = parseInt(originalItem.subQuantity) || 0;
      const returnMainQty = (item.quantity || 0);
      const returnSubQty = (item.subQuantity || 0);
      
      if (returnMainQty > (originalMainQty - totalReturnedMainQty) || 
          returnSubQty > (originalSubQty - totalReturnedSubQty)) {
        throw new Error(`الكمية المرتجعة تتجاوز الكمية المتاحة للمنتج`);
      }
      
      // إضافة الكميات المرتجعة للمخزون (عكس البيع) - فصل أساسي وفرعي
      const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
      if (productIndex !== -1) {
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          mainQuantity: (updatedProducts[productIndex].mainQuantity || 0) + returnMainQty,
          subQuantity: (updatedProducts[productIndex].subQuantity || 0) + returnSubQty
        };
      }
      
      // حساب المبلغ المرتجع
      const itemAmount = (returnMainQty * (originalItem.price || 0)) + 
                        (returnSubQty * (originalItem.subPrice || 0));
      totalAmount += itemAmount;
    });
    
    // إنشاء سجل المرتجع
    const newReturn = {
      id: Date.now(),
      invoiceId,
      date: new Date().toISOString(),
      items,
      reason,
      notes,
      totalAmount,
      status: 'completed' // completed, pending, cancelled
    };
    
    // ==================== إضافة: معالجة المعاملات المالية للمرتجع ====================
    
    // 1. إذا كان الإرجاع نقدي، حذف Cash Receipt وخصم من الخزينة
    if (invoice.paymentType === 'cash') {
      // البحث المحسن عن الإيصال المرتبط
      const invoiceIdStr = invoiceId.toString();
      const customerIdNum = parseInt(invoice.customerId);
      
      console.log('البحث عن الإيصال المرتبط في المرتجعات:', {
        invoiceId: invoiceId,
        customerId: invoice.customerId
      });
      
      // البحث عن جميع الإيصالات المتعلقة بهذا العميل
      const possibleReceipts = cashReceipts.filter(r => 
        r.fromType === 'customer' && 
        r.type === 'sales_payment' &&
        (r.fromId === customerIdNum || r.fromId === invoice.customerId)
      );
      
      // البحث عن الإيصال المحدد للفاتورة
      const relatedReceipt = possibleReceipts.find(r => 
        r.reference === `فاتورة مبيعات ${invoiceIdStr}` ||
        r.reference === `فاتورة مبيعات ${invoiceId}` ||
        r.description.includes(`فاتورة رقم ${invoiceIdStr}`) ||
        r.description.includes(`فاتورة رقم ${invoiceId}`)
      );
      
      if (relatedReceipt) {
        try {
          console.log('حذف الإيصال المرتبط في المرتجعات:', relatedReceipt.id);
          
          // حذف الإيصال
          const updatedReceipts = cashReceipts.filter(r => r.id !== relatedReceipt.id);
          setCashReceipts(updatedReceipts);
          saveData('bero_cash_receipts', updatedReceipts);
          
          // خصم من رصيد الخزينة
          const newBalance = treasuryBalance - totalAmount;
          setTreasuryBalance(newBalance);
          saveData('bero_treasury_balance', newBalance);
          
          console.log('تم حذف الإيصال المرتبط وعكس المبلغ من الخزينة');
        } catch (error) {
          console.error('خطأ في حذف الإيصال المرتبط:', error);
          throw new Error(`فشل في معالجة المرتجع المالي: ${error.message}`);
        }
      }
    }
    
    // 2. إذا كان الإرجاع آجل، تقليل دين العميل
    if (invoice.paymentType === 'deferred' || invoice.paymentType === 'partial') {
      // ✅ تحديث رصيد العميل
      const customerId = parseInt(invoice.customerId);
      const customerIndex = customers.findIndex(c => c.id === customerId);
      
      // ✅ تم إزالة التحديث اليدوي للرصيد - سيتم حسابه تلقائياً من getCustomerBalance()
      console.log(`✅ مرتجع مبيعات: سيتم حساب الرصيد تلقائياً`);
      
      const updatedSalesInvoices = salesInvoices.map(inv => {
        if (inv.id === invoiceId) {
          const currentRemaining = inv.remaining || inv.total || 0;
          return {
            ...inv,
            remaining: Math.max(0, currentRemaining - totalAmount)
          };
        }
        return inv;
      });
      setSalesInvoices(updatedSalesInvoices);
      saveData('bero_sales_invoices', updatedSalesInvoices);
    }
    
    // حفظ المرتجع
    const updatedReturns = [newReturn, ...salesReturns];
    setSalesReturns(updatedReturns);
    saveData('bero_sales_returns', updatedReturns);
    
    // تحديث المخزون
    setProducts(updatedProducts);
    saveData('bero_products', updatedProducts);
    
    // تحديث حالة الفاتورة الأصلية
    const updatedInvoices = salesInvoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, hasReturns: true };
      }
      return inv;
    });
    setSalesInvoices(updatedInvoices);
    saveData('bero_sales_invoices', updatedInvoices);
    
    // تسجيل النشاط
    const customer = customers.find(c => c.id === parseInt(invoice.customerId));
    logActivity('return_sales_add', `إضافة مرتجع مبيعات #${newReturn.id} - فاتورة #${invoiceId} - ${customer?.name || 'غير محدد'} - ${totalAmount.toFixed(2)} ج.م`, { 
      returnId: newReturn.id,
      invoiceId: invoiceId,
      customerId: invoice.customerId, 
      totalAmount: totalAmount 
    });
    
    return newReturn;
  };
  
  const deleteSalesReturn = (returnId) => {
    // البحث عن المرتجع
    const returnRecord = salesReturns.find(ret => ret.id === returnId);
    if (!returnRecord) {
      throw new Error('المرتجع غير موجود');
    }
    
    // حفظ المرتجع في سلة المهملات
    const deletedItem = {
      id: Date.now(),
      type: 'sales_return',
      data: { ...returnRecord },
      deletedAt: new Date().toISOString(),
      deletedBy: 'system'
    };
    const updatedDeleted = [...deletedItems, deletedItem];
    setDeletedItems(updatedDeleted);
    saveData('bero_deleted_items', updatedDeleted);
    
    // خصم الكميات المرتجعة من المخزون (لأن الإرجاع كان قد أضافها) - فصل أساسي وفرعي
    const updatedProducts = [...products];
    
    returnRecord.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
      if (productIndex !== -1) {
        const returnMainQty = (item.quantity || 0);
        const returnSubQty = (item.subQuantity || 0);
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          mainQuantity: (updatedProducts[productIndex].mainQuantity || 0) - returnMainQty,
          subQuantity: (updatedProducts[productIndex].subQuantity || 0) - returnSubQty
        };
      }
    });
    
    setProducts(updatedProducts);
    saveData('bero_products', updatedProducts);
    
    // حذف المرتجع
    const updated = salesReturns.filter(ret => ret.id !== returnId);
    setSalesReturns(updated);
    saveData('bero_sales_returns', updated);
    
    // تسجيل النشاط
    const invoice = salesInvoices.find(inv => inv.id === returnRecord.invoiceId);
    const customer = customers.find(c => c.id === parseInt(invoice?.customerId));
    logActivity('return_sales_delete', `حذف مرتجع مبيعات #${returnId} - فاتورة #${returnRecord.invoiceId} - ${customer?.name || 'غير محدد'}`, { 
      returnId: returnId,
      invoiceId: returnRecord.invoiceId 
    });
  };

  // ==================== دوال الخزينة الشاملة ====================
  
  // إضافة إيصال استلام نقدي
  const addCashReceipt = (receiptData) => {
    // التحقق من وجود معلومات المعاملة
    const hasTransactionInfo = receiptData.transactionInfo;
    
    const newReceipt = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...receiptData,
      type: 'receipt', // receipt
      status: 'completed', // completed, pending, cancelled
      // معلومات إضافية لحركة الخزينة
      treasuryMovement: hasTransactionInfo ? {
        previousBalance: hasTransactionInfo.currentBalance,
        newBalance: hasTransactionInfo.newBalanceAfterPayment,
        transactionType: hasTransactionInfo.transactionType,
        willReduceBalance: hasTransactionInfo.willReduceBalance,
        willIncreaseBalance: hasTransactionInfo.willIncreaseBalance,
        remainingAmount: hasTransactionInfo.remainingAmount,
        processedAt: new Date().toISOString()
      } : null
    };
    
    const updatedReceipts = [newReceipt, ...cashReceipts];
    setCashReceipts(updatedReceipts);
    saveData('bero_cash_receipts', updatedReceipts);
    
    // إذا كان هناك معلومات معاملة، استخدم النظام الجديد
    if (hasTransactionInfo) {
      // معالجة المعاملة مع أرصدة العملاء/الموردين والخزينة
      processTreasuryTransactionWithBalances(receiptData);
    } else {
      // النظام القديم - إضافة المبلغ كاملاً للخزينة
      const newBalance = treasuryBalance + parseFloat(receiptData.amount);
      setTreasuryBalance(newBalance);
      saveData('bero_treasury_balance', newBalance);
    }
    
    console.log('✅ تم إضافة إيصال الاستلام بنجاح:', {
      receiptId: newReceipt.id,
      amount: receiptData.amount,
      source: `${receiptData.fromType}: ${receiptData.fromName || receiptData.fromId}`,
      transactionType: hasTransactionInfo?.transactionType || 'إيداع مباشر',
      treasuryBalanceAfter: hasTransactionInfo ? treasuryBalance + (hasTransactionInfo.remainingAmount || 0) : treasuryBalance + parseFloat(receiptData.amount)
    });
    
    // تسجيل النشاط
    const fromName = receiptData.fromName || receiptData.from || 'غير محدد';
    logActivity('cash_receipt', `إيصال استلام نقدي #${newReceipt.id} - ${fromName} - ${receiptData.amount} ج.م`, { 
      receiptId: newReceipt.id, 
      amount: receiptData.amount, 
      from: fromName 
    });
    
    return newReceipt;
  };
  
  // تحديث إيصال استلام نقدي
  const updateCashReceipt = (id, updatedData) => {
    const oldReceipt = cashReceipts.find(r => r.id === id);
    if (!oldReceipt) {
      throw new Error('الإيصال غير موجود');
    }
    
    // إعادة المبلغ القديم
    let newBalance = treasuryBalance - parseFloat(oldReceipt.amount);
    // إضافة المبلغ الجديد
    newBalance += parseFloat(updatedData.amount || oldReceipt.amount);
    
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    const updated = cashReceipts.map(r => 
      r.id === id ? { ...r, ...updatedData } : r
    );
    setCashReceipts(updated);
    saveData('bero_cash_receipts', updated);
  };
  
  // حذف إيصال استلام نقدي
  const deleteCashReceipt = (id) => {
    const receipt = cashReceipts.find(r => r.id === id);
    if (!receipt) {
      throw new Error('الإيصال غير موجود');
    }
    
    // حفظ الإيصال في سلة المهملات قبل الحذف
    if (receipt) {
      const deletedItem = {
        id: Date.now(),
        type: 'cash_receipt',
        data: { ...receipt },
        deletedAt: new Date().toISOString(),
        deletedBy: 'system'
      };
      const updatedDeleted = [...deletedItems, deletedItem];
      console.log('تم إضافة إيصال الاستلام لسلة المهملات:', deletedItem);
      
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
    }
    
    // إصلاح: خصم المبلغ من الخزينة عند حذف الإيصال (استلام يزيد الرصيد، فحذفه يخفضه)
    const newBalance = treasuryBalance - parseFloat(receipt.amount);
    
    if (newBalance < 0) {
      throw new Error('لا يمكن حذف الإيصال: سيؤدي ذلك إلى رصيد سالب في الخزينة');
    }
    
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    const updated = cashReceipts.filter(r => r.id !== id);
    setCashReceipts(updated);
    saveData('bero_cash_receipts', updated);
    
    // تسجيل النشاط في التقارير العامة
    logActivity('cash_receipt_delete', `حذف إيصال استلام نقدي #${receipt.id} - ${receipt.from} - ${receipt.amount} ج.م`, { receiptId: receipt.id, amount: receipt.amount });
  };
  
  // إضافة إيصال صرف نقدي
  const addCashDisbursement = (disbursementData) => {
    // التحقق من الرصيد الكافي
    if (treasuryBalance < parseFloat(disbursementData.amount)) {
      throw new Error('الرصيد المتوفر في الخزينة غير كافٍ');
    }
    
    const newDisbursement = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...disbursementData,
      type: 'disbursement', // disbursement
      status: 'completed' // completed, pending, cancelled
    };
    
    const updatedDisbursements = [newDisbursement, ...cashDisbursements];
    setCashDisbursements(updatedDisbursements);
    saveData('bero_cash_disbursements', updatedDisbursements);
    
    // ✅ خصم من رصيد الخزينة
    const newBalance = treasuryBalance - parseFloat(disbursementData.amount);
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    // ✅ تحديث رصيد المورد/العميل إذا كان الصرف لهم
    if (disbursementData.toType === 'supplier' && disbursementData.toId) {
      const supplierId = parseInt(disbursementData.toId);
      const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
      
      if (supplierIndex !== -1) {
        const currentBalance = suppliers[supplierIndex].balance || 0;
        const newSupplierBalance = currentBalance - parseFloat(disbursementData.amount);
        
        // ✅ تم إزالة التحديث اليدوي للرصيد - سيتم حسابه تلقائياً من getSupplierBalance()
        console.log(`✅ صرف نقدية: سيتم حساب رصيد المورد تلقائياً`);
      }
    } 
    
    if (disbursementData.toType === 'customer' && disbursementData.toId) {
      const customerId = parseInt(disbursementData.toId);
      const customerIndex = customers.findIndex(c => c.id === customerId);
      
      // ✅ تم إزالة التحديث اليدوي للرصيد - سيتم حسابه تلقائياً من getCustomerBalance()
      console.log(`✅ صرف نقدية: سيتم حساب رصيد العميل تلقائياً`);
    }
    
    // تسجيل النشاط
    const toName = disbursementData.toName || disbursementData.to || 'غير محدد';
    logActivity('cash_disbursement', `إيصال صرف نقدي #${newDisbursement.id} - ${toName} - ${disbursementData.amount} ج.م`, { 
      disbursementId: newDisbursement.id, 
      amount: disbursementData.amount, 
      to: toName 
    });
    
    return newDisbursement;
  };
  
  // تحديث إيصال صرف نقدي
  const updateCashDisbursement = (id, updatedData) => {
    const oldDisbursement = cashDisbursements.find(d => d.id === id);
    if (!oldDisbursement) {
      throw new Error('الإيصال غير موجود');
    }
    
    // إعادة المبلغ القديم للخزينة
    let newBalance = treasuryBalance + parseFloat(oldDisbursement.amount);
    // خصم المبلغ الجديد
    const newAmount = parseFloat(updatedData.amount || oldDisbursement.amount);
    newBalance -= newAmount;
    
    if (newBalance < 0) {
      throw new Error('الرصيد المتوفر في الخزينة غير كافٍ للتحديث');
    }
    
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    const updated = cashDisbursements.map(d => 
      d.id === id ? { ...d, ...updatedData } : d
    );
    setCashDisbursements(updated);
    saveData('bero_cash_disbursements', updated);
  };
  
  // حذف إيصال صرف نقدي
  const deleteCashDisbursement = (id) => {
    const disbursement = cashDisbursements.find(d => d.id === id);
    if (!disbursement) {
      throw new Error('الإيصال غير موجود');
    }
    
    // حفظ الإيصال في سلة المهملات قبل الحذف
    if (disbursement) {
      const deletedItem = {
        id: Date.now(),
        type: 'cash_disbursement',
        data: { ...disbursement },
        deletedAt: new Date().toISOString(),
        deletedBy: 'system'
      };
      const updatedDeleted = [...deletedItems, deletedItem];
      console.log('تم إضافة إيصال الصرف لسلة المهملات:', deletedItem);
      
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
    }
    
    // إصلاح: إضافة المبلغ للخزينة عند حذف الصرف النقدي
    // (الصرف النقدي يخفض الرصيد، فحذفه يجب أن يزيد الرصيد)
    const newBalance = treasuryBalance + parseFloat(disbursement.amount);
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    const updated = cashDisbursements.filter(d => d.id !== id);
    setCashDisbursements(updated);
    saveData('bero_cash_disbursements', updated);
    
    // تسجيل النشاط في التقارير العامة
    logActivity('cash_disbursement_delete', `حذف إيصال صرف نقدي #${disbursement.id} - ${disbursement.to} - ${disbursement.amount} ج.م`, { disbursementId: disbursement.id, amount: disbursement.amount });
  };
  
  // حساب رصيد عميل معين
  const getCustomerBalance = (customerId) => {
    let balance = 0;
    
    // المبيعات (دين على العميل)
    salesInvoices.forEach(invoice => {
      if (invoice.customerId === customerId) {
        balance += parseFloat(invoice.total || 0);
      }
    });
    
    // المرتجعات (تخفض من دين العميل)
    salesReturns.forEach(returnRecord => {
      const invoice = salesInvoices.find(inv => inv.id === returnRecord.invoiceId);
      if (invoice && invoice.customerId === customerId) {
        balance -= parseFloat(returnRecord.totalAmount || 0);
      }
    });
    
    // الاستلامات من العميل (تخفض من دين العميل)
    cashReceipts.forEach(receipt => {
      if (receipt.fromType === 'customer' && parseInt(receipt.fromId) === customerId) {
        // إصلاح: حساب بسيط وواضح للأرصدة
        balance -= parseFloat(receipt.amount || 0);
      }
    });
    
    return balance;
  };
  
  // حساب رصيد مورد معين
  const getSupplierBalance = (supplierId) => {
    let balance = 0;
    
    // المشتريات (دين علينا للمورد)
    purchaseInvoices.forEach(invoice => {
      if (invoice.supplierId === supplierId) {
        balance += parseFloat(invoice.total || 0);
      }
    });
    
    // المرتجعات (تخفض من ديوننا للمورد)
    purchaseReturns.forEach(returnRecord => {
      const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
      if (invoice && invoice.supplierId === supplierId) {
        balance -= parseFloat(returnRecord.totalAmount || 0);
      }
    });
    
    // الصرف للمورد (تخفض من ديوننا للمورد)
    cashDisbursements.forEach(disbursement => {
      if (disbursement.toType === 'supplier' && parseInt(disbursement.toId) === supplierId) {
        // إصلاح: حساب بسيط وواضح للأرصدة
        balance -= parseFloat(disbursement.amount || 0);
      }
    });
    
    return balance;
  };
  
  // دالة مساعدة لتحديث رصيد المورد
  // ✅ تم حذف دالة updateSupplierBalance - لم تعد مطلوبة بعد الإصلاح
  
  // ✅ تم حذف دالة updateCustomerBalance - لم تعد مطلوبة بعد الإصلاح

  // دالة إدارة شاملة لحركة الخزينة مع أرصدة العملاء والموردين
  const processTreasuryTransactionWithBalances = (receiptData) => {
    const { fromType, fromId, amount, transactionInfo } = receiptData;
    const transactionAmount = parseFloat(amount);
    
    // إصلاح: حساب منطقي لحركة الخزينة
    let treasuryChange = 0;
    
    if (fromType === 'customer') {
      // استلام من العميل يزيد رصيد الخزينة
      treasuryChange = transactionAmount;
    } else if (fromType === 'other') {
      // إيداع نقدي يزيد رصيد الخزينة
      treasuryChange = transactionAmount;
    } else {
      // حالة غير متوقعة
      console.warn(`نوع المعاملة غير معروف: ${fromType}`);
    }
    
    const newTreasuryBalance = treasuryBalance + treasuryChange;
    setTreasuryBalance(newTreasuryBalance);
    saveData('bero_treasury_balance', newTreasuryBalance);
    
    if (fromType === 'customer' && fromId) {
      const customerId = parseInt(fromId);
      console.log(`✅ تم تسجيل حركة خزينة من العميل ${customerId} بمبلغ ${transactionAmount} جنيه`);
    }
    
    console.log(`✅ تم تحديث رصيد الخزينة: ${treasuryBalance} -> ${newTreasuryBalance} جنيه`);
    return newTreasuryBalance;
  };
  
  // الحصول على جميع أرصدة العملاء
  const getAllCustomerBalances = () => {
    return customers.map(customer => ({
      ...customer,
      balance: getCustomerBalance(customer.id)
    })).filter(c => c.balance !== 0); // عرض فقط من لديهم رصيد
  };
  
  // الحصول على جميع أرصدة الموردين
  const getAllSupplierBalances = () => {
    return suppliers.map(supplier => ({
      ...supplier,
      balance: getSupplierBalance(supplier.id)
    })).filter(s => s.balance !== 0); // عرض فقط من لديهم رصيد
  };

  // ==================== دوال التحويلات بين المخازن ====================
  
  const transferProduct = (transferData) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity, subQuantity, notes } = transferData;
    
    // البحث عن المنتج في المخزن المصدر
    const sourceProduct = products.find(
      p => p.id === productId && p.warehouseId === fromWarehouseId
    );
    
    if (!sourceProduct) {
      throw new Error('المنتج غير موجود في المخزن المصدر');
    }
    
    // التحقق من توفر الكميات (فصل أساسي وفرعي)
    if ((sourceProduct.mainQuantity || 0) < (quantity || 0)) {
      throw new Error('الكمية الأساسية المتوفرة غير كافية');
    }
    
    if ((sourceProduct.subQuantity || 0) < (subQuantity || 0)) {
      throw new Error('الكمية الفرعية المتوفرة غير كافية');
    }
    
    // البحث عن نفس المنتج في المخزن المستهدف
    const targetProduct = products.find(
      p => p.name === sourceProduct.name && 
           p.category === sourceProduct.category && 
           p.warehouseId === toWarehouseId
    );
    
    let updatedProducts;
    
    if (targetProduct) {
      // المنتج موجود في المخزن المستهدف - نزيد الكمية
      updatedProducts = products.map(p => {
        if (p.id === sourceProduct.id) {
          return { 
            ...p, 
            mainQuantity: (p.mainQuantity || 0) - (quantity || 0),
            subQuantity: (p.subQuantity || 0) - (subQuantity || 0)
          };
        }
        if (p.id === targetProduct.id) {
          return { 
            ...p, 
            mainQuantity: (p.mainQuantity || 0) + (quantity || 0),
            subQuantity: (p.subQuantity || 0) + (subQuantity || 0)
          };
        }
        return p;
      });
    } else {
      // المنتج غير موجود في المخزن المستهدف - ننشئ منتج جديد
      const newProduct = {
        ...sourceProduct,
        id: Date.now() + Math.random(), // معرف فريد لتحجنب التضارب
        warehouseId: toWarehouseId,
        mainQuantity: (quantity || 0),
        subQuantity: (subQuantity || 0),
        createdAt: new Date().toISOString()
      };
      
      updatedProducts = products.map(p => 
        p.id === sourceProduct.id 
          ? { 
              ...p, 
              mainQuantity: (p.mainQuantity || 0) - (quantity || 0),
              subQuantity: (p.subQuantity || 0) - (subQuantity || 0)
            }
          : p
      );
      updatedProducts.push(newProduct);
    }
    
    // حذف المنتجات ذات الكميات صفر (أساسية وفرعية)
    updatedProducts = updatedProducts.filter(p => 
      (p.mainQuantity || 0) > 0 || (p.subQuantity || 0) > 0
    );
    
    setProducts(updatedProducts);
    saveData('bero_products', updatedProducts);
    
    // حفظ سجل التحويل
    const newTransfer = {
      id: Date.now(),
      date: new Date().toISOString(),
      productId,
      productName: sourceProduct.name,
      fromWarehouseId,
      toWarehouseId,
      quantity: (quantity || 0),
      subQuantity: (subQuantity || 0),
      notes
    };
    
    const updatedTransfers = [newTransfer, ...transfers];
    setTransfers(updatedTransfers);
    saveData('bero_transfers', updatedTransfers);
    
    // تسجيل النشاط
    const fromWarehouse = warehouses.find(w => w.id === fromWarehouseId);
    const toWarehouse = warehouses.find(w => w.id === toWarehouseId);
    logActivity('transfer', `تحويل منتج: ${sourceProduct.name} من ${fromWarehouse?.name || 'غير محدد'} إلى ${toWarehouse?.name || 'غير محدد'} - كمية: ${quantity || 0}`, { 
      transferId: newTransfer.id,
      productId: productId,
      fromWarehouseId: fromWarehouseId,
      toWarehouseId: toWarehouseId,
      quantity: quantity 
    });
    
    return newTransfer;
  };

  // ==================== دوال دليل الحسابات (Chart of Accounts) ====================
  
  const addAccount = (account) => {
    // التحقق من وجود الحساب الأب عند إنشاء حساب فرعي
    if (account.parentId) {
      const parentAccount = accounts.find(acc => acc.id === account.parentId);
      if (!parentAccount) {
        throw new Error('الحساب الأب المحدد غير موجود');
      }
    }
    
    // التحقق من عدم تكرار رمز الحساب
    const existingAccount = accounts.find(acc => acc.code === account.code);
    if (existingAccount) {
      throw new Error(`رمز الحساب ${account.code} موجود مسبقاً`);
    }
    
    // حساب مستوى الحساب
    let level = 1;
    if (account.parentId) {
      const parentAccount = accounts.find(acc => acc.id === account.parentId);
      level = parentAccount ? parentAccount.level + 1 : 1;
    }
    
    const newAccount = {
      id: Date.now(),
      code: account.code,
      name: account.name,
      nameEn: account.nameEn || '',
      parentId: account.parentId || null,
      level: level,
      type: account.type, // asset, liability, equity, revenue, expense, gain, loss
      nature: account.nature, // debit, credit
      category: account.category || '',
      isActive: account.isActive !== false,
      isSystem: account.isSystem || false,
      allowPosting: account.allowPosting !== false,
      description: account.description || '',
      balance: 0,
      openingBalance: account.openingBalance || 0,
      openingBalanceType: account.openingBalanceType || 'debit',
      costCenterId: account.costCenterId || null,
      branchId: account.branchId || null,
      createdAt: new Date().toISOString(),
      createdBy: 1, // TODO: من AuthContext
      updatedAt: new Date().toISOString(),
      updatedBy: 1
    };
    
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    saveData('bero_accounts', updated);
    
    // تسجيل النشاط
    logActivity('account_add', `إضافة حساب جديد: ${newAccount.code} - ${newAccount.name}`, { 
      accountId: newAccount.id,
      accountCode: newAccount.code,
      accountName: newAccount.name 
    });
    
    return newAccount;
  };
  
  const updateAccount = (id, updatedData) => {
    // التحقق من وجود الحساب
    const existingAccount = accounts.find(acc => acc.id === id);
    if (!existingAccount) {
      throw new Error('الحساب غير موجود');
    }
    
    // منع تعديل الحسابات النظامية
    if (existingAccount.isSystem) {
      throw new Error('لا يمكن تعديل الحسابات النظامية');
    }
    
    // التحقق من تكرار الرمز (إذا تم تغييره)
    if (updatedData.code && updatedData.code !== existingAccount.code) {
      const codeExists = accounts.find(acc => acc.code === updatedData.code && acc.id !== id);
      if (codeExists) {
        throw new Error(`رمز الحساب ${updatedData.code} موجود مسبقاً`);
      }
    }
    
    const updated = accounts.map(acc => 
      acc.id === id ? { 
        ...acc, 
        ...updatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: 1
      } : acc
    );
    setAccounts(updated);
    saveData('bero_accounts', updated);
    
    // تسجيل النشاط
    logActivity('account_edit', `تعديل حساب: ${existingAccount.code} - ${existingAccount.name}`, { 
      accountId: id,
      accountCode: existingAccount.code,
      accountName: existingAccount.name 
    });
  };
  
  const deleteAccount = (id) => {
    // التحقق من وجود الحساب
    const account = accounts.find(acc => acc.id === id);
    if (!account) {
      throw new Error('الحساب غير موجود');
    }
    
    // منع حذف الحسابات النظامية
    if (account.isSystem) {
      throw new Error('لا يمكن حذف الحسابات النظامية');
    }
    
    // التحقق من وجود حسابات فرعية
    const hasChildren = accounts.some(acc => acc.parentId === id);
    if (hasChildren) {
      throw new Error('لا يمكن حذف الحساب: يوجد حسابات فرعية مرتبطة به');
    }
    
    // التحقق من وجود حركات في الحساب
    const hasTransactions = journalEntries.some(entry => 
      entry.entries.some(je => je.accountId === id)
    );
    if (hasTransactions) {
      throw new Error('لا يمكن حذف الحساب: يوجد حركات محاسبية مرتبطة به');
    }
    
    // حفظ الحساب في سلة المهملات
    const deletedItem = {
      id: Date.now(),
      type: 'account',
      data: { ...account },
      deletedAt: new Date().toISOString(),
      deletedBy: 'system'
    };
    const updatedDeleted = [...deletedItems, deletedItem];
    setDeletedItems(updatedDeleted);
    saveData('bero_deleted_items', updatedDeleted);
    
    const updated = accounts.filter(acc => acc.id !== id);
    setAccounts(updated);
    saveData('bero_accounts', updated);
    
    // تسجيل النشاط
    logActivity('account_delete', `حذف حساب: ${account.code} - ${account.name}`, { 
      accountId: id,
      accountCode: account.code,
      accountName: account.name 
    });
  };
  
  // ==================== دوال القيود اليومية ====================
  
  const createJournalEntry = (entryData) => {
    const { date, description, reference, entries, totalDebit, totalCredit } = entryData;
    
    // التحقق من توازن القيد (المدين = الدائن)
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error('القيد غير متوازن: إجمالي المدين يجب أن يساوي إجمالي الدائن');
    }
    
    // التحقق من وجود حسابات صحيحة
    for (const entry of entries) {
      const account = accounts.find(acc => acc.id === entry.accountId);
      if (!account) {
        throw new Error(`الحساب رقم ${entry.accountId} غير موجود`);
      }
      
      if (!account.allowPosting) {
        throw new Error(`الحساب ${account.name} لا يسمح بالترحيل`);
      }
    }
    
    // إنشاء رقم تسلسلي للقيد
    const lastEntry = journalEntries.length > 0 ? journalEntries[0] : null;
    const nextNumber = lastEntry ? lastEntry.entryNumber + 1 : 1;
    
    const newEntry = {
      id: Date.now(),
      entryNumber: nextNumber,
      date: date || new Date().toISOString(),
      description: description,
      reference: reference || '',
      entries: entries.map(entry => ({
        ...entry,
        id: Date.now() + Math.random() // معرف فريد لكل سطر قيد
      })),
      totalDebit: totalDebit,
      totalCredit: totalCredit,
      status: 'posted', // draft, posted, reversed
      createdAt: new Date().toISOString(),
      createdBy: 1,
      postedAt: new Date().toISOString(),
      postedBy: 1
    };
    
    // إضافة القيد للقائمة (الأحدث أولاً)
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    saveData('bero_journal_entries', updated);
    
    // تحديث أرصدة الحسابات المتأثرة
    updateAccountBalances(entries);
    
    return newEntry;
  };
  
  // دالة مساعدة لتحديث أرصدة الحسابات
  const updateAccountBalances = (entryLines) => {
    const updatedAccounts = [...accounts];
    
    entryLines.forEach(line => {
      const accountIndex = updatedAccounts.findIndex(acc => acc.id === line.accountId);
      if (accountIndex !== -1) {
        const account = updatedAccounts[accountIndex];
        let currentBalance = account.balance || 0;
        
        if (line.debit && line.debit > 0) {
          // إضافة إلى الرصيد
          if (account.nature === 'debit') {
            currentBalance += line.debit;
          } else {
            currentBalance -= line.debit;
          }
        }
        
        if (line.credit && line.credit > 0) {
          // خصم من الرصيد
          if (account.nature === 'credit') {
            currentBalance += line.credit;
          } else {
            currentBalance -= line.credit;
          }
        }
        
        updatedAccounts[accountIndex] = {
          ...account,
          balance: currentBalance,
          updatedAt: new Date().toISOString(),
          updatedBy: 1
        };
      }
    });
    
    setAccounts(updatedAccounts);
    saveData('bero_accounts', updatedAccounts);
  };
  
  // دالة لاسترجاع حركة حساب معين
  const getAccountTransactions = (accountId, startDate = null, endDate = null) => {
    let transactions = [];
    
    journalEntries.forEach(entry => {
      // فلترة حسب التاريخ إذا تم تحديدها
      if (startDate && new Date(entry.date) < new Date(startDate)) return;
      if (endDate && new Date(entry.date) > new Date(endDate)) return;
      
      // البحث عن سطور القيد المتعلقة بالحساب
      entry.entries.forEach(entryLine => {
        if (entryLine.accountId === accountId) {
          transactions.push({
            id: entry.id,
            entryNumber: entry.entryNumber,
            date: entry.date,
            description: entry.description,
            reference: entry.reference,
            debit: entryLine.debit || 0,
            credit: entryLine.credit || 0,
            balance: 0, // سيتم حسابه لاحقاً
            runningBalance: 0 // رصيد تراكمي
          });
        }
      });
    });
    
    // ترتيب حسب التاريخ والرقم
    transactions.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return b.entryNumber - a.entryNumber;
    });
    
    // حساب الرصيد التراكمي
    let runningBalance = 0;
    const account = accounts.find(acc => acc.id === accountId);
    const isDebitNature = account ? account.nature === 'debit' : true;
    
    transactions.forEach(transaction => {
      if (isDebitNature) {
        runningBalance += (transaction.debit - transaction.credit);
      } else {
        runningBalance += (transaction.credit - transaction.debit);
      }
      transaction.runningBalance = runningBalance;
    });
    
    return transactions;
  };
  
  // دالة للحصول على ميزان مراجعة
  const getTrialBalance = (asOfDate = null) => {
    const accountsWithBalances = accounts.map(account => {
      const transactions = getAccountTransactions(account.id, null, asOfDate);
      const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
      const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
      
      let balance = account.openingBalance || 0;
      if (account.openingBalanceType === 'debit') {
        balance += totalDebit - totalCredit;
      } else {
        balance += totalCredit - totalDebit;
      }
      
      return {
        ...account,
        debit: totalDebit,
        credit: totalCredit,
        balance: balance,
        balanceType: account.nature === 'debit' ? 'debit' : 'credit'
      };
    });
    
    return accountsWithBalances.filter(acc => 
      acc.debit > 0 || acc.credit > 0 || acc.balance !== 0
    );
  };

  // دالة مساعدة لإنشاء رقم الموظف
  const generateEmployeeNumber = () => {
    const currentYear = new Date().getFullYear();
    const yearPrefix = currentYear.toString().slice(-2);
    const lastEmployee = employees.find(emp => emp.employeeNumber && emp.employeeNumber.startsWith(yearPrefix));
    
    let sequence = 1;
    if (lastEmployee) {
      const lastSequence = parseInt(lastEmployee.employeeNumber.slice(-3));
      sequence = lastSequence + 1;
    }
    
    return `${yearPrefix}${sequence.toString().padStart(3, '0')}`;
  };

  const value = {
    warehouses,
    products,
    categories,
    groups,
    purchases,
    purchaseInvoices,
    purchaseReturns,
    sales,
    salesInvoices,
    salesReturns,
    suppliers,
    customers,
    treasuryBalance,
    cashReceipts,
    cashDisbursements,
    transfers,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addCategory,
    updateCategory,
    deleteCategory,
    addGroup,
    updateGroup,
    deleteGroup,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addPurchaseInvoice,
    updatePurchaseInvoice,
    deletePurchaseInvoice,
    addPurchaseReturn,
    deletePurchaseReturn,
    addSalesInvoice,
    deleteSalesInvoice,
    addSalesReturn,
    deleteSalesReturn,
    addCashReceipt,
    updateCashReceipt,
    deleteCashReceipt,
    addCashDisbursement,
    updateCashDisbursement,
    deleteCashDisbursement,
    getCustomerBalance,
    getSupplierBalance,
    getAllCustomerBalances,
    getAllSupplierBalances,
    transferProduct,
    
    // ==================== دوال الموارد البشرية ====================
    
    // إدارة الموظفين (4 دوال)
    addEmployee: (employeeData) => {
      const newEmployee = {
        id: Date.now(),
        employeeNumber: generateEmployeeNumber(),
        ...employeeData,
        createdAt: new Date().toISOString(),
        createdBy: 1,
        status: 'active'
      };
      const updated = [...employees, newEmployee];
      setEmployees(updated);
      saveData('bero_employees', updated);
      return newEmployee;
    },
    
    updateEmployee: (id, updatedData) => {
      const employeeIndex = employees.findIndex(emp => emp.id === id);
      if (employeeIndex === -1) {
        throw new Error('الموظف غير موجود');
      }
      
      const updated = [...employees];
      updated[employeeIndex] = {
        ...updated[employeeIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: 1
      };
      
      setEmployees(updated);
      saveData('bero_employees', updated);
      return updated[employeeIndex];
    },
    
    deleteEmployee: (id) => {
      const employeeIndex = employees.findIndex(emp => emp.id === id);
      if (employeeIndex === -1) {
        throw new Error('الموظف غير موجود');
      }
      
      const updated = employees.filter(emp => emp.id !== id);
      setEmployees(updated);
      saveData('bero_employees', updated);
    },
    
    getEmployeeProfile: (id) => {
      const employee = employees.find(emp => emp.id === id);
      if (!employee) {
        throw new Error('الموظف غير موجود');
      }
      
      // حساب رصيد الإجازات
      const leaveBalance = employeeLeaveBalances.find(balance => balance.employeeId === id);
      
      // حساب ساعات العمل الحالية
      const currentMonthAttendance = attendance.filter(att => {
        const attDate = new Date(att.date);
        const now = new Date();
        return att.employeeId === id && 
               attDate.getMonth() === now.getMonth() && 
               attDate.getFullYear() === now.getFullYear();
      });
      
      return {
        ...employee,
        leaveBalance: leaveBalance || null,
        currentMonthAttendance,
        totalWorkingHours: currentMonthAttendance.reduce((total, att) => total + (att.workingHours || 0), 0)
      };
    },
    
    // إدارة الأقسام (3 دوال)
    addDepartment: (departmentData) => {
      const newDepartment = {
        id: Date.now(),
        ...departmentData,
        createdAt: new Date().toISOString(),
        createdBy: 1
      };
      const updated = [...departments, newDepartment];
      setDepartments(updated);
      saveData('bero_departments', updated);
      return newDepartment;
    },
    
    updateDepartment: (id, updatedData) => {
      const deptIndex = departments.findIndex(dept => dept.id === id);
      if (deptIndex === -1) {
        throw new Error('القسم غير موجود');
      }
      
      const updated = [...departments];
      updated[deptIndex] = {
        ...updated[deptIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: 1
      };
      
      setDepartments(updated);
      saveData('bero_departments', updated);
      return updated[deptIndex];
    },
    
    deleteDepartment: (id) => {
      // التحقق من عدم وجود موظفين مرتبطين بالقسم
      const employeesInDept = employees.filter(emp => emp.departmentId === id);
      if (employeesInDept.length > 0) {
        throw new Error('لا يمكن حذف القسم لوجود موظفين مرتبطين به');
      }
      
      const updated = departments.filter(dept => dept.id !== id);
      setDepartments(updated);
      saveData('bero_departments', updated);
    },
    
    // إدارة الحضور والانصراف (3 دوال)
    checkIn: (employeeId, location = '') => {
      const today = new Date().toISOString().split('T')[0];
      
      // التحقق من وجود سجل دخول لهذا اليوم
      const existingRecord = attendance.find(att => 
        att.employeeId === employeeId && 
        att.date.startsWith(today) && 
        !att.checkOutTime
      );
      
      if (existingRecord) {
        throw new Error('تم تسجيل الدخول مسبقاً لهذا اليوم');
      }
      
      const now = new Date().toISOString();
      const newRecord = {
        id: Date.now(),
        employeeId: employeeId,
        date: today,
        checkInTime: now,
        location: location,
        status: 'present'
      };
      
      const updated = [...attendance, newRecord];
      setAttendance(updated);
      saveData('bero_attendance', updated);
      return newRecord;
    },
    
    checkOut: (employeeId) => {
      const today = new Date().toISOString().split('T')[0];
      
      // البحث عن سجل الدخول الحالي
      const currentRecord = attendance.find(att => 
        att.employeeId === employeeId && 
        att.date.startsWith(today) && 
        !att.checkOutTime
      );
      
      if (!currentRecord) {
        throw new Error('لم يتم تسجيل الدخول لهذا اليوم');
      }
      
      const now = new Date();
      const checkInTime = new Date(currentRecord.checkInTime);
      const workingHours = (now - checkInTime) / (1000 * 60 * 60); // بالساعات
      
      const updatedRecord = {
        ...currentRecord,
        checkOutTime: now.toISOString(),
        workingHours: workingHours,
        overtimeHours: Math.max(0, workingHours - 8) // ساعات إضافية بعد 8 ساعات
      };
      
      const updated = attendance.map(att => 
        att.id === currentRecord.id ? updatedRecord : att
      );
      
      setAttendance(updated);
      saveData('bero_attendance', updated);
      return updatedRecord;
    },
    
    getAttendanceReport: (employeeId, startDate, endDate) => {
      let filteredAttendance = attendance;
      
      // فلترة حسب الموظف
      if (employeeId) {
        filteredAttendance = filteredAttendance.filter(att => att.employeeId === employeeId);
      }
      
      // فلترة حسب التاريخ
      if (startDate) {
        filteredAttendance = filteredAttendance.filter(att => att.date >= startDate);
      }
      if (endDate) {
        filteredAttendance = filteredAttendance.filter(att => att.date <= endDate);
      }
      
      // حساب الإحصائيات
      const totalDays = filteredAttendance.length;
      const presentDays = filteredAttendance.filter(att => att.status === 'present').length;
      const absentDays = totalDays - presentDays;
      const totalHours = filteredAttendance.reduce((total, att) => total + (att.workingHours || 0), 0);
      const totalOvertime = filteredAttendance.reduce((total, att) => total + (att.overtimeHours || 0), 0);
      
      return {
        records: filteredAttendance,
        summary: {
          totalDays,
          presentDays,
          absentDays,
          attendanceRate: totalDays > 0 ? (presentDays / totalDays * 100).toFixed(2) : 0,
          totalHours: totalHours.toFixed(2),
          totalOvertime: totalOvertime.toFixed(2)
        }
      };
    },
    
    // نظام الإجازات (3 دوال)
    applyForLeave: (leaveData) => {
      const { employeeId, leaveTypeId, startDate, endDate, days, reason } = leaveData;
      
      // التحقق من توفر الرصيد
      const leaveBalance = employeeLeaveBalances.find(balance => 
        balance.employeeId === employeeId && balance.leaveTypeId === leaveTypeId
      );
      
      if (!leaveBalance || leaveBalance.remainingDays < days) {
        throw new Error('رصيد الإجازات غير كافٍ');
      }
      
      const newLeaveRequest = {
        id: Date.now(),
        employeeId: employeeId,
        leaveTypeId: leaveTypeId,
        startDate: startDate,
        endDate: endDate,
        days: days,
        reason: reason,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        appliedBy: 1
      };
      
      const updated = [...employeeLeaves, newLeaveRequest];
      setEmployeeLeaves(updated);
      saveData('bero_employee_leaves', updated);
      return newLeaveRequest;
    },
    
    approveLeave: (leaveId, approvedBy, status = 'approved') => {
      const leaveIndex = employeeLeaves.findIndex(leave => leave.id === leaveId);
      if (leaveIndex === -1) {
        throw new Error('طلب الإجازة غير موجود');
      }
      
      const leaveRequest = employeeLeaves[leaveIndex];
      const updated = [...employeeLeaves];
      updated[leaveIndex] = {
        ...leaveRequest,
        status: status,
        approvedAt: new Date().toISOString(),
        approvedBy: approvedBy
      };
      
      // إذا تمت الموافقة، خصم من الرصيد
      if (status === 'approved') {
        const balanceIndex = employeeLeaveBalances.findIndex(balance => 
          balance.employeeId === leaveRequest.employeeId && 
          balance.leaveTypeId === leaveRequest.leaveTypeId
        );
        
        if (balanceIndex !== -1) {
          const updatedBalances = [...employeeLeaveBalances];
          const currentBalance = updatedBalances[balanceIndex];
          updatedBalances[balanceIndex] = {
            ...currentBalance,
            usedDays: currentBalance.usedDays + leaveRequest.days,
            remainingDays: currentBalance.remainingDays - leaveRequest.days,
            updatedAt: new Date().toISOString(),
            updatedBy: approvedBy
          };
          
          setEmployeeLeaveBalances(updatedBalances);
          saveData('bero_employee_leave_balances', updatedBalances);
        }
      }
      
      setEmployeeLeaves(updated);
      saveData('bero_employee_leaves', updated);
      return updated[leaveIndex];
    },
    
    calculateLeaveBalance: (employeeId, leaveTypeId, year = new Date().getFullYear()) => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) {
        throw new Error('الموظف غير موجود');
      }
      
      const leaveType = leaveTypes.find(type => type.id === leaveTypeId);
      if (!leaveType) {
        throw new Error('نوع الإجازة غير موجود');
      }
      
      // حساب عدد أيام العمل في السنة
      const workingDaysInYear = 365;
      const leaveDaysPerYear = leaveType.annualAllowance || 30;
      
      // البحث عن رصيد موجود
      let existingBalance = employeeLeaveBalances.find(balance => 
        balance.employeeId === employeeId && 
        balance.leaveTypeId === leaveTypeId &&
        balance.year === year
      );
      
      if (existingBalance) {
        return existingBalance;
      }
      
      // إنشاء رصيد جديد
      const newBalance = {
        id: Date.now(),
        employeeId: employeeId,
        leaveTypeId: leaveTypeId,
        year: year,
        annualAllowance: leaveDaysPerYear,
        usedDays: 0,
        remainingDays: leaveDaysPerYear,
        carryForward: 0,
        createdAt: new Date().toISOString()
      };
      
      const updated = [...employeeLeaveBalances, newBalance];
      setEmployeeLeaveBalances(updated);
      saveData('bero_employee_leave_balances', updated);
      return newBalance;
    },
    
    // نظام الرواتب (2 دالة)
    calculatePayroll: (periodId) => {
      const period = payrollPeriods.find(p => p.id === periodId);
      if (!period) {
        throw new Error('فترة الراتب غير موجودة');
      }
      
      const employeesForPeriod = employees.filter(emp => emp.status === 'active');
      const payrollResults = [];
      
      employeesForPeriod.forEach(employee => {
        // حساب الراتب الأساسي
        const basicSalary = parseFloat(employee.basicSalary || 0);
        
        // البحث عن مكونات الراتب الإضافية
        const salaryComp = salaryComponents.find(comp => 
          comp.employeeId === employee.id && comp.periodId === periodId
        );
        
        const allowances = salaryComp ? (salaryComp.allowances || {}).reduce((total, allow) => 
          total + parseFloat(allow.amount || 0), 0) : 0;
        
        const deductions = salaryComp ? (salaryComp.deductions || {}).reduce((total, ded) => 
          total + parseFloat(ded.amount || 0), 0) : 0;
        
        // حساب ساعات العمل الإضافية من سجلات الحضور
        const periodAttendance = attendance.filter(att => {
          const attDate = new Date(att.date);
          const startDate = new Date(period.startDate);
          const endDate = new Date(period.endDate);
          return att.employeeId === employee.id && 
                 attDate >= startDate && attDate <= endDate;
        });
        
        const totalOvertimeHours = periodAttendance.reduce((total, att) => 
          total + (att.overtimeHours || 0), 0);
        const overtimePay = totalOvertimeHours * (basicSalary / 160); // 160 ساعة شهرية
        
        // الراتب الصافي
        const netSalary = basicSalary + allowances + overtimePay - deductions;
        
        const payrollDetail = {
          id: Date.now() + Math.random(),
          periodId: periodId,
          employeeId: employee.id,
          basicSalary: basicSalary,
          allowances: allowances,
          overtimeHours: totalOvertimeHours,
          overtimePay: overtimePay,
          deductions: deductions,
          netSalary: netSalary,
          status: 'calculated',
          calculatedAt: new Date().toISOString(),
          calculatedBy: 1
        };
        
        payrollResults.push(payrollDetail);
        
        // حفظ تفاصيل الراتب
        const updated = [...payrollDetails, payrollDetail];
        setPayrollDetails(updated);
        saveData('bero_payroll_details', updated);
      });
      
      return payrollResults;
    },
    
    generatePayrollReport: (periodId) => {
      const period = payrollPeriods.find(p => p.id === periodId);
      if (!period) {
        throw new Error('فترة الراتب غير موجودة');
      }
      
      const periodDetails = payrollDetails.filter(detail => detail.periodId === periodId);
      
      const totalBasicSalary = periodDetails.reduce((total, detail) => total + detail.basicSalary, 0);
      const totalAllowances = periodDetails.reduce((total, detail) => total + detail.allowances, 0);
      const totalOvertimePay = periodDetails.reduce((total, detail) => total + detail.overtimePay, 0);
      const totalDeductions = periodDetails.reduce((total, detail) => total + detail.deductions, 0);
      const totalNetSalary = periodDetails.reduce((total, detail) => total + detail.netSalary, 0);
      
      return {
        period: period,
        details: periodDetails,
        summary: {
          totalEmployees: periodDetails.length,
          totalBasicSalary: totalBasicSalary.toFixed(2),
          totalAllowances: totalAllowances.toFixed(2),
          totalOvertimePay: totalOvertimePay.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          totalNetSalary: totalNetSalary.toFixed(2)
        }
      };
    },
    
    // دوال المحاسبة
    accounts,
    journalEntries,
    addAccount,
    updateAccount,
    deleteAccount,
    createJournalEntry,
    getAccountTransactions,
    getTrialBalance,
    
    // حالات نظام الموارد البشرية
    employees,
    departments,
    positions,
    attendance,
    leaveTypes,
    employeeLeaves,
    employeeLeaveBalances,
    salaryComponents,
    payrollPeriods,
    payrollDetails,
    performanceMetrics,
    performanceReviews,
    
    // دوال الموارد البشرية الإضافية
    // سجلات الحضور
    attendanceRecords: attendance,
    addAttendanceRecord: (recordData) => {
      const newRecord = {
        id: Date.now(),
        ...recordData,
        createdAt: new Date().toISOString()
      };
      const updated = [...attendance, newRecord];
      setAttendance(updated);
      saveData('bero_attendance', updated);
      return newRecord;
    },
    updateAttendanceRecord: (id, updatedData) => {
      const updated = attendance.map(record => 
        record.id === id ? { ...record, ...updatedData } : record
      );
      setAttendance(updated);
      saveData('bero_attendance', updated);
    },
    deleteAttendanceRecord: (id) => {
      const updated = attendance.filter(record => record.id !== id);
      setAttendance(updated);
      saveData('bero_attendance', updated);
    },
    getAttendanceByEmployee: (employeeId) => {
      return attendance.filter(record => record.employeeId === employeeId);
    },
    getMonthlyAttendanceReport: (month, year) => {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      return attendance.filter(record => record.date.startsWith(monthStr));
    },
    
    // الإجازات
    leaves: employeeLeaves,
    addLeave: (leaveData) => {
      const newLeave = {
        id: Date.now(),
        ...leaveData,
        leaveDays: Math.ceil((new Date(leaveData.endDate) - new Date(leaveData.startDate)) / (1000 * 60 * 60 * 24)) + 1,
        createdAt: new Date().toISOString()
      };
      const updated = [...employeeLeaves, newLeave];
      setEmployeeLeaves(updated);
      saveData('bero_employee_leaves', updated);
      return newLeave;
    },
    updateLeave: (id, updatedData) => {
      const updated = employeeLeaves.map(leave => 
        leave.id === id ? { ...leave, ...updatedData } : leave
      );
      setEmployeeLeaves(updated);
      saveData('bero_employee_leaves', updated);
    },
    deleteLeave: (id) => {
      const updated = employeeLeaves.filter(leave => leave.id !== id);
      setEmployeeLeaves(updated);
      saveData('bero_employee_leaves', updated);
    },
    getLeavesByEmployee: (employeeId) => {
      return employeeLeaves.filter(leave => leave.employeeId === employeeId);
    },
    getLeavesByStatus: (status) => {
      return employeeLeaves.filter(leave => leave.status === status);
    },
    getLeavesByDateRange: (startDate, endDate) => {
      return employeeLeaves.filter(leave => 
        leave.startDate >= startDate && leave.endDate <= endDate
      );
    },
    getLeaveBalance: (employeeId, leaveTypeId) => {
      return employeeLeaveBalances.find(balance => 
        balance.employeeId === employeeId && balance.leaveTypeId === leaveTypeId
      );
    },
    
    // الرواتب
    salaries: payrollDetails,
    addSalary: (salaryData) => {
      const newSalary = {
        id: Date.now(),
        ...salaryData,
        createdAt: new Date().toISOString()
      };
      const updated = [...payrollDetails, newSalary];
      setPayrollDetails(updated);
      saveData('bero_payroll_details', updated);
      return newSalary;
    },
    updateSalary: (id, updatedData) => {
      const updated = payrollDetails.map(salary => 
        salary.id === id ? { ...salary, ...updatedData } : salary
      );
      setPayrollDetails(updated);
      saveData('bero_payroll_details', updated);
    },
    deleteSalary: (id) => {
      const updated = payrollDetails.filter(salary => salary.id !== id);
      setPayrollDetails(updated);
      saveData('bero_payroll_details', updated);
    },
    getSalariesByEmployee: (employeeId) => {
      return payrollDetails.filter(salary => salary.employeeId === employeeId);
    },
    getMonthlySalaryReport: (month, year) => {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      return payrollDetails.filter(salary => salary.periodId?.startsWith(monthStr));
    },
    calculateMonthlySalary: (employeeId, month, year) => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return 0;
      
      const basicSalary = employee.basicSalary || 0;
      const allowances = 1000; // بدلات افتراضية
      const deductions = 500; // خصومات افتراضية
      
      return basicSalary + allowances - deductions;
    },

    // ==================== نظام الإنتاج ====================
    
    // أوامر الإنتاج
    productionOrders,
    addProductionOrder: (orderData) => {
      const newOrder = {
        id: Date.now(),
        ...orderData,
        status: 'Created',
        createdAt: new Date().toISOString(),
        progress: 0,
        actualStartDate: null,
        actualEndDate: null,
        actualCost: 0
      };
      const updated = [...productionOrders, newOrder];
      setProductionOrders(updated);
      saveData('bero_production_orders', updated);
      return newOrder;
    },
    updateProductionOrder: (id, updatedData) => {
      const updated = productionOrders.map(order => 
        order.id === id ? { ...order, ...updatedData } : order
      );
      setProductionOrders(updated);
      saveData('bero_production_orders', updated);
    },
    deleteProductionOrder: (id) => {
      const updated = productionOrders.filter(order => order.id !== id);
      setProductionOrders(updated);
      saveData('bero_production_orders', updated);
    },
    getProductionOrderById: (id) => {
      return productionOrders.find(order => order.id === id);
    },
    getProductionOrdersByStatus: (status) => {
      return productionOrders.filter(order => order.status === status);
    },
    getProductionOrdersByDateRange: (startDate, endDate) => {
      return productionOrders.filter(order => 
        order.plannedStartDate >= startDate && order.plannedEndDate <= endDate
      );
    },
    updateProductionOrderStatus: (id, status, progress = null) => {
      const updatedOrders = productionOrders.map(order => {
        if (order.id === id) {
          const updatedOrder = { ...order, status };
          if (status === 'In Progress' && !order.actualStartDate) {
            updatedOrder.actualStartDate = new Date().toISOString();
          }
          if (status === 'Completed' || status === 'Closed') {
            updatedOrder.actualEndDate = new Date().toISOString();
            updatedOrder.progress = 100;
          }
          if (progress !== null) {
            updatedOrder.progress = progress;
          }
          return updatedOrder;
        }
        return order;
      });
      setProductionOrders(updatedOrders);
      saveData('bero_production_orders', updatedOrders);
    },

    // قوائم المواد (BOM)
    bomItems,
    addBomItem: (bomData) => {
      const newBomItem = {
        id: Date.now(),
        ...bomData,
        createdAt: new Date().toISOString()
      };
      const updated = [...bomItems, newBomItem];
      setBomItems(updated);
      saveData('bero_bom_items', updated);
      return newBomItem;
    },
    updateBomItem: (id, updatedData) => {
      const updated = bomItems.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      );
      setBomItems(updated);
      saveData('bero_bom_items', updated);
    },
    deleteBomItem: (id) => {
      const updated = bomItems.filter(item => item.id !== id);
      setBomItems(updated);
      saveData('bero_bom_items', updated);
    },
    getBomItemsByProduct: (productId) => {
      return bomItems.filter(item => item.productId === productId);
    },

    // مراكز العمل والعمليات
    workCenters,
    addWorkCenter: (workCenterData) => {
      const newWorkCenter = {
        id: Date.now(),
        ...workCenterData,
        createdAt: new Date().toISOString(),
        status: 'Active',
        utilization: 0
      };
      const updated = [...workCenters, newWorkCenter];
      setWorkCenters(updated);
      saveData('bero_work_centers', updated);
      return newWorkCenter;
    },
    updateWorkCenter: (id, updatedData) => {
      const updated = workCenters.map(center => 
        center.id === id ? { ...center, ...updatedData } : center
      );
      setWorkCenters(updated);
      saveData('bero_work_centers', updated);
    },
    deleteWorkCenter: (id) => {
      const updated = workCenters.filter(center => center.id !== id);
      setWorkCenters(updated);
      saveData('bero_work_centers', updated);
    },

    productionOperations,
    addProductionOperation: (operationData) => {
      const newOperation = {
        id: Date.now(),
        ...operationData,
        createdAt: new Date().toISOString(),
        actualDuration: 0,
        status: 'Pending'
      };
      const updated = [...productionOperations, newOperation];
      setProductionOperations(updated);
      saveData('bero_production_operations', updated);
      return newOperation;
    },
    updateProductionOperation: (id, updatedData) => {
      const updated = productionOperations.map(operation => 
        operation.id === id ? { ...operation, ...updatedData } : operation
      );
      setProductionOperations(updated);
      saveData('bero_production_operations', updated);
    },
    getOperationsByOrder: (orderId) => {
      return productionOperations.filter(operation => operation.orderId === orderId);
    },

    // خطط الإنتاج
    productionPlans,
    addProductionPlan: (planData) => {
      const newPlan = {
        id: Date.now(),
        ...planData,
        createdAt: new Date().toISOString(),
        status: 'Draft'
      };
      const updated = [...productionPlans, newPlan];
      setProductionPlans(updated);
      saveData('bero_production_plans', updated);
      return newPlan;
    },
    updateProductionPlan: (id, updatedData) => {
      const updated = productionPlans.map(plan => 
        plan.id === id ? { ...plan, ...updatedData } : plan
      );
      setProductionPlans(updated);
      saveData('bero_production_plans', updated);
    },
    generateMRPRequirements: (productId, quantity) => {
      const bom = bomItems.filter(item => item.productId === productId);
      return bom.map(item => ({
        materialId: item.materialId,
        requiredQuantity: item.quantity * quantity,
        availableQuantity: 0, // سيتم حسابها من المخزون
        shortage: 0
      }));
    },

    // تتبع استهلاك المواد
    materialConsumption,
    addMaterialConsumption: (consumptionData) => {
      const newConsumption = {
        id: Date.now(),
        ...consumptionData,
        createdAt: new Date().toISOString()
      };
      const updated = [...materialConsumption, newConsumption];
      setMaterialConsumption(updated);
      saveData('bero_material_consumption', updated);
      return newConsumption;
    },
    getMaterialConsumptionByOrder: (orderId) => {
      return materialConsumption.filter(consumption => consumption.orderId === orderId);
    },

    // الهدر في الإنتاج
    productionWaste,
    addProductionWaste: (wasteData) => {
      const newWaste = {
        id: Date.now(),
        ...wasteData,
        createdAt: new Date().toISOString()
      };
      const updated = [...productionWaste, newWaste];
      setProductionWaste(updated);
      saveData('bero_production_waste', updated);
      return newWaste;
    },
    getWasteByOrder: (orderId) => {
      return productionWaste.filter(waste => waste.orderId === orderId);
    },

    // ضوابط الجودة
    qualityControls,
    addQualityControl: (qcData) => {
      const newQC = {
        id: Date.now(),
        ...qcData,
        createdAt: new Date().toISOString(),
        status: 'Pending'
      };
      const updated = [...qualityControls, newQC];
      setQualityControls(updated);
      saveData('bero_quality_controls', updated);
      return newQC;
    },
    updateQualityControl: (id, updatedData) => {
      const updated = qualityControls.map(qc => 
        qc.id === id ? { ...qc, ...updatedData } : qc
      );
      setQualityControls(updated);
      saveData('bero_quality_controls', updated);
    },
    getQualityControlsByOrder: (orderId) => {
      return qualityControls.filter(qc => qc.orderId === orderId);
    },

    // مؤشرات الأداء الإنتاجية
    productionKPIs,
    addProductionKPI: (kpiData) => {
      const newKPI = {
        id: Date.now(),
        ...kpiData,
        createdAt: new Date().toISOString(),
        calculatedAt: new Date().toISOString()
      };
      const updated = [...productionKPIs, newKPI];
      setProductionKPIs(updated);
      saveData('bero_production_kpis', updated);
      return newKPI;
    },
    calculateOEE: (orderId) => {
      // حساب كفاءة المعدات الإجمالية (OEE)
      const operations = productionOperations.filter(op => op.orderId === orderId);
      if (operations.length === 0) return 0;
      
      const availability = operations.filter(op => op.status === 'Completed').length / operations.length;
      const performance = operations.reduce((sum, op) => {
        const plannedTime = op.plannedDuration || 1;
        const actualTime = op.actualDuration || plannedTime;
        return sum + (plannedTime / actualTime);
      }, 0) / operations.length;
      const quality = 1 - (productionWaste.filter(w => w.orderId === orderId).length / (operations.length || 1));
      
      return (availability * performance * quality * 100).toFixed(2);
    },
    calculateOnTimeDelivery: (startDate, endDate) => {
      const orders = productionOrders.filter(order => 
        order.plannedEndDate >= startDate && order.plannedEndDate <= endDate
      );
      if (orders.length === 0) return 0;
      
      const onTimeOrders = orders.filter(order => 
        order.actualEndDate && order.actualEndDate <= order.plannedEndDate
      );
      
      return ((onTimeOrders.length / orders.length) * 100).toFixed(2);
    },
    calculateMaterialEfficiency: (orderId) => {
      const consumption = materialConsumption.filter(c => c.orderId === orderId);
      const standardMaterials = bomItems.filter(bom => 
        productionOrders.find(order => order.id === orderId)?.productId === bom.productId
      );
      
      if (consumption.length === 0 || standardMaterials.length === 0) return 100;
      
      const actualTotal = consumption.reduce((sum, c) => sum + c.quantity, 0);
      const standardTotal = standardMaterials.reduce((sum, bom) => sum + bom.quantity, 0);
      
      return ((standardTotal / actualTotal) * 100).toFixed(2);
    },
    getProductionDashboardData: () => {
      const totalOrders = productionOrders.length;
      const completedOrders = productionOrders.filter(order => order.status === 'Completed').length;
      const inProgressOrders = productionOrders.filter(order => order.status === 'In Progress').length;
      const onTimeDelivery = productionOrders.filter(order => 
        order.actualEndDate && order.actualEndDate <= order.plannedEndDate
      ).length;
      
      return {
        totalOrders,
        completedOrders,
        inProgressOrders,
        onTimeDeliveryRate: totalOrders > 0 ? ((onTimeDelivery / totalOrders) * 100).toFixed(2) : 0,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
      };
    },

    // ==================== نظام الأصول الثابتة ====================
    
    // إدارة الأصول الثابتة
    fixedAssets,
    addFixedAsset: (assetData) => {
      const newAsset = {
        id: Date.now(),
        ...assetData,
        createdAt: new Date().toISOString(),
        status: 'Active',
        currentValue: assetData.originalCost,
        accumulatedDepreciation: 0,
        bookValue: assetData.originalCost,
        lastValuationDate: null,
        nextMaintenanceDate: null,
        warrantyExpiry: null
      };
      const updated = [...fixedAssets, newAsset];
      setFixedAssets(updated);
      saveData('bero_fixed_assets', updated);
      return newAsset;
    },
    updateFixedAsset: (id, updatedData) => {
      const updated = fixedAssets.map(asset => 
        asset.id === id ? { ...asset, ...updatedData, updatedAt: new Date().toISOString() } : asset
      );
      setFixedAssets(updated);
      saveData('bero_fixed_assets', updated);
    },
    deleteFixedAsset: (id) => {
      const updated = fixedAssets.filter(asset => asset.id !== id);
      setFixedAssets(updated);
      saveData('bero_fixed_assets', updated);
    },
    getFixedAssetById: (id) => {
      return fixedAssets.find(asset => asset.id === id);
    },
    getFixedAssetsByCategory: (categoryId) => {
      return fixedAssets.filter(asset => asset.categoryId === categoryId);
    },
    getFixedAssetsByLocation: (locationId) => {
      return fixedAssets.filter(asset => asset.locationId === locationId);
    },
    getActiveFixedAssets: () => {
      return fixedAssets.filter(asset => asset.status === 'Active');
    },

    // إدارة فئات الأصول
    assetCategories,
    addAssetCategory: (categoryData) => {
      const newCategory = {
        id: Date.now(),
        ...categoryData,
        createdAt: new Date().toISOString()
      };
      const updated = [...assetCategories, newCategory];
      setAssetCategories(updated);
      saveData('bero_asset_categories', updated);
      return newCategory;
    },
    updateAssetCategory: (id, updatedData) => {
      const updated = assetCategories.map(category => 
        category.id === id ? { ...category, ...updatedData, updatedAt: new Date().toISOString() } : category
      );
      setAssetCategories(updated);
      saveData('bero_asset_categories', updated);
    },
    deleteAssetCategory: (id) => {
      // التحقق من وجود أصول مرتبطة بالفئة
      const hasAssets = fixedAssets.some(asset => asset.categoryId === id);
      if (hasAssets) {
        throw new Error('لا يمكن حذف الفئة: يوجد أصول مرتبطة بها');
      }
      const updated = assetCategories.filter(category => category.id !== id);
      setAssetCategories(updated);
      saveData('bero_asset_categories', updated);
    },

    // إدارة مواقع الأصول
    assetLocations,
    addAssetLocation: (locationData) => {
      const newLocation = {
        id: Date.now(),
        ...locationData,
        createdAt: new Date().toISOString()
      };
      const updated = [...assetLocations, newLocation];
      setAssetLocations(updated);
      saveData('bero_asset_locations', updated);
      return newLocation;
    },
    updateAssetLocation: (id, updatedData) => {
      const updated = assetLocations.map(location => 
        location.id === id ? { ...location, ...updatedData, updatedAt: new Date().toISOString() } : location
      );
      setAssetLocations(updated);
      saveData('bero_asset_locations', updated);
    },
    deleteAssetLocation: (id) => {
      // التحقق من وجود أصول مرتبطة بالموقع
      const hasAssets = fixedAssets.some(asset => asset.locationId === id);
      if (hasAssets) {
        throw new Error('لا يمكن حذف الموقع: يوجد أصول مرتبطة به');
      }
      const updated = assetLocations.filter(location => location.id !== id);
      setAssetLocations(updated);
      saveData('bero_asset_locations', updated);
    },

    // إدارة طرق الإهلاك
    depreciationMethods,
    addDepreciationMethod: (methodData) => {
      const newMethod = {
        id: Date.now(),
        ...methodData,
        createdAt: new Date().toISOString()
      };
      const updated = [...depreciationMethods, newMethod];
      setDepreciationMethods(updated);
      saveData('bero_depreciation_methods', updated);
      return newMethod;
    },
    updateDepreciationMethod: (id, updatedData) => {
      const updated = depreciationMethods.map(method => 
        method.id === id ? { ...method, ...updatedData, updatedAt: new Date().toISOString() } : method
      );
      setDepreciationMethods(updated);
      saveData('bero_depreciation_methods', updated);
    },
    deleteDepreciationMethod: (id) => {
      // التحقق من وجود أصول تستخدم هذه الطريقة
      const hasAssets = fixedAssets.some(asset => asset.depreciationMethodId === id);
      if (hasAssets) {
        throw new Error('لا يمكن حذف طريقة الإهلاك: يوجد أصول تستخدمها');
      }
      const updated = depreciationMethods.filter(method => method.id !== id);
      setDepreciationMethods(updated);
      saveData('bero_depreciation_methods', updated);
    },

    // حساب الإهلاك
    calculateDepreciation: (assetId, period = 'monthly') => {
      const asset = fixedAssets.find(a => a.id === assetId);
      if (!asset) {
        throw new Error('الأصل غير موجود');
      }

      const method = depreciationMethods.find(m => m.id === asset.depreciationMethodId);
      if (!method) {
        throw new Error('طريقة الإهلاك غير موجودة');
      }

      let depreciationAmount = 0;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      switch (method.type) {
        case 'straight_line':
          // القسط الثابت
          const remainingLife = asset.usefulLife - asset.elapsedYears;
          if (remainingLife <= 0) {
            depreciationAmount = 0;
          } else {
            depreciationAmount = (asset.currentValue - asset.salvageValue) / remainingLife;
          }
          break;

        case 'declining_balance':
          // الرصيد المتناقص
          const rate = (method.depreciationRate || 0.2); // معدل افتراضي 20%
          depreciationAmount = asset.currentValue * rate;
          // التأكد من عدم النزول تحت قيمة الخردة
          if (asset.currentValue - depreciationAmount < asset.salvageValue) {
            depreciationAmount = asset.currentValue - asset.salvageValue;
          }
          break;

        case 'units_of_production':
          // وحدات الإنتاج
          const currentProduction = asset.currentProduction || 0;
          const totalProduction = asset.totalProduction || 1;
          const totalDepreciation = asset.originalCost - asset.salvageValue;
          depreciationAmount = (currentProduction / totalProduction) * totalDepreciation;
          break;

        default:
          depreciationAmount = (asset.currentValue - asset.salvageValue) / asset.usefulLife;
      }

      // تحديد الفترة الزمنية
      let periodMonths = 1; // شهري افتراضي
      if (period === 'yearly') periodMonths = 12;
      if (period === 'quarterly') periodMonths = 3;

      const monthlyDepreciation = depreciationAmount / periodMonths;

      return {
        assetId,
        period,
        periodStart: period === 'yearly' ? `${currentYear}-01-01` : `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
        periodEnd: period === 'yearly' ? `${currentYear}-12-31` : `${currentYear}-${String(currentMonth + periodMonths - 1).padStart(2, '0')}-28`,
        depreciationAmount: monthlyDepreciation,
        totalDepreciation: depreciationAmount,
        method: method.type,
        rate: method.depreciationRate,
        calculatedAt: new Date().toISOString()
      };
    },

    // إدارة جداول الإهلاك
    depreciationSchedules,
    generateDepreciationSchedule: (assetId) => {
      const asset = fixedAssets.find(a => a.id === assetId);
      if (!asset) {
        throw new Error('الأصل غير موجود');
      }

      const method = depreciationMethods.find(m => m.id === asset.depreciationMethodId);
      if (!method) {
        throw new Error('طريقة الإهلاك غير موجودة');
      }

      const schedule = [];
      let currentValue = asset.originalCost;
      let totalDepreciation = 0;
      const startDate = new Date(asset.depreciationStartDate || asset.purchaseDate);
      const monthsTotal = asset.usefulLife * 12;

      for (let month = 1; month <= monthsTotal; month++) {
        const periodDate = new Date(startDate);
        periodDate.setMonth(periodDate.getMonth() + (month - 1));

        let depreciationAmount = 0;

        if (method.type === 'straight_line') {
          depreciationAmount = (currentValue - asset.salvageValue) / (monthsTotal - (month - 1));
        } else if (method.type === 'declining_balance') {
          const rate = method.depreciationRate || 0.2;
          depreciationAmount = currentValue * rate;
          if (currentValue - depreciationAmount < asset.salvageValue) {
            depreciationAmount = currentValue - asset.salvageValue;
          }
        }

        currentValue -= depreciationAmount;
        totalDepreciation += depreciationAmount;

        schedule.push({
          id: Date.now() + month,
          assetId: assetId,
          period: month,
          periodDate: periodDate.toISOString(),
          beginningValue: currentValue + depreciationAmount,
          depreciationAmount: depreciationAmount,
          accumulatedDepreciation: totalDepreciation,
          endingValue: currentValue,
          status: month <= 12 ? 'Current' : 'Future'
        });
      }

      const updated = [...depreciationSchedules, ...schedule];
      setDepreciationSchedules(updated);
      saveData('bero_depreciation_schedules', updated);
      return schedule;
    },
    getDepreciationSchedule: (assetId) => {
      return depreciationSchedules.filter(schedule => schedule.assetId === assetId);
    },

    // إدارة قيود الإهلاك المحاسبية
    depreciationEntries,
    createDepreciationEntry: (entryData) => {
      const { assetId, depreciationAmount, period, description } = entryData;
      const asset = fixedAssets.find(a => a.id === assetId);
      
      if (!asset) {
        throw new Error('الأصل غير موجود');
      }

      const newEntry = {
        id: Date.now(),
        assetId,
        assetName: asset.name,
        depreciationAmount,
        period,
        description: description || `إهلاك الأصل ${asset.name} لفترة ${period}`,
        date: new Date().toISOString(),
        status: 'Posted',
        createdAt: new Date().toISOString()
      };

      // تحديث الأصل
      const updatedAssets = fixedAssets.map(a => {
        if (a.id === assetId) {
          return {
            ...a,
            accumulatedDepreciation: (a.accumulatedDepreciation || 0) + depreciationAmount,
            currentValue: a.currentValue - depreciationAmount,
            bookValue: a.originalCost - (a.accumulatedDepreciation || 0) - depreciationAmount,
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      });

      setFixedAssets(updatedAssets);
      saveData('bero_fixed_assets', updatedAssets);

      const updated = [...depreciationEntries, newEntry];
      setDepreciationEntries(updated);
      saveData('bero_depreciation_entries', updated);
      return newEntry;
    },
    getDepreciationEntriesByAsset: (assetId) => {
      return depreciationEntries.filter(entry => entry.assetId === assetId);
    },
    getDepreciationEntriesByPeriod: (period) => {
      return depreciationEntries.filter(entry => entry.period === period);
    },

    // إدارة الصيانة
    maintenanceSchedules,
    addMaintenanceSchedule: (scheduleData) => {
      const newSchedule = {
        id: Date.now(),
        ...scheduleData,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      const updated = [...maintenanceSchedules, newSchedule];
      setMaintenanceSchedules(updated);
      saveData('bero_maintenance_schedules', updated);
      return newSchedule;
    },
    updateMaintenanceSchedule: (id, updatedData) => {
      const updated = maintenanceSchedules.map(schedule => 
        schedule.id === id ? { ...schedule, ...updatedData, updatedAt: new Date().toISOString() } : schedule
      );
      setMaintenanceSchedules(updated);
      saveData('bero_maintenance_schedules', updated);
    },
    getMaintenanceSchedulesByAsset: (assetId) => {
      return maintenanceSchedules.filter(schedule => schedule.assetId === assetId);
    },
    checkMaintenanceDue: () => {
      const now = new Date();
      return maintenanceSchedules.filter(schedule => {
        const nextDate = new Date(schedule.nextMaintenanceDate);
        const daysDiff = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30 && schedule.status === 'Active'; // خلال 30 يوم
      });
    },

    // سجلات الصيانة
    maintenanceRecords,
    addMaintenanceRecord: (recordData) => {
      const newRecord = {
        id: Date.now(),
        ...recordData,
        createdAt: new Date().toISOString(),
        status: 'Completed'
      };
      const updated = [...maintenanceRecords, newRecord];
      setMaintenanceRecords(updated);
      saveData('bero_maintenance_records', updated);
      return newRecord;
    },
    updateMaintenanceRecord: (id, updatedData) => {
      const updated = maintenanceRecords.map(record => 
        record.id === id ? { ...record, ...updatedData, updatedAt: new Date().toISOString() } : record
      );
      setMaintenanceRecords(updated);
      saveData('bero_maintenance_records', updated);
    },
    getMaintenanceRecordsByAsset: (assetId) => {
      return maintenanceRecords.filter(record => record.assetId === assetId);
    },

    // تكاليف الصيانة
    maintenanceCosts,
    addMaintenanceCost: (costData) => {
      const newCost = {
        id: Date.now(),
        ...costData,
        createdAt: new Date().toISOString()
      };
      const updated = [...maintenanceCosts, newCost];
      setMaintenanceCosts(updated);
      saveData('bero_maintenance_costs', updated);
      return newCost;
    },
    getMaintenanceCostsByAsset: (assetId, startDate = null, endDate = null) => {
      let filteredCosts = maintenanceCosts.filter(cost => cost.assetId === assetId);
      
      if (startDate) {
        filteredCosts = filteredCosts.filter(cost => cost.date >= startDate);
      }
      if (endDate) {
        filteredCosts = filteredCosts.filter(cost => cost.date <= endDate);
      }
      
      return filteredCosts;
    },
    getTotalMaintenanceCostByAsset: (assetId, year = null) => {
      let filteredCosts = maintenanceCosts.filter(cost => cost.assetId === assetId);
      
      if (year) {
        filteredCosts = filteredCosts.filter(cost => new Date(cost.date).getFullYear() === year);
      }
      
      return filteredCosts.reduce((total, cost) => total + (cost.amount || 0), 0);
    },

    // جرد الأصول
    assetInventory,
    createInventory: (inventoryData) => {
      const newInventory = {
        id: Date.now(),
        ...inventoryData,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      const updated = [...assetInventory, newInventory];
      setAssetInventory(updated);
      saveData('bero_asset_inventory', updated);
      return newInventory;
    },
    addInventoryItem: (inventoryId, itemData) => {
      const inventory = assetInventory.find(inv => inv.id === inventoryId);
      if (!inventory) {
        throw new Error('الجرد غير موجود');
      }

      const newItem = {
        id: Date.now(),
        inventoryId,
        assetId: itemData.assetId,
        found: itemData.found !== false,
        actualCondition: itemData.actualCondition || 'Good',
        actualLocation: itemData.actualLocation,
        notes: itemData.notes,
        checkedAt: new Date().toISOString(),
        checkedBy: 1
      };

      // تحديث سجل الجرد
      const updatedInventory = assetInventory.map(inv => {
        if (inv.id === inventoryId) {
          const currentItems = inv.items || [];
          return {
            ...inv,
            items: [...currentItems, newItem]
          };
        }
        return inv;
      });

      setAssetInventory(updatedInventory);
      saveData('bero_asset_inventory', updatedInventory);
      return newItem;
    },

    // تقييم الأصول
    assetValuations,
    addAssetValuation: (valuationData) => {
      const newValuation = {
        id: Date.now(),
        ...valuationData,
        createdAt: new Date().toISOString()
      };
      const updated = [...assetValuations, newValuation];
      setAssetValuations(updated);
      saveData('bero_asset_valuations', updated);
      return newValuation;
    },
    getAssetValuations: (assetId) => {
      return assetValuations.filter(valuation => valuation.assetId === assetId)
        .sort((a, b) => new Date(b.valuationDate) - new Date(a.valuationDate));
    },
    getLatestAssetValuation: (assetId) => {
      const valuations = assetValuations.filter(valuation => valuation.assetId === assetId);
      return valuations.length > 0 ? 
        valuations.sort((a, b) => new Date(b.valuationDate) - new Date(a.valuationDate))[0] : null;
    },

    // التصرفات في الأصول
    assetDisposals,
    createAssetDisposal: (disposalData) => {
      const { assetId, disposalType, disposalDate, disposalAmount, reason } = disposalData;
      const asset = fixedAssets.find(a => a.id === assetId);
      
      if (!asset) {
        throw new Error('الأصل غير موجود');
      }

      const newDisposal = {
        id: Date.now(),
        assetId,
        assetName: asset.name,
        disposalType, // 'sale', 'scrapped', 'donated', 'stolen'
        disposalDate,
        disposalAmount,
        reason,
        status: 'Completed',
        createdAt: new Date().toISOString()
      };

      // تحديث الأصل
      const updatedAssets = fixedAssets.map(a => {
        if (a.id === assetId) {
          return {
            ...a,
            status: 'Disposed',
            disposalDate: disposalDate,
            disposalAmount: disposalAmount,
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      });

      setFixedAssets(updatedAssets);
      saveData('bero_fixed_assets', updatedAssets);

      const updated = [...assetDisposals, newDisposal];
      setAssetDisposals(updated);
      saveData('bero_asset_disposals', updated);
      return newDisposal;
    },
    getAssetDisposals: (assetId) => {
      return assetDisposals.filter(disposal => disposal.assetId === assetId);
    },

    // نقل الأصول
    assetTransfers,
    createAssetTransfer: (transferData) => {
      const { assetId, fromLocationId, toLocationId, transferDate, reason } = transferData;
      const asset = fixedAssets.find(a => a.id === assetId);
      
      if (!asset) {
        throw new Error('الأصل غير موجود');
      }

      const newTransfer = {
        id: Date.now(),
        assetId,
        assetName: asset.name,
        fromLocationId,
        toLocationId,
        transferDate,
        reason,
        status: 'Completed',
        createdAt: new Date().toISOString()
      };

      // تحديث الأصل
      const updatedAssets = fixedAssets.map(a => {
        if (a.id === assetId) {
          return {
            ...a,
            locationId: toLocationId,
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      });

      setFixedAssets(updatedAssets);
      saveData('bero_fixed_assets', updatedAssets);

      const updated = [...assetTransfers, newTransfer];
      setAssetTransfers(updated);
      saveData('bero_asset_transfers', updated);
      return newTransfer;
    },
    getAssetTransfers: (assetId) => {
      return assetTransfers.filter(transfer => transfer.assetId === assetId);
    },

    // اقتناء الأصول
    assetAcquisitions,
    createAssetAcquisition: (acquisitionData) => {
      const newAcquisition = {
        id: Date.now(),
        ...acquisitionData,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      const updated = [...assetAcquisitions, newAcquisition];
      setAssetAcquisitions(updated);
      saveData('bero_asset_acquisitions', updated);
      return newAcquisition;
    },
    getAssetAcquisitions: (assetId) => {
      return assetAcquisitions.filter(acquisition => acquisition.assetId === assetId);
    },

    // تقارير الأصول الثابتة
    getFixedAssetsSummary: () => {
      const activeAssets = fixedAssets.filter(asset => asset.status === 'Active');
      const totalOriginalCost = activeAssets.reduce((sum, asset) => sum + (asset.originalCost || 0), 0);
      const totalCurrentValue = activeAssets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
      const totalAccumulatedDepreciation = activeAssets.reduce((sum, asset) => sum + (asset.accumulatedDepreciation || 0), 0);
      const totalBookValue = activeAssets.reduce((sum, asset) => sum + (asset.bookValue || 0), 0);

      // تجميع حسب الفئات
      const categorySummary = {};
      activeAssets.forEach(asset => {
        const categoryName = assetCategories.find(cat => cat.id === asset.categoryId)?.name || 'غير محدد';
        if (!categorySummary[categoryName]) {
          categorySummary[categoryName] = {
            count: 0,
            originalCost: 0,
            currentValue: 0,
            bookValue: 0
          };
        }
        categorySummary[categoryName].count++;
        categorySummary[categoryName].originalCost += asset.originalCost || 0;
        categorySummary[categoryName].currentValue += asset.currentValue || 0;
        categorySummary[categoryName].bookValue += asset.bookValue || 0;
      });

      return {
        totalAssets: activeAssets.length,
        totalOriginalCost,
        totalCurrentValue,
        totalAccumulatedDepreciation,
        totalBookValue,
        categorySummary,
        averageAssetAge: activeAssets.length > 0 ? 
          activeAssets.reduce((sum, asset) => {
            const purchaseDate = new Date(asset.purchaseDate);
            const currentDate = new Date();
            const years = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
            return sum + years;
          }, 0) / activeAssets.length : 0
      };
    },

    // ==================== نظام الشحن والتوصيل ====================
    
    // إدارة شاحنات الشحن
    shippingVehicles,
    addShippingVehicle: (vehicleData) => {
      const newVehicle = {
        id: Date.now(),
        ...vehicleData,
        status: 'متاح', // متاح، مشغول، صيانة، خارج الخدمة
        currentLocation: 'المخزن الرئيسي',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...shippingVehicles, newVehicle];
      setShippingVehicles(updated);
      saveData('bero_shipping_vehicles', updated);
      return newVehicle;
    },
    updateShippingVehicle: (id, updatedData) => {
      const updated = shippingVehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, ...updatedData, updatedAt: new Date().toISOString() } : vehicle
      );
      setShippingVehicles(updated);
      saveData('bero_shipping_vehicles', updated);
    },
    deleteShippingVehicle: (id) => {
      // التحقق من الشحنات النشطة فقط (التي تمنع الحذف)
      // الشحنات المكتملة أو الملغية لا تمنع حذف الشاحنة
      const activeShipments = shipments.filter(shipment => 
        shipment.vehicleId === id && 
        ['awaiting_pickup', 'in_transit', 'delayed'].includes(shipment.status)
      );
      
      console.log('DataContext: عدد الشحنات النشطة للشاحنة', id, ':', activeShipments.length);
      
      if (activeShipments.length > 0) {
        console.log('DataContext: منع حذف الشاحنة بسبب شحنات نشطة');
        throw new Error('لا يمكن حذف الشاحنة: توجد شحنات نشطة مرتبطة بها');
      }
      
      // لا توجد شحنات نشطة، يمكن حذف الشاحنة
      console.log('DataContext: السماح بحذف الشاحنة');
      const updated = shippingVehicles.filter(vehicle => vehicle.id !== id);
      setShippingVehicles(updated);
      saveData('bero_shipping_vehicles', updated);
    },
    getAvailableVehicles: () => {
      return shippingVehicles.filter(vehicle => vehicle.status === 'متاح');
    },
    updateVehicleStatus: (id, status) => {
      const updated = shippingVehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, status, updatedAt: new Date().toISOString() } : vehicle
      );
      setShippingVehicles(updated);
      saveData('bero_shipping_vehicles', updated);
    },

    // إدارة شحنات التوصيل
    shipments,
    addShipment: (shipmentData) => {
      const newShipment = {
        id: Date.now(),
        ...shipmentData,
        status: 'awaiting_pickup', // awaiting_pickup, in_transit, delivered, delayed, cancelled
        trackingNumber: `SHIP-${Date.now()}`, // رقم تتبع تلقائي
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + (shipmentData.deliveryDays || 1) * 24 * 60 * 60 * 1000).toISOString(),
        actualDelivery: null,
        currentLocation: '',
        history: [
          {
            status: 'awaiting_pickup',
            location: shipmentData.pickupAddress || 'المخزن الرئيسي',
            timestamp: new Date().toISOString(),
            notes: 'تم إنشاء الشحنة'
          }
        ]
      };
      const updated = [...shipments, newShipment];
      setShipments(updated);
      saveData('bero_shipments', updated);
      return newShipment;
    },
    updateShipmentStatus: (id, status, location = '', notes = '') => {
      const updated = shipments.map(shipment => {
        if (shipment.id === id) {
          const historyEntry = {
            status,
            location: location || shipment.currentLocation,
            timestamp: new Date().toISOString(),
            notes
          };
          return {
            ...shipment,
            status,
            currentLocation: location || shipment.currentLocation,
            history: [...(shipment.history || []), historyEntry],
            actualDelivery: status === 'delivered' ? new Date().toISOString() : shipment.actualDelivery,
            updatedAt: new Date().toISOString()
          };
        }
        return shipment;
      });
      setShipments(updated);
      saveData('bero_shipments', updated);
    },
    assignVehicleToShipment: (shipmentId, vehicleId) => {
      const updated = shipments.map(shipment => {
        if (shipment.id === shipmentId) {
          const vehicle = shippingVehicles.find(v => v.id === vehicleId);
          return {
            ...shipment,
            vehicleId,
            vehicleName: vehicle?.name || '',
            driverName: vehicle?.driver || '',
            status: 'in_transit',
            history: [
              ...(shipment.history || []),
              {
                status: 'in_transit',
                location: 'تم تحميل الشحنة',
                timestamp: new Date().toISOString(),
                notes: `تم تخصيص ${vehicle?.name}`
              }
            ]
          };
        }
        return shipment;
      });
      setShipments(updated);
      saveData('bero_shipments', updated);

      // تحديث حالة الشاحنة
      if (vehicleId) {
        const updatedVehicles = shippingVehicles.map(v => 
          v.id === vehicleId ? { ...v, status: 'مشغول', updatedAt: new Date().toISOString() } : v
        );
        setShippingVehicles(updatedVehicles);
        saveData('bero_shipping_vehicles', updatedVehicles);
      }
    },
    getShipmentById: (id) => {
      return shipments.find(shipment => shipment.id === id);
    },
    getShipmentsByInvoice: (invoiceId) => {
      return shipments.filter(shipment => shipment.invoiceId === invoiceId);
    },
    getShipmentsByStatus: (status) => {
      return shipments.filter(shipment => shipment.status === status);
    },
    getShipmentsByDateRange: (startDate, endDate) => {
      return shipments.filter(shipment => 
        shipment.createdAt >= startDate && shipment.createdAt <= endDate
      );
    },


    // سجلات الشحن التفصيلية
    shippingRecords,
    addShippingRecord: (recordData) => {
      const newRecord = {
        id: Date.now(),
        ...recordData,
        createdAt: new Date().toISOString()
      };
      const updated = [...shippingRecords, newRecord];
      setShippingRecords(updated);
      saveData('bero_shipping_records', updated);
      return newRecord;
    },
    getShippingRecordsByShipment: (shipmentId) => {
      return shippingRecords.filter(record => record.shipmentId === shipmentId);
    },
    getShippingRecordsByVehicle: (vehicleId, startDate = null, endDate = null) => {
      let filteredRecords = shippingRecords.filter(record => record.vehicleId === vehicleId);
      
      if (startDate) {
        filteredRecords = filteredRecords.filter(record => record.date >= startDate);
      }
      if (endDate) {
        filteredRecords = filteredRecords.filter(record => record.date <= endDate);
      }
      
      return filteredRecords;
    },
    
    // التقارير والإحصائيات
    getShippingDashboard: () => {
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const todayShipments = shipments.filter(s => s.createdAt.startsWith(today));
      const thisMonthShipments = shipments.filter(s => s.createdAt.startsWith(thisMonth));
      const activeVehicles = shippingVehicles.filter(v => v.status === 'متاح').length;
      const totalVehicles = shippingVehicles.length;
      
      const deliveredThisMonth = thisMonthShipments.filter(s => s.status === 'delivered').length;
      const inTransitThisMonth = thisMonthShipments.filter(s => s.status === 'in_transit').length;
      const delayedThisMonth = thisMonthShipments.filter(s => s.status === 'delayed').length;
      
      return {
        todayShipments: todayShipments.length,
        thisMonthShipments: thisMonthShipments.length,
        deliveredThisMonth,
        inTransitThisMonth,
        delayedThisMonth,
        activeVehicles,
        totalVehicles,
        vehicleUtilization: totalVehicles > 0 ? ((totalVehicles - activeVehicles) / totalVehicles * 100).toFixed(1) : 0,
        onTimeDeliveryRate: thisMonthShipments.length > 0 ? 
          (deliveredThisMonth / thisMonthShipments.length * 100).toFixed(1) : 0
      };
    },
    getShippingAnalytics: (startDate, endDate) => {
      const filteredShipments = shipments.filter(s => 
        s.createdAt >= startDate && s.createdAt <= endDate
      );
      
      const totalRevenue = filteredShipments.reduce((sum, shipment) => sum + (shipment.cost || 0), 0);
      const deliveredShipments = filteredShipments.filter(s => s.status === 'delivered').length;
      const delayedShipments = filteredShipments.filter(s => s.status === 'delayed').length;
      const inTransitShipments = filteredShipments.filter(s => s.status === 'in_transit').length;
      
      // تحليل حسب نوع الشاحنة
      const vehicleTypeAnalysis = {};
      filteredShipments.forEach(shipment => {
        const vehicle = shippingVehicles.find(v => v.id === shipment.vehicleId);
        const type = vehicle?.vehicleType || 'غير محدد';
        
        if (!vehicleTypeAnalysis[type]) {
          vehicleTypeAnalysis[type] = {
            count: 0,
            totalCost: 0,
            delivered: 0,
            delayed: 0
          };
        }
        
        vehicleTypeAnalysis[type].count++;
        vehicleTypeAnalysis[type].totalCost += shipment.cost || 0;
        if (shipment.status === 'delivered') vehicleTypeAnalysis[type].delivered++;
        if (shipment.status === 'delayed') vehicleTypeAnalysis[type].delayed++;
      });
      
      return {
        totalShipments: filteredShipments.length,
        totalRevenue: totalRevenue.toFixed(2),
        deliveredShipments,
        delayedShipments,
        inTransitShipments,
        vehicleTypeAnalysis,
        averageCostPerShipment: filteredShipments.length > 0 ? 
          (totalRevenue / filteredShipments.length).toFixed(2) : 0
      };
    },

    // ==================== نظام سلة المهملات ====================
    deletedItems,
    
    // استعادة عنصر محذوف
    restoreDeletedItem: (deletedItemId) => {
      const deletedItem = deletedItems.find(item => item.id === deletedItemId);
      if (!deletedItem) {
        throw new Error('العنصر المحذوف غير موجود');
      }

      // استعادة العنصر حسب نوعه
      switch (deletedItem.type) {
        case 'product':
          const restoredProduct = { ...deletedItem.data };
          const updatedProducts = [...products, restoredProduct];
          setProducts(updatedProducts);
          saveData('bero_products', updatedProducts);
          logActivity('product_restore', `استعادة منتج: ${restoredProduct.name}`, { productId: restoredProduct.id, productName: restoredProduct.name });
          break;
          
        case 'customer':
          const restoredCustomer = { ...deletedItem.data };
          const updatedCustomers = [...customers, restoredCustomer];
          setCustomers(updatedCustomers);
          saveData('bero_customers', updatedCustomers);
          logActivity('customer_restore', `استعادة عميل: ${restoredCustomer.name}`, { customerId: restoredCustomer.id, customerName: restoredCustomer.name });
          break;
          
        case 'invoice':
          const restoredInvoice = { ...deletedItem.data };
          const updatedInvoices = [...salesInvoices, restoredInvoice];
          setSalesInvoices(updatedInvoices);
          saveData('bero_sales_invoices', updatedInvoices);
          
          // استعادة المعاملات المالية المرتبطة إذا كانت نقدية
          if (restoredInvoice.paymentType === 'cash') {
            const receiptData = {
              amount: restoredInvoice.total,
              fromType: 'customer',
              fromId: restoredInvoice.customerId,
              description: `مبيعات نقدية من العميل - فاتورة رقم ${restoredInvoice.id} (مستعادة)`,
              reference: `فاتورة مبيعات ${restoredInvoice.id}`,
              type: 'sales_payment'
            };
            
            const newReceipt = {
              id: Date.now(),
              ...receiptData,
              date: new Date().toISOString()
            };
            
            const updatedReceipts = [...cashReceipts, newReceipt];
            setCashReceipts(updatedReceipts);
            saveData('bero_cash_receipts', updatedReceipts);
            
            const newBalance = treasuryBalance + restoredInvoice.total;
            setTreasuryBalance(newBalance);
            saveData('bero_treasury_balance', newBalance);
          }
          
          // خصم الكميات من المخزون
          if (restoredInvoice.items && Array.isArray(restoredInvoice.items)) {
            let productsCopy = [...products];
            restoredInvoice.items.forEach(item => {
              const productIndex = productsCopy.findIndex(p => p.id === parseInt(item.productId));
              if (productIndex !== -1) {
                const mainQty = parseInt(item.mainQuantity || item.quantity) || 0;
                const subQty = parseInt(item.subQuantity) || 0;
                
                productsCopy[productIndex] = {
                  ...productsCopy[productIndex],
                  mainQuantity: (productsCopy[productIndex].mainQuantity || 0) - mainQty,
                  subQuantity: (productsCopy[productIndex].subQuantity || 0) - subQty
                };
              }
            });
            setProducts(productsCopy);
            saveData('bero_products', productsCopy);
          }
          
          // تسجيل النشاط
          const customer = customers.find(c => c.id === parseInt(restoredInvoice.customerId));
          logActivity('invoice_restore', `استعادة فاتورة مبيعات #${restoredInvoice.id} - ${customer?.name || 'غير محدد'}`, { 
            invoiceId: restoredInvoice.id, 
            customerId: restoredInvoice.customerId 
          });
          break;
        
        case 'cash_receipt':
          // استعادة إيصال الاستلام النقدي
          const restoredReceipt = { ...deletedItem.data };
          const updatedCashReceipts = [...cashReceipts, restoredReceipt];
          setCashReceipts(updatedCashReceipts);
          saveData('bero_cash_receipts', updatedCashReceipts);
          
          // إضافة المبلغ للخزينة
          const newReceiptBalance = treasuryBalance + parseFloat(restoredReceipt.amount);
          setTreasuryBalance(newReceiptBalance);
          saveData('bero_treasury_balance', newReceiptBalance);
          
          // تسجيل النشاط
          logActivity('cash_receipt', `استعادة إيصال استلام نقدي #${restoredReceipt.id} - ${restoredReceipt.from} - ${restoredReceipt.amount} ج.م`, { receiptId: restoredReceipt.id, amount: restoredReceipt.amount });
          break;
        
        case 'cash_disbursement':
          // استعادة إيصال الصرف النقدي
          const restoredDisbursement = { ...deletedItem.data };
          const updatedCashDisbursements = [...cashDisbursements, restoredDisbursement];
          setCashDisbursements(updatedCashDisbursements);
          saveData('bero_cash_disbursements', updatedCashDisbursements);
          
          // خصم المبلغ من الخزينة
          const newDisbursementBalance = treasuryBalance - parseFloat(restoredDisbursement.amount);
          if (newDisbursementBalance < 0) {
            throw new Error('لا يمكن استعادة إيصال الصرف: الرصيد غير كافٍ');
          }
          setTreasuryBalance(newDisbursementBalance);
          saveData('bero_treasury_balance', newDisbursementBalance);
          
          // تسجيل النشاط
          logActivity('cash_disbursement', `استعادة إيصال صرف نقدي #${restoredDisbursement.id} - ${restoredDisbursement.to} - ${restoredDisbursement.amount} ج.م`, { disbursementId: restoredDisbursement.id, amount: restoredDisbursement.amount });
          break;
        
        case 'warehouse':
          // استعادة المخزن
          const restoredWarehouse = { ...deletedItem.data };
          const updatedWarehouses = [...warehouses, restoredWarehouse];
          setWarehouses(updatedWarehouses);
          saveData('bero_warehouses', updatedWarehouses);
          logActivity('warehouse_restore', `استعادة مخزن: ${restoredWarehouse.name}`, { warehouseId: restoredWarehouse.id, warehouseName: restoredWarehouse.name });
          break;
        
        case 'category':
          // استعادة الفئة
          const restoredCategory = { ...deletedItem.data };
          const updatedCategories = [...categories, restoredCategory];
          setCategories(updatedCategories);
          saveData('bero_categories', updatedCategories);
          logActivity('category_restore', `استعادة فئة: ${restoredCategory.name}`, { categoryId: restoredCategory.id, categoryName: restoredCategory.name });
          break;
        
        case 'supplier':
          // استعادة المورد
          const restoredSupplier = { ...deletedItem.data };
          const updatedSuppliers = [...suppliers, restoredSupplier];
          setSuppliers(updatedSuppliers);
          saveData('bero_suppliers', updatedSuppliers);
          logActivity('supplier_restore', `استعادة مورد: ${restoredSupplier.name}`, { supplierId: restoredSupplier.id, supplierName: restoredSupplier.name });
          break;
        
        case 'account':
          // استعادة الحساب
          const restoredAccount = { ...deletedItem.data };
          const updatedAccounts = [...accounts, restoredAccount];
          setAccounts(updatedAccounts);
          saveData('bero_accounts', updatedAccounts);
          logActivity('account_restore', `استعادة حساب: ${restoredAccount.code} - ${restoredAccount.name}`, { 
            accountId: restoredAccount.id, 
            accountCode: restoredAccount.code,
            accountName: restoredAccount.name 
          });
          break;
        
        case 'purchase_return':
          // استعادة مرتجع المشتريات
          const restoredPurchaseReturn = { ...deletedItem.data };
          const updatedPurchaseReturns = [...purchaseReturns, restoredPurchaseReturn];
          setPurchaseReturns(updatedPurchaseReturns);
          saveData('bero_purchase_returns', updatedPurchaseReturns);
          logActivity('return_purchase_restore', `استعادة مرتجع مشتريات #${restoredPurchaseReturn.id}`, { 
            returnId: restoredPurchaseReturn.id,
            invoiceId: restoredPurchaseReturn.invoiceId 
          });
          break;
        
        case 'sales_return':
          // استعادة مرتجع المبيعات
          const restoredSalesReturn = { ...deletedItem.data };
          const updatedSalesReturns = [...salesReturns, restoredSalesReturn];
          setSalesReturns(updatedSalesReturns);
          saveData('bero_sales_returns', updatedSalesReturns);
          logActivity('return_sales_restore', `استعادة مرتجع مبيعات #${restoredSalesReturn.id}`, { 
            returnId: restoredSalesReturn.id,
            invoiceId: restoredSalesReturn.invoiceId 
          });
          break;
          
        default:
          throw new Error('نوع العنصر غير مدعوم');
      }

      // إزالة العنصر من سلة المهملات
      const updatedDeleted = deletedItems.filter(item => item.id !== deletedItemId);
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
    },
    
    // حذف نهائي لعنصر من سلة المهملات
    permanentlyDeleteItem: (deletedItemId) => {
      const updatedDeleted = deletedItems.filter(item => item.id !== deletedItemId);
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
    },
    
    // الحصول على المحذوفات حسب النوع
    getDeletedItemsByType: (type) => {
      return deletedItems.filter(item => item.type === type);
    },
    
    // تفريغ سلة المهملات حسب النوع
    clearTrashByType: (type) => {
      const updatedDeleted = deletedItems.filter(item => item.type !== type);
      setDeletedItems(updatedDeleted);
      saveData('bero_deleted_items', updatedDeleted);
    },
    
    // تفريغ سلة المهملات بالكامل
    clearAllTrash: () => {
      setDeletedItems([]);
      saveData('bero_deleted_items', []);
    },

    // ==================== دوال نظام تسجيل الأنشطة ====================
    
    // تسجيل نشاط جديد
    logActivity,
    
    // أرشفة أنشطة اليوم السابق
    archiveDailyActivities: () => {
      if (dailyActivities.length === 0) return;
      
      const archiveEntry = {
        id: Date.now(),
        date: currentSessionDate,
        activities: dailyActivities,
        archivedAt: new Date().toISOString(),
        totalActivities: dailyActivities.length
      };
      
      const updatedArchive = [...activitiesArchive, archiveEntry];
      setActivitiesArchive(updatedArchive);
      saveData('bero_activities_archive', updatedArchive);
      
      // مسح الأنشطة اليومية
      setDailyActivities([]);
      saveData('bero_daily_activities', []);
    },
    
    // الحصول على الأنشطة اليومية
    getDailyActivities: () => dailyActivities,
    
    // الحصول على أرشيف الأنشطة
    getActivitiesArchive: () => activitiesArchive,
    
    // الحصول على أرشيف يوم معين
    getActivitiesByDate: (date) => {
      const archive = activitiesArchive.find(a => a.date === date);
      return archive ? archive.activities : [];
    },
    
    // مسح الأنشطة اليومية
    clearDailyActivities: () => {
      setDailyActivities([]);
      saveData('bero_daily_activities', []);
    },

    // دوال وأقسام إضافية للأصول الثابتة مدمجة في الدوال أعلاه
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
