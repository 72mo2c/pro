/**
 * FixedAssetsService.js
 * خدمة إدارة الأصول الثابتة - متكاملة مع المحاسبة والإهلاك
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';
import { autoJournalEntry } from '../accounting/AutoJournalEntry';

class FixedAssetsService {
  constructor() {
    this.db = dbManager;
    this.journalService = autoJournalEntry;
  }

  /**
   * إضافة أصل ثابت جديد
   */
  async addFixedAsset(asset) {
    try {
      const assetId = `FA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newAsset = {
        id: assetId,
        asset_number: asset.asset_number || this.generateAssetNumber(),
        name: asset.name,
        category: asset.category, // land, building, vehicle, equipment, furniture, etc.
        purchase_date: asset.purchase_date || new Date().toISOString(),
        purchase_cost: asset.purchase_cost,
        residual_value: asset.residual_value || 0, // القيمة المتبقية في نهاية العمر الإنتاجي
        useful_life_years: asset.useful_life_years || 5, // العمر الإنتاجي بالسنوات
        depreciation_method: asset.depreciation_method || 'straight_line', // straight_line, declining_balance
        accumulated_depreciation: 0,
        book_value: asset.purchase_cost, // القيمة الدفترية = التكلفة - الإهلاك المتراكم
        location: asset.location || '',
        serial_number: asset.serial_number || '',
        supplier_id: asset.supplier_id || null,
        status: asset.status || 'active', // active, disposed, sold
        notes: asset.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.add('fixed_assets', newAsset);
      return newAsset;
    } catch (error) {
      console.error('خطأ في إضافة الأصل الثابت:', error);
      throw error;
    }
  }

  /**
   * تحديث أصل ثابت
   */
  async updateFixedAsset(assetId, updates) {
    try {
      const asset = await this.db.get('fixed_assets', assetId);
      if (!asset) {
        throw new Error('الأصل الثابت غير موجود');
      }

      const updatedAsset = {
        ...asset,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await this.db.update('fixed_assets', assetId, updatedAsset);
      return updatedAsset;
    } catch (error) {
      console.error('خطأ في تحديث الأصل الثابت:', error);
      throw error;
    }
  }

  /**
   * حذف أصل ثابت
   */
  async deleteFixedAsset(assetId) {
    try {
      await this.db.delete('fixed_assets', assetId);
      return true;
    } catch (error) {
      console.error('خطأ في حذف الأصل الثابت:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الأصول الثابتة
   */
  async getAllFixedAssets(filters = {}) {
    try {
      let assets = await this.db.getAll('fixed_assets');

      if (filters.category) {
        assets = assets.filter(asset => asset.category === filters.category);
      }
      if (filters.status) {
        assets = assets.filter(asset => asset.status === filters.status);
      }

      return assets.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('خطأ في الحصول على الأصول الثابتة:', error);
      throw error;
    }
  }

  /**
   * الحصول على أصل ثابت بالمعرف
   */
  async getFixedAssetById(assetId) {
    try {
      return await this.db.get('fixed_assets', assetId);
    } catch (error) {
      console.error('خطأ في الحصول على الأصل الثابت:', error);
      throw error;
    }
  }

  /**
   * حساب الإهلاك السنوي
   */
  calculateAnnualDepreciation(asset) {
    const depreciableAmount = asset.purchase_cost - asset.residual_value;

    if (asset.depreciation_method === 'straight_line') {
      // طريقة القسط الثابت
      return depreciableAmount / asset.useful_life_years;
    } else if (asset.depreciation_method === 'declining_balance') {
      // طريقة القسط المتناقص (معدل 200%)
      const rate = 2 / asset.useful_life_years;
      const currentBookValue = asset.book_value;
      return currentBookValue * rate;
    }

    return 0;
  }

  /**
   * حساب الإهلاك الشهري
   */
  calculateMonthlyDepreciation(asset) {
    return this.calculateAnnualDepreciation(asset) / 12;
  }

  /**
   * تسجيل إهلاك شهري لجميع الأصول
   */
  async recordMonthlyDepreciation(month, year) {
    try {
      const assets = await this.getAllFixedAssets({ status: 'active' });
      const depreciationEntries = [];
      let totalDepreciation = 0;

      for (const asset of assets) {
        // تخطي الأراضي (لا تخضع للإهلاك)
        if (asset.category === 'land') continue;

        // التحقق من أن الأصل لم يصل للإهلاك الكامل
        if (asset.accumulated_depreciation >= (asset.purchase_cost - asset.residual_value)) {
          continue;
        }

        const monthlyDepreciation = this.calculateMonthlyDepreciation(asset);
        const newAccumulatedDepreciation = Math.min(
          asset.accumulated_depreciation + monthlyDepreciation,
          asset.purchase_cost - asset.residual_value
        );
        const actualDepreciation = newAccumulatedDepreciation - asset.accumulated_depreciation;

        if (actualDepreciation > 0) {
          // تحديث الأصل
          await this.updateFixedAsset(asset.id, {
            accumulated_depreciation: newAccumulatedDepreciation,
            book_value: asset.purchase_cost - newAccumulatedDepreciation,
          });

          depreciationEntries.push({
            asset_id: asset.id,
            asset_name: asset.name,
            depreciation_amount: actualDepreciation,
          });

          totalDepreciation += actualDepreciation;
        }
      }

      // إنشاء سجل الإهلاك
      const depreciationId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const depreciationRecord = {
        id: depreciationId,
        record_number: this.generateDepreciationNumber(),
        month: month,
        year: year,
        date: new Date(year, month - 1, 1).toISOString(),
        entries: depreciationEntries,
        total_depreciation: totalDepreciation,
        created_at: new Date().toISOString(),
      };

      await this.db.add('depreciation_records', depreciationRecord);

      // تسجيل قيد محاسبي للإهلاك
      if (totalDepreciation > 0) {
        await this.journalService.createDepreciationEntry(depreciationRecord);
      }

      return depreciationRecord;
    } catch (error) {
      console.error('خطأ في تسجيل الإهلاك الشهري:', error);
      throw error;
    }
  }

  /**
   * الحصول على سجلات الإهلاك
   */
  async getDepreciationRecords(filters = {}) {
    try {
      let records = await this.db.getAll('depreciation_records');

      if (filters.month) {
        records = records.filter(rec => rec.month === filters.month);
      }
      if (filters.year) {
        records = records.filter(rec => rec.year === filters.year);
      }

      return records.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    } catch (error) {
      console.error('خطأ في الحصول على سجلات الإهلاك:', error);
      throw error;
    }
  }

  /**
   * بيع أصل ثابت
   */
  async sellFixedAsset(assetId, saleData) {
    try {
      const asset = await this.db.get('fixed_assets', assetId);
      if (!asset) {
        throw new Error('الأصل الثابت غير موجود');
      }

      const saleId = `AS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // حساب الربح أو الخسارة من البيع
      const salePrice = saleData.sale_price;
      const bookValue = asset.book_value;
      const gainOrLoss = salePrice - bookValue;

      const assetSale = {
        id: saleId,
        asset_id: assetId,
        asset_name: asset.name,
        asset_number: asset.asset_number,
        sale_date: saleData.sale_date || new Date().toISOString(),
        sale_price: salePrice,
        book_value: bookValue,
        gain_or_loss: gainOrLoss,
        customer_name: saleData.customer_name || '',
        notes: saleData.notes || '',
        created_at: new Date().toISOString(),
      };

      // حفظ سجل البيع
      await this.db.add('asset_sales', assetSale);

      // تحديث حالة الأصل
      await this.updateFixedAsset(assetId, {
        status: 'sold',
        disposal_date: assetSale.sale_date,
        disposal_value: salePrice,
      });

      // تسجيل قيد محاسبي للبيع
      await this.journalService.createAssetDisposalEntry(asset, assetSale);

      return assetSale;
    } catch (error) {
      console.error('خطأ في بيع الأصل الثابت:', error);
      throw error;
    }
  }

  /**
   * استبعاد أصل ثابت (Disposal)
   */
  async disposeFixedAsset(assetId, disposalData) {
    try {
      const asset = await this.db.get('fixed_assets', assetId);
      if (!asset) {
        throw new Error('الأصل الثابت غير موجود');
      }

      const disposalId = `AD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const assetDisposal = {
        id: disposalId,
        asset_id: assetId,
        asset_name: asset.name,
        asset_number: asset.asset_number,
        disposal_date: disposalData.disposal_date || new Date().toISOString(),
        disposal_reason: disposalData.disposal_reason || 'obsolete',
        book_value: asset.book_value,
        notes: disposalData.notes || '',
        created_at: new Date().toISOString(),
      };

      // حفظ سجل الاستبعاد
      await this.db.add('asset_disposals', assetDisposal);

      // تحديث حالة الأصل
      await this.updateFixedAsset(assetId, {
        status: 'disposed',
        disposal_date: assetDisposal.disposal_date,
      });

      // تسجيل قيد محاسبي للاستبعاد
      await this.journalService.createAssetDisposalEntry(asset, {
        ...assetDisposal,
        sale_price: 0,
        gain_or_loss: -asset.book_value,
      });

      return assetDisposal;
    } catch (error) {
      console.error('خطأ في استبعاد الأصل الثابت:', error);
      throw error;
    }
  }

  /**
   * إضافة صيانة لأصل
   */
  async addMaintenance(maintenance) {
    try {
      const maintenanceId = `MAINT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newMaintenance = {
        id: maintenanceId,
        asset_id: maintenance.asset_id,
        asset_name: maintenance.asset_name,
        maintenance_date: maintenance.maintenance_date || new Date().toISOString(),
        maintenance_type: maintenance.maintenance_type || 'routine', // routine, repair, overhaul
        description: maintenance.description || '',
        cost: maintenance.cost || 0,
        vendor: maintenance.vendor || '',
        next_maintenance_date: maintenance.next_maintenance_date || null,
        notes: maintenance.notes || '',
        created_at: new Date().toISOString(),
      };

      await this.db.add('asset_maintenance', newMaintenance);
      return newMaintenance;
    } catch (error) {
      console.error('خطأ في إضافة الصيانة:', error);
      throw error;
    }
  }

  /**
   * الحصول على سجلات الصيانة
   */
  async getMaintenanceRecords(filters = {}) {
    try {
      let records = await this.db.getAll('asset_maintenance');

      if (filters.asset_id) {
        records = records.filter(rec => rec.asset_id === filters.asset_id);
      }

      return records.sort((a, b) => new Date(b.maintenance_date) - new Date(a.maintenance_date));
    } catch (error) {
      console.error('خطأ في الحصول على سجلات الصيانة:', error);
      throw error;
    }
  }

  // ==================== وظائف مساعدة ====================

  /**
   * توليد رقم أصل تلقائي
   */
  generateAssetNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ASSET-${timestamp}-${random}`;
  }

  /**
   * توليد رقم إهلاك تلقائي
   */
  generateDepreciationNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DEP-${timestamp}-${random}`;
  }

  /**
   * إحصائيات الأصول الثابتة
   */
  async getFixedAssetsStatistics() {
    try {
      const assets = await this.getAllFixedAssets();
      const activeAssets = assets.filter(asset => asset.status === 'active');

      const totalCost = activeAssets.reduce((sum, asset) => sum + asset.purchase_cost, 0);
      const totalAccumulatedDepreciation = activeAssets.reduce((sum, asset) => sum + asset.accumulated_depreciation, 0);
      const totalBookValue = activeAssets.reduce((sum, asset) => sum + asset.book_value, 0);

      // تصنيف حسب الفئة
      const byCategory = {};
      activeAssets.forEach(asset => {
        const category = asset.category || 'غير مصنف';
        if (!byCategory[category]) {
          byCategory[category] = { count: 0, total_cost: 0, book_value: 0 };
        }
        byCategory[category].count++;
        byCategory[category].total_cost += asset.purchase_cost;
        byCategory[category].book_value += asset.book_value;
      });

      return {
        total_assets: activeAssets.length,
        total_cost: totalCost,
        total_accumulated_depreciation: totalAccumulatedDepreciation,
        total_book_value: totalBookValue,
        by_category: byCategory,
      };
    } catch (error) {
      console.error('خطأ في حساب إحصائيات الأصول الثابتة:', error);
      throw error;
    }
  }

  /**
   * تقرير الإهلاك لأصل
   */
  async getAssetDepreciationReport(assetId) {
    try {
      const asset = await this.getFixedAssetById(assetId);
      if (!asset) {
        throw new Error('الأصل الثابت غير موجود');
      }

      const annualDepreciation = this.calculateAnnualDepreciation(asset);
      const monthlyDepreciation = this.calculateMonthlyDepreciation(asset);
      const remainingDepreciation = (asset.purchase_cost - asset.residual_value) - asset.accumulated_depreciation;
      
      // حساب العمر المتبقي
      const remainingLife = remainingDepreciation / annualDepreciation;

      return {
        asset: {
          id: asset.id,
          name: asset.name,
          asset_number: asset.asset_number,
          category: asset.category,
        },
        financial: {
          purchase_cost: asset.purchase_cost,
          residual_value: asset.residual_value,
          depreciable_amount: asset.purchase_cost - asset.residual_value,
          accumulated_depreciation: asset.accumulated_depreciation,
          book_value: asset.book_value,
        },
        depreciation: {
          method: asset.depreciation_method,
          useful_life_years: asset.useful_life_years,
          annual_depreciation: annualDepreciation,
          monthly_depreciation: monthlyDepreciation,
          remaining_depreciation: remainingDepreciation,
          remaining_life_years: remainingLife,
        },
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير الإهلاك:', error);
      throw error;
    }
  }

  /**
   * تقرير الأصول حسب الحالة
   */
  async getAssetsByStatusReport() {
    try {
      const assets = await this.getAllFixedAssets();

      const active = assets.filter(asset => asset.status === 'active');
      const sold = assets.filter(asset => asset.status === 'sold');
      const disposed = assets.filter(asset => asset.status === 'disposed');

      return {
        active: {
          count: active.length,
          total_cost: active.reduce((sum, a) => sum + a.purchase_cost, 0),
          total_book_value: active.reduce((sum, a) => sum + a.book_value, 0),
        },
        sold: {
          count: sold.length,
          total_cost: sold.reduce((sum, a) => sum + a.purchase_cost, 0),
        },
        disposed: {
          count: disposed.length,
          total_cost: disposed.reduce((sum, a) => sum + a.purchase_cost, 0),
        },
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير الأصول حسب الحالة:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

export const getFixedAssetsServiceInstance = () => {
  if (!instance) {
    instance = new FixedAssetsService();
  }
  return instance;
};

export default FixedAssetsService;
