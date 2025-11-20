// ======================================
// Supplier Balances - أرصدة الموردين
// إعادة بناء كاملة - بسيطة وواضحة
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useTab } from '../../contexts/TabContext';
import PageHeader from '../../components/Common/PageHeader';
import { FaTruck, FaSearch, FaEye, FaFileInvoiceDollar } from 'react-icons/fa';

const SupplierBalances = () => {
  const { suppliers, purchaseInvoices, purchaseReturns, cashDisbursements, getSupplierBalance } = useData();
  const { openTab } = useTab();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, debit, credit, zero
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  // حساب أرصدة جميع الموردين
  const supplierBalances = useMemo(() => {
    return suppliers.map(supplier => ({
      ...supplier,
      balance: getSupplierBalance(supplier.id)
    }));
  }, [suppliers, purchaseInvoices, purchaseReturns, cashDisbursements, getSupplierBalance]);
  
  // الفلترة والبحث
  const filteredBalances = useMemo(() => {
    return supplierBalances.filter(supplier => {
      // البحث
      const matchesSearch = 
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone1?.includes(searchTerm) ||
        supplier.phone2?.includes(searchTerm) ||
        supplier.area?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // الفلتر حسب نوع الرصيد
      let matchesFilter = true;
      if (filterType === 'debit') {
        matchesFilter = supplier.balance > 0;
      } else if (filterType === 'credit') {
        matchesFilter = supplier.balance < 0;
      } else if (filterType === 'zero') {
        matchesFilter = supplier.balance === 0;
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [supplierBalances, searchTerm, filterType]);
  
  // حساب الإجماليات
  const totals = useMemo(() => {
    const totalDebit = filteredBalances
      .filter(s => s.balance > 0)
      .reduce((sum, s) => sum + s.balance, 0);
    
    const totalCredit = Math.abs(
      filteredBalances
        .filter(s => s.balance < 0)
        .reduce((sum, s) => sum + s.balance, 0)
    );
    
    return {
      debit: totalDebit,
      credit: totalCredit,
      net: totalDebit - totalCredit,
      debitCount: filteredBalances.filter(s => s.balance > 0).length,
      creditCount: filteredBalances.filter(s => s.balance < 0).length,
      zeroCount: filteredBalances.filter(s => s.balance === 0).length
    };
  }, [filteredBalances]);
  
  // عرض تفاصيل حركات المورد
  const showSupplierDetails = (supplier) => {
    setSelectedSupplier(supplier);
  };
  
  // الحصول على حركات المورد
  const getSupplierTransactions = (supplierId) => {
    const transactions = [];
    
    // فواتير المشتريات
    purchaseInvoices
      .filter(inv => inv.supplierId === supplierId)
      .forEach(inv => {
        transactions.push({
          id: inv.id,
          date: inv.date,
          type: 'purchase',
          typeLabel: 'فاتورة مشتريات',
          invoiceNumber: inv.invoiceNumber,
          amount: inv.total,
          effect: 'debit',
          balance: inv.total
        });
      });
    
    // مرتجعات المشتريات
    purchaseReturns.forEach(ret => {
      const invoice = purchaseInvoices.find(inv => inv.id === ret.invoiceId);
      if (invoice && invoice.supplierId === supplierId) {
        transactions.push({
          id: ret.id,
          date: ret.date,
          type: 'return',
          typeLabel: 'مرتجع مشتريات',
          invoiceNumber: invoice.invoiceNumber,
          amount: ret.totalAmount,
          effect: 'credit',
          balance: -ret.totalAmount
        });
      }
    });
    
    // الصرف النقدي
    cashDisbursements
      .filter(disb => disb.toType === 'supplier' && disb.toId === supplierId)
      .forEach(disb => {
        transactions.push({
          id: disb.id,
          date: disb.date,
          type: 'disbursement',
          typeLabel: 'صرف نقدي',
          invoiceNumber: disb.disbursementNumber,
          amount: disb.amount,
          effect: 'credit',
          balance: -disb.amount,
          description: disb.description
        });
      });
    
    // ترتيب حسب التاريخ
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  
  return (
    <div className="space-y-4">
      <PageHeader 
        title="أرصدة الموردين"
        icon={<FaTruck />}
        description="عرض وإدارة أرصدة جميع الموردين"
      />
      
      {/* شريط البحث والفلترة */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف أو المنطقة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">جميع الموردين ({supplierBalances.length})</option>
            <option value="debit">لهم دين علينا ({totals.debitCount})</option>
            <option value="credit">عليهم دين لنا ({totals.creditCount})</option>
            <option value="zero">رصيد متعادل ({totals.zeroCount})</option>
          </select>
        </div>
      </div>
      
      {/* الجدول الرئيسي */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">اسم المورد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">رقم الهاتف</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">المنطقة</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الرصيد (جنيه)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الحالة</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBalances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FaTruck className="text-4xl text-gray-300" />
                      <p>لا توجد بيانات متطابقة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBalances.map((supplier, index) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{supplier.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {supplier.phone1 || supplier.phone2 
                        ? `${supplier.phone1 || ''}${supplier.phone1 && supplier.phone2 ? ' - ' : ''}${supplier.phone2 || ''}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{supplier.area || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${
                        supplier.balance > 0 
                          ? 'text-red-600' 
                          : supplier.balance < 0 
                          ? 'text-green-600' 
                          : 'text-gray-600'
                      }`}>
                        {supplier.balance.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {supplier.balance > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          لهم دين علينا
                        </span>
                      ) : supplier.balance < 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          عليهم دين لنا
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          متعادل
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => showSupplierDetails(supplier)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEye />
                        <span>التفاصيل</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            
            {filteredBalances.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    الإجماليات:
                  </td>
                  <td colSpan="3" className="px-4 py-3">
                    <div className="flex items-center justify-center gap-4 text-sm font-bold">
                      <span className="text-red-600">
                        مدين: {totals.debit.toFixed(2)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-green-600">
                        دائن: {totals.credit.toFixed(2)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className={totals.net >= 0 ? 'text-red-600' : 'text-green-600'}>
                        الصافي: {totals.net.toFixed(2)}
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      {/* نافذة تفاصيل المورد */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <FaTruck className="text-2xl" />
                <div>
                  <h3 className="text-lg font-bold">{selectedSupplier.name}</h3>
                  <p className="text-sm opacity-90">تفاصيل حركات المورد</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* معلومات المورد */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">الهاتف</p>
                  <p className="text-sm font-medium">{selectedSupplier.phone1 || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">المنطقة</p>
                  <p className="text-sm font-medium">{selectedSupplier.area || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">الرصيد الحالي</p>
                  <p className={`text-sm font-bold ${
                    selectedSupplier.balance > 0 
                      ? 'text-red-600' 
                      : selectedSupplier.balance < 0 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`}>
                    {selectedSupplier.balance.toFixed(2)} جنيه
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">الحالة</p>
                  <p className="text-sm font-medium">
                    {selectedSupplier.balance > 0 
                      ? 'لهم دين علينا' 
                      : selectedSupplier.balance < 0 
                      ? 'عليهم دين لنا' 
                      : 'متعادل'}
                  </p>
                </div>
              </div>
              
              {/* جدول الحركات */}
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaFileInvoiceDollar />
                <span>سجل الحركات</span>
              </h4>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">التاريخ</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">النوع</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">رقم المستند</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">المبلغ</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">التأثير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getSupplierTransactions(selectedSupplier.id).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-3 py-8 text-center text-gray-500">
                          لا توجد حركات
                        </td>
                      </tr>
                    ) : (
                      getSupplierTransactions(selectedSupplier.id).map((transaction, idx) => (
                        <tr key={`${transaction.type}-${transaction.id}`} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">
                            {new Date(transaction.date).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              transaction.type === 'purchase' 
                                ? 'bg-blue-100 text-blue-800' 
                                : transaction.type === 'return'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.typeLabel}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{transaction.invoiceNumber || '-'}</td>
                          <td className="px-3 py-2 text-center font-medium text-gray-900">
                            {transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`font-bold ${
                              transaction.effect === 'debit' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {transaction.effect === 'debit' ? '+' : '-'} {Math.abs(transaction.balance).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierBalances;
