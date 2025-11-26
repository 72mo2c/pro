// ======================================
// Data Context مع قاعدة البيانات - إدارة بيانات النظام
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateStockWithSmartPurchase } from '../utils/dataContextUpdates.js';
import {
  initializeDatabase,
  checkDatabaseStatus,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  migrationManager
} from '../services/databaseService.js';

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
  // ==================== حالة قاعدة البيانات ====================
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState({
    connected: false,
    message: 'جاري تهيئة قاعدة البيانات...',
    error: null
  });

  // ==================== حالة الترحيل ====================
  const [migrationStatus, setMigrationStatus] = useState({
    isMigrating: false,
    progress: 0,
    status: 'ready',
    error: null
  });

  // ==================== بيانات المخازن ====================
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
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
  const [cashReceipts, setCashReceipts] = useState([]);
  const [cashDisbursements, setCashDisbursements] = useState([]);
  
  // بيانات التحويلات بين المخازن
  const [transfers, setTransfers] = useState([]);
  
  // بيانات نظام المحاسبة
  const [accounts, setAccounts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);

  // بيانات نظام الموارد البشرية
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [employeeLeaveBalances, setEmployeeLeaveBalances] = useState([]);
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [payrollDetails, setPayrollDetails] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);

  // بيانات نظام الإنتاج
  const [productionOrders, setProductionOrders] = useState([]);
  const [bomItems, setBomItems] = useState([]);
  const [productionOperations, setProductionOperations] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [productionPlans, setProductionPlans] = useState([]);
  const [materialConsumption, setMaterialConsumption] = useState([]);
  const [productionWaste, setProductionWaste] = useState([]);
  const [qualityControls, setQualityControls] = useState([]);
  const [productionKPIs, setProductionKPIs] = useState([]);

  // بيانات نظام الأصول الثابتة
  const [fixedAssets, setFixedAssets] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [assetLocations, setAssetLocations] = useState([]);
  const [depreciationMethods, setDepreciationMethods] = useState([]);
  const [depreciationSchedules, setDepreciationSchedules] = useState([]);
  const [depreciationEntries, setDepreciationEntries] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [maintenanceCosts, setMaintenanceCosts] = useState([]);
  const [assetInventory, setAssetInventory] = useState([]);
  const [assetValuations, setAssetValuations] = useState([]);
  const [assetDisposals, setAssetDisposals] = useState([]);
  const [assetTransfers, setAssetTransfers] = useState([]);
  const [assetAcquisitions, setAssetAcquisitions] = useState([]);

  // بيانات نظام الشحن والتوصيل
  const [shippingVehicles, setShippingVehicles] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [shippingRecords, setShippingRecords] = useState([]);

  // ==================== نظام سلة المهملات ====================
  const [deletedItems, setDeletedItems] = useState([]);

  // ==================== نظام تسجيل الأنشطة ====================
  const [dailyActivities, setDailyActivities] = useState([]);
  const [activitiesArchive, setActivitiesArchive] = useState([]);
  const [currentSessionDate, setCurrentSessionDate] = useState(new Date().toISOString().split('T')[0]);

  // ==================== تهيئة قاعدة البيانات ====================
  const initializeData = async () => {
    try {
      setDatabaseStatus({
        connected: false,
        message: 'جاري تهيئة قاعدة البيانات...',
        error: null
      });

      // تهيئة قاعدة البيانات
      const initResult = await initializeDatabase();
      if (!initResult.success) {
        throw new Error(initResult.error || 'فشل في تهيئة قاعدة البيانات');
      }

      // فحص حالة قاعدة البيانات
      const status = await checkDatabaseStatus();
      setDatabaseStatus(status);

      if (status.connected) {
        setDatabaseReady(true);
        await loadAllDataFromDatabase();
      }

    } catch (error) {
      console.error('خطأ في تهيئة قاعدة البيانات:', error);
      setDatabaseStatus({
        connected: false,
        message: 'فشل في تهيئة قاعدة البيانات',
        error: error.message
      });
    }
  };

  // ==================== تحميل البيانات من قاعدة البيانات ====================
  const loadAllDataFromDatabase = async () => {
    try {
      // تحميل المخازن
      const warehousesResult = await getWarehouses();
      if (warehousesResult.success) {
        setWarehouses(warehousesResult.data);
      }

      // تحميل المنتجات
      const productsResult = await getProducts();
      if (productsResult.success) {
        setProducts(productsResult.data);
      }

      // تحميل العملاء
      const customersResult = await getCustomers();
      if (customersResult.success) {
        setCustomers(customersResult.data);
      }

      // تحميل الموردين
      const suppliersResult = await getSuppliers();
      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data);
      }

      console.log('تم تحميل البيانات من قاعدة البيانات بنجاح');

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  };

  // ==================== بدء الترحيل ====================
  const startMigration = async () => {
    try {
      setMigrationStatus(prev => ({ ...prev, isMigrating: true, status: 'starting' }));

      const result = await migrationManager.startMigration((progress, message) => {
        setMigrationStatus(prev => ({
          ...prev,
          progress,
          status: message
        }));
      });

      if (result.success) {
        // إعادة تحميل البيانات
        await loadAllDataFromDatabase();
        setMigrationStatus(prev => ({ ...prev, isMigrating: false, status: 'completed' }));
      }

    } catch (error) {
      setMigrationStatus(prev => ({
        ...prev,
        isMigrating: false,
        status: 'failed',
        error: error.message
      }));
      throw error;
    }
  };

  // ==================== تأثير تهيئة النظام ====================
  useEffect(() => {
    initializeData();
  }, []);

  // ==================== دوال نظام الشحن (مُعرَّفة مبكراً) ====================
  const calculateShipmentCost = (shipmentData) => {
    const { vehicleId, totalWeight = 100, deliveryDays = 1, sameDay = false } = shipmentData;
    
    let baseCost = 50;
    
    if (vehicleId) {
      baseCost = 60;
    }
    
    const weightCost = totalWeight > 100 ? (totalWeight - 100) * 0.5 : 0;
    const sameDayCost = sameDay ? 25 : 0;
    
    return baseCost + weightCost + sameDayCost;
  };

  // ==================== دوال توليد أرقام الفواتير ====================
  const getNextPurchaseInvoiceId = () => {
    if (purchaseInvoices.length === 0) return 1;
    const maxId = Math.max(...purchaseInvoices.map(inv => inv.id));
    return maxId + 1;
  };

  const getNextSalesInvoiceId = () => {
    if (salesInvoices.length === 0) return 1;
    const maxId = Math.max(...salesInvoices.map(inv => inv.id));
    return maxId + 1;
  };

  // ==================== دوال تسجيل النشاط ====================
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
    
    // حفظ في LocalStorage كنسخة احتياطية
    localStorage.setItem('bero_daily_activities', JSON.stringify(updatedActivities));
    
    return activity;
  };

  // ==================== دوال المخازن ====================
  const addWarehouse = async (warehouse) => {
    try {
      if (databaseReady) {
        const result = await createWarehouse(warehouse);
        if (result.success) {
          const newWarehouse = result.data;
          setWarehouses(prev => [...prev, newWarehouse]);
          logActivity('warehouse_add', `إضافة مخزن جديد: ${newWarehouse.name}`, { 
            warehouseId: newWarehouse.id, 
            warehouseName: newWarehouse.name 
          });
          return newWarehouse;
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        const newWarehouse = { id: Date.now(), ...warehouse };
        const updated = [...warehouses, newWarehouse];
        setWarehouses(updated);
        localStorage.setItem('bero_warehouses', JSON.stringify(updated));
        logActivity('warehouse_add', `إضافة مخزن جديد: ${newWarehouse.name}`, { 
          warehouseId: newWarehouse.id, 
          warehouseName: newWarehouse.name 
        });
        return newWarehouse;
      }
    } catch (error) {
      console.error('خطأ في إضافة المخزن:', error);
      throw error;
    }
  };

  const updateWarehouse = async (id, updatedData) => {
    try {
      if (databaseReady) {
        const result = await updateWarehouse(id, updatedData);
        if (result.success) {
          setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updatedData } : w));
          logActivity('warehouse_edit', `تعديل مخزن: ${result.data.name}`, { 
            warehouseId: id, 
            warehouseName: result.data.name 
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updatedData } : w));
        localStorage.setItem('bero_warehouses', JSON.stringify(warehouses));
        logActivity('warehouse_edit', `تعديل مخزن: ${updatedData.name}`, { warehouseId: id });
      }
    } catch (error) {
      console.error('خطأ في تحديث المخزن:', error);
      throw error;
    }
  };

  const deleteWarehouse = async (id) => {
    try {
      if (databaseReady) {
        const result = await deleteWarehouse(id);
        if (result.success) {
          setWarehouses(prev => prev.filter(w => w.id !== id));
          logActivity('warehouse_delete', `حذف مخزن`, { warehouseId: id });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        const warehouse = warehouses.find(w => w.id === id);
        const updated = warehouses.filter(w => w.id !== id);
        setWarehouses(updated);
        localStorage.setItem('bero_warehouses', JSON.stringify(updated));
        
        if (warehouse) {
          logActivity('warehouse_delete', `حذف مخزن: ${warehouse.name}`, { warehouseId: id });
        }
      }
    } catch (error) {
      console.error('خطأ في حذف المخزن:', error);
      throw error;
    }
  };

  // ==================== دوال المنتجات ====================
  const addProduct = async (product) => {
    try {
      if (databaseReady) {
        const result = await createProduct(product);
        if (result.success) {
          const newProduct = result.data;
          setProducts(prev => [...prev, newProduct]);
          logActivity('product_add', `إضافة منتج جديد: ${newProduct.name}`, { 
            productId: newProduct.id, 
            productName: newProduct.name 
          });
          return newProduct;
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        const newProduct = { id: Date.now(), ...product };
        const updated = [...products, newProduct];
        setProducts(updated);
        localStorage.setItem('bero_products', JSON.stringify(updated));
        logActivity('product_add', `إضافة منتج جديد: ${newProduct.name}`, { 
          productId: newProduct.id, 
          productName: newProduct.name 
        });
        return newProduct;
      }
    } catch (error) {
      console.error('خطأ في إضافة المنتج:', error);
      throw error;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      if (databaseReady) {
        const result = await updateProduct(id, updatedData);
        if (result.success) {
          setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
          logActivity('product_edit', `تعديل منتج: ${result.data.name}`, { 
            productId: id, 
            productName: result.data.name 
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
        localStorage.setItem('bero_products', JSON.stringify(products));
        logActivity('product_edit', `تعديل منتج: ${updatedData.name}`, { productId: id });
      }
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      if (databaseReady) {
        const result = await deleteProduct(id);
        if (result.success) {
          setProducts(prev => prev.filter(p => p.id !== id));
          logActivity('product_delete', `حذف منتج`, { productId: id });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        const product = products.find(p => p.id === id);
        const updated = products.filter(p => p.id !== id);
        setProducts(updated);
        localStorage.setItem('bero_products', JSON.stringify(updated));
        
        if (product) {
          logActivity('product_delete', `حذف منتج: ${product.name}`, { productId: id });
        }
      }
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
      throw error;
    }
  };

  // ==================== دوال العملاء ====================
  const addCustomer = async (customer) => {
    try {
      if (databaseReady) {
        const result = await createCustomer(customer);
        if (result.success) {
          const newCustomer = result.data;
          setCustomers(prev => [...prev, newCustomer]);
          logActivity('customer_add', `إضافة عميل جديد: ${newCustomer.name}`, { 
            customerId: newCustomer.id, 
            customerName: newCustomer.name 
          });
          return newCustomer;
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        const newCustomer = { id: Date.now(), ...customer };
        const updated = [...customers, newCustomer];
        setCustomers(updated);
        localStorage.setItem('bero_customers', JSON.stringify(updated));
        logActivity('customer_add', `إضافة عميل جديد: ${newCustomer.name}`, { 
          customerId: newCustomer.id, 
          customerName: newCustomer.name 
        });
        return newCustomer;
      }
    } catch (error) {
      console.error('خطأ في إضافة العميل:', error);
      throw error;
    }
  };

  const updateCustomer = async (id, updatedData) => {
    try {
      if (databaseReady) {
        const result = await updateCustomer(id, updatedData);
        if (result.success) {
          setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
          logActivity('customer_edit', `تعديل عميل: ${result.data.name}`, { 
            customerId: id, 
            customerName: result.data.name 
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
        localStorage.setItem('bero_customers', JSON.stringify(customers));
        logActivity('customer_edit', `تعديل عميل: ${updatedData.name}`, { customerId: id });
      }
    } catch (error) {
      console.error('خطأ في تحديث العميل:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      if (databaseReady) {
        const result = await deleteCustomer(id);
        if (result.success) {
          setCustomers(prev => prev.filter(c => c.id !== id));
          logActivity('customer_delete', `حذف عميل`, { customerId: id });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback لـ LocalStorage
        const customer = customers.find(c => c.id === id);
        const updated = customers.filter(c => c.id !== id);
        setCustomers(updated);
        localStorage.setItem('bero_customers', JSON.stringify(updated));
        
        if (customer) {
          logActivity('customer_delete', `حذف عميل: ${customer.name}`, { customerId: id });
        }
      }
    } catch (error) {
      console.error('خطأ في حذف العميل:', error);
      throw error;
    }
  };

  // ==================== قيمة السياق ====================
  const value = {
    // حالة النظام
    databaseReady,
    databaseStatus,
    migrationStatus,
    startMigration,

    // ==================== دوال نظام الشحن ====================
    calculateShipmentCost,

    // بيانات المخازن
    warehouses,
    products,
    categories,
    
    // بيانات المشتريات
    purchases,
    purchaseInvoices,
    purchaseReturns,
    
    // بيانات المبيعات
    sales,
    salesInvoices,
    salesReturns,
    
    // بيانات العملاء والموردين
    suppliers,
    customers,
    
    // بيانات الخزينة
    treasuryBalance,
    cashReceipts,
    cashDisbursements,
    
    // بيانات التحويلات
    transfers,
    
    // بيانات المحاسبة
    accounts,
    journalEntries,

    // بيانات الموارد البشرية
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

    // بيانات الإنتاج
    productionOrders,
    bomItems,
    productionOperations,
    workCenters,
    productionPlans,
    materialConsumption,
    productionWaste,
    qualityControls,
    productionKPIs,

    // بيانات الأصول الثابتة
    fixedAssets,
    assetCategories,
    assetLocations,
    depreciationMethods,
    depreciationSchedules,
    depreciationEntries,
    maintenanceSchedules,
    maintenanceRecords,
    maintenanceCosts,
    assetInventory,
    assetValuations,
    assetDisposals,
    assetTransfers,
    assetAcquisitions,

    // بيانات الشحن
    shippingVehicles,
    shipments,
    shippingRecords,

    // البيانات المحذوفة
    deletedItems,

    // بيانات الأنشطة
    dailyActivities,
    activitiesArchive,
    currentSessionDate,

    // ==================== دوال توليد أرقام الفواتير ====================
    getNextPurchaseInvoiceId,
    getNextSalesInvoiceId,

    // ==================== دوال المخازن ====================
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,

    // ==================== دوال المنتجات ====================
    addProduct,
    updateProduct,
    deleteProduct,

    // ==================== دوال العملاء ====================
    addCustomer,
    updateCustomer,
    deleteCustomer,

    // ==================== دوال الموردين ====================
    addSupplier: (supplier) => {
      if (databaseReady) {
        // استخدام قاعدة البيانات
        return createSupplier(supplier).then(result => {
          if (result.success) {
            const newSupplier = result.data;
            setSuppliers(prev => [...prev, newSupplier]);
            logActivity('supplier_add', `إضافة مورد جديد: ${newSupplier.name}`, { 
              supplierId: newSupplier.id, 
              supplierName: newSupplier.name 
            });
            return newSupplier;
          } else {
            throw new Error(result.error);
          }
        });
      } else {
        // Fallback لـ LocalStorage
        const newSupplier = { id: Date.now(), ...supplier };
        const updated = [...suppliers, newSupplier];
        setSuppliers(updated);
        localStorage.setItem('bero_suppliers', JSON.stringify(updated));
        logActivity('supplier_add', `إضافة مورد جديد: ${newSupplier.name}`, { 
          supplierId: newSupplier.id, 
          supplierName: newSupplier.name 
        });
        return Promise.resolve(newSupplier);
      }
    },

    // ==================== دوال تسجيل النشاط ====================
    logActivity,

    // ==================== باقي الدوال (مختصرة للوضوح) ====================
    // هنا يمكن إضافة باقي الدوال بنفس النمط...
    
    // للحصول على أرصدة العملاء والموردين
    getCustomerBalance: (customerId) => {
      // حساب الرصيد من الفواتير والدفعات
      return 0; // تنفيذ مبسط
    },

    getSupplierBalance: (supplierId) => {
      // حساب الرصيد من الفواتير والمدفوعات
      return 0; // تنفيذ مبسط
    },

    // دوال الخزينة
    addCashReceipt: (receiptData) => {
      const newReceipt = { id: Date.now(), ...receiptData };
      setCashReceipts(prev => [...prev, newReceipt]);
      setTreasuryBalance(prev => prev + receiptData.amount);
      return newReceipt;
    },

    addCashDisbursement: (disbursementData) => {
      const newDisbursement = { id: Date.now(), ...disbursementData };
      setCashDisbursements(prev => [...prev, newDisbursement]);
      setTreasuryBalance(prev => prev - disbursementData.amount);
      return newDisbursement;
    },

    deleteCashReceipt: (id) => {
      const receipt = cashReceipts.find(r => r.id === id);
      if (receipt) {
        setCashReceipts(prev => prev.filter(r => r.id !== id));
        setTreasuryBalance(prev => prev - receipt.amount);
      }
    },

    deleteCashDisbursement: (id) => {
      const disbursement = cashDisbursements.find(d => d.id === id);
      if (disbursement) {
        setCashDisbursements(prev => prev.filter(d => d.id !== id));
        setTreasuryBalance(prev => prev + disbursement.amount);
      }
    },

    // دوال سلة المهملات
    restoreDeletedItem: (deletedItemId) => {
      const deletedItem = deletedItems.find(item => item.id === deletedItemId);
      if (deletedItem) {
        // تنفيذ الاستعادة حسب النوع
        setDeletedItems(prev => prev.filter(item => item.id !== deletedItemId));
      }
    },

    permanentlyDeleteItem: (deletedItemId) => {
      setDeletedItems(prev => prev.filter(item => item.id !== deletedItemId));
    },

    // دوال الأنشطة
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
      setDailyActivities([]);
      localStorage.setItem('bero_activities_archive', JSON.stringify(updatedArchive));
    },

    getDailyActivities: () => dailyActivities,
    getActivitiesArchive: () => activitiesArchive,
    getActivitiesByDate: (date) => {
      const archive = activitiesArchive.find(a => a.date === date);
      return archive ? archive.activities : [];
    },

    clearDailyActivities: () => {
      setDailyActivities([]);
      localStorage.removeItem('bero_daily_activities');
    }
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
