// ======================================
// Migration Service - خدمة ترحيل البيانات
// نقل البيانات من localStorage إلى IndexedDB تلقائياً
// ======================================

import { dbManager, STORES } from './IndexedDBManager';

// مفاتيح localStorage القديمة
const LOCAL_STORAGE_KEYS = {
  warehouses: 'bero_warehouses',
  products: 'bero_products',
  categories: 'bero_categories',
  purchases: 'bero_purchases',
  purchaseInvoices: 'bero_purchase_invoices',
  purchaseReturns: 'bero_purchase_returns',
  sales: 'bero_sales',
  salesInvoices: 'bero_sales_invoices',
  salesReturns: 'bero_sales_returns',
  suppliers: 'bero_suppliers',
  customers: 'bero_customers',
  treasuryBalance: 'bero_treasury_balance',
  cashReceipts: 'bero_cash_receipts',
  cashDisbursements: 'bero_cash_disbursements',
  transfers: 'bero_transfers',
  accounts: 'bero_accounts',
  journalEntries: 'bero_journal_entries',
  
  // موارد بشرية
  employees: 'bero_employees',
  departments: 'bero_departments',
  positions: 'bero_positions',
  attendance: 'bero_attendance',
  leaveTypes: 'bero_leave_types',
  employeeLeaves: 'bero_employee_leaves',
  employeeLeaveBalances: 'bero_employee_leave_balances',
  salaryComponents: 'bero_salary_components',
  payrollPeriods: 'bero_payroll_periods',
  payrollDetails: 'bero_payroll_details',
  performanceMetrics: 'bero_performance_metrics',
  performanceReviews: 'bero_performance_reviews',
  
  // إنتاج
  productionOrders: 'bero_production_orders',
  bomItems: 'bero_bom_items',
  productionOperations: 'bero_production_operations',
  workCenters: 'bero_work_centers',
  productionPlans: 'bero_production_plans',
  materialConsumption: 'bero_material_consumption',
  productionWaste: 'bero_production_waste',
  qualityControls: 'bero_quality_controls',
  productionKPIs: 'bero_production_kpis',
  
  // أصول ثابتة
  fixedAssets: 'bero_fixed_assets',
  assetCategories: 'bero_asset_categories',
  assetLocations: 'bero_asset_locations',
  depreciationMethods: 'bero_depreciation_methods',
  depreciationSchedules: 'bero_depreciation_schedules',
  depreciationEntries: 'bero_depreciation_entries',
  maintenanceSchedules: 'bero_maintenance_schedules',
  maintenanceRecords: 'bero_maintenance_records',
  maintenanceCosts: 'bero_maintenance_costs',
  assetInventory: 'bero_asset_inventory',
  assetValuations: 'bero_asset_valuations',
  assetDisposals: 'bero_asset_disposals',
  assetTransfers: 'bero_asset_transfers',
  assetAcquisitions: 'bero_asset_acquisitions'
};

class MigrationService {
  constructor() {
    this.migrationKey = 'bero_migration_status';
    this.migrationVersion = '1.0.0';
  }

  /**
   * التحقق من الحاجة للترحيل
   */
  needsMigration() {
    const migrationStatus = localStorage.getItem(this.migrationKey);
    
    if (!migrationStatus) {
      return true;
    }
    
    try {
      const status = JSON.parse(migrationStatus);
      return status.version !== this.migrationVersion;
    } catch (error) {
      return true;
    }
  }

  /**
   * ترحيل جميع البيانات
   */
  async migrateAll(progressCallback = null) {
    console.log('🔄 بدء عملية الترحيل...');
    
    const startTime = Date.now();
    const results = {
      success: [],
      failed: [],
      totalItems: 0
    };

    try {
      // تهيئة قاعدة البيانات
      await dbManager.init();

      const entries = Object.entries(LOCAL_STORAGE_KEYS);
      const totalStores = entries.length;

      for (let i = 0; i < entries.length; i++) {
        const [storeName, localKey] = entries[i];
        
        try {
          // إبلاغ التقدم
          if (progressCallback) {
            progressCallback({
              current: i + 1,
              total: totalStores,
              storeName,
              status: 'processing'
            });
          }

          // جلب البيانات من localStorage
          const data = this._getFromLocalStorage(localKey);
          
          if (data && Array.isArray(data) && data.length > 0) {
            // ترحيل البيانات إلى IndexedDB
            await dbManager.bulkAdd(storeName, data);
            
            results.success.push({
              store: storeName,
              count: data.length
            });
            results.totalItems += data.length;
            
            console.log(`  ✓ تم ترحيل ${data.length} عنصر من ${storeName}`);
          } else if (data && !Array.isArray(data)) {
            // بيانات مفردة (مثل treasury_balance)
            await dbManager.add(storeName, { 
              id: 1, 
              value: data 
            });
            results.success.push({
              store: storeName,
              count: 1
            });
            results.totalItems += 1;
          } else {
            console.log(`  ⚠ لا توجد بيانات في ${storeName}`);
          }
          
        } catch (error) {
          console.error(`  ✗ خطأ في ترحيل ${storeName}:`, error);
          results.failed.push({
            store: storeName,
            error: error.message
          });
        }
      }

      // حفظ حالة الترحيل
      this._saveMigrationStatus({
        version: this.migrationVersion,
        completedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
        results
      });

      console.log(`✅ اكتمل الترحيل في ${((Date.now() - startTime) / 1000).toFixed(2)} ثانية`);
      console.log(`   - نجح: ${results.success.length} مخزن`);
      console.log(`   - فشل: ${results.failed.length} مخزن`);
      console.log(`   - إجمالي العناصر: ${results.totalItems}`);

      return {
        success: true,
        ...results,
        duration: Date.now() - startTime
      };

    } catch (error) {
      console.error('❌ فشلت عملية الترحيل:', error);
      throw error;
    }
  }

  /**
   * جلب البيانات من localStorage
   */
  _getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error(`خطأ في قراءة ${key} من localStorage:`, error);
      return null;
    }
  }

  /**
   * حفظ حالة الترحيل
   */
  _saveMigrationStatus(status) {
    try {
      localStorage.setItem(this.migrationKey, JSON.stringify(status));
    } catch (error) {
      console.error('خطأ في حفظ حالة الترحيل:', error);
    }
  }

  /**
   * الحصول على حالة الترحيل
   */
  getMigrationStatus() {
    try {
      const status = localStorage.getItem(this.migrationKey);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * إعادة الترحيل (للطوارئ)
   */
  async reMigrate(progressCallback = null) {
    console.log('🔄 إعادة الترحيل...');
    
    // مسح بيانات IndexedDB الحالية
    const stores = Object.values(STORES);
    for (const storeName of stores) {
      try {
        await dbManager.clear(storeName);
      } catch (error) {
        console.error(`خطأ في مسح ${storeName}:`, error);
      }
    }

    // حذف حالة الترحيل
    localStorage.removeItem(this.migrationKey);

    // إعادة الترحيل
    return await this.migrateAll(progressCallback);
  }

  /**
   * نسخة احتياطية من localStorage
   */
  backupLocalStorage() {
    const backup = {};
    
    for (const [storeName, localKey] of Object.entries(LOCAL_STORAGE_KEYS)) {
      const data = this._getFromLocalStorage(localKey);
      if (data) {
        backup[storeName] = data;
      }
    }

    return {
      version: '1.0.0',
      backupDate: new Date().toISOString(),
      data: backup
    };
  }

  /**
   * حفظ نسخة احتياطية
   */
  async saveBackup() {
    const backup = this.backupLocalStorage();
    
    // حفظ في IndexedDB
    try {
      await dbManager.add(STORES.backups, {
        id: Date.now(),
        ...backup
      });
      
      console.log('✅ تم حفظ النسخة الاحتياطية');
      return backup;
    } catch (error) {
      console.error('خطأ في حفظ النسخة الاحتياطية:', error);
      throw error;
    }
  }

  /**
   * تصدير جميع البيانات كملف JSON
   */
  async exportToFile() {
    const data = await dbManager.exportAll();
    
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bero-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    console.log('✅ تم تصدير البيانات');
    return true;
  }

  /**
   * استيراد من ملف JSON
   */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          await dbManager.importAll(importedData);
          
          console.log('✅ تم استيراد البيانات');
          resolve(true);
        } catch (error) {
          console.error('خطأ في استيراد البيانات:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('خطأ في قراءة الملف'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * مسح localStorage بعد الترحيل الناجح (اختياري)
   */
  clearLocalStorage() {
    console.log('⚠️ تحذير: سيتم مسح localStorage');
    
    for (const localKey of Object.values(LOCAL_STORAGE_KEYS)) {
      try {
        localStorage.removeItem(localKey);
      } catch (error) {
        console.error(`خطأ في مسح ${localKey}:`, error);
      }
    }
    
    console.log('✅ تم مسح localStorage');
  }
}

// إنشاء نسخة singleton
const migrationService = new MigrationService();

export { migrationService };
export default MigrationService;
