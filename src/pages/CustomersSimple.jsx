// ======================================
// Customers Simple - صفحة العملاء المبسطة
// للعرض والتجربة فقط
// ======================================

import React, { useState, useEffect } from 'react';
import { useFinalData } from '../context/FinalDataContext';
import { 
  FaUsers, 
  FaSearch, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaUser
} from 'react-icons/fa';

const CustomersSimple = () => {
  const { customers, searchCustomers, salesInvoices, getInvoicesByCustomer } = useFinalData();

  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // فلترة العملاء
  useEffect(() => {
    let filtered = customers;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = searchCustomers(searchTerm);
    }

    // فلترة حسب النوع
    if (selectedType) {
      filtered = filtered.filter(c => c.customerType === selectedType);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, selectedType, searchCustomers]);

  const getCustomerTypeText = (type) => {
    const types = {
      retail: 'مستهلك نهائي',
      wholesale: 'جملة',
      restaurant: 'مطعم',
      supermarket: 'سوبرماركت',
      other: 'أخرى'
    };
    return types[type] || type || 'غير محدد';
  };

  const getCustomerTypeIcon = (type) => {
    switch (type) {
      case 'wholesale':
      case 'supermarket':
      case 'restaurant':
        return <FaBuilding className="text-blue-600" />;
      default:
        return <FaUser className="text-green-600" />;
    }
  };

  const getCustomerTotalPurchases = (customerId) => {
    const customerInvoices = getInvoicesByCustomer(customerId);
    return customerInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  };

  const getCustomerInvoicesCount = (customerId) => {
    return getInvoicesByCustomer(customerId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
              <p className="text-gray-600">عرض بيانات العملاء (للعرض والتجربة فقط)</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            إجمالي العملاء: {customers.length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* البحث */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث عن عميل
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم أو الكود أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* فلترة النوع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع العميل
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">جميع الأنواع</option>
              <option value="retail">مستهلك نهائي</option>
              <option value="wholesale">جملة</option>
              <option value="restaurant">مطعم</option>
              <option value="supermarket">سوبرماركت</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          {/* معلومات النتائج */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <div>النتائج: {filteredCustomers.length} عميل</div>
              <div className="text-green-600 font-medium">
                {filteredCustomers.filter(c => c.isActive).length} عميل نشط
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                    {getCustomerTypeIcon(customer.customerType)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {customer.code} | {getCustomerTypeText(customer.customerType)}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  customer.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.isActive ? 'نشط' : 'غير نشط'}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3 mb-4">
                {/* Contact Person */}
                {customer.contactPerson && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUser className="text-gray-400" />
                    <span>{customer.contactPerson}</span>
                  </div>
                )}

                {/* Phone */}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaPhone className="text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                )}

                {/* Mobile */}
                {customer.mobile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaPhone className="text-gray-400" />
                    <span>{customer.mobile}</span>
                  </div>
                )}

                {/* Email */}
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaEnvelope className="text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}

                {/* Address */}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span className="truncate">{customer.address}, {customer.city}</span>
                  </div>
                )}
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {getCustomerInvoicesCount(customer.id)}
                  </div>
                  <div className="text-xs text-gray-500">فاتورة</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {getCustomerTotalPurchases(customer.id).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">إجمالي المبيعات (ر.س)</div>
                </div>
              </div>

              {/* Credit Info */}
              {(customer.creditLimit > 0 || customer.creditPeriod > 0) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm">
                    <div className="text-blue-800 font-medium">
                      حد الائتمان: {customer.creditLimit?.toLocaleString()} ر.س
                    </div>
                    <div className="text-blue-600">
                      فترة السداد: {customer.creditPeriod} يوم
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Terms */}
              {customer.paymentTerms && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">شروط الدفع:</span> {customer.paymentTerms}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <FaEye className="text-xs" />
                  عرض
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <FaEdit className="text-xs" />
                  تعديل
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <FaTrash className="text-xs" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عملاء</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedType
              ? 'لم يتم العثور على عملاء تطابق المعايير المحددة'
              : 'لا يوجد عملاء في النظام'
            }
          </p>
        </div>
      )}

      {/* Note for demo */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <FaUsers className="text-amber-500" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">ملاحظة هامة</h3>
            <p className="text-sm text-amber-700 mt-1">
              هذه الصفحة للعرض والتجربة فقط. جميع العمليات (عرض، تعديل، حذف) هي لمحاكاة الواجهة ولا تعمل فعلياً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersSimple;