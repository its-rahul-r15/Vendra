import React, { useState, useMemo, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Bike,
  Clock,
  Phone,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Volume2,
  FileText,
  Receipt,
  CreditCard,
  CheckSquare,
  MinusSquare,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Eye,
  DollarSign,
  RotateCcw,
  Download,
  Mail,
  MessageSquare,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupees } from '../utils/formatters';
import { Pagination } from '../components/common/Pagination';
import { api } from '../services/api';

export const LiveOrders = () => {
  const { orders, updateOrderStatus, audioChimeEnabled, setAudioChimeEnabled } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New state for bulk actions and modals
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrder, setRefundOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Bulk selection handlers
  const toggleSelectOrder = useCallback((orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedOrders([]), []);

  // Refund handler
  const handleRefund = async (order) => {
    setRefundOrder(order);
    setShowRefundModal(true);
  };

  const processRefund = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      amountPaise: Number(formData.get('amountPaise')),
      reason: formData.get('reason'),
      reasonCode: formData.get('reasonCode'),
      refundTo: formData.get('refundTo'),
      notes: formData.get('notes'),
    };

    try {
      await api.processRefund(refundOrder.rawId || refundOrder.id, payload);
      showToast('Refund processed successfully', 'success');
      setShowRefundModal(false);
      setRefundOrder(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process refund', 'error');
    }
  };

  // Invoice handlers
  const handleGenerateInvoice = async (order) => {
    setInvoiceOrder(order);
    setShowInvoiceModal(true);
  };

  const generateInvoice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      gstNumber: formData.get('gstNumber'),
    };

    try {
      await api.generateInvoice(invoiceOrder.rawId || invoiceOrder.id, payload);
      showToast('Invoice generated successfully', 'success');
      setShowInvoiceModal(false);
      setInvoiceOrder(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate invoice', 'error');
    }
  };

  const sendInvoice = async () => {
    if (!invoiceOrder) return;
    try {
      await api.sendInvoice(invoiceOrder.rawId || invoiceOrder.id);
      showToast('Invoice sent to customer', 'success');
      setShowInvoiceModal(false);
      setInvoiceOrder(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send invoice', 'error');
    }
  };

  const handleDownloadInvoice = async (order) => {
    try {
      const blob = await api.downloadInvoice(order.rawId || order.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.invoice?.invoiceNumber || order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Invoice downloaded successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to download invoice', 'error');
    }
  };

  // Bulk actions
  const handleBulkStatusUpdate = async (status) => {
    const reason = window.prompt(`Enter reason for bulk ${status} update:`);
    if (!reason) return;

    try {
      // Send rawIds (MongoDB _ids) for more reliable lookup
      const rawIds = selectedOrders.map(id => {
        const order = orders.find(o => o.id === id);
        return order?.rawId || id;
      });
      const result = await api.bulkUpdateOrderStatus(rawIds, status, reason);
      showToast(`Bulk update completed: ${result.success.length} success, ${result.failed.length} failed`, 'success');
      clearSelection();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to bulk update', 'error');
    }
  };

  const handleBulkRefund = () => {
    if (selectedOrders.length === 1) {
      const order = orders.find((o) => o.id === selectedOrders[0]);
      if (order) handleRefund(order);
    } else {
      showToast('Please select a single order for refund', 'error');
    }
  };

  // Detail view
  const handleViewDetail = async (order) => {
    try {
      // Use rawId (MongoDB _id) for more reliable lookup
      const response = await api.getOrderDetail(order.rawId || order.id);
      // Backend returns { order: {...} }, extract the order object
      const detail = response.order || response;
      setDetailOrder(detail);
      setShowDetailModal(true);
    } catch (err) {
      showToast('Failed to load order details', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const filters = useMemo(
    () => [
      { key: 'ALL', label: 'All Orders', count: orders.length },
      {
        key: 'PENDING',
        label: 'Pending',
        count: orders.filter((o) => o.status === 'PENDING').length,
      },
      {
        key: 'PREPARING',
        label: 'Preparing',
        count: orders.filter((o) => o.status === 'PREPARING').length,
      },
      {
        key: 'OUT_FOR_DELIVERY',
        label: 'Out for Delivery',
        count: orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
      },
      {
        key: 'DELIVERED',
        label: 'Delivered',
        count: orders.filter((o) => o.status === 'DELIVERED').length,
      },
      {
        key: 'CANCELLED',
        label: 'Cancelled',
        count: orders.filter((o) => o.status === 'CANCELLED').length,
      },
    ],
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      const matchesFilter = selectedFilter === 'ALL' || order.status === selectedFilter;
      const matchesSearch =
        !q ||
        (order.id || '').toLowerCase().includes(q) ||
        (order.customerName || '').toLowerCase().includes(q) ||
        (order.customerPhone || '').includes(q) ||
        (order.restaurantName || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [orders, selectedFilter, searchQuery]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  const toggleSelectAll = useCallback(() => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    }
  }, [selectedOrders, paginatedOrders]);

  const handleFilterChange = (key) => {
    setSelectedFilter(key);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-xs font-semibold shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-rose-500/90 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header with Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Live Order Dispatch</h2>
          <p className="text-xs text-slate-400">
            Real-time order statuses, rider assignment, and customer fulfillment controls
          </p>
        </div>

        {/* Bulk Actions Bar */}
        {selectedOrders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 border border-orange-500/30 rounded-xl p-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-orange-400 mr-2">
              {selectedOrders.length} selected
            </span>
            <button
              onClick={() => handleBulkStatusUpdate('PREPARING')}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition"
            >
              Mark Preparing
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('OUT_FOR_DELIVERY')}
              className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition"
            >
              Mark Out for Delivery
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('DELIVERED')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition"
            >
              Mark Delivered
            </button>
            <button
              onClick={handleBulkRefund}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition"
            >
              Refund
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition"
            >
              Clear
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Advanced Filters Dropdown */}
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 hover:text-slate-200 transition">
              <Filter size={14} />
              <span>Filters</span>
              <ChevronRight size={12} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
              <p className="text-xs font-semibold text-slate-400 mb-2">Advanced Filters</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input type="checkbox" className="rounded border-slate-700 text-orange-500 focus:ring-orange-500" />
                  Only COD Orders
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input type="checkbox" className="rounded border-slate-700 text-orange-500 focus:ring-orange-500" />
                  Has Refund Pending
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input type="checkbox" className="rounded border-slate-700 text-orange-500 focus:ring-orange-500" />
                  Invoice Not Generated
                </label>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Filter by Order ID, name, phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition w-64"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
              selectedFilter === f.key
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>{f.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedFilter === f.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Grid / List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <ShoppingBag className="mx-auto text-slate-600 mb-2" size={36} />
            <p className="text-sm font-semibold text-slate-300">No orders found in this view</p>
            <p className="text-xs text-slate-500">Try changing the search query or status filter.</p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div
              key={order.id}
              className={`p-5 rounded-2xl bg-slate-900/80 border transition space-y-4 shadow-xl ${
                selectedOrders.includes(order.id)
                  ? 'border-orange-500/50 ring-1 ring-orange-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  {/* Selection Checkbox */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                  <span className="font-mono text-sm font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                    {order.id}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{order.restaurantName}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span>Customer: {order.customerName}</span>
                      <span>•</span>
                      <Phone size={12} className="text-slate-500" />
                      <span>{order.customerPhone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-white">{formatRupees(order.totalAmount)}</p>
                    <p className="text-[11px] text-slate-400 uppercase font-mono">
                      {order.paymentMethod}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      order.status === 'PREPARING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : order.status === 'PENDING'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : order.status === 'OUT_FOR_DELIVERY'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : order.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Details & Items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Items */}
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Order Items
                  </p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 border-b border-slate-800/40"
                      >
                        <span className="text-slate-200">
                          <span className="font-bold text-orange-400">{item.qty}x</span> {item.name}
                        </span>
                        <span className="text-slate-400">{formatRupees(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                    <MapPin size={13} className="text-slate-500 shrink-0" />
                    <span className="text-[11px] text-slate-300">{order.address}</span>
                  </div>
                </div>

                {/* Rider Info & Actions */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Bike size={13} className="text-blue-400" />
                      Delivery Partner
                    </p>
                    <p className="text-xs font-bold text-slate-200 mt-1">{order.riderName}</p>
                    <p className="text-[11px] text-slate-500">{order.riderPhone}</p>
                  </div>

                  {/* Operational Status Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/60 mt-3 flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          className="w-full py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition cursor-pointer"
                        >
                          Accept & Prep
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt('Enter cancellation reason:', 'Kitchen out of stock');
                            if (reason) updateOrderStatus(order.id, 'CANCELLED', reason);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition cursor-pointer"
                          title="Force Cancel Order"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {order.status === 'PREPARING' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                          className="w-full py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Bike size={14} />
                          <span>Handover to Rider</span>
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt('Enter cancellation reason:', 'Kitchen out of stock');
                            if (reason) updateOrderStatus(order.id, 'CANCELLED', reason);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition cursor-pointer"
                          title="Force Cancel Order"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle size={14} />
                          <span>Confirm Delivered</span>
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt('Enter cancellation reason:', 'Customer unreachable');
                            if (reason) updateOrderStatus(order.id, 'CANCELLED', reason);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition cursor-pointer"
                          title="Force Cancel Order"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {order.status === 'DELIVERED' && (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle size={14} /> Fulfilled successfully
                      </span>
                    )}

                    {order.status === 'CANCELLED' && (
                      <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle size={14} /> Order Cancelled
                      </span>
                    )}

                    {/* Admin Action Buttons - Available for all statuses except cancelled */}
                    {order.status !== 'CANCELLED' && (
                      <div className="pt-2 border-t border-slate-800/60 mt-2 space-y-2">
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                        {order.status === 'DELIVERED' && order.payment?.status === 'paid' && order.refund?.status === 'NONE' && (
                          <button
                            onClick={() => handleRefund(order)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <RotateCcw size={14} />
                            <span>Process Refund</span>
                          </button>
                        )}
                        {order.status === 'DELIVERED' && order.invoice?.status === 'NOT_GENERATED' && (
                          <button
                            onClick={() => handleGenerateInvoice(order)}
                            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                          >
                            <Receipt size={14} />
                            <span>Generate Invoice</span>
                          </button>
                        )}
                        {order.invoice?.status === 'GENERATED' && (
                          <button
                            onClick={sendInvoice}
                            className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Mail size={14} />
                            <span>Send Invoice</span>
                          </button>
                        )}
                        {order.invoice?.status === 'GENERATED' && (
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className="w-full py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Download size={14} />
                            <span>Download Invoice</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-lg font-bold text-white">Order Details</h3>
              <div className="flex items-center gap-2">
                {detailOrder.invoice?.status === 'GENERATED' && (
                  <button
                    onClick={() => handleDownloadInvoice(detailOrder)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                )}
                <button
                  onClick={() => { setShowDetailModal(false); setDetailOrder(null); }}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-slate-400">Order ID:</span> <span className="text-white font-mono ml-2">{detailOrder._id || detailOrder.id}</span></div>
                <div><span className="text-slate-400">Order Number:</span> <span className="text-white font-mono ml-2">{detailOrder.orderNumber}</span></div>
                <div><span className="text-slate-400">Status:</span> <span className="text-white ml-2">{detailOrder.orderStatus || detailOrder.status}</span></div>
                <div><span className="text-slate-400">Payment:</span> <span className="text-white ml-2">{detailOrder.paymentMethod || detailOrder.payment?.method}</span></div>
                <div className="col-span-2">
                  <span className="text-slate-400">Customer:</span> 
                  <span className="text-white ml-2">
                    {detailOrder.user?.name || detailOrder.customerName || 'N/A'} - 
                    {detailOrder.user?.phone || detailOrder.customerPhone || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Restaurant:</span> 
                  <span className="text-white ml-2">
                    {detailOrder.restaurant?.name || detailOrder.vendorId?.name || detailOrder.restaurantName || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Address:</span> 
                  <span className="text-white ml-2">
                    {detailOrder.deliveryAddress?.line1 || ''} {detailOrder.deliveryAddress?.city || ''}
                    {detailOrder.address || ''}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Rider:</span> 
                  <span className="text-white ml-2">
                    {detailOrder.deliveryPartner?.name || detailOrder.riderName || 'N/A'} - 
                    {detailOrder.deliveryPartner?.phone || detailOrder.riderPhone || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Total:</span> 
                  <span className="text-white font-bold ml-2">
                    {formatRupees(detailOrder.totalAmount || detailOrder.pricing?.totalPaise || 0)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Invoice:</span> 
                  <span className="text-white ml-2 capitalize">
                    {detailOrder.invoice?.status?.toLowerCase() || 'not_generated'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Refund:</span> 
                  <span className="text-white ml-2 capitalize">
                    {detailOrder.refund?.status?.toLowerCase() || 'none'}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Items</h4>
                <div className="space-y-1">
                  {(detailOrder.items || []).map((item, idx) => {
                    const itemName = item.menuItem?.name || item.itemId?.name || item.name || item.product?.name || 'Item';
                    const itemPrice = item.pricePaise || item.price || item.menuItem?.price || item.itemId?.price || 0;
                    const itemQty = item.quantity || item.qty || 1;
                    return (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/40 text-xs">
                        <span className="text-slate-200"><span className="font-bold text-orange-400">{itemQty}x</span> {itemName}</span>
                        <span className="text-slate-400">{formatRupees(itemPrice * itemQty)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Timeline</h4>
                <div className="space-y-2">
                  {(detailOrder.timeline || []).map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <span className="text-slate-500 font-mono shrink-0">{new Date(t.at).toLocaleString()}</span>
                      <span className="font-semibold text-orange-400">{t.status}</span>
                      <span className="text-slate-500">by {t.actor?.role} ({t.actor?.id})</span>
                      {t.reason && <span className="text-slate-400">- {t.reason}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && refundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={processRefund} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Process Refund</h3>
            <p className="text-xs text-slate-400 mb-4">Order: {refundOrder.id} - {refundOrder.customerName}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Refund Amount (Paise)</label>
                <input
                  type="number"
                  name="amountPaise"
                  required
                  min="1"
                  max={refundOrder.pricing?.totalPaise || refundOrder.totalAmount * 100}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason</label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason Code</label>
                <select
                  name="reasonCode"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="QUALITY">Quality Issue</option>
                  <option value="LATE_DELIVERY">Late Delivery</option>
                  <option value="WRONG_ITEM">Wrong Item</option>
                  <option value="CUSTOMER_REQUEST">Customer Request</option>
                  <option value="CANCELLED_BEFORE_PREP">Cancelled Before Prep</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Refund To</label>
                <select
                  name="refundTo"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="ORIGINAL">Original Payment Method</option>
                  <option value="WALLET">Customer Wallet</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setShowRefundModal(false); setRefundOrder(null); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/20 transition"
              >
                Process Refund
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={generateInvoice} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Generate Invoice</h3>
            <p className="text-xs text-slate-400 mb-4">Order: {invoiceOrder.id} - {invoiceOrder.customerName}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer GSTIN (Optional)</label>
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="Enter GSTIN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setShowInvoiceModal(false); setInvoiceOrder(null); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
              >
                Generate Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={filteredOrders.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};
