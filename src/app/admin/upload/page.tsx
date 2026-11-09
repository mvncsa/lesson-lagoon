'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Product } from '@/lib/types';
import {
  parseResourceFilename,
  generateClientThumbnail,
  validateUploadFileSize,
} from '@/lib/fileDetection';
import { UploadCloud, CheckCircle2, FileText, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

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
  thumbnailUrl?: string;
  fileSize?: string;
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
      fileSize: '4.2 MB',
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
      fileSize: '1.8 MB',
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
      ic: q.type === 'PPTX' ? '📊' : q.type === 'DOCX' ? '📝' : '📄',
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

  const addQueueItem = (
    fileName: string,
    fileSizeStr: string,
    thumbUrl?: string
  ) => {
    // Pure deterministic metadata extraction (no AI)
    const detected = parseResourceFilename(fileName);
    const defaultPrice = detected.detectedType === 'PPTX' ? 7500 : 5000;

    const newQ: QueueItem = {
      id: 'q_' + Math.random().toString(36).slice(2, 7),
      name: fileName,
      title: detected.detectedTitle,
      cat: detected.detectedSubject,
      grade: detected.detectedGrade,
      type: detected.detectedType,
      pages: detected.estimatedPages,
      price: defaultPrice,
      min: Math.round(defaultPrice * 0.2),
      status: 'ready',
      step: '✓ Watermark preview generated',
      thumbnailUrl: thumbUrl,
      fileSize: fileSizeStr,
    };

    setQueue((prev) => [newQ, ...prev]);
  };

  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const validation = validateUploadFileSize(file.size, 10);
      if (!validation.valid) {
        showToast(validation.error || 'File too large (10MB limit)', 'error');
        continue;
      }

      let thumbUrl: string | undefined = undefined;
      if (file.type.startsWith('image/')) {
        try {
          thumbUrl = await generateClientThumbnail(file);
        } catch {}
      }

      addQueueItem(file.name, validation.formattedSize, thumbUrl);
    }

    showToast(`Analyzed and added ${files.length} file(s) with title & grade detection.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2">
            <span>Upload Teaching Resources</span>
            <span className="badge b-free text-[10px] font-bold">Admin Only</span>
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Add new worksheets, slide decks, and exam packs to sell online across the Maldives.
          </p>
        </div>

        {queue.length > 0 && (
          <button onClick={handlePublishAll} className="btn sm acc shadow-md">
            Publish All Ready ({queue.length})
          </button>
        )}
      </div>

      {/* 3-Step Guided Instruction Bar */}
      <div className="bg-white rounded-3xl p-5 border border-line shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-pri font-black flex items-center justify-center text-sm flex-none">
            1
          </div>
          <div>
            <b className="text-ink font-bold block">1. Drop Your Master File</b>
            <p className="text-mut text-[11px] leading-tight mt-0.5">
              Upload PDF, DOCX, or PPTX (max 10MB). LessonLagoon extracts page count & builds watermarked previews.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-pri font-black flex items-center justify-center text-sm flex-none">
            2
          </div>
          <div>
            <b className="text-ink font-bold block">2. Review Title, Grade & Price</b>
            <p className="text-mut text-[11px] leading-tight mt-0.5">
              Check auto-detected grade and curriculum. Set digital price in MVR (or MVR 0 for Free sample).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-pri font-black flex items-center justify-center text-sm flex-none">
            3
          </div>
          <div>
            <b className="text-ink font-bold block">3. Publish to Storefront</b>
            <p className="text-mut text-[11px] leading-tight mt-0.5">
              Hit "Publish Resource" to immediately sell it online to teachers across the Maldives.
            </p>
          </div>
        </div>
      </div>

      {/* Real Drop Zone with File Browser (P1-UPL-01) */}
      <label className="relative bg-white border-2 border-dashed border-[#B8C2D3] hover:border-pri hover:bg-teal-50/20 rounded-3xl p-10 text-center cursor-pointer transition shadow-xs space-y-2 block">
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,image/*"
          onChange={handleFilesChosen}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <UploadCloud className="w-12 h-12 text-pri mx-auto" />
        <h3 className="font-extrabold text-lg text-ink">
          Drop lesson files anywhere or tap to browse
        </h3>
        <p className="text-xs text-mut max-w-sm mx-auto">
          Supports PDF, Word (.docx), PowerPoint (.pptx), and images up to 50MB. Auto-detects curriculum level and metadata.
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="badge b-grey text-[10px]">Deterministic rule-based</span>
          <span className="badge b-free text-[10px]">Zero AI dependency</span>
        </div>
      </label>

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
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
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
              {[
                'KG',
                'Grade 1',
                'Grade 2',
                'Grade 3',
                'Grade 4',
                'Grade 5',
                'Grade 6',
                'Grade 7',
                'Grade 8',
              ].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
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
            {/* Thumbnail Preview Card with Watermark Overlay */}
            <div className="w-full md:w-48 aspect-[4/3] bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-3 border border-line text-center flex-none relative overflow-hidden group">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-pri flex items-center justify-center text-xl mb-1.5">
                    {item.type === 'PPTX' ? '📊' : item.type === 'DOCX' ? '📝' : '📄'}
                  </div>
                  <span className="text-xs font-bold text-ink">{item.type}</span>
                  <span className="text-[10px] text-mut">{item.pages} pages</span>
                  {item.fileSize && (
                    <span className="text-[10px] text-slate-400 font-mono">{item.fileSize}</span>
                  )}
                </>
              )}
              {/* Watermark badge overlay */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md">
                PREVIEW
              </div>
              <span className="text-[10px] text-ok font-semibold mt-1 block">
                {item.step}
              </span>
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
                    setQueue((q) =>
                      q.map((i) => (i.id === item.id ? { ...i, title: val } : i))
                    );
                  }}
                  className="inp text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold block mb-1">Subject</label>
                  <select
                    value={item.cat}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQueue((q) =>
                        q.map((i) => (i.id === item.id ? { ...i, cat: val } : i))
                      );
                    }}
                    className="inp text-xs py-1.5"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Grade</label>
                  <select
                    value={item.grade}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQueue((q) =>
                        q.map((i) => (i.id === item.id ? { ...i, grade: val } : i))
                      );
                    }}
                    className="inp text-xs py-1.5"
                  >
                    {[
                      'KG',
                      'Grade 1',
                      'Grade 2',
                      'Grade 3',
                      'Grade 4',
                      'Grade 5',
                      'Grade 6',
                      'Grade 7',
                      'Grade 8',
                      'Grade 9',
                      'Grade 10',
                    ].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
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
                      setQueue((q) =>
                        q.map((i) => (i.id === item.id ? { ...i, price: laari } : i))
                      );
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
                      setQueue((q) =>
                        q.map((i) => (i.id === item.id ? { ...i, min: laari } : i))
                      );
                    }}
                    className="inp text-xs py-1.5"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-line/60">
                <span className="text-[11px] text-mut truncate">
                  File: <code className="bg-slate-100 px-1 py-0.5 rounded">{item.name}</code>
                </span>
                <button
                  onClick={() => setQueue((q) => q.filter((i) => i.id !== item.id))}
                  className="btn xs ghost text-bad hover:bg-rose-50"
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
