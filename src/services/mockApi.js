// ======================================
// Mock API Service - نظام API وهمية شامل
// يعمل بالكامل مع localStorage
// ======================================

// دالة مساعدة للحصول على البيانات من localStorage
const getData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`خطأ في قراءة ${key}:`, error);
    return defaultValue;
  }
};

// دالة مساعدة لحفظ البيانات في localStorage
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`خطأ في حفظ ${key}:`, error);
    return false;
  }
};

// دالة مساعدة لإنشاء ID جديد
const generateId = () => Date.now();

// دالة مساعدة لمحاكاة التأخير
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== خدمات المصادقة ====================

export const authAPI = {
  login: async (username, password) => {
    await delay();
    
    const users = getData('bero_system_users', []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('اسم المستخدم غير موجود');
    }
    
    // التحقق من كلمة المرور المبسطة
    if (user.password !== password && user.password !== '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') {
      throw new Error('كلمة المرور غير صحيحة');
    }
    
    // تحديث آخر تسجيل دخول
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, lastLogin: new Date().toISOString() }
        : u
    );
    saveData('bero_system_users', updatedUsers);
    
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
      loginAt: new Date().toISOString()
    };
    
    return { success: true, user: userData, token: 'mock_token_' + user.id };
  },

  logout: async () => {
    await delay();
    localStorage.removeItem('bero_token');
    localStorage.removeItem('bero_user');
    return { success: true };
  },
};

// ==================== خدمات المخازن ====================

export const warehouseAPI = {
  getAll: async () => {
    await delay();
    return getData('bero_warehouses', []);
  },
  getById: async (id) => {
    await delay();
    const warehouses = getData('bero_warehouses', []);
    return warehouses.find(w => w.id === parseInt(id));
  },
  create: async (data) => {
    await delay();
    const warehouses = getData('bero_warehouses', []);
    const newWarehouse = { id: generateId(), ...data, createdAt: new Date().toISOString() };
    warehouses.push(newWarehouse);
    saveData('bero_warehouses', warehouses);
    return newWarehouse;
  },
  update: async (id, data) => {
    await delay();
    const warehouses = getData('bero_warehouses', []);
    const index = warehouses.findIndex(w => w.id === parseInt(id));
    if (index === -1) throw new Error('المخزن غير موجود');
    warehouses[index] = { ...warehouses[index], ...data, updatedAt: new Date().toISOString() };
    saveData('bero_warehouses', warehouses);
    return warehouses[index];
  },
  delete: async (id) => {
    await delay();
    const warehouses = getData('bero_warehouses', []);
    const updated = warehouses.filter(w => w.id !== parseInt(id));
    saveData('bero_warehouses', updated);
    return { success: true };
  },
};

// ==================== خدمات المنتجات ====================

export const productAPI = {
  getAll: async () => {
    await delay();
    return getData('bero_products', []);
  },
  getById: async (id) => {
    await delay();
    const products = getData('bero_products', []);
    return products.find(p => p.id === parseInt(id));
  },
  create: async (data) => {
    await delay();
    const products = getData('bero_products', []);
    const newProduct = { id: generateId(), ...data, createdAt: new Date().toISOString() };
    products.push(newProduct);
    saveData('bero_products', products);
    return newProduct;
  },
  update: async (id, data) => {
    await delay();
    const products = getData('bero_products', []);
    const index = products.findIndex(p => p.id === parseInt(id));
    if (index === -1) throw new Error('المنتج غير موجود');
    products[index] = { ...products[index], ...data, updatedAt: new Date().toISOString() };
    saveData('bero_products', products);
    return products[index];
  },
  delete: async (id) => {
    await delay();
    const products = getData('bero_products', []);
    const updated = products.filter(p => p.id !== parseInt(id));
    saveData('bero_products', updated);
    return { success: true };
  },
};

// ==================== خدمات الموردين ====================

export const supplierAPI = {
  getAll: async () => {
    await delay();
    return getData('bero_suppliers', []);
  },
  getById: async (id) => {
    await delay();
    const suppliers = getData('bero_suppliers', []);
    return suppliers.find(s => s.id === parseInt(id));
  },
  create: async (data) => {
    await delay();
    const suppliers = getData('bero_suppliers', []);
    const newSupplier = { id: generateId(), ...data, createdAt: new Date().toISOString() };
    suppliers.push(newSupplier);
    saveData('bero_suppliers', suppliers);
    return newSupplier;
  },
  update: async (id, data) => {
    await delay();
    const suppliers = getData('bero_suppliers', []);
    const index = suppliers.findIndex(s => s.id === parseInt(id));
    if (index === -1) throw new Error('المورد غير موجود');
    suppliers[index] = { ...suppliers[index], ...data, updatedAt: new Date().toISOString() };
    saveData('bero_suppliers', suppliers);
    return suppliers[index];
  },
  delete: async (id) => {
    await delay();
    const suppliers = getData('bero_suppliers', []);
    const updated = suppliers.filter(s => s.id !== parseInt(id));
    saveData('bero_suppliers', updated);
    return { success: true };
  },
};

// ==================== خدمات العملاء ====================

export const customerAPI = {
  getAll: async () => {
    await delay();
    return getData('bero_customers', []);
  },
  getById: async (id) => {
    await delay();
    const customers = getData('bero_customers', []);
    return customers.find(c => c.id === parseInt(id));
  },
  create: async (data) => {
    await delay();
    const customers = getData('bero_customers', []);
    const newCustomer = { id: generateId(), ...data, createdAt: new Date().toISOString() };
    customers.push(newCustomer);
    saveData('bero_customers', customers);
    return newCustomer;
  },
  update: async (id, data) => {
    await delay();
    const customers = getData('bero_customers', []);
    const index = customers.findIndex(c => c.id === parseInt(id));
    if (index === -1) throw new Error('العميل غير موجود');
    customers[index] = { ...customers[index], ...data, updatedAt: new Date().toISOString() };
    saveData('bero_customers', customers);
    return customers[index];
  },
  delete: async (id) => {
    await delay();
    const customers = getData('bero_customers', []);
    const updated = customers.filter(c => c.id !== parseInt(id));
    saveData('bero_customers', updated);
    return { success: true };
  },
};

// ==================== خدمات فواتير المشتريات ====================

export const purchaseAPI = {
  getAll: async () => {
    await delay();
    return getData('bero_purchase_invoices', []);
  },
  getById: async (id) => {
    await delay();
    const purchases = getData('bero_purchase_invoices', []);
    return purchases.find(p => p.id === parseInt(id));
  },
  create: async (data) => {
    await delay();
    const purchases = getData('bero_purchase_invoices', []);
    const newPurchase = { 
      id: generateId(),
      invoiceNumber: `PUR-2024-${String(purchases.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      ...data 
    };
    purchases.push(newPurchase);
    saveData('bero_purchase_invoices', purchases);
    return newPurchase;
  },
  update: async (id, data) => {
    await delay();
    const purchases = getData('bero_purchase_invoices', []);
    const index = purchases.findIndex(p => p.id === parseInt(id));
    if (index === -1) throw new Error('الفاتورة غير موجودة');
    purchases[index] = { ...purchases[index], ...data, updatedAt: new Date().toISOString() };
    saveData('bero_purchase_invoices', purchases);
    return purchases[index];
  },
  delete: async (id) => {
    await delay();
    const purchases = getData('bero_purchase_invoices', []);
    const updated = purchases.filter(p => p.id !== parseInt(id));
    saveData('bero_purchase_invoices', updated);
    return { success: true };
  },
};

// ==================== خدمات فواتير المبيعات ====================

export const salesAPI = {
  getAll: async () => {
    await delay();
    return getData('bero_sales_invoices', []);
  },
  getById: async (id) => {
    await delay();
    const sales = getData('bero_sales_invoices', []);
    return sales.find(s => s.id === parseInt(id));
  },
  create: async (data) => {
    await delay();
    const sales = getData('bero_sales_invoices', []);
    const newSale = { 
      id: generateId(),
      invoiceNumber: `SALES-2024-${String(sales.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      ...data 
    };
    sales.push(newSale);
    saveData('bero_sales_invoices', sales);
    return newSale;
  },
  update: async (id, data) => {
    await delay();
    const sales = getData('bero_sales_invoices', []);
    const index = sales.findIndex(s => s.id === parseInt(id));
    if (index === -1) throw new Error('الفاتورة غير موجودة');
    sales[index] = { ...sales[index], ...data, updatedAt: new Date().toISOString() };
    saveData('bero_sales_invoices', sales);
    return sales[index];
  },
  delete: async (id) => {
    await delay();
    const sales = getData('bero_sales_invoices', []);
    const updated = sales.filter(s => s.id !== parseInt(id));
    saveData('bero_sales_invoices', updated);
    return { success: true };
  },
};

// ==================== خدمات الخزينة ====================

export const treasuryAPI = {
  getBalance: async () => {
    await delay();
    return parseFloat(localStorage.getItem('bero_treasury_balance') || '0');
  },
  getTransactions: async () => {
    await delay();
    const receipts = getData('bero_cash_receipts', []);
    const disbursements = getData('bero_cash_disbursements', []);
    return {
      receipts,
      disbursements,
      balance: parseFloat(localStorage.getItem('bero_treasury_balance') || '0')
    };
  },
  addTransaction: async (data) => {
    await delay();
    // سيتم تنفيذ هذا في DataContext
    return { success: true, message: 'تم إضافة المعاملة بنجاح' };
  },
  getReports: async (params) => {
    await delay();
    // تقرير أساسي للخزينة
    return {
      period: params,
      balance: parseFloat(localStorage.getItem('bero_treasury_balance') || '0'),
      totalReceipts: getData('bero_cash_receipts', []).length,
      totalDisbursements: getData('bero_cash_disbursements', []).length
    };
  },
};

// ==================== خدمات التقارير ====================

export const reportsAPI = {
  getSalesReport: async (startDate, endDate) => {
    await delay();
    const sales = getData('bero_sales_invoices', []);
    const filteredSales = sales.filter(s => s.date >= startDate && s.date <= endDate);
    return {
      period: { startDate, endDate },
      totalSales: filteredSales.length,
      totalAmount: filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0),
      sales: filteredSales
    };
  },
  
  getPurchasesReport: async (startDate, endDate) => {
    await delay();
    const purchases = getData('bero_purchase_invoices', []);
    const filteredPurchases = purchases.filter(p => p.date >= startDate && p.date <= endDate);
    return {
      period: { startDate, endDate },
      totalPurchases: filteredPurchases.length,
      totalAmount: filteredPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0),
      purchases: filteredPurchases
    };
  },
  
  getProfitReport: async (startDate, endDate) => {
    await delay();
    const sales = getData('bero_sales_invoices', []);
    const purchases = getData('bero_purchase_invoices', []);
    const filteredSales = sales.filter(s => s.date >= startDate && s.date <= endDate);
    const filteredPurchases = purchases.filter(p => p.date >= startDate && p.date <= endDate);
    
    return {
      period: { startDate, endDate },
      totalRevenue: filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0),
      totalExpenses: filteredPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0),
      netProfit: filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0) - 
                 filteredPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
    };
  },
  
  getInventoryReport: async () => {
    await delay();
    const products = getData('bero_products', []);
    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, product) => sum + ((product.mainQuantity || 0) * (product.cost || 0)), 0),
      lowStockItems: products.filter(p => (p.mainQuantity || 0) <= (p.minStock || 0)),
      products: products
    };
  },
};

// ==================== دوال إضافية للنظام ====================

// دوال إدارة المستخدمين
export const userAPI = {
  getAll: async () => {
    await delay();
    return getData('bero_system_users', []);
  },
  create: async (userData) => {
    await delay();
    const users = getData('bero_system_users', []);
    const newUser = {
      id: generateId(),
      ...userData,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveData('bero_system_users', users);
    return newUser;
  },
  update: async (id, userData) => {
    await delay();
    const users = getData('bero_system_users', []);
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) throw new Error('المستخدم غير موجود');
    users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
    saveData('bero_system_users', users);
    return users[index];
  },
  delete: async (id) => {
    await delay();
    const users = getData('bero_system_users', []);
    const updated = users.filter(u => u.id !== parseInt(id));
    saveData('bero_system_users', updated);
    return { success: true };
  }
};

// دوال إحصائيات عامة
export const statsAPI = {
  getDashboardStats: async () => {
    await delay();
    const products = getData('bero_products', []);
    const sales = getData('bero_sales_invoices', []);
    const purchases = getData('bero_purchase_invoices', []);
    const customers = getData('bero_customers', []);
    const suppliers = getData('bero_suppliers', []);
    const treasury = parseFloat(localStorage.getItem('bero_treasury_balance') || '0');
    
    return {
      totalProducts: products.length,
      totalSales: sales.length,
      totalPurchases: purchases.length,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      treasuryBalance: treasury,
      recentSales: sales.slice(-5),
      lowStockProducts: products.filter(p => (p.mainQuantity || 0) <= (p.minStock || 0)).length
    };
  }
};

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
  user: userAPI,
  stats: statsAPI
};