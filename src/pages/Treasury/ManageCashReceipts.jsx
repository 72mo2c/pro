// ======================================
// Manage Cash Receipts - إدارة إيصالات الاستلام
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTab } from '../../contexts/TabContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import { 
  FaPlus, 
  FaEye, 
  FaTrash, 
  FaMoneyBillWave,
  FaSearch,
  FaLock,
  FaFileInvoice,
  FaUsers,
  FaPhone,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCalculator
} from 'react-icons/fa';

const ManageCashReceipts = () => {
  const navigate = useNavigate();
  const { cashReceipts, deleteCashReceipt, customers, suppliers } = useData();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();
  const { showWarning, showError } = useNotification();
  const { openTab } = useTab();

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  
  const paymentMethodLabels = {
    cash: 'نقداً',
    check: 'شيك',
    bank_transfer: 'تحويل بنكي'
  };
  
  // الحصول على معلومات المصدر الكاملة
  const getSourceDetails = (receipt) => {
    if (receipt.fromType === 'customer') {
      return customers.find(c => c.id === receipt.fromId);
    } else if (receipt.fromType === 'supplier') {
      return suppliers.find(s => s.id === receipt.fromId);
    }
    return null;
  };
  
  // الحصول على اسم المصدر
  const getSourceName = (receipt) => {
    const details = getSourceDetails(receipt);
    return details?.name || receipt.fromName || 'غير محدد';
  };
  
  // فلترة وبحث
  const filteredReceipts = cashReceipts.filter(receipt => {
    const sourceName = getSourceName(receipt);
    const matchesSearch = 
      receipt.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // أعمدة الجدول - تطابق Table API
  const columns = [
    { header: 'رقم الإيصال', accessor: 'receiptNumber' },
    { header: 'التاريخ', accessor: 'date' },
    { header: 'من', accessor: 'sourceName' },
    { header: 'المبلغ', accessor: 'amount' },
    { header: 'طريقة الدفع', accessor: 'paymentMethod' },
  ];
  
  // تنسيق البيانات للجدول
  const tableData = filteredReceipts.map(receipt => ({
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    date: new Date(receipt.date).toLocaleDateString('ar-EG'),
    sourceName: getSourceName(receipt),
    amount: hasPermission('view_financial_data') ? formatCurrency(parseFloat(receipt.amount)) : (
      <span className="flex items-center gap-1 text-gray-400">
        <FaLock className="text-xs" />
        مخفي
      </span>
    ),
    paymentMethod: paymentMethodLabels[receipt.paymentMethod] || receipt.paymentMethod
  }));
  
  const handleView = (receipt) => {
    if (!hasPermission('view_cash_receipts')) {
      showWarning('ليس لديك صلاحية عرض إيصالات الاستلام');
      return;
    }
    
    const original = cashReceipts.find(r => r.id === receipt.id);
    setSelectedReceipt(original);
    setShowViewModal(true);
  };
  
  const handleDelete = (receipt) => {
    if (!hasPermission('delete_cash_receipt')) {
      showWarning('ليس لديك صلاحية حذف إيصالات الاستلام');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا الإيصال؟')) {
      try {
        deleteCashReceipt(receipt.id);
      } catch (error) {
        showError('خطأ: ' + error.message);
      }
    }
  };
  
  const handleAddNew = () => {
    if (!hasPermission('manage_cash_receipts')) {
      showWarning('ليس لديك صلاحية إدارة إيصالات الاستلام');
      return;
    }
    // فتح تبويبة جديدة لإضافة إيصال نقدي
    openTab('/treasury/receipt/new', 'إضافة إيصال نقدي', '💰➕');
  };
  
  // حساب إجمالي الإيصالات
  const totalReceipts = filteredReceipts.reduce((sum, receipt) => 
    sum + parseFloat(receipt.amount || 0), 0
  );
  
  return (
    <div className="space-y-4">
      <PageHeader 
        title="سجل إيصالات الاستلام"
        icon={<FaMoneyBillWave />}
        action={
          hasPermission('manage_cash_receipts') && (
            <Button onClick={handleAddNew} icon={<FaPlus />} size="sm">
              إضافة إيصال جديد
            </Button>
          )
        }
      />
      
      {/* بطاقات الإحصائيات المحسنة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-xl">
              <FaMoneyBillWave className="text-2xl text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">إجمالي الإيصالات</div>
              <div className="text-3xl font-bold text-green-600">
                {hasPermission('view_cash_receipts') ? filteredReceipts.length : (
                  <span className="flex items-center gap-2 text-gray-400">
                    <FaLock className="text-sm" />
                    ----
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-xl">
              <FaMoneyBillWave className="text-2xl text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">إجمالي المبالغ</div>
              <div className="text-3xl font-bold text-blue-600">
                {hasPermission('view_financial_data') ? formatCurrency(totalReceipts) : (
                  <span className="flex items-center gap-2 text-gray-400">
                    <FaLock className="text-sm" />
                    ----
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-xl">
              <FaCalculator className="text-2xl text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">متوسط الإيصال</div>
              <div className="text-3xl font-bold text-purple-600">
                {hasPermission('view_financial_data') ? formatCurrency(filteredReceipts.length > 0 ? (totalReceipts / filteredReceipts.length) : 0) : (
                  <span className="flex items-center gap-2 text-gray-400">
                    <FaLock className="text-sm" />
                    ----
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* أدوات البحث والفلترة المحسنة */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* مربع البحث */}
            <div className="flex-1 relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="بحث برقم الإيصال أو المصدر أو الوصف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          {/* إحصائيات سريعة */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              عرض <span className="font-semibold text-blue-600">{filteredReceipts.length}</span> من أصل 
              <span className="font-semibold text-gray-800">{cashReceipts.length}</span> إيصال
            </div>
            {searchTerm && (
              <div className="text-sm text-blue-600">
                نتائج البحث عن: "<span className="font-semibold">{searchTerm}</span>"
              </div>
            )}
          </div>
        </div>
        
        {/* الجدول */}
        <div className="mt-6">
          <Table
            columns={columns}
            data={tableData || []}
            onView={handleView}
            onDelete={handleDelete}
          />
        </div>
      </Card>
      
      {/* Modal عرض تفاصيل الإيصال - تصميم محسن */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-green-600 text-xl" />
            <span>تفاصيل إيصال الاستلام #{selectedReceipt?.receiptNumber}</span>
          </div>
        }
        size="lg"
      >
        {selectedReceipt && (() => {
          const sourceDetails = getSourceDetails(selectedReceipt);
          return (
            <div className="space-y-6">
              {/* معلومات الإيصال الأساسية */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaFileInvoice className="text-green-600" />
                  معلومات الإيصال
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-sm text-gray-600 mb-1">رقم الإيصال</div>
                    <div className="font-bold text-lg text-gray-800">{selectedReceipt.receiptNumber}</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-sm text-gray-600 mb-1">التاريخ</div>
                    <div className="font-bold text-lg text-gray-800">
                      {new Date(selectedReceipt.date).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-sm text-gray-600 mb-1">المبلغ</div>
                    <div className="font-bold text-xl text-green-600">
                      {hasPermission('view_financial_data') ? 
                        formatCurrency(parseFloat(selectedReceipt.amount)) : 
                        <span className="flex items-center gap-1 text-gray-400">
                          <FaLock className="text-sm" />
                          مخفي
                        </span>
                      }
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-sm text-gray-600 mb-1">طريقة الدفع</div>
                    <div className="font-medium text-gray-800">
                      {paymentMethodLabels[selectedReceipt.paymentMethod] || selectedReceipt.paymentMethod}
                    </div>
                  </div>
                  
                  {selectedReceipt.referenceNumber && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="text-sm text-gray-600 mb-1">رقم المرجع</div>
                      <div className="font-medium text-gray-800">{selectedReceipt.referenceNumber}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* معلومات المصدر */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUsers className="text-blue-600" />
                  معلومات المصدر
                </h3>
                {sourceDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUsers className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">الاسم</div>
                          <div className="font-bold text-gray-800">{sourceDetails.name}</div>
                          <div className="text-xs text-gray-500">
                            {selectedReceipt.fromType === 'customer' ? 'عميل' : 'مورد'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <FaPhone className="text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">رقم الهاتف</div>
                          <div className="font-medium text-gray-800">
                            {sourceDetails.phone1 || sourceDetails.phone2 ? 
                              `${sourceDetails.phone1 || ''}${sourceDetails.phone1 && sourceDetails.phone2 ? ' / ' : ''}${sourceDetails.phone2 || ''}` : 
                              <span className="text-gray-400">غير محدد</span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <FaMapMarkerAlt className="text-yellow-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">المنطقة</div>
                          <div className="font-medium text-gray-800">{sourceDetails.area || 'غير محدد'}</div>
                        </div>
                      </div>
                    </div>
                    
                    {sourceDetails.address && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border md:col-span-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mt-1">
                            <FaMapMarkerAlt className="text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">العنوان</div>
                            <div className="font-medium text-gray-800">{sourceDetails.address}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <FaInfoCircle className="text-gray-400 text-2xl mx-auto mb-2" />
                    <p className="text-gray-600">المصدر: {selectedReceipt.fromName || 'غير محدد'}</p>
                  </div>
                )}
              </div>
              
              {/* الوصف والملاحظات */}
              {(selectedReceipt.description || selectedReceipt.notes) && (
                <div className="space-y-4">
                  {selectedReceipt.description && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <FaFileInvoice className="text-gray-600" />
                        الوصف
                      </h4>
                      <p className="text-gray-700">{selectedReceipt.description}</p>
                    </div>
                  )}
                  
                  {selectedReceipt.notes && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <FaInfoCircle className="text-yellow-600" />
                        ملاحظات
                      </h4>
                      <p className="text-yellow-700">{selectedReceipt.notes}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* زر الإغلاق */}
              <div className="flex justify-end pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-4 rounded-b-lg">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowViewModal(false)}
                  className="px-8"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ManageCashReceipts;