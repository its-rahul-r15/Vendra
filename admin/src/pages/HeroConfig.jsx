import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Power,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Palette,
  Check,
  Star,
  Layers,
  Image as ImageIcon,
  Sliders,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

const RADIAL_PRESETS = [
  {
    name: 'Velvet Carmine',
    value: 'radial-gradient(ellipse at center, #ba2249 0%, #990f30 50%, #6e0820 100%)',
    badge: 'bg-[#ba2249]',
  },
  {
    name: 'Imperial Emerald',
    value: 'radial-gradient(ellipse at center, #1b4938 0%, #113627 50%, #0a2118 100%)',
    badge: 'bg-[#1b4938]',
  },
  {
    name: 'Velvet Amber',
    value: 'radial-gradient(ellipse at center, #6b213b 0%, #441124 50%, #200510 100%)',
    badge: 'bg-[#6b213b]',
  },
  {
    name: 'Midnight Sapphire',
    value: 'radial-gradient(ellipse at center, #1e3a8a 0%, #172554 50%, #0b132b 100%)',
    badge: 'bg-[#1e3a8a]',
  },
  {
    name: 'Obsidian Amethyst',
    value: 'radial-gradient(ellipse at center, #581c87 0%, #3b0764 50%, #1e0533 100%)',
    badge: 'bg-[#581c87]',
  },
  {
    name: 'Golden Topaz',
    value: 'radial-gradient(ellipse at center, #b45309 0%, #78350f 50%, #451a03 100%)',
    badge: 'bg-[#b45309]',
  },
];

const IMAGE_PRESETS = [
  { label: 'Wireless Headphones', path: '/hero/headphones-wireless.png' },
  { label: 'Luxe Sneakers', path: '/hero/luxe-sneaker.png' },
  { label: 'Luxe Fragrance', path: '/hero/luxe-perfume.png' },
];

export const HeroConfig = () => {
  const { showToast } = useApp();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    key: '',
    name: '',
    description: '',
    themeName: 'Velvet Carmine',
    radialGlow: RADIAL_PRESETS[0].value,
    heroPng: IMAGE_PRESETS[0].path,
    optionsStr: '30mm, 40mm, 50mm',
    nameKeywordsStr: 'headphone, audio, earbud',
    tagsStr: 'headphones, electronics',
    categorySlug: 'electronics',
    sortOrder: 1,
    isActive: true,
    isDefault: false,
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const items = await api.getHeroConfigs();
      setConfigs(Array.isArray(items) ? items : []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load hero configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      sortOrder: configs.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      key: item.key || '',
      name: item.name || '',
      description: item.description || '',
      themeName: item.themeName || '',
      radialGlow: item.radialGlow || RADIAL_PRESETS[0].value,
      heroPng: item.heroPng || '',
      optionsStr: (item.options || []).join(', '),
      nameKeywordsStr: (item.matchRules?.nameKeywords || []).join(', '),
      tagsStr: (item.matchRules?.tags || []).join(', '),
      categorySlug: item.matchRules?.categorySlug || '',
      sortOrder: item.sortOrder ?? 1,
      isActive: item.isActive ?? true,
      isDefault: item.isDefault ?? false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      key: formData.key.trim().toLowerCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      themeName: formData.themeName.trim(),
      radialGlow: formData.radialGlow.trim(),
      heroPng: formData.heroPng.trim(),
      options: formData.optionsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      matchRules: {
        nameKeywords: formData.nameKeywordsStr
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        tags: formData.tagsStr
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        categorySlug: formData.categorySlug.trim().toLowerCase(),
      },
      sortOrder: Number(formData.sortOrder) || 1,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
    };

    try {
      if (editingId) {
        await api.updateHeroConfig(editingId, payload);
        showToast('Hero theme updated successfully', 'success');
      } else {
        await api.createHeroConfig(payload);
        showToast('Hero theme created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchConfigs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save hero configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await api.updateHeroConfig(item._id, { isActive: !item.isActive });
      setConfigs((prev) =>
        prev.map((c) => (c._id === item._id ? { ...c, isActive: !c.isActive } : c))
      );
      showToast(`Theme ${!item.isActive ? 'activated' : 'deactivated'}`, 'success');
    } catch (err) {
      showToast('Could not update status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete hero theme "${name}"?`)) return;
    try {
      await api.deleteHeroConfig(id);
      showToast('Hero theme deleted', 'success');
      setConfigs((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      showToast('Failed to delete hero theme', 'error');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= configs.length) return;

    const newConfigs = [...configs];
    const temp = newConfigs[index];
    newConfigs[index] = newConfigs[targetIndex];
    newConfigs[targetIndex] = temp;

    const reordered = newConfigs.map((item, idx) => ({
      id: item._id,
      sortOrder: idx + 1,
    }));

    setConfigs(newConfigs);

    try {
      await api.reorderHeroConfigs(reordered);
      showToast('Theme order updated', 'success');
    } catch {
      fetchConfigs();
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Seed initial default themes (Headphones, Footwear, Fragrance)?')) return;
    setLoading(true);
    try {
      const res = await api.seedDefaultHeroConfigs();
      showToast(`Default themes seeded (${res?.seededCount || 0} added)`, 'success');
      fetchConfigs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to seed default themes', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Website Hero Showcase</h1>
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-indigo-500/30">
              Web Storefront
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure dynamic central radial glow stages, luxury transparent PNGs, options pills, and product match rules on the website home page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDefaults}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Seed default 3 luxury hero themes"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Seed Defaults</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Hero Theme</span>
          </button>
        </div>
      </div>

      {/* Grid of Hero Configurations */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <RefreshCw className="animate-spin text-indigo-500" size={28} />
          <p className="text-xs">Loading hero showcase themes...</p>
        </div>
      ) : configs.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/40 space-y-4">
          <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Hero Showcase Themes Configured</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your website is currently falling back to standard hardcoded slides. Click "Seed Defaults" to automatically populate the 3 curated luxury themes or create your own custom theme.
            </p>
          </div>
          <button
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            <Sparkles size={14} />
            <span>Seed Default Showcase Themes</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((item, idx) => (
            <div
              key={item._id}
              className={`rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden bg-slate-900/80 backdrop-blur-sm ${
                item.isActive ? 'border-slate-800 shadow-xl hover:border-slate-700' : 'border-slate-800/40 opacity-60'
              }`}
            >
              {/* Radial Glow Preview Area */}
              <div
                style={{ background: item.radialGlow }}
                className="relative h-44 w-full flex items-center justify-center p-4 overflow-hidden"
              >
                {/* PNG image */}
                {item.heroPng ? (
                  <img
                    src={item.heroPng}
                    alt={item.name}
                    className="max-h-32 max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] transition transform hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="text-white/40 size-12" />
                )}

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    #{idx + 1}
                  </span>
                  {item.isDefault && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star size={10} className="fill-current" />
                      Default
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    disabled={idx === configs.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>

                {/* Bottom Theme Label */}
                <div className="absolute bottom-2.5 left-3 text-[11px] font-extrabold text-white tracking-wide bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md">
                  {item.themeName || 'Luxury Theme'}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm tracking-tight">{item.name}</h3>
                      <p className="text-[11px] font-mono text-indigo-400">key: {item.key}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  )}

                  {/* Options Pills */}
                  {item.options && item.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.options.map((opt) => (
                        <span
                          key={opt}
                          className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700/60"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Match Criteria */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="font-medium text-slate-500">Keywords:</span>
                      <span className="text-slate-300 truncate">
                        {(item.matchRules?.nameKeywords || []).join(', ') || 'Any'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="font-medium text-slate-500">Category:</span>
                      <span className="text-indigo-400 font-mono">
                        {item.matchRules?.categorySlug || 'All Categories'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                      item.isActive
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Power size={13} />
                    <span>{item.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit theme"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete theme"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-400 size-5" />
                <h2 className="text-base font-bold text-white">
                  {editingId ? 'Edit Hero Theme' : 'Create New Hero Theme'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Key & Display Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Theme Key <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g. electronics, footwear, fragrance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Unique slug identifier</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Luxury Headphones"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Wireless noise-cancelling luxury audio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Row 2: Theme Title & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Theme Label / Shade Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.themeName}
                    onChange={(e) => setFormData({ ...formData, themeName: e.target.value })}
                    placeholder="e.g. Velvet Carmine"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Interactive Option Pills (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.optionsStr}
                    onChange={(e) => setFormData({ ...formData, optionsStr: e.target.value })}
                    placeholder="e.g. 30mm, 40mm, 50mm OR UK 8, UK 9"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Radial Glow Configuration */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Radial Gradient Glow (CSS) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.radialGlow}
                  onChange={(e) => setFormData({ ...formData, radialGlow: e.target.value })}
                  placeholder="radial-gradient(ellipse at center, ...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
                {/* Presets */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[11px] text-slate-500 self-center">Presets:</span>
                  {RADIAL_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      onClick={() => setFormData({ ...formData, radialGlow: p.value, themeName: p.name })}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 transition"
                    >
                      <span className={`size-2.5 rounded-full ${p.badge}`} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Transparent PNG Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hero Image URL / Path (Transparent PNG) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.heroPng}
                  onChange={(e) => setFormData({ ...formData, heroPng: e.target.value })}
                  placeholder="e.g. /hero/headphones-wireless.png or https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                {/* Image Presets */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[11px] text-slate-500 self-center">Assets:</span>
                  {IMAGE_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => setFormData({ ...formData, heroPng: p.path })}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Match Rules */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-indigo-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Automated Product Matching Rules
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  When users open the homepage, the backend product catalog is dynamically searched to find an active item that matches these keywords, tags, or category.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Name Keywords</label>
                    <input
                      type="text"
                      value={formData.nameKeywordsStr}
                      onChange={(e) => setFormData({ ...formData, nameKeywordsStr: e.target.value })}
                      placeholder="e.g. headphone, audio"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tags</label>
                    <input
                      type="text"
                      value={formData.tagsStr}
                      onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
                      placeholder="e.g. electronics, audio"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category Slug</label>
                    <input
                      type="text"
                      value={formData.categorySlug}
                      onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                      placeholder="e.g. electronics, shoes"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="size-4 rounded accent-indigo-600 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="isActive" className="text-xs font-medium text-slate-300 cursor-pointer">
                    Active & Published
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="size-4 rounded accent-amber-500 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="isDefault" className="text-xs font-medium text-slate-300 cursor-pointer">
                    Default Fallback Theme
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Theme' : 'Create Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HeroConfig;
