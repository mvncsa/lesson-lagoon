'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import { Printer, Package, Truck, CheckCircle2, Download, Tag } from 'lucide-react';

export default function AdminPrintOrdersPage() {
  const { orders, showToast } = useApp();

  const printOrders = orders.filter((o) => !!o.deliveryDetails && o.status === 'PAID');
  const [activeTab, setActiveTab] = useState('all');

  const handleStatusUpdate = (orderNo: string, newStatus: string) => {
    showToast(`Print order ${orderNo} status updated to ${newStatus}. Customer notified.`);
  };

  const handleDownloadPrintPack = (orderNo: string) => {
    showToast(`Generating merged print-ready PDF pack for ${orderNo}...`, 'success');
  };

  const handleDownloadSticker = (orderNo: string) => {
    showToast(`Generating A6 thermal packing delivery sticker for ${orderNo}...`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Print Orders & Island Fulfilment
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Classroom print packs · Binding options · Courier & ferry boat dispatch tracking.
          </p>
        </div>

        <span className="badge b-blue text-xs font-bold py-1 px-3">
          {printOrders.length} Print Orders Active
        </span>
      </div>

      {printOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-line space-y-3">
          <Printer className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-lg text-ink">No Print Orders in Queue</h3>
          <p className="text-xs text-mut">When customers select &ldquo;Digital + Printed Copy&rdquo;, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {printOrders.map((o) => {
            const del = o.deliveryDetails;
            const printItem = o.items.find((i) => i.format === 'print');
            const printDetails = printItem?.printDetails;

            return (
              <div
                key={o.no}
                className="bg-white border border-line rounded-3xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-pri flex items-center justify-center font-bold text-lg">
                      🖨️
                    </div>
                    <div>
                      <b className="font-extrabold text-base text-ink block font-mono">{o.no}</b>
                      <span className="text-xs text-mut">
                        Recipient: {del?.recipient} ({del?.phone})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge b-blue text-xs font-bold">
                      {del?.zoneName}
                    </span>
                    <span className="badge b-wait text-xs font-bold">
                      {del?.status || 'PRINT_QUEUED'}
                    </span>
                  </div>
                </div>

                {/* Print Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                  <div className="md:col-span-6 bg-bg p-4 rounded-2xl border border-line space-y-2">
                    <span className="font-bold text-ink uppercase block">Printing Specs</span>
                    <div className="space-y-1">
                      <div>Resource: <b className="text-ink">{printItem?.title}</b></div>
                      <div>Quantity: <b className="text-ink">{printDetails?.qty || 1} copies</b></div>
                      <div>Color: <b className="capitalize text-ink">{printDetails?.colour}</b></div>
                      <div>Binding: <b className="capitalize text-ink">{printDetails?.binding}</b></div>
                      <div>Paper: <b className="capitalize text-ink">{printDetails?.paper}</b></div>
                    </div>
                  </div>

                  <div className="md:col-span-6 bg-bg p-4 rounded-2xl border border-line space-y-2">
                    <span className="font-bold text-ink uppercase block">Delivery Destination</span>
                    <div className="space-y-1">
                      <div>Island: <b className="text-ink">{del?.island}</b></div>
                      <div>Address: <b className="text-ink">{del?.address}</b></div>
                      <div>Phone: <b className="font-mono text-ink">{del?.phone}</b></div>
                      {del?.notes && <div className="text-amber-800">Note: {del?.notes}</div>}
                    </div>
                  </div>
                </div>

                {/* Fulfilment Buttons (P1-PRN-08) */}
                <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadPrintPack(o.no)}
                      className="btn xs ghost flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Print Pack PDF
                    </button>
                    <button
                      onClick={() => handleDownloadSticker(o.no)}
                      className="btn xs ghost flex items-center gap-1.5"
                    >
                      <Tag className="w-3.5 h-3.5" /> A6 Delivery Sticker
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(o.no, 'PRINTING')}
                      className="btn xs ghost"
                    >
                      Mark Printing
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(o.no, 'OUT_FOR_DELIVERY')}
                      className="btn xs ghost"
                    >
                      Mark Out for Delivery
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(o.no, 'DELIVERED')}
                      className="btn xs bg-ok hover:bg-emerald-700 text-white font-bold"
                    >
                      Mark Delivered ✓
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

