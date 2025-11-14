/**
 * ProductionService.js
 * خدمة إدارة الإنتاج - متكاملة مع المخزون والتكاليف والمحاسبة
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';
import { autoJournalEntry } from '../accounting/AutoJournalEntry';

class ProductionService {
  constructor() {
    this.db = dbManager;
    this.journalService = autoJournalEntry;
  }

  /**
   * إضافة أمر إنتاج جديد
   * يحدث: المخزون (خصم المواد الخام + إضافة المنتج النهائي)، التكاليف، المحاسبة
   */
  async addProductionOrder(order) {
    try {
      // التحقق من البيانات المطلوبة
      if (!order.product_id || !order.quantity || order.quantity <= 0) {
        throw new Error('بيانات أمر الإنتاج غير مكتملة');
      }

      // الحصول على المنتج وقائمة المواد الخام (BOM)
      const product = await this.db.get('products', order.product_id);
      if (!product) {
        throw new Error('المنتج غير موجود');
      }

      if (!product.bom || product.bom.length === 0) {
        throw new Error('قائمة المواد الخام (BOM) غير محددة لهذا المنتج');
      }

      // إنشاء معرف فريد للأمر
      const orderId = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // حساب التكاليف
      const costs = await this.calculateProductionCosts(product.bom, order.quantity);

      const newOrder = {
        id: orderId,
        order_number: order.order_number || this.generateOrderNumber(),
        product_id: order.product_id,
        product_name: order.product_name || product.name,
        quantity: order.quantity,
        bom: product.bom, // قائمة المواد الخام المستخدمة
        material_cost: costs.material_cost,
        labor_cost: order.labor_cost || 0,
        overhead_cost: order.overhead_cost || 0,
        total_cost: costs.material_cost + (order.labor_cost || 0) + (order.overhead_cost || 0),
        cost_per_unit: 0, // سيتم حسابه بعد قليل
        start_date: order.start_date || new Date().toISOString(),
        expected_completion_date: order.expected_completion_date,
        actual_completion_date: null,
        status: 'pending', // pending, in_progress, completed, cancelled
        warehouse_id: order.warehouse_id,
        notes: order.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // حساب التكلفة لكل وحدة
      newOrder.cost_per_unit = newOrder.total_cost / newOrder.quantity;

      // حفظ أمر الإنتاج
      await this.db.add('production_orders', newOrder);

      return newOrder;
    } catch (error) {
      console.error('خطأ في إضافة أمر الإنتاج:', error);
      throw error;
    }
  }

  /**
   * بدء أمر الإنتاج (خصم المواد الخام من المخزون)
   */
  async startProductionOrder(orderId) {
    try {
      const order = await this.db.get('production_orders', orderId);
      if (!order) {
        throw new Error('أمر الإنتاج غير موجود');
      }

      if (order.status !== 'pending') {
        throw new Error('لا يمكن بدء أمر الإنتاج في الحالة الحالية');
      }

      // التحقق من توفر المواد الخام
      const availability = await this.checkMaterialsAvailability(order.bom, order.quantity);
      if (!availability.available) {
        throw new Error(`المواد الخام غير متوفرة بالكميات المطلوبة: ${availability.missing.join(', ')}`);
      }

      // خصم المواد الخام من المخزون
      await this.deductRawMaterials(order.bom, order.quantity, order.warehouse_id, orderId);

      // تحديث حالة الأمر
      const updatedOrder = {
        ...order,
        status: 'in_progress',
        actual_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.update('production_orders', orderId, updatedOrder);

      // تسجيل قيد محاسبي لبدء الإنتاج (تحويل المواد الخام لإنتاج تحت التشغيل)
      await this.journalService.createProductionStartEntry(updatedOrder);

      return updatedOrder;
    } catch (error) {
      console.error('خطأ في بدء أمر الإنتاج:', error);
      throw error;
    }
  }

  /**
   * إكمال أمر الإنتاج (إضافة المنتج النهائي للمخزون)
   */
  async completeProductionOrder(orderId, actualCosts = {}) {
    try {
      const order = await this.db.get('production_orders', orderId);
      if (!order) {
        throw new Error('أمر الإنتاج غير موجود');
      }

      if (order.status !== 'in_progress') {
        throw new Error('لا يمكن إكمال أمر الإنتاج في الحالة الحالية');
      }

      // تحديث التكاليف الفعلية إذا تم تقديمها
      const finalLaborCost = actualCosts.labor_cost || order.labor_cost;
      const finalOverheadCost = actualCosts.overhead_cost || order.overhead_cost;
      const finalTotalCost = order.material_cost + finalLaborCost + finalOverheadCost;

      // إضافة المنتج النهائي للمخزون
      await this.addFinishedProductToInventory(
        order.product_id,
        order.product_name,
        order.quantity,
        finalTotalCost / order.quantity, // التكلفة لكل وحدة
        order.warehouse_id,
        orderId
      );

      // تحديث حالة الأمر
      const updatedOrder = {
        ...order,
        status: 'completed',
        labor_cost: finalLaborCost,
        overhead_cost: finalOverheadCost,
        total_cost: finalTotalCost,
        cost_per_unit: finalTotalCost / order.quantity,
        actual_completion_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.update('production_orders', orderId, updatedOrder);

      // تسجيل قيد محاسبي لإكمال الإنتاج (تحويل من إنتاج تحت التشغيل إلى مخزون جاهز)
      await this.journalService.createProductionCompleteEntry(updatedOrder);

      return updatedOrder;
    } catch (error) {
      console.error('خطأ في إكمال أمر الإنتاج:', error);
      throw error;
    }
  }

  /**
   * إلغاء أمر الإنتاج
   */
  async cancelProductionOrder(orderId, reason = '') {
    try {
      const order = await this.db.get('production_orders', orderId);
      if (!order) {
        throw new Error('أمر الإنتاج غير موجود');
      }

      // إذا كان الأمر قد بدأ، نرجع المواد الخام للمخزون
      if (order.status === 'in_progress') {
        await this.returnRawMaterials(order.bom, order.quantity, order.warehouse_id, orderId);
      }

      // تحديث حالة الأمر
      const updatedOrder = {
        ...order,
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.update('production_orders', orderId, updatedOrder);

      // عكس القيود المحاسبية إذا كان الأمر قد بدأ
      if (order.status === 'in_progress') {
        await this.journalService.reverseEntry(`PROD-START-${orderId}`);
      }

      return updatedOrder;
    } catch (error) {
      console.error('خطأ في إلغاء أمر الإنتاج:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع أوامر الإنتاج
   */
  async getAllProductionOrders(filters = {}) {
    try {
      let orders = await this.db.getAll('production_orders');

      // تطبيق الفلاتر
      if (filters.status) {
        orders = orders.filter(order => order.status === filters.status);
      }
      if (filters.product_id) {
        orders = orders.filter(order => order.product_id === filters.product_id);
      }
      if (filters.from_date) {
        orders = orders.filter(order => new Date(order.start_date) >= new Date(filters.from_date));
      }
      if (filters.to_date) {
        orders = orders.filter(order => new Date(order.start_date) <= new Date(filters.to_date));
      }

      return orders.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    } catch (error) {
      console.error('خطأ في الحصول على أوامر الإنتاج:', error);
      throw error;
    }
  }

  /**
   * الحصول على أمر إنتاج بالمعرف
   */
  async getProductionOrderById(orderId) {
    try {
      return await this.db.get('production_orders', orderId);
    } catch (error) {
      console.error('خطأ في الحصول على أمر الإنتاج:', error);
      throw error;
    }
  }

  // ==================== وظائف مساعدة ====================

  /**
   * حساب تكاليف الإنتاج
   */
  async calculateProductionCosts(bom, quantity) {
    try {
      let materialCost = 0;

      for (const material of bom) {
        const product = await this.db.get('products', material.material_id);
        if (!product) continue;

        const requiredQuantity = material.quantity * quantity;
        const costPerUnit = product.purchase_price || product.cost || 0;
        materialCost += requiredQuantity * costPerUnit;
      }

      return {
        material_cost: materialCost,
      };
    } catch (error) {
      console.error('خطأ في حساب تكاليف الإنتاج:', error);
      return { material_cost: 0 };
    }
  }

  /**
   * التحقق من توفر المواد الخام
   */
  async checkMaterialsAvailability(bom, quantity) {
    try {
      const missing = [];
      let available = true;

      for (const material of bom) {
        const product = await this.db.get('products', material.material_id);
        if (!product) {
          missing.push(`${material.material_name} (غير موجود)`);
          available = false;
          continue;
        }

        const requiredQuantity = material.quantity * quantity;
        const availableQuantity = product.quantity || 0;

        if (availableQuantity < requiredQuantity) {
          missing.push(`${material.material_name} (المطلوب: ${requiredQuantity}, المتوفر: ${availableQuantity})`);
          available = false;
        }
      }

      return { available, missing };
    } catch (error) {
      console.error('خطأ في التحقق من توفر المواد:', error);
      return { available: false, missing: ['خطأ في التحقق'] };
    }
  }

  /**
   * خصم المواد الخام من المخزون
   */
  async deductRawMaterials(bom, quantity, warehouseId, orderId) {
    try {
      for (const material of bom) {
        const product = await this.db.get('products', material.material_id);
        if (!product) continue;

        const requiredQuantity = material.quantity * quantity;
        const newQuantity = (product.quantity || 0) - requiredQuantity;

        await this.db.update('products', material.material_id, {
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        });

        // تسجيل حركة المخزون
        await this.recordInventoryMovement({
          product_id: material.material_id,
          product_name: material.material_name,
          type: 'out',
          quantity: requiredQuantity,
          reason: 'production',
          warehouse_id: warehouseId,
          reference_type: 'production_order',
          reference_id: orderId,
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في خصم المواد الخام:', error);
      throw error;
    }
  }

  /**
   * إرجاع المواد الخام للمخزون (عند الإلغاء)
   */
  async returnRawMaterials(bom, quantity, warehouseId, orderId) {
    try {
      for (const material of bom) {
        const product = await this.db.get('products', material.material_id);
        if (!product) continue;

        const returnQuantity = material.quantity * quantity;
        const newQuantity = (product.quantity || 0) + returnQuantity;

        await this.db.update('products', material.material_id, {
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        });

        // تسجيل حركة المخزون
        await this.recordInventoryMovement({
          product_id: material.material_id,
          product_name: material.material_name,
          type: 'in',
          quantity: returnQuantity,
          reason: 'production_cancelled',
          warehouse_id: warehouseId,
          reference_type: 'production_order_cancelled',
          reference_id: orderId,
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في إرجاع المواد الخام:', error);
      throw error;
    }
  }

  /**
   * إضافة المنتج النهائي للمخزون
   */
  async addFinishedProductToInventory(productId, productName, quantity, costPerUnit, warehouseId, orderId) {
    try {
      const product = await this.db.get('products', productId);
      if (!product) {
        throw new Error('المنتج غير موجود');
      }

      const newQuantity = (product.quantity || 0) + quantity;

      // تحديث سعر التكلفة
      await this.db.update('products', productId, {
        quantity: newQuantity,
        cost: costPerUnit,
        updated_at: new Date().toISOString(),
      });

      // تسجيل حركة المخزون
      await this.recordInventoryMovement({
        product_id: productId,
        product_name: productName,
        type: 'in',
        quantity: quantity,
        reason: 'production_complete',
        warehouse_id: warehouseId,
        reference_type: 'production_order_complete',
        reference_id: orderId,
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('خطأ في إضافة المنتج النهائي للمخزون:', error);
      throw error;
    }
  }

  /**
   * تسجيل حركة المخزون
   */
  async recordInventoryMovement(movement) {
    try {
      const movementId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await this.db.add('inventory_movements', {
        id: movementId,
        ...movement,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('خطأ في تسجيل حركة المخزون:', error);
    }
  }

  /**
   * توليد رقم أمر تلقائي
   */
  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PROD-${timestamp}-${random}`;
  }

  /**
   * إحصائيات الإنتاج
   */
  async getProductionStatistics(period = 'month') {
    try {
      const orders = await this.getAllProductionOrders();
      const now = new Date();
      let startDate;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const periodOrders = orders.filter(order => new Date(order.start_date) >= startDate);
      const completedOrders = periodOrders.filter(order => order.status === 'completed');

      return {
        total_orders: periodOrders.length,
        completed_orders: completedOrders.length,
        in_progress_orders: periodOrders.filter(order => order.status === 'in_progress').length,
        pending_orders: periodOrders.filter(order => order.status === 'pending').length,
        cancelled_orders: periodOrders.filter(order => order.status === 'cancelled').length,
        total_cost: completedOrders.reduce((sum, order) => sum + order.total_cost, 0),
        total_quantity: completedOrders.reduce((sum, order) => sum + order.quantity, 0),
        average_cost_per_unit: completedOrders.length > 0
          ? completedOrders.reduce((sum, order) => sum + order.cost_per_unit, 0) / completedOrders.length
          : 0,
      };
    } catch (error) {
      console.error('خطأ في حساب إحصائيات الإنتاج:', error);
      throw error;
    }
  }

  /**
   * إضافة/تحديث قائمة المواد (BOM) لمنتج
   */
  async updateProductBOM(productId, bom) {
    try {
      const product = await this.db.get('products', productId);
      if (!product) {
        throw new Error('المنتج غير موجود');
      }

      await this.db.update('products', productId, {
        bom: bom,
        updated_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('خطأ في تحديث قائمة المواد:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

export const getProductionServiceInstance = () => {
  if (!instance) {
    instance = new ProductionService();
  }
  return instance;
};

export default ProductionService;
