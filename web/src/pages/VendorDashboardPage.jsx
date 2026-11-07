import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  Plus,
  RefreshCw,
  Power,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MapPin,
  FileText,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { vendorsApi, restaurantsApi, ordersApi, catalogApi } from '@/api'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

const STATUS_TONE = {
  PLACED: 'warn',
  ACCEPTED: 'dark',
  CONFIRMED: 'dark',
  PREPARING: 'dark',
  READY_FOR_PICKUP: 'warn',
  READY: 'warn',
  OUT_FOR_DELIVERY: 'warn',
  DELIVERED: 'veg',
  CANCELLED: 'nonveg',
  REJECTED: 'nonveg',
}

export function VendorDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useUiStore((s) => s.toast)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [application, setApplication] = useState(null)

  // Active tab inside vendor panel: 'overview' | 'orders' | 'menu' | 'catalog' | 'settings' | 'new-store'
  const [activeTab, setActiveTab] = useState('overview')

  // Orders state
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState('')

  // Menu items state
  const [menuCategories, setMenuCategories] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)

  // Catalog listings state
  const [listings, setListings] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)

  // New store form modal/view
  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    description: '',
    cuisineType: 'Multi-category retail',
    address: {
      line1: '',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
    },
    vertical: 'commerce',
  })
  const [savingStore, setSavingStore] = useState(false)

  // Add Item Form Modal state
  const [showItemModal, setShowItemModal] = useState(false)
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    pricePaise: 10000,
    categoryName: 'General',
    isVeg: true,
  })
  const [savingItem, setSavingItem] = useState(false)

  // 1. Initial Load: Fetch owned restaurants or vendor application
  useEffect(() => {
    loadVendorData()
  }, [])

  async function loadVendorData() {
    setLoading(true)
    try {
      const [restRes, appRes] = await Promise.allSettled([
        vendorsApi.myRestaurants(),
        vendorsApi.myApplication(),
      ])

      const myStores = restRes.status === 'fulfilled' ? restRes.value || [] : []
      setStores(myStores)
      if (myStores.length > 0) {
        setSelectedStore(myStores[0])
      }

      if (appRes.status === 'fulfilled' && appRes.value) {
        setApplication(appRes.value)
      }
    } catch (err) {
      toast(err.message || 'Failed to load vendor records', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 2. Fetch Store Orders when selectedStore changes or tab changes
  useEffect(() => {
    if (!selectedStore?._id) return

    if (activeTab === 'orders' || activeTab === 'overview') {
      loadStoreOrders(selectedStore._id)
    }
    if (activeTab === 'menu') {
      loadStoreMenu(selectedStore._id)
    }
    if (activeTab === 'catalog') {
      loadStoreCatalog(selectedStore._id)
    }
  }, [selectedStore, activeTab])

  async function loadStoreOrders(restaurantId) {
    setOrdersLoading(true)
    try {
      const res = await ordersApi.getRestaurantOrders(restaurantId, { limit: 50 })
      setOrders(res.orders || [])
    } catch (err) {
      // Endpoint may return empty if no orders yet
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  async function loadStoreMenu(restaurantId) {
    setMenuLoading(true)
    try {
      const menu = await restaurantsApi.menu(restaurantId)
      setMenuCategories(Array.isArray(menu) ? menu : [])
    } catch {
      setMenuCategories([])
    } finally {
      setMenuLoading(false)
    }
  }

  async function loadStoreCatalog(vendorId) {
    setCatalogLoading(true)
    try {
      const res = await catalogApi.products({ vendorId, limit: 50 })
      setListings(res.products || [])
    } catch {
      setListings([])
    } finally {
      setCatalogLoading(false)
    }
  }

  // Handle Toggle Open/Close Store
  async function handleToggleOpen() {
    if (!selectedStore?._id) return
    try {
      const res = await restaurantsApi.toggleOpen(selectedStore._id)
      setSelectedStore((prev) => ({ ...prev, isOpen: res.isOpen }))
      setStores((prev) =>
        prev.map((s) => (s._id === selectedStore._id ? { ...s, isOpen: res.isOpen } : s)),
      )
      toast(res.isOpen ? 'Store is now Open' : 'Store is now Closed', 'info')
    } catch (err) {
      toast(err.message || 'Failed to toggle status', 'error')
    }
  }

  // Handle Updating Order Status
  async function handleUpdateOrderStatus(orderId, newStatus) {
    setStatusUpdating(orderId)
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      toast(`Order marked as ${newStatus.replace(/_/g, ' ')}`, 'success')
      if (selectedStore?._id) {
        await loadStoreOrders(selectedStore._id)
      }
    } catch (err) {
      toast(err.message || 'Could not update status', 'error')
    } finally {
      setStatusUpdating('')
    }
  }

  // Handle Toggle Menu Item Availability
  async function handleToggleItemAvailability(itemId) {
    if (!selectedStore?._id) return
    try {
      const res = await restaurantsApi.toggleItemAvailability(selectedStore._id, itemId)
      toast(res.isAvailable ? 'Item available' : 'Item unavailable', 'info')
      loadStoreMenu(selectedStore._id)
    } catch (err) {
      toast(err.message || 'Failed to toggle availability', 'error')
    }
  }

  // Handle Create New Storefront
  async function handleCreateStore(e) {
    e.preventDefault()
    if (!newStoreForm.name.trim()) {
      toast('Store name is required', 'error')
      return
    }

    setSavingStore(true)
    try {
      const res = await restaurantsApi.create({
        name: newStoreForm.name.trim(),
        description: newStoreForm.description.trim(),
        cuisineType: newStoreForm.cuisineType.trim() || 'Multi-category retail',
        cuisines: [newStoreForm.cuisineType.trim() || 'Retail & Lifestyle'],
        vertical: newStoreForm.vertical || 'commerce',
        location: {
          type: 'Point',
          coordinates: [77.209, 28.6139],
        },
        address: {
          line1: newStoreForm.address.line1.trim() || 'Main Market',
          city: newStoreForm.address.city.trim() || 'New Delhi',
          state: newStoreForm.address.state.trim() || 'Delhi',
          pincode: newStoreForm.address.pincode.trim() || '110001',
        },
      })
      toast('Store created successfully!', 'success')
      await loadVendorData()
      setActiveTab('overview')
    } catch (err) {
      toast(err.message || 'Could not create store', 'error')
    } finally {
      setSavingStore(false)
    }
  }

  // Handle Add Item to Store
  async function handleAddItem(e) {
    e.preventDefault()
    if (!selectedStore?._id || !itemForm.name.trim()) return

    setSavingItem(true)
    try {
      await restaurantsApi.addItem(selectedStore._id, {
        name: itemForm.name.trim(),
        description: itemForm.description.trim(),
        price: Number(itemForm.pricePaise) / 100,
        pricePaise: Number(itemForm.pricePaise),
        category: itemForm.categoryName.trim() || 'General',
        isVeg: itemForm.isVeg,
      })
      toast('Item added to storefront menu!', 'success')
      setShowItemModal(false)
      setItemForm({
        name: '',
        description: '',
        pricePaise: 10000,
        categoryName: 'General',
        isVeg: true,
      })
      loadStoreMenu(selectedStore._id)
    } catch (err) {
      toast(err.message || 'Could not add item', 'error')
    } finally {
      setSavingItem(false)
    }
  }

  if (loading) {
    return (
      <div className="container-app flex min-h-[60vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#0a0a0a]" />
      </div>
    )
  }

  // If vendor has no stores and application is pending
  if (!stores.length && application?.approval?.status === 'pending') {
    return (
      <div className="container-app max-w-2xl py-16 animate-rise">
        <div className="rounded-3xl border border-[#e7e5df] bg-white p-8 sm:p-12 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#faf9f5] border border-[#e7e5df]">
            <Clock className="size-8 text-[#a37237]" />
          </div>
          <Badge tone="warn" className="mt-4">
            Under Verification
          </Badge>
          <h1 className="mt-3 text-2xl font-black text-[#0a0a0a] sm:text-3xl">
            Application Under Review
          </h1>
          <p className="mt-3 text-base text-[#575550] leading-relaxed">
            Your vendor registration for <strong>{application.name || 'your store'}</strong> has been
            submitted and is currently being reviewed by the operations team.
          </p>
          <div className="mt-6 rounded-2xl bg-[#faf9f5] border border-[#e7e5df] p-4 text-xs text-[#737069] text-left space-y-1.5">
            <p><strong>Business Name:</strong> {application.name}</p>
            <p><strong>Category Vertical:</strong> {application.vertical || 'Commerce'}</p>
            <p><strong>Registered Email:</strong> {application.contact?.email || user?.email}</p>
            <p><strong>Status:</strong> Pending Approval</p>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" onClick={() => loadVendorData()}>
              <RefreshCw className="mr-2 size-4" /> Refresh Status
            </Button>
            <Button variant="primary" onClick={() => navigate('/')}>
              Browse Store
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If no stores yet, prompt to create first storefront
  if (!stores.length && activeTab !== 'new-store') {
    return (
      <div className="container-app max-w-2xl py-16 animate-rise">
        <div className="rounded-3xl border border-[#e7e5df] bg-white p-8 sm:p-12 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#faf9f5] border border-[#e7e5df]">
            <Store className="size-8 text-[#0a0a0a]" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-[#0a0a0a] sm:text-3xl">
            Welcome to Vendor Portal
          </h1>
          <p className="mt-2 text-base text-[#575550]">
            You have seller access. Create your first marketplace storefront to start listing products and accepting orders.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-6"
            onClick={() => setActiveTab('new-store')}
          >
            <Plus className="mr-2 size-4" /> Create My Storefront
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app py-8 animate-rise">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e7e5df] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#737069]">
            <Store className="size-4 text-[#0a0a0a]" />
            <span>Merchant Control Panel</span>
            <span>·</span>
            <span className="text-[#0a0a0a]">{user?.name || user?.phone}</span>
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#0a0a0a]">
            {selectedStore?.name || 'Vendor Hub'}
          </h1>
        </div>

        {/* Store selector & Open/Close toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {stores.length > 1 ? (
            <select
              aria-label="Select storefront"
              value={selectedStore?._id || ''}
              onChange={(e) => {
                const found = stores.find((s) => s._id === e.target.value)
                if (found) setSelectedStore(found)
              }}
              className="h-11 rounded-xl border border-[#e7e5df] bg-white px-3 text-sm font-semibold text-[#0a0a0a] outline-none"
            >
              {stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : null}

          {selectedStore ? (
            <button
              type="button"
              onClick={handleToggleOpen}
              className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-bold uppercase tracking-wider transition ${
                selectedStore.isOpen !== false
                  ? 'border-[#c8e6c9] bg-[#edf7ed] text-[#1e7041] hover:bg-[#e0f2e0]'
                  : 'border-[#ffcdd2] bg-[#fde8e8] text-[#b82828] hover:bg-[#fad4d4]'
              }`}
            >
              <Power className="size-4" />
              <span>{selectedStore.isOpen !== false ? 'Store Open' : 'Store Closed'}</span>
            </button>
          ) : null}

          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveTab('new-store')}
            className="text-xs font-semibold"
          >
            <Plus className="mr-1.5 size-4" /> New Store
          </Button>

          {selectedStore?._id ? (
            <Link
              to={`/shops/${selectedStore._id}`}
              target="_blank"
              className="flex h-11 items-center gap-1.5 rounded-xl border border-[#e7e5df] bg-white px-3.5 text-xs font-semibold text-[#0a0a0a] hover:border-[#0a0a0a]"
            >
              <span>Live View</span>
              <ExternalLink className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-[#e7e5df] pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'menu', label: 'Store Items', icon: Package },
          { id: 'settings', label: 'Store Details', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                isActive
                  ? 'bg-[#0a0a0a] text-white shadow-sm'
                  : 'border border-[#e7e5df] bg-white text-[#575550] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' ? (
        <div className="mt-8 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#e7e5df] bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
                Total Orders
              </span>
              <p className="mt-2 text-3xl font-black text-[#0a0a0a]">{orders.length}</p>
            </div>
            <div className="rounded-2xl border border-[#e7e5df] bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
                Pending Orders
              </span>
              <p className="mt-2 text-3xl font-black text-[#a37237]">
                {orders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status)).length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e7e5df] bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
                Delivered
              </span>
              <p className="mt-2 text-3xl font-black text-[#1e7041]">
                {orders.filter((o) => o.status === 'DELIVERED').length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e7e5df] bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
                Status
              </span>
              <p className="mt-2 text-xl font-black text-[#0a0a0a]">
                {selectedStore?.isOpen !== false ? '🟢 Receiving Orders' : '🔴 Closed'}
              </p>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e7e5df] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">Recent Customer Orders</h3>
                <p className="text-xs text-[#737069]">Orders received for this storefront</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>
                View All Orders →
              </Button>
            </div>

            <div className="mt-4 divide-y divide-[#e7e5df]">
              {orders.slice(0, 5).map((order) => {
                const total = order.totalAmount || order.pricing?.totalPaise || 0
                return (
                  <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0a0a0a]">
                          #{String(order._id).slice(-8)}
                        </span>
                        <Badge tone={STATUS_TONE[order.status] || 'neutral'}>
                          {String(order.status).replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[#737069]">
                        {order.items?.length || 0} items · {new Date(order.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-sm text-[#0a0a0a]">
                        {formatINRFromPaise(total)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                )
              })}

              {!orders.length ? (
                <div className="py-12 text-center text-sm text-[#737069]">
                  No orders placed yet. When customers buy from your store, they will appear here live.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' ? (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0a0a0a]">
              Customer Orders ({orders.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedStore?._id && loadStoreOrders(selectedStore._id)}
            >
              <RefreshCw className="mr-1.5 size-3.5" /> Refresh List
            </Button>
          </div>

          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = order._id
              const status = String(order.status).toUpperCase()
              const total = order.totalAmount || order.pricing?.totalPaise || 0

              return (
                <div
                  key={orderId}
                  className="rounded-2xl border border-[#e7e5df] bg-white p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e7e5df] pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-[#0a0a0a]">
                          Order #{String(orderId).slice(-8)}
                        </span>
                        <Badge tone={STATUS_TONE[status] || 'neutral'}>
                          {status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[#737069]">
                        Placed on {new Date(order.createdAt).toLocaleString('en-IN')} · Payment: {order.paymentMethod || 'COD'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-[#0a0a0a]">
                        {formatINRFromPaise(total)}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Address */}
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[#737069]">
                        Delivery Address
                      </span>
                      <p className="mt-1 text-[#575550]">
                        {order.deliveryAddress?.line1 || 'Customer Address'}
                        {order.deliveryAddress?.line2 ? `, ${order.deliveryAddress?.line2}` : ''}
                        <br />
                        {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[#737069]">
                        Order Items
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {(order.items || []).map((item, idx) => (
                          <p key={idx} className="text-[#0a0a0a]">
                            <strong>{item.quantity}x</strong> {item.name || item.menuItem?.name || 'Item'}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e7e5df] pt-4">
                    {status === 'PLACED' ? (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={statusUpdating === orderId}
                          onClick={() => handleUpdateOrderStatus(orderId, 'ACCEPTED')}
                          className="text-xs"
                        >
                          Accept Order
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={statusUpdating === orderId}
                          onClick={() => handleUpdateOrderStatus(orderId, 'CANCELLED')}
                          className="text-xs text-[#b82828] border-[#b82828] hover:bg-[#b82828] hover:text-white"
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}

                    {status === 'ACCEPTED' || status === 'CONFIRMED' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={statusUpdating === orderId}
                        onClick={() => handleUpdateOrderStatus(orderId, 'PREPARING')}
                        className="text-xs"
                      >
                        Start Packaging / Preparing
                      </Button>
                    ) : null}

                    {status === 'PREPARING' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={statusUpdating === orderId}
                        onClick={() => handleUpdateOrderStatus(orderId, 'READY_FOR_PICKUP')}
                        className="text-xs"
                      >
                        Mark Ready for Dispatch
                      </Button>
                    ) : null}

                    {status === 'READY_FOR_PICKUP' || status === 'READY' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={statusUpdating === orderId}
                        onClick={() => handleUpdateOrderStatus(orderId, 'OUT_FOR_DELIVERY')}
                        className="text-xs"
                      >
                        Mark Out for Delivery
                      </Button>
                    ) : null}

                    {status === 'OUT_FOR_DELIVERY' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={statusUpdating === orderId}
                        onClick={() => handleUpdateOrderStatus(orderId, 'DELIVERED')}
                        className="text-xs bg-[#1e7041] hover:bg-[#165a33]"
                      >
                        Mark Delivered
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            })}

            {!orders.length ? (
              <div className="rounded-2xl border border-dashed border-[#e7e5df] p-12 text-center">
                <ShoppingBag className="mx-auto size-8 text-[#737069]" />
                <p className="mt-3 text-base font-bold text-[#0a0a0a]">No orders yet</p>
                <p className="mt-1 text-xs text-[#737069]">
                  Live orders from buyers will appear here automatically.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* TAB 3: STORE MENU / ITEMS */}
      {activeTab === 'menu' ? (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0a0a0a]">Store Catalog & Menu Items</h2>
              <p className="text-xs text-[#737069]">Manage product listings and availability for this store</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowItemModal(true)}>
              <Plus className="mr-1.5 size-4" /> Add Item
            </Button>
          </div>

          <div className="space-y-6">
            {menuCategories.map((category) => {
              const catName = category.name || category.category || 'Specialties'
              const items = category.items || []

              return (
                <div
                  key={category._id || catName}
                  className="rounded-2xl border border-[#e7e5df] bg-white p-6 shadow-sm"
                >
                  <h3 className="text-base font-bold text-[#0a0a0a] border-b border-[#e7e5df] pb-3">
                    {catName} ({items.length})
                  </h3>

                  <div className="mt-4 divide-y divide-[#e7e5df]">
                    {items.map((item) => {
                      const itemId = item._id || item.id
                      const isAvailable = item.isAvailable !== false
                      const price = item.pricePaise ? item.pricePaise : (item.price || 0) * 100

                      return (
                        <div
                          key={itemId}
                          className="flex items-center justify-between py-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-[#0a0a0a]">{item.name}</p>
                              <Badge tone={isAvailable ? 'veg' : 'nonveg'}>
                                {isAvailable ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-[#737069]">
                              {formatINRFromPaise(price)} · {item.description || 'No description'}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleItemAvailability(itemId)}
                            className="text-xs"
                          >
                            {isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {!menuCategories.length ? (
              <div className="rounded-2xl border border-dashed border-[#e7e5df] p-12 text-center">
                <Package className="mx-auto size-8 text-[#737069]" />
                <p className="mt-3 text-base font-bold text-[#0a0a0a]">No products listed yet</p>
                <p className="mt-1 text-xs text-[#737069]">
                  Add items to your store so customers can browse and purchase them.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowItemModal(true)}
                >
                  <Plus className="mr-1.5 size-4" /> Add First Item
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* TAB 4: STORE SETTINGS */}
      {activeTab === 'settings' ? (
        <div className="mt-8 max-w-2xl space-y-6">
          <div className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-[#0a0a0a]">Store Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
                  Storefront Name
                </span>
                <p className="font-bold text-base text-[#0a0a0a]">{selectedStore?.name}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
                  Category / Vertical
                </span>
                <p className="text-[#575550]">{selectedStore?.vertical || 'General Commerce'}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
                  Address
                </span>
                <p className="text-[#575550]">
                  {selectedStore?.address?.line1}, {selectedStore?.address?.city}, {selectedStore?.address?.state} — {selectedStore?.address?.pincode}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
                  Operating Status
                </span>
                <p className="font-bold text-base text-[#0a0a0a]">
                  {selectedStore?.isOpen !== false ? '🟢 Open for Orders' : '🔴 Closed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB 5: CREATE NEW STORE */}
      {activeTab === 'new-store' ? (
        <div className="mt-8 max-w-2xl">
          <div className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-10 shadow-sm">
            <h2 className="text-2xl font-black text-[#0a0a0a]">Create New Storefront</h2>
            <p className="mt-1 text-xs text-[#737069]">
              Launch an additional boutique, kitchen, grocery shop, or retail branch under your vendor account.
            </p>

            <form onSubmit={handleCreateStore} className="mt-6 space-y-4">
              <Input
                label="Store Name"
                value={newStoreForm.name}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                placeholder="e.g. Apex Electronics, Modern Living, Royal Bakers"
                required
              />
              <Input
                label="Store Description"
                value={newStoreForm.description}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, description: e.target.value })}
                placeholder="Short bio or specialty of your shop"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#575550]">
                    Department Vertical
                  </label>
                  <select
                    value={newStoreForm.vertical}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, vertical: e.target.value })}
                    className="h-11 w-full rounded-xl border border-[#e7e5df] bg-white px-3 text-sm text-[#0a0a0a] outline-none"
                  >
                    <option value="commerce">Retail & Multi-Category</option>
                    <option value="food">Gourmet & Dining</option>
                    <option value="grocery">Groceries & Essentials</option>
                  </select>
                </div>
                <Input
                  label="Specialty / Tags"
                  value={newStoreForm.cuisineType}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, cuisineType: e.target.value })}
                  placeholder="e.g. Electronics, Fashion, Sweets"
                />
              </div>

              <Input
                label="Street Address / Market"
                value={newStoreForm.address.line1}
                onChange={(e) =>
                  setNewStoreForm({
                    ...newStoreForm,
                    address: { ...newStoreForm.address, line1: e.target.value },
                  })
                }
                placeholder="Shop number, market, road"
                required
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="City"
                  value={newStoreForm.address.city}
                  onChange={(e) =>
                    setNewStoreForm({
                      ...newStoreForm,
                      address: { ...newStoreForm.address, city: e.target.value },
                    })
                  }
                  required
                />
                <Input
                  label="State"
                  value={newStoreForm.address.state}
                  onChange={(e) =>
                    setNewStoreForm({
                      ...newStoreForm,
                      address: { ...newStoreForm.address, state: e.target.value },
                    })
                  }
                  required
                />
                <Input
                  label="Pincode"
                  value={newStoreForm.address.pincode}
                  onChange={(e) =>
                    setNewStoreForm({
                      ...newStoreForm,
                      address: { ...newStoreForm.address, pincode: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('overview')}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={savingStore}>
                  {savingStore ? 'Creating…' : 'Launch Storefront'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Add Item Modal */}
      {showItemModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-xl animate-rise">
            <h3 className="text-xl font-bold text-[#0a0a0a]">Add Item to Store</h3>
            <p className="mt-1 text-xs text-[#737069]">
              Add a new product or menu item to {selectedStore?.name}
            </p>

            <form onSubmit={handleAddItem} className="mt-5 space-y-4">
              <Input
                label="Product / Item Name"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="e.g. Wireless Headphone, Signature Pizza, Green Tea"
                required
              />
              <Input
                label="Category / Section Name"
                value={itemForm.categoryName}
                onChange={(e) => setItemForm({ ...itemForm, categoryName: e.target.value })}
                placeholder="e.g. Audio, Starters, Beverages"
                required
              />
              <Input
                label="Price (in Rupees)"
                type="number"
                value={itemForm.pricePaise / 100}
                onChange={(e) =>
                  setItemForm({ ...itemForm, pricePaise: Math.round(Number(e.target.value) * 100) })
                }
                required
              />
              <Input
                label="Short Description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Features, specifications, ingredients..."
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowItemModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={savingItem}>
                  {savingItem ? 'Saving…' : 'Publish Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

