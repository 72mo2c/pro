// ======================================
// Treasury Movement - حركة الخزينة الشاملة
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import { 
  FaHistory, 
  FaMoneyBillWave, 
  FaUser, 
  FaBuilding, 
  FaBalanceScale,
  FaArrowUp,
  FaArrowDown,
  FaCalculator,
  FaFilter,
  FaDownload,
  FaChartLine,
  FaLock,
  FaInfoCircle
} from 'react-icons/fa';

const TreasuryMovement = () => {
  const { cashReceipts, cashDisbursements, treasuryBalance, customers, suppliers } = useData();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all'); // all, receipts, disbursements

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // دمج الإيصالات والمصروفات
  const allTransactions = useMemo(() => {
    const receipts = cashReceipts.map(r => ({
      ...r,
      transactionType: 'receipt',
      displayAmount: parseFloat(r.amount)
    }));
    
    const disbursements = cashDisbursements.map(d => ({
      ...d,
      transactionType: 'disbursement',
      displayAmount: -parseFloat(d.amount)
    }));
    
    return [...receipts, ...disbursements].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [cashReceipts, cashDisbursements]);
  
  // فلترة المعاملات
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      // فلتر بالتاريخ
      if (startDate && new Date(transaction.date) < new Date(startDate)) {
        return false;
      }
      if (endDate && new Date(transaction.date) > new Date(endDate)) {
        return false;
      }
      
      // فلتر بالنوع
      if (transactionType === 'receipts' && transaction.transactionType !== 'receipt') {
        return false;
      }
      if (transactionType === 'disbursements' && transaction.transactionType !== 'disbursement') {
        return false;
      }
      
      return true;
    });
  }, [allTransactions, startDate, endDate, transactionType]);
  
  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalReceipts = filteredTransactions
      .filter(t => t.transactionType === 'receipt')
      .reduce((sum, t) => sum + Math.abs(t.displayAmount), 0);
    
    const totalDisbursements = filteredTransactions
      .filter(t => t.transactionType === 'disbursement')
      .reduce((sum, t) => sum + Math.abs(t.displayAmount), 0);
    
    const netMovement = totalReceipts - totalDisbursements;
    
    return { totalReceipts, totalDisbursements, netMovement };
  }, [filteredTransactions]);
  
  // الحصول على اسم الطرف ومعلومات إضافية
  const getPartyInfo = (transaction) => {
    let name = 'غير محدد';
    let type = 'أخرى';
    let icon = <FaBalanceScale className="text-gray-600" />;
    let balanceInfo = null;

    if (transaction.transactionType === 'receipt') {
      if (transaction.fromType === 'customer') {
        const customer = customers.find(c => c.id === transaction.fromId);
        name = customer?.name || transaction.fromName || 'عميل غير محدد';
        type = 'عميل';
        icon = <FaUser className="text-blue-600" />;
        balanceInfo = transaction.treasuryMovement ? 
          `رصيد قبل: ${formatCurrency(transaction.treasuryMovement.previousBalance || 0)}` : null;
      } else if (transaction.fromType === 'supplier') {
        const supplier = suppliers.find(s => s.id === transaction.fromId);
        name = supplier?.name || transaction.fromName || 'مورد غير محدد';
        type = 'مورد';
        icon = <FaBuilding className="text-purple-600" />;
        balanceInfo = transaction.treasuryMovement ? 
          `رصيد قبل: ${formatCurrency(transaction.treasuryMovement.previousBalance || 0)}` : null;
      } else {
        name = transaction.fromName || 'مصدر آخر';
        type = 'أخرى';
        icon = <FaBalanceScale className="text-gray-600" />;
      }
    } else {
      if (transaction.toType === 'supplier') {
        const supplier = suppliers.find(s => s.id === transaction.toId);
        name = supplier?.name || transaction.toName || 'مورد غير محدد';
        type = 'مورد';
        icon = <FaBuilding className="text-purple-600" />;
      } else if (transaction.toType === 'customer') {
        const customer = customers.find(c => c.id === transaction.toId);
        name = customer?.name || transaction.toName || 'عميل غير محدد';
        type = 'عميل';
        icon = <FaUser className="text-blue-600" />;
      } else {
        name = transaction.toName || 'مستفيد آخر';
        type = 'أخرى';
        icon = <FaBalanceScale className="text-gray-600" />;
      }
    }

    return { name, type, icon, balanceInfo };
  };

  // تحديد لون المبلغ حسب النوع
  const getAmountColor = (transaction) => {
    if (transaction.transactionType === 'receipt') {
      return transaction.treasuryMovement?.willReduceBalance ? 'text-orange-600' : 'text-green-600';
    }
    return 'text-red-600';
  };

  // الحصول على وصف المعاملة
  const getTransactionDescription = (transaction) => {
    if (transaction.treasuryMovement?.transactionType) {
      return `${transaction.description || 'إيصال استلام'} - ${transaction.treasuryMovement.transactionType}`;
    }
    return transaction.description || (transaction.transactionType === 'receipt' ? 'إيصال استلام' : 'إيصال صرف');
  };
  
  // حساب الرصيد التراكمي
  let runningBalance = treasuryBalance;
  const transactionsWithBalance = filteredTransactions.map(transaction => {
    const balanceBeforeTransaction = runningBalance - transaction.displayAmount;
    const result = {
      ...transaction,
      balanceAfter: runningBalance
    };
    runningBalance = balanceBeforeTransaction;
    return result;
  }).reverse();
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="حركة الخزينة"
        icon={<FaChartLine />}
      />
      
      {/* بطاقات الإحصائيات المحسنة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FaMoneyBillWave className="text-2xl text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">الرصيد الحالي</div>
              <div className="text-2xl font-bold text-blue-600">
                {hasPermission('view_financial_data') ? formatCurrency(treasuryBalance) : (
                  <span className="flex items-center gap-2 text-gray-400">
                    <FaLock className="text-sm" />
                    مخفي
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <FaArrowUp className="text-2xl text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">إجمالي الاستلامات</div>
              <div className="text-2xl font-bold text-green-600">
                {hasPermission('view_financial_data') ? formatCurrency(stats.totalReceipts) : (
                  <span className="flex items-center gap-2 text-gray-400">
                    <FaLock className="text-sm" />
                    مخفي
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <FaArrowDown className="text-2xl text-red-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">إجمالي الصرف</div>
              <div className="text-2xl font-bold text-red-600">
                {hasPermission('view_financial_data') ? formatCurrency(stats.totalDisbursements) : (
                  <span className="flex items-center gap-2 text-gray-400">
                    <FaLock className="text-sm" />
                    مخفي
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stats.netMovement >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <FaChartLine className={`text-2xl ${stats.netMovement >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">صافي التدفق</div>
              <div className={`text-2xl font-bold ${stats.netMovement >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {hasPermission('view_financial_data') ? formatCurrency(stats.netMovement) : (
                  <span className="flex items-center gap-2 text-gray-400">
                    <FaLock className="text-sm" />
                    مخفي
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* أدوات الفلترة المحسنة */}
      <Card>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">فلترة الحركات:</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">من:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">إلى:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحركات</option>
              <option value="receipts">الاستلامات فقط</option>
              <option value="disbursements">الصرف فقط</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 mr-auto">
            عرض {transactionsWithBalance.length} من أصل {filteredTransactions.length} حركة
          </div>
        </div>
      </Card>
      
      {/* جدول الحركات المحسن */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ والوقت</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الطرف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الوصف</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">المبلغ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الرقم المرجعي</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactionsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FaHistory className="text-4xl text-gray-300" />
                      <p>لا توجد حركات في الفترة المحددة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactionsWithBalance.map((transaction) => {
                  const partyInfo = getPartyInfo(transaction);
                  const amountColor = getAmountColor(transaction);
                  const description = getTransactionDescription(transaction);
                  
                  return (
                    <tr key={`${transaction.transactionType}-${transaction.id}`} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">
                          {new Date(transaction.date).toLocaleDateString('ar-EG')}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(transaction.date).toLocaleTimeString('ar-EG', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {transaction.transactionType === 'receipt' ? (
                            <FaArrowUp className="text-green-600" />
                          ) : (
                            <FaArrowDown className="text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            transaction.transactionType === 'receipt' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transactionType === 'receipt' ? 'استلام' : 'صرف'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {partyInfo.icon}
                          <div>
                            <div className="font-medium text-sm">{partyInfo.name}</div>
                            <div className="text-gray-500 text-xs">{partyInfo.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-xs">
                          <div className="font-medium text-gray-800">{description}</div>
                          {transaction.treasuryMovement?.transactionType && (
                            <div className="text-xs text-blue-600 mt-1">
                              {transaction.treasuryMovement.transactionType}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className={`font-bold ${amountColor}`}>
                          {hasPermission('view_financial_data') ? 
                            formatCurrency(Math.abs(transaction.displayAmount)) : 
                            (
                              <span className="flex items-center justify-center gap-1 text-gray-400">
                                <FaLock className="text-xs" />
                                مخفي
                              </span>
                            )
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {transaction.transactionType === 'receipt' 
                          ? transaction.receiptNumber 
                          : transaction.disbursementNumber}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-blue-600">
                          {hasPermission('view_financial_data') ? 
                            formatCurrency(transaction.balanceAfter) : 
                            (
                              <span className="flex items-center justify-center gap-1 text-gray-400">
                                <FaLock className="text-xs" />
                                ---
                              </span>
                            )
                          }
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {transactionsWithBalance.length > 0 && (
              <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-right">الإجمالي:</td>
                  <td className="px-4 py-3 text-center">
                    <div className="space-y-1">
                      <div className="text-green-600">
                        {hasPermission('view_financial_data') ? formatCurrency(stats.totalReceipts) : '---'}
                      </div>
                      <div className="text-red-600 text-xs">
                        {hasPermission('view_financial_data') ? formatCurrency(stats.totalDisbursements) : '---'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-center text-blue-600">
                    {hasPermission('view_financial_data') ? formatCurrency(treasuryBalance) : '---'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      {/* ملاحظات مهمة */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">معلومات نظام حركة الخزينة:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• جميع الحركات مسجلة تلقائياً مع تفاصيل الأرصدة</li>
              <li>• يتم تحديث أرصدة العملاء والموردين مع كل إيصال استلام</li>
              <li>• إذا كان للعميل دين، يتم خصمه تلقائياً من المبلغ</li>
              <li>• إذا لم يكن هناك دين، يتم إضافة المبلغ كاملاً للخزينة</li>
              <li>• الرصيد الحالي للخزينة: <strong>{formatCurrency(treasuryBalance)}</strong></li>
              <li>• يمكن فلترة الحركات حسب التاريخ والنوع للبحث الدقيق</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TreasuryMovement;