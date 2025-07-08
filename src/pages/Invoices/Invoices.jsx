import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiDownload,
  FiPrinter,
  FiMail,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiMoreVertical,
  FiCalendar,
  FiTrash2
} from 'react-icons/fi';
import axios from 'axios';

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const invoicesPerPage = 5;
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showActionMenu && !e.target.closest('.action-menu-container')) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionMenu]);

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get('http://localhost:3000/api/invoices', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            limit: invoicesPerPage,
            status: activeFilter === 'All' ? null : activeFilter,
            search: searchTerm
          }
        });

        if (response.data && response.data.success) {
          setInvoices(response.data.data);
          setTotalInvoices(response.data.totalInvoices);
          setTotalPages(response.data.totalPages);
        } else {
          throw new Error('Failed to fetch invoices');
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentPage, activeFilter, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleActionMenu = (invoiceId, e) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === invoiceId ? null : invoiceId);
  };

  const markAsPaid = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/api/invoices/${invoiceId}`,
        { status: 'Paid' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInvoices(invoices.map(invoice => 
        invoice.id === invoiceId ? { ...invoice, status: 'Paid' } : invoice
      ));
      setShowActionMenu(null);
      setSuccessMessage('Invoice marked as paid');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  // const sendReminder = async (invoiceId) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     await axios.post(
  //       `http://localhost:3000/api/invoices/${invoiceId}/reminder`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setSuccessMessage('Reminder sent successfully');
  //     setShowSuccess(true);
  //     setTimeout(() => setShowSuccess(false), 3000);
  //     setShowActionMenu(null);
  //   } catch (err) {
  //     console.error('Error sending reminder:', err);
  //     setError(err.response?.data?.message || err.message);
  //   }
  // };

  const deleteInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/invoices/${invoiceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
      setSuccessMessage('Invoice deleted successfully');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowActionMenu(null);
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-700">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-lg font-medium text-red-600">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your billing</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/invoices/add"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm"
            >
              <FiPlus size={16} />
              <span>Create Invoice</span>
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-3 animate-fade-in border border-emerald-200">
            <FiCheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            <p className="font-medium text-sm">{successMessage}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search invoices by ID, client or amount..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'All' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiFilter size={14} />
              All Invoices
            </button>
            <button 
              onClick={() => setActiveFilter('Paid')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'Paid' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiCheckCircle size={14} className="text-emerald-500" />
              Paid
            </button>
            <button 
              onClick={() => setActiveFilter('Pending')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'Pending' 
                  ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiClock size={14} className="text-amber-500" />
              Pending
            </button>
            <button 
              onClick={() => setActiveFilter('Overdue')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'Overdue' 
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiAlertCircle size={14} className="text-red-500" />
              Overdue
            </button>
            <button 
              onClick={() => setActiveFilter('Draft')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'Draft' 
                  ? 'border-gray-500 bg-gray-50 text-gray-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiAlertCircle size={14} className="text-gray-500" />
              Draft
            </button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Invoice</div>
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Invoices */}
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 relative">
                {/* Invoice ID */}
                <div className="col-span-3 flex items-center">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-gray-400" size={16} />
                    <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                  </div>
                </div>

                {/* Client */}
                <div className="col-span-3 flex items-center">
                  <span className="text-gray-700">
                    {invoice.client?.name || 'N/A'}
                  </span>
                </div>

                {/* Amount */}
                <div className="col-span-2 flex items-center">
                  <span className="font-medium">{formatCurrency(invoice.total)}</span>
                </div>

                {/* Due Date */}
                <div className="col-span-2 flex items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <FiCalendar size={14} className="text-gray-400" />
                    <span className={invoice.status === 'Overdue' ? 'text-red-500' : 'text-gray-600'}>
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1 flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end items-center action-menu-container">
                  <button 
                    onClick={(e) => toggleActionMenu(invoice.id, e)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical size={18} />
                  </button>
                  
                  {/* Action Menu */}
                  {showActionMenu === invoice.id && (
                    <div className="absolute z-50 right-6 top-14 w-48 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in">
                      <div className="py-1">
                        {/* <button 
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiDownload size={14} />
                          <span>View/Download</span>
                        </button> */}
                        <button 
                          onClick={() => {
                            navigate(`/invoices/${invoice.id}/print`);
                            setShowActionMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiPrinter size={14} />
                          <span>Print</span>
                        </button>
                        {/* <button 
                          onClick={() => {
                            sendReminder(invoice.id);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiMail size={14} />
                          <span>Send Reminder</span>
                        </button> */}
                        {invoice.status !== 'Paid' && (
                          <button
                            onClick={() => {
                              markAsPaid(invoice.id);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <FiCheckCircle size={14} />
                            <span>Mark as Paid</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            deleteInvoice(invoice.id);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                        >
                          <FiTrash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <FiAlertCircle size={32} className="text-gray-400" />
                <p className="text-base font-medium text-gray-700">No invoices found</p>
                {(searchTerm || activeFilter !== 'All') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setActiveFilter('All');
                    }} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalInvoices > invoicesPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * invoicesPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * invoicesPerPage, totalInvoices)}
              </span>{' '}
              of <span className="font-medium">{totalInvoices}</span> invoices
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Previous page"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-10 h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    currentPage === number
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  aria-label={`Page ${number}`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Next page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;