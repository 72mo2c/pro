/**
 * InventoryService.js
 * خدمة إدارة المخزون - إدارة المنتجات والحركات
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';

class InventoryService {
  constructor() {
    this.db = dbManager;
  }

  /**
   * إضافة منتج جديد
   */
  async addProduct(product) {
    try {
      const productId = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newProduct = {
        id: productId,
        sku: product.sku || this.generateSKU(),
        name: product.name,
        name_en: product.name_en || '',
        description: product.description || '',
        category: product.category || '',
        unit: product.unit || 'piece',
        quantity: product.quantity || 0,
        min_quantity: product.min_quantity || 0,
        max_quantity: product.max_quantity || null,
        purchase_price: product.purchase_price || 0,
        selling_price: product.selling_price || 0,
        cost: product.cost || 0,
        tax_rate: product.tax_rate || 0,
        barcode: product.barcode || '',
        type: product.type || 'product', // product, raw_material, finished_good
        bom: product.bom || [], // Bill of Materials (قائمة المواد للمنتجات المصنعة)
        warehouse_id: product.warehouse_id || null,
        supplier_id: product.supplier_id || null,
        image_url: product.image_url || '',
        status: product.status || 'active',
        notes: product.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.add('products', newProduct);
      return newProduct;
    } catch (error) {
      console.error('خطأ في إضافة المنتج:', error);
      throw error;
    }
  }

  /**
   * تحديث منتج
   */
  async updateProduct(productId, updates) {
    try {
      const product = await this.db.get('products', productId);
      if (!product) {
        throw new Error('المنتج غير موجود');
      }

      const updatedProduct = {
        ...product,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await this.db.update('products', productId, updatedProduct);
      return updatedProduct;
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      throw error;
    }
  }

  /**
   * حذف منتج
   */
  async deleteProduct(productId) {
    try {
      const product = await this.db.get('products', productId);
      if (!product) {
        throw new Error('المنتج غير موجود');
      }

      // التحقق من عدم وجود رصيد للمنتج
      if (product.quantity > 0) {
        throw new Error('لا يمكن حذف منتج له رصيد في المخزون');
      }

      await this.db.delete('products', productId);
      return true;
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع المنتجات
   */
  async getAllProducts(filters = {}) {
    try {
      let products = await this.db.getAll('products');

      if (filters.category) {
        products = products.filter(prod => prod.category === filters.category);
      }
      if (filters.type) {
        products = products.filter(prod => prod.type === filters.type);
      }
      if (filters.status) {
        products = products.filter(prod => prod.status === filters.status);
      }
      if (filters.warehouse_id) {
        products = products.filter(prod => prod.warehouse_id === filters.warehouse_id);
      }
      if (filters.low_stock) {
        products = products.filter(prod => prod.quantity <= prod.min_quantity);
      }

      return products.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('خطأ في الحصول على المنتجات:', error);
      throw error;
    }
  }

  /**
   * الحصول على منتج بالمعرف
   */
  async getProductById(productId) {
    try {
      return await this.db.get('products', productId);
    } catch (error) {
      console.error('خطأ في الحصول على المنتج:', error);
      throw error;
    }
  }

  /**
   * البحث عن منتج
   */
  async searchProducts(searchTerm) {
    try {
      const products = await this.getAllProducts();
      const term = searchTerm.toLowerCase();

      return products.filter(prod => 
        prod.name.toLowerCase().includes(term) ||
        prod.name_en.toLowerCase().includes(term) ||
        prod.sku.toLowerCase().includes(term) ||
        prod.barcode.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('خطأ في البحث عن المنتجات:', error);
      throw error;
    }
  }

  /**
   * تحديث كمية منتج
   */
  async updateProductQuantity(productId, quantity, type = 'set') {
    try {
      const product = await this.db.get('products', productId);
      if (!product) {
        throw new Error('المنتج غير موجود');
      }

      let newQuantity;
      if (type === 'set') {
        newQuantity = quantity;
      } else if (type === 'add') {
        newQuantity = product.quantity + quantity;
      } else if (type === 'subtract') {
        newQuantity = Math.max(0, product.quantity - quantity);
      }

      await this.db.update('products', productId, {
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      });

      return newQuantity;
    } catch (error) {
      console.error('خطأ في تحديث كمية المنتج:', error);
      throw error;
    }
  }

  /**
   * الحصول على حركات المخزون
   */
  async getInventoryMovements(filters = {}) {
    try {
      let movements = await this.db.getAll('inventory_movements');

      if (filters.product_id) {
        movements = movements.filter(mov => mov.product_id === filters.product_id);
      }
      if (filters.type) {
        movements = movements.filter(mov => mov.type === filters.type);
      }
      if (filters.warehouse_id) {
        movements = movements.filter(mov => mov.warehouse_id === filters.warehouse_id);
      }
      if (filters.from_date) {
        movements = movements.filter(mov => new Date(mov.date) >= new Date(filters.from_date));
      }
      if (filters.to_date) {
        movements = movements.filter(mov => new Date(mov.date) <= new Date(filters.to_date));
      }

      return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('خطأ في الحصول على حركات المخزون:', error);
      throw error;
    }
  }

  /**
   * إضافة فئة منتجات
   */
  async addCategory(category) {
    try {
      const categoryId = `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newCategory = {
        id: categoryId,
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || null,
        created_at: new Date().toISOString(),
      };

      await this.db.add('product_categories', newCategory);
      return newCategory;
    } catch (error) {
      console.error('خطأ في إضافة فئة المنتجات:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الفئات
   */
  async getAllCategories() {
    try {
      return await this.db.getAll('product_categories');
    } catch (error) {
      console.error('خطأ في الحصول على فئات المنتجات:', error);
      throw error;
    }
  }

  /**
   * إضافة مخزن
   */
  async addWarehouse(warehouse) {
    try {
      const warehouseId = `WH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newWarehouse = {
        id: warehouseId,
        name: warehouse.name,
        code: warehouse.code || this.generateWarehouseCode(),
        location: warehouse.location || '',
        address: warehouse.address || '',
        manager: warehouse.manager || '',
        phone: warehouse.phone || '',
        status: warehouse.status || 'active',
        notes: warehouse.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.add('warehouses', newWarehouse);
      return newWarehouse;
    } catch (error) {
      console.error('خطأ في إضافة المخزن:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع المخازن
   */
  async getAllWarehouses() {
    try {
      return await this.db.getAll('warehouses');
    } catch (error) {
      console.error('خطأ في الحصول على المخازن:', error);
      throw error;
    }
  }

  /**
   * تحويل بين المخازن
   */
  async transferBetweenWarehouses(transfer) {
    try {
      const transferId = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newTransfer = {
        id: transferId,
        transfer_number: this.generateTransferNumber(),
        product_id: transfer.product_id,
        product_name: transfer.product_name,
        quantity: transfer.quantity,
        from_warehouse_id: transfer.from_warehouse_id,
        to_warehouse_id: transfer.to_warehouse_id,
        date: transfer.date || new Date().toISOString(),
        status: 'completed',
        notes: transfer.notes || '',
        created_at: new Date().toISOString(),
      };

      // خصم من المخزن المصدر وإضافة للمخزن الهدف
      // (هذا يتطلب منطق إضافي لتحديث المخازن المنفصلة إذا كانت موجودة)
      
      // حفظ التحويل
      await this.db.add('warehouse_transfers', newTransfer);

      // تسجيل حركات المخزون
      await this.recordInventoryMovement({
        product_id: transfer.product_id,
        product_name: transfer.product_name,
        type: 'out',
        quantity: transfer.quantity,
        reason: 'transfer',
        warehouse_id: transfer.from_warehouse_id,
        reference_type: 'warehouse_transfer',
        reference_id: transferId,
        date: new Date().toISOString(),
      });

      await this.recordInventoryMovement({
        product_id: transfer.product_id,
        product_name: transfer.product_name,
        type: 'in',
        quantity: transfer.quantity,
        reason: 'transfer',
        warehouse_id: transfer.to_warehouse_id,
        reference_type: 'warehouse_transfer',
        reference_id: transferId,
        date: new Date().toISOString(),
      });

      return newTransfer;
    } catch (error) {
      console.error('خطأ في التحويل بين المخازن:', error);
      throw error;
    }
  }

  /**
   * تسجيل جرد مخزون
   */
  async recordStockCount(stockCount) {
    try {
      const countId = `SC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newStockCount = {
        id: countId,
        count_number: this.generateCountNumber(),
        warehouse_id: stockCount.warehouse_id,
        date: stockCount.date || new Date().toISOString(),
        items: stockCount.items, // [{product_id, product_name, system_quantity, actual_quantity, difference}]
        total_items: stockCount.items.length,
        status: 'completed',
        notes: stockCount.notes || '',
        created_at: new Date().toISOString(),
      };

      // حفظ الجرد
      await this.db.add('stock_counts', newStockCount);

      // تطبيق التعديلات على المخزون
      for (const item of stockCount.items) {
        if (item.difference !== 0) {
          await this.updateProductQuantity(item.product_id, item.actual_quantity, 'set');

          // تسجيل حركة المخزون
          await this.recordInventoryMovement({
            product_id: item.product_id,
            product_name: item.product_name,
            type: item.difference > 0 ? 'in' : 'out',
            quantity: Math.abs(item.difference),
            reason: 'stock_adjustment',
            warehouse_id: stockCount.warehouse_id,
            reference_type: 'stock_count',
            reference_id: countId,
            date: new Date().toISOString(),
          });
        }
      }

      return newStockCount;
    } catch (error) {
      console.error('خطأ في تسجيل جرد المخزون:', error);
      throw error;
    }
  }

  /**
   * تسجيل حركة مخزون
   */
  async recordInventoryMovement(movement) {
    try {
      const movementId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await this.db.add('inventory_movements', {
        id: movementId,
        ...movement,
        created_at: new Date().toISOString(),
      });

      return movementId;
    } catch (error) {
      console.error('خطأ في تسجيل حركة المخزون:', error);
      throw error;
    }
  }

  // ==================== وظائف مساعدة ====================

  /**
   * توليد رمز SKU تلقائي
   */
  generateSKU() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `SKU-${timestamp}-${random}`;
  }

  /**
   * توليد رمز مخزن تلقائي
   */
  generateWarehouseCode() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `WH-${timestamp}-${random}`;
  }

  /**
   * توليد رقم تحويل تلقائي
   */
  generateTransferNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TRF-${timestamp}-${random}`;
  }

  /**
   * توليد رقم جرد تلقائي
   */
  generateCountNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `COUNT-${timestamp}-${random}`;
  }

  /**
   * إحصائيات المخزون
   */
  async getInventoryStatistics() {
    try {
      const products = await this.getAllProducts({ status: 'active' });

      const totalProducts = products.length;
      const totalValue = products.reduce((sum, prod) => sum + (prod.quantity * prod.cost), 0);
      const lowStockProducts = products.filter(prod => prod.quantity <= prod.min_quantity);
      const outOfStockProducts = products.filter(prod => prod.quantity === 0);

      // تصنيف حسب الفئة
      const byCategory = {};
      products.forEach(prod => {
        const category = prod.category || 'غير مصنف';
        if (!byCategory[category]) {
          byCategory[category] = { count: 0, value: 0 };
        }
        byCategory[category].count++;
        byCategory[category].value += prod.quantity * prod.cost;
      });

      return {
        total_products: totalProducts,
        total_inventory_value: totalValue,
        low_stock_products: lowStockProducts.length,
        out_of_stock_products: outOfStockProducts.length,
        by_category: byCategory,
        low_stock_items: lowStockProducts.map(prod => ({
          id: prod.id,
          name: prod.name,
          quantity: prod.quantity,
          min_quantity: prod.min_quantity,
        })),
      };
    } catch (error) {
      console.error('خطأ في حساب إحصائيات المخزون:', error);
      throw error;
    }
  }

  /**
   * تقرير حركة المخزون لمنتج
   */
  async getProductMovementReport(productId, fromDate, toDate) {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('المنتج غير موجود');
      }

      const movements = await this.getInventoryMovements({
        product_id: productId,
        from_date: fromDate,
        to_date: toDate,
      });

      const inMovements = movements.filter(mov => mov.type === 'in');
      const outMovements = movements.filter(mov => mov.type === 'out');

      const totalIn = inMovements.reduce((sum, mov) => sum + mov.quantity, 0);
      const totalOut = outMovements.reduce((sum, mov) => sum + mov.quantity, 0);

      return {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          current_quantity: product.quantity,
        },
        period: {
          from: fromDate,
          to: toDate,
        },
        summary: {
          total_in: totalIn,
          total_out: totalOut,
          net_change: totalIn - totalOut,
        },
        movements: movements,
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير حركة المخزون:', error);
      throw error;
    }
  }

  /**
   * تقرير تقييم المخزون
   */
  async getInventoryValuationReport() {
    try {
      const products = await this.getAllProducts({ status: 'active' });

      const valuationItems = products.map(prod => ({
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku,
        quantity: prod.quantity,
        cost_per_unit: prod.cost,
        total_value: prod.quantity * prod.cost,
        category: prod.category,
      }));

      const totalValue = valuationItems.reduce((sum, item) => sum + item.total_value, 0);

      return {
        date: new Date().toISOString(),
        total_products: products.length,
        total_inventory_value: totalValue,
        items: valuationItems,
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير تقييم المخزون:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

export const getInventoryServiceInstance = () => {
  if (!instance) {
    instance = new InventoryService();
  }
  return instance;
};

export default InventoryService;
