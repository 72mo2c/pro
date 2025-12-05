// ======================================
// Database Service - خدمة قاعدة البيانات
// ======================================

import { invoke } from '@tauri-apps/api/tauri';

// ======================================
// Database Initialization
// ======================================

/**
 * تهيئة قاعدة البيانات
 */
export const initializeDatabase = async () => {
  try {
    const result = await invoke('initialize_database');
    return result;
  } catch (error) {
    console.error('خطأ في تهيئة قاعدة البيانات:', error);
    throw error;
  }
};

/**
 * ترحيل البيانات من LocalStorage إلى SQLite
 */
export const migrateFromLocalStorage = async () => {
  try {
    const result = await invoke('migrate_from_localstorage');
    return result;
  } catch (error) {
    console.error('خطأ في ترحيل البيانات:', error);
    throw error;
  }
};

// ======================================
// Warehouse Operations
// ======================================

/**
 * إضافة مخزن جديد
 */
export const createWarehouse = async (warehouseData) => {
  try {
    const result = await invoke('create_warehouse', { 
      warehouse: {
        name: warehouseData.name,
        address: warehouseData.address,
        phone: warehouseData.phone,
        manager: warehouseData.manager,
        is_active: warehouseData.is_active ?? true
      }
    });
    return result;
  } catch (error) {
    console.error('خطأ في إضافة المخزن:', error);
    throw error;
  }
};

/**
 * جلب جميع المخازن
 */
export const getWarehouses = async () => {
  try {
    const result = await invoke('get_warehouses');
    return result;
  } catch (error) {
    console.error('خطأ في جلب المخازن:', error);
    throw error;
  }
};

/**
 * تحديث مخزن
 */
export const updateWarehouse = async (id, warehouseData) => {
  try {
    const result = await invoke('update_warehouse', { 
      id,
      warehouse: {
        name: warehouseData.name,
        address: warehouseData.address,
        phone: warehouseData.phone,
        manager: warehouseData.manager,
        is_active: warehouseData.is_active ?? true
      }
    });
    return result;
  } catch (error) {
    console.error('خطأ في تحديث المخزن:', error);
    throw error;
  }
};

/**
 * حذف مخزن (إلغاء تفعيل)
 */
export const deleteWarehouse = async (id) => {
  try {
    const result = await invoke('delete_warehouse', { id });
    return result;
  } catch (error) {
    console.error('خطأ في حذف المخزن:', error);
    throw error;
  }
};

// ======================================
// Product Operations
// ======================================

/**
 * إضافة منتج جديد
 */
export const createProduct = async (productData) => {
  try {
    const result = await invoke('create_product', { 
      product: {
        name: productData.name,
        barcode: productData.barcode,
        sku: productData.sku,
        description: productData.description,
        category_id: productData.category_id,
        unit: productData.unit || 'piece',
        main_quantity: productData.main_quantity || 0,
        sub_quantity: productData.sub_quantity || 0,
        units_in_main: productData.units_in_main || 1,
        cost_price: productData.cost_price || 0,
        selling_price: productData.selling_price || 0,
        min_stock_level: productData.min_stock_level || 0,
        max_stock_level: productData.max_stock_level || 0,
        warehouse_id: productData.warehouse_id,
        is_active: productData.is_active ?? true
      }
    });
    return result;
  } catch (error) {
    console.error('خطأ في إضافة المنتج:', error);
    throw error;
  }
};

/**
 * جلب جميع المنتجات
 */
export const getProducts = async () => {
  try {
    const result = await invoke('get_products');
    return result;
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error);
    throw error;
  }
};

/**
 * تحديث منتج
 */
export const updateProduct = async (id, productData) => {
  try {
    const result = await invoke('update_product', { 
      id,
      product: {
        name: productData.name,
        barcode: productData.barcode,
        sku: productData.sku,
        description: productData.description,
        category_id: productData.category_id,
        unit: productData.unit || 'piece',
        main_quantity: productData.main_quantity || 0,
        sub_quantity: productData.sub_quantity || 0,
        units_in_main: productData.units_in_main || 1,
        cost_price: productData.cost_price || 0,
        selling_price: productData.selling_price || 0,
        min_stock_level: productData.min_stock_level || 0,
        max_stock_level: productData.max_stock_level || 0,
        warehouse_id: productData.warehouse_id,
        is_active: productData.is_active ?? true
      }
    });
    return result;
  } catch (error) {
    console.error('خطأ في تحديث المنتج:', error);
    throw error;
  }
};

/**
 * حذف منتج (إلغاء تفعيل)
 */
export const deleteProduct = async (id) => {
  try {
    const result = await invoke('delete_product', { id });
    return result;
  } catch (error) {
    console.error('خطأ في حذف المنتج:', error);
    throw error;
  }
};

// ======================================
// Customer Operations
// ======================================

/**
 * إضافة عميل جديد
 */
export const createCustomer = async (customerData) => {
  try {
    const result = await invoke('create_customer', { 
      customer: {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        balance: customerData.balance || 0,
        credit_limit: customerData.credit_limit || 0,
        tax_number: customerData.tax_number,
        contact_person: customerData.contact_person,
        notes: customerData.notes,
        is_active: customerData.is_active ?? true
      }
    });
    return result;
  } catch (error) {
    console.error('خطأ في إضافة العميل:', error);
    throw error;
  }
};

/**
 * جلب جميع العملاء
 */
export const getCustomers = async () => {
  try {
    const result = await invoke('get_customers');
    return result;
  } catch (error) {
    console.error('خطأ في جلب العملاء:', error);
    throw error;
  }
};

// ======================================
// Database Utilities
// ======================================

/**
 * التحقق من حالة قاعدة البيانات
 */
export const checkDatabaseStatus = async () => {
  try {
    // جلب البيانات لاختبار الاتصال
    const warehouses = await getWarehouses();
    return {
      connected: warehouses.success,
      message: warehouses.success ? 'قاعدة البيانات متصلة' : 'فشل الاتصال بقاعدة البيانات',
      error: warehouses.error
    };
  } catch (error) {
    return {
      connected: false,
      message: 'خطأ في الاتصال بقاعدة البيانات',
      error: error.message || error
    };
  }
};

/**
 * تصدير البيانات من LocalStorage للترحيل
 */
export const exportLocalStorageData = () => {
  const data = {};
  
  // قائمة بجميع مفاتيح البيانات الموجودة في LocalStorage
  const keys = [
    'bero_warehouses', 'bero_products', 'bero_categories', 'bero_customers', 'bero_suppliers',
    'bero_sales_invoices', 'bero_purchase_invoices', 'bero_treasury_balance',
    'bero_cash_receipts', 'bero_cash_disbursements', 'bero_accounts',
    'bero_journal_entries', 'bero_employees', 'bero_departments', 'bero_positions'
  ];
  
  keys.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        data[key] = JSON.parse(item);
      }
    } catch (error) {
      console.warn(`خطأ في قراءة ${key}:`, error);
    }
  });
  
  return data;
};

/**
 * مسح البيانات من LocalStorage بعد الترحيل الناجح
 */
export const clearLocalStorageData = () => {
  const keys = [
    'bero_warehouses', 'bero_products', 'bero_categories', 'bero_customers', 'bero_suppliers',
    'bero_sales_invoices', 'bero_purchase_invoices', 'bero_treasury_balance',
    'bero_cash_receipts', 'bero_cash_disbursements', 'bero_accounts',
    'bero_journal_entries', 'bero_employees', 'bero_departments', 'bero_positions'
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('تم مسح بيانات LocalStorage');
};

// ======================================
// Migration Manager
// ======================================

/**
 * إدارة عملية الترحيل من LocalStorage إلى SQLite
 */
export class MigrationManager {
  constructor() {
    this.isMigrating = false;
    this.progress = 0;
    this.status = 'ready';
    this.error = null;
  }

  async startMigration(onProgress = null) {
    if (this.isMigrating) {
      throw new Error('عملية الترحيل قيد التنفيذ بالفعل');
    }

    try {
      this.isMigrating = true;
      this.status = 'starting';
      this.progress = 0;
      this.error = null;

      // 1. تهيئة قاعدة البيانات
      this.progress = 10;
      this.status = 'initializing';
      onProgress?.(this.progress, 'جاري تهيئة قاعدة البيانات...');
      
      await initializeDatabase();

      // 2. تصدير البيانات من LocalStorage
      this.progress = 20;
      this.status = 'exporting';
      onProgress?.(this.progress, 'جاري تصدير البيانات من LocalStorage...');
      
      const localData = exportLocalStorageData();

      // 3. ترحيل البيانات
      this.progress = 40;
      this.status = 'migrating';
      onProgress?.(this.progress, 'جاري ترحيل البيانات...');

      // ترحيل المخازن
      if (localData.bero_warehouses) {
        this.progress = 50;
        onProgress?.(this.progress, 'جاري ترحيل المخازن...');
        
        for (const warehouse of localData.bero_warehouses) {
          await createWarehouse(warehouse);
        }
      }

      // ترحيل المنتجات
      if (localData.bero_products) {
        this.progress = 65;
        onProgress?.(this.progress, 'جاري ترحيل المنتجات...');
        
        for (const product of localData.bero_products) {
          await createProduct(product);
        }
      }

      // ترحيل العملاء
      if (localData.bero_customers) {
        this.progress = 80;
        onProgress?.(this.progress, 'جاري ترحيل العملاء...');
        
        for (const customer of localData.bero_customers) {
          await createCustomer(customer);
        }
      }

      // 4. التحقق من نجاح الترحيل
      this.progress = 90;
      this.status = 'verifying';
      onProgress?.(this.progress, 'جاري التحقق من نجاح الترحيل...');

      // اختبار جلب البيانات
      await getWarehouses();
      await getProducts();
      await getCustomers();

      // 5. مسح LocalStorage
      this.progress = 95;
      this.status = 'cleaning';
      onProgress?.(this.progress, 'جاري مسح البيانات القديمة...');
      
      clearLocalStorageData();

      // 6. إنهاء الترحيل
      this.progress = 100;
      this.status = 'completed';
      this.isMigrating = false;
      
      onProgress?.(this.progress, 'تم ترحيل البيانات بنجاح!');

      return {
        success: true,
        message: 'تم ترحيل البيانات من LocalStorage إلى SQLite بنجاح',
        dataMigrated: Object.keys(localData).length
      };

    } catch (error) {
      this.isMigrating = false;
      this.status = 'failed';
      this.error = error.message || error;
      
      throw new Error(`فشل في ترحيل البيانات: ${this.error}`);
    }
  }

  stopMigration() {
    this.isMigrating = false;
    this.status = 'stopped';
    this.progress = 0;
  }

  getStatus() {
    return {
      isMigrating: this.isMigrating,
      progress: this.progress,
      status: this.status,
      error: this.error
    };
  }
}

// تصدير instance واحد للاستخدام العام
export const migrationManager = new MigrationManager();
