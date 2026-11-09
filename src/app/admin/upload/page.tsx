'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Product } from '@/lib/types';
import { UploadCloud, CheckCircle2, Sparkles, FileText, Check, AlertCircle } from 'lucide-react';

interface QueueItem {
  id: string;
  name: string;
  title: string;
  cat: string;
  grade: string;
  type: 'PDF' | 'DOCX' | 'PPTX';
  pages: number;
  price: number; // laari
  min: number;
  status: 'processing' | 'ready' | 'published';
  step: string;
}

export default function UploadPage() {
  const { categories, products, setProducts, showToast } = useApp();

  const [queue, setQueue] = useState<QueueItem[]>([
    {
      id: 'q1',
      name: 'Grade-5-Solar-System-Presentation.pptx',
      title: 'Our Solar System: Grade 5 Interactive Slides',
      cat: 'science',
      grade: 'Grade 5',
      type: 'PPTX',
      pages: 24,
      price: 8000,
      min: 1600,
      status: 'ready',
      step: '✓ Converted & watermarked',
    },
    {
      id: 'q2',
      name: 'grade-3-dhivehi-grammar-drills.pdf',
      title: 'Grade 3 Dhivehi Grammar Drills',
      cat: 'dhivehi',
      grade: 'Grade 3',
      type: 'PDF',
      pages: 18,
      price: 5500,
      min: 1100,
      status: 'ready',
      step: '✓ Watermarked WebP previews ready',
    },
  ]);

  // Apply to all bar state (P1-UPL-05)
  const [applySubject, setApplySubject] = useState('maths');
  const [applyGrade, setApplyGrade] = useState('Grade 4');
  const [applyPriceMvr, setApplyPriceMvr] = useState('50');

  const handleApplyToAll = () => {
    const priceLaari = (parseFloat(applyPriceMvr) || 50) * 100;
    const minLaari = Math.round(priceLaari * 0.2);
    setQueue((prev) =>
      prev.map((q) => ({
        ...q,
        cat: applySubject,
        grade: applyGrade,
        price: priceLaari,
        min: minLaari,
      }))
    );
    showToast('Applied settings to all queued uploads.');
  };

  const handlePublishAll = () => {
    const newProducts: Product[] = queue.map((q) => ({
      id: 'p_' + Math.random().toString(36).slice(2, 7),
      slug: q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
      title: q.title,
      short: `Comprehensive ${q.grade} ${q.cat} teaching resource with step-by-step activities.`,
      cat: q.cat,
      grade: q.grade,
      type: q.type,
      pages: q.pages,
      price: q.price,
      min: q.min,
      featured: false,
      rating: 5.0,
      rc: 0,
      color: '#0E8C7F',
      ic: '📄',
      status: 'Published',
      sales: 0,
      curr: 'National Curriculum',
      ver: 1,
      pv: 3,
      created: new Date().toISOString().slice(0, 10),
    }));

    setProducts((prev) => [...newProducts, ...prev]);
    setQueue([]);
    showToast(`🎉 ${newProducts.length} resources published directly to catalogue!`);
  };

  const handleSimulateDrop = () => {
    const newQ: QueueItem = {
      id: 'q_' + Math.random().toString(36).slice(2, 6),
      name: 'Grade-6-Fractions-Decimals-Worksheet.pdf',
      title: 'Grade 6 Fractions to Decimals Practice Workbook',
      cat: 'maths',
      grade: 'Grade 6',
      type: 'PDF',
      pages: 16,
      price: 6000,
      min: 1200,
      status: 'ready',
      step: '✓ Watermarked WebP previews ready',
    };
    setQueue((prev) => [newQ, ...prev]);
    showToast('File analyzed: Auto-detected Grade 6 Maths PDF');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Upload Teaching Resources
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Bulk drag-and-drop · Automatic title & grade detection · Watermark preview generation
          </p>
        </div>

        {queue.length > 0 && (
          <button onClick={handlePublishAll} className="btn sm acc shadow-md">
            Publish All Ready ({queue.length})
          </button>
        )}
      </div>

      {/* Drop Zone (P1-UPL-01) */}
      <div
        onClick={handleSimulateDrop}
        className="bg-white border-2 border-dashed border-[#B8C2D3] hover:border-pri hover:bg-teal-50/20 rounded-3xl p-10 text-center cursor-pointer transition shadow-xs space-y-2"
      >
        <UploadCloud className="w-12 h-12 text-pri mx-auto" />
        <h3 className="font-extrabold text-lg text-ink">
          Drop lesson files anywhere or tap to browse
        </h3>
        <p className="text-xs text-mut max-w-sm mx-auto">
          Supports PDF, Word (.docx), and PowerPoint (.pptx). Upload multiple files simultaneously.
        </p>
        <span className="badge b-grey text-[10px] mt-2">
          Pre-signed secure private storage
        </span>
      </div>

      {/* "Apply to All" Bar (P1-UPL-05) */}
      {queue.length > 0 && (
        <div className="bg-ink text-white rounded-2xl p-4 flex flex-wrap items-end gap-3 shadow-md text-xs">
          <span className="font-bold uppercase tracking-wider text-amber-300 block mb-1">
            Apply to All:
          </span>

          <div>
            <label className="text-[10px] text-slate-300 block mb-1">Subject</label>
            <select
              value={applySubject}
              onChange={(e) => setApplySubject(e.target.value)}
              className="inp text-xs py-1 text-ink w-32"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-300 block mb-1">Grade</label>
            <select
              value={applyGrade}
              onChange={(e) => setApplyGrade(e.target.value)}
              className="inp text-xs py-1 text-ink w-28"
            >
              {['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-300 block mb-1">Price (MVR)</label>
            <input
              type="number"
              value={applyPriceMvr}
              onChange={(e) => setApplyPriceMvr(e.target.value)}
              className="inp text-xs py-1 text-ink w-24"
            />
          </div>

          <button
            onClick={handleApplyToAll}
            className="btn xs bg-pri hover:bg-pri-hover text-white font-bold"
          >
            Apply to All Cards
          </button>
        </div>
      )}

      {/* Queue Cards (P1-UPL-04) */}
      <div className="space-y-4">
        {queue.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-line rounded-3xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start"
          >
            {/* Thumbnail Preview Mock */}
            <div className="w-full md:w-48 aspect-[4/3] bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-3 border border-line text-center flex-none">
              <span className="text-3xl mb-1">📄</span>
              <span className="text-xs font-bold text-ink">{item.type}</span>
              <span className="text-[10px] text-mut">{item.pages} pages</span>
              <span className="text-[10px] text-ok font-semibold mt-1">{item.step}</span>
            </div>

            {/* Editable Fields */}
            <div className="flex-1 space-y-3 w-full text-xs">
              <div>
                <label className="font-bold block mb-1 text-ink">Detected Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, title: val } : i)));
                  }}
                  className="inp text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold block mb-1">Subject</label>
                  <select
                    value={item.cat}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, cat: val } : i)));
                    }}
                    className="inp text-xs py-1.5"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Grade</label>
                  <select
                    value={item.grade}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, grade: val } : i)));
                    }}
                    className="inp text-xs py-1.5"
                  >
                    {['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Price (MVR)</label>
                  <input
                    type="number"
                    value={item.price / 100}
                    onChange={(e) => {
                      const laari = (parseFloat(e.target.value) || 0) * 100;
                      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, price: laari } : i)));
                    }}
                    className="inp text-xs py-1.5"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Min Floor (MVR)</label>
                  <input
                    type="number"
                    value={item.min / 100}
                    onChange={(e) => {
                      const laari = (parseFloat(e.target.value) || 0) * 100;
                      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, min: laari } : i)));
                    }}
                    className="inp text-xs py-1.5"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-mut truncate">File: {item.name}</span>
                <button
                  onClick={() => setQueue((q) => q.filter((i) => i.id !== item.id))}
                  className="btn xs ghost text-bad"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

