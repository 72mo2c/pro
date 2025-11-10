// ======================================
// Mock API Service - للتوضيح والتجربة
// يحاكي API حقيقي ولكن مع بيانات وهمية
// ======================================

// استيراد البيانات الوهمية
import mockData from '../data/mockData';

// دالة محاكاة تأخير الشبكة
const simulateNetworkDelay = (ms = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// دالة مساعدة للبحث عن عنصر
const findById = (array, id) => array.find(item => item.id === parseInt(id));

// دالة مساعدة للفلترة
const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key];
      const itemValue = item[key];
      
      if (filterValue === undefined || filterValue === null || filterValue === '') {
        return true;
      }
      
      // البحث النصي
      if (typeof filterValue === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(filterValue.toLowerCase());
      }
      
      // البحث الرقمي
      if (typeof filterValue === 'number') {
        return parseInt(itemValue) === filterValue;
      }
      
      // البحث المباشر
      return itemValue === filterValue;
    });
  });
};

// ==================== خدمات المصادقة (محاكاة) ====================

export const authAPI = {
  // تسجيل الدخول (محاكاة)
  login: async (username, password) => {
    await simulateNetworkDelay(1000);
    
    const user = mockData.users.find(u => 
      u.username === username && u.password === password
    );
    
    if (user) {
      // حفظ توكن وهمي
      const token = `mock_token_${user.id}_${Date.now()}`;
      localStorage.setItem('bero_token', token);
      localStorage.setItem('bero_user', JSON.stringify(user));
      
      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        }
      };
    }
    
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  },

  // تسجيل الخروج
  logout: async () => {
    await simulateNetworkDelay(300);
    localStorage.removeItem('bero_token');
    localStorage.removeItem('bero_user');
    return { success: true };
  },

  // التحقق من حالة تسجيل الدخول
  checkAuth: async () => {
    await simulateNetworkDelay(200);
    const token = localStorage.getItem('bero_token');
    const user = localStorage.getItem('bero_user');
    
    if (token && user) {
      return {
        success: true,
        user: JSON.parse(user)
      };
    }
    
    throw new Error('غير مسجل دخول');
  }
};

// ==================== خدمات المخازن (محاكاة) ====================

export const warehouseAPI = {
  getAll: async (filters = {}) => {
    await simulateNetworkDelay(300);
    let warehouses = [...mockData.warehouses];
    
    if (Object.keys(filters).length > 0) {
      warehouses = filterBy(warehouses, filters);
    }
    
    return { success: true, data: warehouses };
  },

  getById: async (id) => {
    await simulateNetworkDelay(200);
    const warehouse = findById(mockData.warehouses, id);
    
    if (!warehouse) {
      throw new Error('المخزن غير موجود');
    }
    
    return { success: true, data: warehouse };
  },

  // هذه الدوال للعرض فقط - لا تعمل فعلياً
  create: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحفظ فعلياً' };
  },

  update: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم التحديث فعلياً' };
  },

  delete: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحذف فعلياً' };
  }
};

// ==================== خدمات المنتجات (محاكاة) ====================

export const productAPI = {
  getAll: async (filters = {}) => {
    await simulateNetworkDelay(400);
    let products = [...mockData.products];
    
    if (Object.keys(filters).length > 0) {
      products = filterBy(products, filters);
    }
    
    return { success: true, data: products };
  },

  getById: async (id) => {
    await simulateNetworkDelay(200);
    const product = findById(mockData.products, id);
    
    if (!product) {
      throw new Error('المنتج غير موجود');
    }
    
    return { success: true, data: product };
  },

  getByCategory: async (categoryId) => {
    await simulateNetworkDelay(300);
    const products = mockData.products.filter(p => p.categoryId === parseInt(categoryId));
    return { success: true, data: products };
  },

  getLowStock: async () => {
    await simulateNetworkDelay(300);
    const lowStockProducts = mockData.products.filter(p => p.mainQuantity <= p.minStockLevel);
    return { success: true, data: lowStockProducts };
  },

  // هذه الدوال للعرض فقط
  create: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحفظ فعلياً' };
  },

  update: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم التحديث فعلياً' };
  },

  delete: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحذف فعلياً' };
  }
};

// ==================== خدمات الموردين (محاكاة) ====================

export const supplierAPI = {
  getAll: async (filters = {}) => {
    await simulateNetworkDelay(300);
    let suppliers = [...mockData.suppliers];
    
    if (Object.keys(filters).length > 0) {
      suppliers = filterBy(suppliers, filters);
    }
    
    return { success: true, data: suppliers };
  },

  getById: async (id) => {
    await simulateNetworkDelay(200);
    const supplier = findById(mockData.suppliers, id);
    
    if (!supplier) {
      throw new Error('المورد غير موجود');
    }
    
    return { success: true, data: supplier };
  },

  // هذه الدوال للعرض فقط
  create: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحفظ فعلياً' };
  },

  update: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم التحديث فعلياً' };
  },

  delete: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحذف فعلياً' };
  }
};

// ==================== خدمات العملاء (محاكاة) ====================

export const customerAPI = {
  getAll: async (filters = {}) => {
    await simulateNetworkDelay(300);
    let customers = [...mockData.customers];
    
    if (Object.keys(filters).length > 0) {
      customers = filterBy(customers, filters);
    }
    
    return { success: true, data: customers };
  },

  getById: async (id) => {
    await simulateNetworkDelay(200);
    const customer = findById(mockData.customers, id);
    
    if (!customer) {
      throw new Error('العميل غير موجود');
    }
    
    return { success: true, data: customer };
  },

  // هذه الدوال للعرض فقط
  create: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحفظ فعلياً' };
  },

  update: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم التحديث فعلياً' };
  },

  delete: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحذف فعلياً' };
  }
};

// ==================== خدمات فواتير المشتريات (محاكاة) ====================

export const purchaseAPI = {
  getAll: async (filters = {}) => {
    await simulateNetworkDelay(400);
    let invoices = [...mockData.purchaseInvoices];
    
    if (Object.keys(filters).length > 0) {
      invoices = filterBy(invoices, filters);
    }
    
    return { success: true, data: invoices };
  },

  getById: async (id) => {
    await simulateNetworkDelay(200);
    const invoice = findById(mockData.purchaseInvoices, id);
    
    if (!invoice) {
      throw new Error('فاتورة المشتريات غير موجودة');
    }
    
    return { success: true, data: invoice };
  },

  getBySupplier: async (supplierId) => {
    await simulateNetworkDelay(300);
    const invoices = mockData.purchaseInvoices.filter(inv => inv.supplierId === parseInt(supplierId));
    return { success: true, data: invoices };
  },

  // هذه الدوال للعرض فقط
  create: async () => {
    await simulateNetworkDelay(800);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحفظ فعلياً' };
  },

  update: async () => {
    await simulateNetworkDelay(600);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم التحديث فعلياً' };
  },

  delete: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحذف فعلياً' };
  }
};

// ==================== خدمات فواتير المبيعات (محاكاة) ====================

export const salesAPI = {
  getAll: async (filters = {}) => {
    await simulateNetworkDelay(400);
    let invoices = [...mockData.salesInvoices];
    
    if (Object.keys(filters).length > 0) {
      invoices = filterBy(invoices, filters);
    }
    
    return { success: true, data: invoices };
  },

  getById: async (id) => {
    await simulateNetworkDelay(200);
    const invoice = findById(mockData.salesInvoices, id);
    
    if (!invoice) {
      throw new Error('فاتورة المبيعات غير موجودة');
    }
    
    return { success: true, data: invoice };
  },

  getByCustomer: async (customerId) => {
    await simulateNetworkDelay(300);
    const invoices = mockData.salesInvoices.filter(inv => inv.customerId === parseInt(customerId));
    return { success: true, data: invoices };
  },

  // هذه الدوال للعرض فقط
  create: async () => {
    await simulateNetworkDelay(800);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحفظ فعلياً' };
  },

  update: async () => {
    await simulateNetworkDelay(600);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم التحديث فعلياً' };
  },

  delete: async () => {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحذف فعلياً' };
  }
};

// ==================== خدمات الخزينة (محاكاة) ====================

export const treasuryAPI = {
  getBalance: async () => {
    await simulateNetworkDelay(300);
    return { 
      success: true, 
      data: { 
        balance: mockData.treasury.balance,
        lastUpdated: mockData.treasury.lastUpdated
      } 
    };
  },

  getTransactions: async () => {
    await simulateNetworkDelay(400);
    const allTransactions = [
      ...mockData.treasury.cashReceipts.map(r => ({ ...r, type: 'receipt' })),
      ...mockData.treasury.cashDisbursements.map(d => ({ ...d, type: 'disbursement' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return { success: true, data: allTransactions };
  },

  // هذه الدوال للعرض فقط
  addTransaction: async () => {
    await simulateNetworkDelay(600);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحفظ فعلياً' };
  },

  getReports: async () => {
    await simulateNetworkDelay(500);
    return { 
      success: true, 
      data: {
        balance: mockData.treasury.balance,
        receipts: mockData.treasury.cashReceipts.length,
        disbursements: mockData.treasury.cashDisbursements.length,
        netCashFlow: mockData.treasury.cashReceipts.reduce((sum, r) => sum + r.amount, 0) - 
                    mockData.treasury.cashDisbursements.reduce((sum, d) => sum + d.amount, 0)
      }
    };
  }
};

// ==================== خدمات التقارير (محاكاة) ====================

export const reportsAPI = {
  getSalesReport: async (startDate, endDate) => {
    await simulateNetworkDelay(600);
    const filteredInvoices = mockData.salesInvoices.filter(inv => {
      const invDate = new Date(inv.date);
      return (!startDate || invDate >= new Date(startDate)) && 
             (!endDate || invDate <= new Date(endDate));
    });
    
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalTax = filteredInvoices.reduce((sum, inv) => sum + inv.tax, 0);
    
    return { 
      success: true, 
      data: {
        invoices: filteredInvoices,
        totalSales,
        totalTax,
        count: filteredInvoices.length
      }
    };
  },

  getPurchasesReport: async (startDate, endDate) => {
    await simulateNetworkDelay(600);
    const filteredInvoices = mockData.purchaseInvoices.filter(inv => {
      const invDate = new Date(inv.date);
      return (!startDate || invDate >= new Date(startDate)) && 
             (!endDate || invDate <= new Date(endDate));
    });
    
    const totalPurchases = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalTax = filteredInvoices.reduce((sum, inv) => sum + inv.tax, 0);
    
    return { 
      success: true, 
      data: {
        invoices: filteredInvoices,
        totalPurchases,
        totalTax,
        count: filteredInvoices.length
      }
    };
  },

  getInventoryReport: async () => {
    await simulateNetworkDelay(500);
    const totalValue = mockData.products.reduce((sum, p) => {
      return sum + ((p.mainQuantity || 0) * (p.mainPrice || 0)) + 
             ((p.subQuantity || 0) * (p.subPrice || 0));
    }, 0);
    
    return { 
      success: true, 
      data: {
        products: mockData.products,
        totalProducts: mockData.products.length,
        totalValue,
        lowStockCount: mockData.products.filter(p => p.mainQuantity <= p.minStockLevel).length
      }
    };
  },

  getProfitReport: async (startDate, endDate) => {
    await simulateNetworkDelay(700);
    const salesInvoices = mockData.salesInvoices.filter(inv => {
      const invDate = new Date(inv.date);
      return (!startDate || invDate >= new Date(startDate)) && 
             (!endDate || invDate <= new Date(endDate));
    });
    
    const purchaseInvoices = mockData.purchaseInvoices.filter(inv => {
      const invDate = new Date(inv.date);
      return (!startDate || invDate >= new Date(startDate)) && 
             (!endDate || invDate <= new Date(endDate));
    });
    
    const totalRevenue = salesInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCost = purchaseInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(2) : 0;
    
    return { 
      success: true, 
      data: {
        totalRevenue,
        totalCost,
        profit,
        profitMargin: parseFloat(profitMargin),
        salesCount: salesInvoices.length,
        purchasesCount: purchaseInvoices.length
      }
    };
  }
};

// ==================== تصدير خدمات API ========
export default {
  auth: authAPI,
  warehouse: warehouseAPI,
  product: productAPI,
  supplier: supplierAPI,
  customer: customerAPI,
  purchase: purchaseAPI,
  sales: salesAPI,
  treasury: treasuryAPI,
  reports: reportsAPI,
  
  // رسالة توضيحية
  note: "هذه خدمات محاكاة للعرض والتجربة - لا تعمل مع backend حقيقي"
};