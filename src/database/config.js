/**
 * database/config.js
 * تكوين قاعدة البيانات - تحديد جميع الـ stores والـ indices
 */

export const DB_NAME = 'BeroSystemDB';
export const DB_VERSION = 1;

/**
 * تعريف Stores وال Indices
 */
export const DB_STORES = {
  // الشركات
  companies: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'created_at', keyPath: 'created_at', unique: false },
    ],
  },

  // المنتجات
  products: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'sku', keyPath: 'sku', unique: true },
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'category', keyPath: 'category', unique: false },
      { name: 'type', keyPath: 'type', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'barcode', keyPath: 'barcode', unique: false },
    ],
  },

  // العملاء
  customers: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'email', keyPath: 'email', unique: false },
      { name: 'phone', keyPath: 'phone', unique: false },
    ],
  },

  // الموردون
  suppliers: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'email', keyPath: 'email', unique: false },
      { name: 'phone', keyPath: 'phone', unique: false },
    ],
  },

  // فواتير المبيعات
  salesInvoices: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'invoice_number', keyPath: 'invoice_number', unique: true },
      { name: 'customer_id', keyPath: 'customer_id', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
    ],
  },

  // مرتجعات المبيعات
  sales_returns: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'return_number', keyPath: 'return_number', unique: true },
      { name: 'invoice_id', keyPath: 'invoice_id', unique: false },
      { name: 'customer_id', keyPath: 'customer_id', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
    ],
  },

  // فواتير المشتريات
  purchaseInvoices: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'invoice_number', keyPath: 'invoice_number', unique: true },
      { name: 'supplier_id', keyPath: 'supplier_id', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
    ],
  },

  // مرتجعات المشتريات
  purchase_returns: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'return_number', keyPath: 'return_number', unique: true },
      { name: 'invoice_id', keyPath: 'invoice_id', unique: false },
      { name: 'supplier_id', keyPath: 'supplier_id', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
    ],
  },

  // حركات المخزون
  inventory_movements: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'product_id', keyPath: 'product_id', unique: false },
      { name: 'type', keyPath: 'type', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
      { name: 'reference_type', keyPath: 'reference_type', unique: false },
    ],
  },

  // الإيصالات النقدية
  cash_receipts: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'receipt_number', keyPath: 'receipt_number', unique: true },
      { name: 'reference_type', keyPath: 'reference_type', unique: false },
      { name: 'customer_id', keyPath: 'customer_id', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
    ],
  },

  // المصروفات النقدية
  cash_disbursements: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'disbursement_number', keyPath: 'disbursement_number', unique: true },
      { name: 'reference_type', keyPath: 'reference_type', unique: false },
      { name: 'category', keyPath: 'category', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
    ],
  },

  // الحسابات البنكية
  bank_accounts: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'account_number', keyPath: 'account_number', unique: true },
      { name: 'bank_name', keyPath: 'bank_name', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
    ],
  },

  // الموظفون
  employees: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'employee_number', keyPath: 'employee_number', unique: true },
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'department', keyPath: 'department', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'national_id', keyPath: 'national_id', unique: false },
    ],
  },

  // سجلات الحضور
  attendance_records: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'employee_id', keyPath: 'employee_id', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
    ],
  },

  // طلبات الإجازات
  leave_requests: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'employee_id', keyPath: 'employee_id', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'start_date', keyPath: 'start_date', unique: false },
    ],
  },

  // سجلات الرواتب
  payroll_records: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'payroll_number', keyPath: 'payroll_number', unique: true },
      { name: 'month', keyPath: 'month', unique: false },
      { name: 'year', keyPath: 'year', unique: false },
      { name: 'payment_date', keyPath: 'payment_date', unique: false },
    ],
  },

  // أوامر الإنتاج
  production_orders: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'order_number', keyPath: 'order_number', unique: true },
      { name: 'product_id', keyPath: 'product_id', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'start_date', keyPath: 'start_date', unique: false },
    ],
  },

  // الأصول الثابتة
  fixed_assets: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'asset_number', keyPath: 'asset_number', unique: true },
      { name: 'category', keyPath: 'category', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'purchase_date', keyPath: 'purchase_date', unique: false },
    ],
  },

  // سجلات الإهلاك
  depreciation_records: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'record_number', keyPath: 'record_number', unique: true },
      { name: 'month', keyPath: 'month', unique: false },
      { name: 'year', keyPath: 'year', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
    ],
  },

  // مبيعات الأصول
  asset_sales: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'asset_id', keyPath: 'asset_id', unique: false },
      { name: 'sale_date', keyPath: 'sale_date', unique: false },
    ],
  },

  // استبعاد الأصول
  asset_disposals: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'asset_id', keyPath: 'asset_id', unique: false },
      { name: 'disposal_date', keyPath: 'disposal_date', unique: false },
    ],
  },

  // صيانة الأصول
  asset_maintenance: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'asset_id', keyPath: 'asset_id', unique: false },
      { name: 'maintenance_date', keyPath: 'maintenance_date', unique: false },
      { name: 'maintenance_type', keyPath: 'maintenance_type', unique: false },
    ],
  },

  // الحسابات المحاسبية
  accounts: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'code', keyPath: 'code', unique: true },
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'type', keyPath: 'type', unique: false },
      { name: 'is_active', keyPath: 'is_active', unique: false },
    ],
  },

  // قيود اليومية
  journal_entries: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'entry_number', keyPath: 'entry_number', unique: true },
      { name: 'date', keyPath: 'date', unique: false },
      { name: 'reference_type', keyPath: 'reference_type', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
    ],
  },

  // فئات المنتجات
  product_categories: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'parent_id', keyPath: 'parent_id', unique: false },
    ],
  },

  // المخازن
  warehouses: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'code', keyPath: 'code', unique: true },
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
    ],
  },

  // تحويلات بين المخازن
  warehouse_transfers: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'transfer_number', keyPath: 'transfer_number', unique: true },
      { name: 'product_id', keyPath: 'product_id', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
    ],
  },

  // جرد المخزون
  stock_counts: {
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'count_number', keyPath: 'count_number', unique: true },
      { name: 'warehouse_id', keyPath: 'warehouse_id', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
    ],
  },
};

/**
 * الحصول على جميع أسماء الـ Stores
 */
export const getStoreNames = () => Object.keys(DB_STORES);

/**
 * الحصول على تكوين Store محدد
 */
export const getStoreConfig = (storeName) => DB_STORES[storeName];

/**
 * التحقق من وجود Store
 */
export const hasStore = (storeName) => storeName in DB_STORES;

export default {
  DB_NAME,
  DB_VERSION,
  DB_STORES,
  getStoreNames,
  getStoreConfig,
  hasStore,
};
