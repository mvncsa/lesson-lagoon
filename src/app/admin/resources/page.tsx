'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Product } from '@/lib/types';
import { formatMVR } from '@/lib/pricing';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Star,
  Printer,
  Eye,
} from 'lucide-react';

export default function ResourcesAdminPage() {
  const { products, setProducts, categories, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editing state for inline price or modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.slug.includes(q) || p.grade.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: 'publish' | 'archive' | 'feature') => {
    setProducts((prev) =>
      prev.map((p) => {
        if (!selectedIds.includes(p.id)) return p;
        if (action === 'publish') return { ...p, status: 'Published' };
        if (action === 'archive') return { ...p, status: 'Archived' };
        if (action === 'feature') return { ...p, featured: !p.featured };
        return p;
      })
    );
    setSelectedIds([]);
    showToast(`Bulk action applied to ${selectedIds.length} resources.`);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );
    setEditingProduct(null);
    showToast('Resource updated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Resources Catalogue
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Manage worksheets, slide presentations, pricing floors, and versions.
          </p>
        </div>

        <Link href="/admin/upload" className="btn sm acc">
          <Plus className="w-4 h-4" /> Upload Resources
        </Link>
      </div>

      {/* Filter and Bulk Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-line">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-mut" />
            <input
              type="text"
              placeholder="Search title, grade, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="inp text-xs pl-9 py-1.5"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="inp text-xs py-1.5 w-32"
          >
            <option value="all">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Bulk Action Buttons (P1-CAT-05) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-ink mr-1">{selectedIds.length} selected:</span>
            <button
              onClick={() => handleBulkAction('publish')}
              className="btn xs ghost"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('feature')}
              className="btn xs ghost"
            >
              Toggle Feature
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="btn xs ghost text-bad"
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs">
        <table className="t text-xs">
          <thead>
            <tr>
              <th className="w-8">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                />
              </th>
              <th>Resource</th>
              <th>Subject</th>
              <th>Grade</th>
              <th>Price</th>
              <th>Min Price</th>
              <th>Print</th>
              <th>Status</th>
              <th>Sales</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                </td>

                <td className="font-bold text-ink max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl flex-none">{p.ic}</span>
                    <div className="truncate">
                      <Link href={`/r/${p.slug}`} className="hover:text-pri truncate block">
                        {p.title}
                      </Link>
                      <span className="text-[10px] text-mut font-normal">
                        {p.pages} {p.type === 'PPTX' ? 'slides' : 'pages'} · v{p.ver}.0
                      </span>
                    </div>
                  </div>
                </td>

                <td className="capitalize text-slate-600">{p.cat}</td>
                <td>{p.grade}</td>

                {/* Inline Price Display */}
                <td className="font-bold text-ink">
                  {p.price === 0 ? <span className="text-ok">FREE</span> : formatMVR(p.price)}
                </td>

                <td className="text-mut font-medium">
                  {p.price === 0 ? '—' : formatMVR(p.min || 0)}
                </td>

                <td>
                  {p.printOptions?.enabled ? (
                    <span className="badge b-blue text-[10px]">Print</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                <td>
                  <span
                    className={`badge ${
                      p.status === 'Published'
                        ? 'b-free'
                        : p.status === 'Draft'
                        ? 'b-wait'
                        : 'b-grey'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="font-semibold text-slate-700">{p.sales}</td>

                <td className="text-right">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="btn xs ghost"
                    title="Edit resource"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal (P1-CAT-01) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-line shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-xl text-ink">Edit Resource</h3>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="inp text-xs"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.short}
                  onChange={(e) => setEditingProduct({ ...editingProduct, short: e.target.value })}
                  className="inp text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Price (Laari)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value, 10) || 0 })}
                    className="inp text-xs"
                  />
                  <span className="text-[10px] text-mut">{formatMVR(editingProduct.price)}</span>
                </div>

                <div>
                  <label className="font-bold block mb-1">Minimum Price Floor (Laari)</label>
                  <input
                    type="number"
                    value={editingProduct.min || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, min: parseInt(e.target.value, 10) || 0 })}
                    className="inp text-xs"
                  />
                  <span className="text-[10px] text-mut">{formatMVR(editingProduct.min || 0)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="inp text-xs"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Print Available</label>
                  <select
                    value={editingProduct.printOptions?.enabled ? 'yes' : 'no'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        printOptions: {
                          ...(editingProduct.printOptions || {
                            enabled: false,
                            pricingMode: 'auto',
                            allowColour: true,
                            allowBw: true,
                            bindings: ['stapled'],
                            papers: ['standard'],
                            maxQty: 30,
                            productionDays: 2,
                          }),
                          enabled: e.target.value === 'yes',
                        },
                      })
                    }
                    className="inp text-xs"
                  >
                    <option value="yes">Yes - Printing Allowed</option>
                    <option value="no">No - Digital Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn sm ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

