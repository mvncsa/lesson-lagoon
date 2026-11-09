'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FolderTree, Plus, Trash2 } from 'lucide-react';

export default function AdminCataloguePage() {
  const { categories, products, showToast } = useApp();

  const [subjects, setSubjects] = useState(categories);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('📚');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;
    const id = newSubName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSubjects([...subjects, { id, name: newSubName, ic: newSubIcon }]);
    setNewSubName('');
    showToast(`Added subject "${newSubName}".`);
  };

  const handleDeleteSubject = (id: string) => {
    const isUsed = products.some((p) => p.cat === id);
    if (isUsed) {
      alert('Cannot delete this subject while existing resources are categorized under it.');
      return;
    }
    setSubjects(subjects.filter((s) => s.id !== id));
    showToast('Subject removed.');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Subjects & Grade Taxonomies
        </h1>
        <p className="text-xs text-mut mt-0.5">
          Manage Maldives National Curriculum & Cambridge subjects, grades, and icons.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs space-y-4 text-xs">
        <h3 className="font-extrabold text-base text-ink">Subjects List</h3>

        {/* Add Subject */}
        <form onSubmit={handleAddSubject} className="flex gap-2">
          <input
            type="text"
            placeholder="Icon (e.g. 🎨)"
            value={newSubIcon}
            onChange={(e) => setNewSubIcon(e.target.value)}
            className="inp text-xs w-20 text-center"
          />
          <input
            type="text"
            required
            placeholder="Subject Name (e.g. Art & Design)"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            className="inp text-xs flex-1"
          />
          <button type="submit" className="btn sm">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </form>

        <table className="t text-xs">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Subject Name</th>
              <th>Resource Count</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => {
              const count = products.filter((p) => p.cat === s.id).length;
              return (
                <tr key={s.id}>
                  <td className="text-xl w-12">{s.ic}</td>
                  <td className="font-bold text-ink">{s.name}</td>
                  <td>{count} resources</td>
                  <td className="text-right">
                    <button
                      onClick={() => handleDeleteSubject(s.id)}
                      className="btn xs ghost text-bad"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

