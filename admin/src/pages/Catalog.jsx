import { useEffect, useMemo, useState } from 'react'
import { Edit2, Layers, Plus, Search, Tag, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'
import { formatRupees, paiseToRupees, rupeesToPaise } from '../utils/formatters'

const EMPTY_PRODUCT = { name: '', categoryId: '', description: '', image: '', price: '', mrp: '', stock: 10, sku: '', unit: 'piece', tags: '', isActive: true }
const EMPTY_CATEGORY = { name: '', image: '', description: '', sortOrder: 0, isActive: true }

export const Catalog = () => {
  const { showToast } = useApp()
  const [tab, setTab] = useState('products')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(true)
  const [productModal, setProductModal] = useState(false)
  const [categoryModal, setCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY)
  const [saving, setSaving] = useState(false)

  async function loadCatalog() {
    setBusy(true)
    try {
      const [categoryList, productList] = await Promise.all([
        api.getCommerceCategories(true),
        api.getCommerceProducts(true),
      ])
      setCategories(categoryList)
      setProducts(productList)
    } catch (error) {
      showToast(`Could not load catalog: ${error.message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { loadCatalog() }, [])

  const filteredProducts = useMemo(() => products.filter((listing) => {
    const item = listing.itemId || {}
    const query = search.trim().toLowerCase()
    return !query || item.name?.toLowerCase().includes(query) || item.categoryId?.name?.toLowerCase().includes(query)
  }), [products, search])

  function openProduct(listing = null) {
    setEditingProduct(listing)
    if (!listing) setProductForm({ ...EMPTY_PRODUCT, categoryId: categories.find((category) => category.isActive !== false)?._id || '' })
    else {
      const item = listing.itemId || {}
      setProductForm({
        name: item.name || '',
        categoryId: item.categoryId?._id || item.categoryId || '',
        description: item.description || '',
        image: item.media?.find((media) => media.isPrimary)?.url || item.media?.[0]?.url || '',
        price: String(paiseToRupees(listing.pricePaise || 0)),
        mrp: String(paiseToRupees(listing.mrpPaise || 0)),
        stock: listing.stock?.available ?? 0,
        sku: item.attributes?.barcode || '',
        unit: item.attributes?.unit || 'piece',
        tags: (item.tags || []).join(', '),
        isActive: listing.isAvailable !== false && item.status === 'active',
      })
    }
    setProductModal(true)
  }

  async function saveProduct(event) {
    event.preventDefault()
    setSaving(true)
    const payload = {
      name: productForm.name.trim(),
      categoryId: productForm.categoryId,
      description: productForm.description.trim(),
      image: productForm.image.trim(),
      pricePaise: rupeesToPaise(productForm.price),
      mrpPaise: rupeesToPaise(productForm.mrp || productForm.price),
      stock: Number(productForm.stock) || 0,
      sku: productForm.sku.trim(),
      unit: productForm.unit.trim() || 'piece',
      tags: productForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      isActive: productForm.isActive,
    }
    try {
      if (editingProduct) await api.updateCommerceProduct(editingProduct._id, payload)
      else await api.createCommerceProduct(payload)
      showToast(editingProduct ? 'Product updated' : 'Product added')
      setProductModal(false)
      await loadCatalog()
    } catch (error) {
      showToast(`Could not save product: ${error.response?.data?.message || error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  function openCategory(category = null) {
    setEditingCategory(category)
    setCategoryForm(category ? {
      name: category.name || '', image: category.image || category.iconUrl || '',
      description: category.description || '', sortOrder: category.sortOrder || category.order || 0,
      isActive: category.isActive !== false,
    } : { ...EMPTY_CATEGORY, sortOrder: categories.length })
    setCategoryModal(true)
  }

  async function saveCategory(event) {
    event.preventDefault()
    setSaving(true)
    const payload = {
      name: categoryForm.name.trim(),
      image: categoryForm.image.trim(),
      iconUrl: categoryForm.image.trim(),
      description: categoryForm.description.trim(),
      sortOrder: Number(categoryForm.sortOrder) || 0,
      isActive: categoryForm.isActive,
      vertical: 'commerce',
    }
    try {
      if (editingCategory) await api.updateCommerceCategory(editingCategory._id, payload)
      else await api.createCommerceCategory(payload)
      showToast(editingCategory ? 'Category updated' : 'Category created')
      setCategoryModal(false)
      await loadCatalog()
    } catch (error) {
      showToast(`Could not save category: ${error.response?.data?.message || error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(listing) {
    const name = listing.itemId?.name || 'this product'
    if (!window.confirm(`Archive ${name} from the storefront?`)) return
    try {
      await api.deleteCommerceProduct(listing._id)
      showToast('Product archived')
      await loadCatalog()
    } catch (error) {
      showToast(`Could not archive product: ${error.message}`, 'error')
    }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete the ${category.name} category?`)) return
    try {
      await api.deleteCommerceCategory(category._id)
      showToast('Category deleted')
      await loadCatalog()
    } catch (error) {
      showToast(`Could not delete category: ${error.message}`, 'error')
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500'
  const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-300'

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Storefront controls</p><h1 className="mt-1 text-3xl font-extrabold text-white">Products & categories</h1><p className="mt-1 text-sm text-slate-400">Changes here appear in the customer marketplace.</p></div><div className="flex gap-2"><button onClick={() => openCategory()} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"><Tag size={15} /> Add category</button><button onClick={() => openProduct()} disabled={!categories.some((category) => category.isActive !== false)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-50"><Plus size={16} /> Add product</button></div></div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-2"><div className="flex gap-1"><button onClick={() => setTab('products')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === 'products' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>Products ({products.length})</button><button onClick={() => setTab('categories')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === 'categories' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>Categories ({categories.length})</button></div>{tab === 'products' ? <div className="relative w-full sm:w-72"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or categories" className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-indigo-500" /></div> : null}</div>

      {tab === 'products' ? <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Manage</th></tr></thead><tbody className="divide-y divide-slate-800">{busy ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Loading catalog…</td></tr> : filteredProducts.length ? filteredProducts.map((listing) => { const item = listing.itemId || {}; return <tr key={listing._id} className="hover:bg-slate-800/40"><td className="px-5 py-4"><div className="flex items-center gap-3">{item.media?.[0]?.url ? <img src={item.media[0].url} alt="" className="size-11 rounded-lg object-cover" /> : <div className="grid size-11 place-items-center rounded-lg bg-slate-800"><Layers size={17} /></div>}<div><p className="font-bold text-white">{item.name}</p><p className="mt-0.5 text-xs text-slate-500">{item.attributes?.barcode || item.slug}</p></div></div></td><td className="px-5 py-4 text-slate-300">{item.categoryId?.name || 'Uncategorized'}</td><td className="px-5 py-4 font-bold text-emerald-400">{formatRupees(paiseToRupees(listing.pricePaise))}</td><td className="px-5 py-4 text-slate-300">{listing.stock?.available ?? '—'}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${listing.isAvailable && item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{listing.isAvailable && item.status === 'active' ? 'Live' : item.status === 'archived' ? 'Archived' : 'Hidden'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={() => openProduct(listing)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" title="Edit"><Edit2 size={15} /></button><button onClick={() => deleteProduct(listing)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400" title="Archive"><Trash2 size={15} /></button></div></td></tr>}) : <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No products yet. Add your first marketplace product.</td></tr>}</tbody></table></div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{busy ? <p className="text-slate-400">Loading categories…</p> : categories.length ? categories.map((category) => <article key={category._id} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">{category.image || category.iconUrl ? <img src={category.image || category.iconUrl} alt="" className="size-12 rounded-xl object-cover" /> : <div className="grid size-12 place-items-center rounded-xl bg-indigo-500/10 text-indigo-300"><Tag size={18} /></div>}<div className="min-w-0 flex-1"><p className="truncate font-bold text-white">{category.name}</p><p className="mt-0.5 text-xs text-slate-500">{category.slug} · {category.isActive === false ? 'Hidden' : 'Visible'}</p></div><button onClick={() => openCategory(category)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" title="Edit"><Edit2 size={15} /></button><button onClick={() => deleteCategory(category)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400" title="Delete"><Trash2 size={15} /></button></article>) : <p className="text-sm text-slate-400">Create categories such as Electronics, Accessories, and Watches.</p>}</div>}

      {productModal ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 p-4"><form onSubmit={saveProduct} className="my-6 max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">{editingProduct ? 'Edit product' : 'Add marketplace product'}</h2><p className="text-xs text-slate-400">Prices are entered in rupees; storefront amounts use backend paise.</p></div><button type="button" onClick={() => setProductModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button></div><div className="grid gap-3 sm:grid-cols-2"><label><span className={labelClass}>Product name *</span><input required value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} className={inputClass} /></label><label><span className={labelClass}>Category *</span><select required value={productForm.categoryId} onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })} className={inputClass}><option value="">Choose category</option>{categories.filter((category) => category.isActive !== false).map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label><label><span className={labelClass}>Price (₹) *</span><input required min="0" step="0.01" type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} className={inputClass} /></label><label><span className={labelClass}>MRP (₹)</span><input min="0" step="0.01" type="number" value={productForm.mrp} onChange={(event) => setProductForm({ ...productForm, mrp: event.target.value })} className={inputClass} /></label><label><span className={labelClass}>Stock quantity</span><input min="0" type="number" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} className={inputClass} /></label><label><span className={labelClass}>SKU / model number</span><input value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} className={inputClass} /></label><label><span className={labelClass}>Unit</span><input value={productForm.unit} onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })} className={inputClass} /></label><label><span className={labelClass}>GST (%)</span><input min="0" max="100" type="number" value={productForm.gstPercent || 18} onChange={(event) => setProductForm({ ...productForm, gstPercent: event.target.value })} className={inputClass} /></label><label className="sm:col-span-2"><span className={labelClass}>Image URL</span><input value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} className={inputClass} placeholder="https://…" /></label><label className="sm:col-span-2"><span className={labelClass}>Description</span><textarea rows={3} value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} className={inputClass} /></label><label className="sm:col-span-2"><span className={labelClass}>Search tags (comma separated)</span><input value={productForm.tags} onChange={(event) => setProductForm({ ...productForm, tags: event.target.value })} className={inputClass} placeholder="wireless, bluetooth, black" /></label><label className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={productForm.isActive} onChange={(event) => setProductForm({ ...productForm, isActive: event.target.checked })} /> Visible in the storefront</label></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setProductModal(false)} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300">Cancel</button><button disabled={saving} className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save product'}</button></div></form></div> : null}

      {categoryModal ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"><form onSubmit={saveCategory} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center justify-between"><h2 className="font-bold text-white">{editingCategory ? 'Edit category' : 'Add category'}</h2><button type="button" onClick={() => setCategoryModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button></div><label className="block"><span className={labelClass}>Name *</span><input required value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className={inputClass} placeholder="Electronics, Accessories, Watches" /></label><label className="block"><span className={labelClass}>Image URL</span><input value={categoryForm.image} onChange={(event) => setCategoryForm({ ...categoryForm, image: event.target.value })} className={inputClass} /></label><label className="block"><span className={labelClass}>Description</span><textarea rows={2} value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} className={inputClass} /></label><label className="block"><span className={labelClass}>Display order</span><input type="number" value={categoryForm.sortOrder} onChange={(event) => setCategoryForm({ ...categoryForm, sortOrder: event.target.value })} className={inputClass} /></label><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={categoryForm.isActive} onChange={(event) => setCategoryForm({ ...categoryForm, isActive: event.target.checked })} /> Visible in the storefront</label><div className="flex justify-end gap-2"><button type="button" onClick={() => setCategoryModal(false)} className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Cancel</button><button disabled={saving} className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save category'}</button></div></form></div> : null}
    </div>
  )
}
