'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatMVR } from '@/lib/pricing';
import { DeliveryDetails } from '@/lib/types';
import { Printer, Package, Truck, CheckCircle2, Download, Tag, X } from 'lucide-react';

export default function AdminPrintOrdersPage() {
  const { orders, updatePrintStatus, showToast } = useApp();

  const printOrders = orders.filter((o) => !!o.deliveryDetails && o.status === 'PAID');
  const [activeTab, setActiveTab] = useState<'all' | 'queued' | 'printing' | 'out' | 'delivered'>('all');
  const [activeStickerOrder, setActiveStickerOrder] = useState<(typeof printOrders)[0] | null>(null);

  const filteredOrders = printOrders.filter((o) => {
    const status = o.deliveryDetails?.status || 'PRINT_QUEUED';
    if (activeTab === 'queued') return status === 'PRINT_QUEUED';
    if (activeTab === 'printing') return status === 'PRINTING';
    if (activeTab === 'out') return status === 'OUT_FOR_DELIVERY';
    if (activeTab === 'delivered') return status === 'DELIVERED';
    return true;
  });

  const handleStatusUpdate = (orderNo: string, newStatus: NonNullable<DeliveryDetails['status']>) => {
    updatePrintStatus(orderNo, newStatus);
  };

  const handleDownloadPrintPack = (orderNo: string) => {
    showToast(`Generating merged print-ready PDF pack for ${orderNo}...`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Print Orders & Island Fulfilment
          </h1>
          <p className="text-xs text-mut mt-0.5">
            Classroom print packs · Binding options · Courier & ferry boat dispatch tracking (P1-PRN).
          </p>
        </div>

        <span className="badge b-blue text-xs font-bold py-1 px-3">
          {printOrders.length} Print Orders Active
        </span>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === 'all' ? 'bg-pri text-white' : 'bg-white border border-line text-mut hover:text-ink'
          }`}
        >
          All ({printOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('queued')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === 'queued' ? 'bg-pri text-white' : 'bg-white border border-line text-mut hover:text-ink'
          }`}
        >
          Queued ({printOrders.filter((o) => (o.deliveryDetails?.status || 'PRINT_QUEUED') === 'PRINT_QUEUED').length})
        </button>
        <button
          onClick={() => setActiveTab('printing')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === 'printing' ? 'bg-pri text-white' : 'bg-white border border-line text-mut hover:text-ink'
          }`}
        >
          Printing ({printOrders.filter((o) => o.deliveryDetails?.status === 'PRINTING').length})
        </button>
        <button
          onClick={() => setActiveTab('out')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === 'out' ? 'bg-pri text-white' : 'bg-white border border-line text-mut hover:text-ink'
          }`}
        >
          Out for Delivery ({printOrders.filter((o) => o.deliveryDetails?.status === 'OUT_FOR_DELIVERY').length})
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === 'delivered' ? 'bg-pri text-white' : 'bg-white border border-line text-mut hover:text-ink'
          }`}
        >
          Delivered ({printOrders.filter((o) => o.deliveryDetails?.status === 'DELIVERED').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-line space-y-3">
          <Printer className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-lg text-ink">No Print Orders</h3>
          <p className="text-xs text-mut">
            No print orders match the selected status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            const del = o.deliveryDetails;
            const printItem = o.items.find((i) => i.format === 'print');
            const printDetails = printItem?.printDetails;
            const curStatus = del?.status || 'PRINT_QUEUED';

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
                    <span
                      className={`badge text-xs font-bold ${
                        curStatus === 'DELIVERED'
                          ? 'b-paid'
                          : curStatus === 'OUT_FOR_DELIVERY'
                          ? 'b-blue'
                          : curStatus === 'PRINTING'
                          ? 'b-wait'
                          : 'b-grey'
                      }`}
                    >
                      {curStatus}
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
                      onClick={() => setActiveStickerOrder(o)}
                      className="btn xs ghost flex items-center gap-1.5"
                    >
                      <Tag className="w-3.5 h-3.5" /> A6 Delivery Sticker
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {curStatus === 'PRINT_QUEUED' && (
                      <button
                        onClick={() => handleStatusUpdate(o.no, 'PRINTING')}
                        className="btn xs acc font-bold"
                      >
                        Start Printing
                      </button>
                    )}
                    {curStatus === 'PRINTING' && (
                      <button
                        onClick={() => handleStatusUpdate(o.no, 'OUT_FOR_DELIVERY')}
                        className="btn xs acc font-bold"
                      >
                        Dispatch / Out for Delivery
                      </button>
                    )}
                    {curStatus === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleStatusUpdate(o.no, 'DELIVERED')}
                        className="btn xs bg-ok hover:bg-emerald-700 text-white font-bold"
                      >
                        Mark Delivered ✓
                      </button>
                    )}
                    {curStatus === 'DELIVERED' && (
                      <span className="text-ok font-bold flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4" /> Delivered to Customer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* A6 Delivery Sticker Modal (P1-PRN-07) */}
      {activeStickerOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-bold text-xs uppercase text-mut">A6 Shipping Label Preview</span>
              <button
                onClick={() => setActiveStickerOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-ink text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* A6 Thermal Printable Layout */}
            <div className="border-2 border-black p-4 rounded-xl text-black font-sans space-y-3 bg-white text-xs">
              <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <div>
                  <h3 className="font-black text-sm tracking-tight">🏝️ LessonLagoon Maldives</h3>
                  <span className="text-[10px]">Teaching Resources Island Dispatch</span>
                </div>
                <b className="font-mono text-xs">{activeStickerOrder.no}</b>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase block text-slate-600">DELIVER TO:</span>
                <p className="font-extrabold text-sm">{activeStickerOrder.deliveryDetails?.recipient}</p>
                <p className="font-bold">{activeStickerOrder.deliveryDetails?.island}</p>
                <p>{activeStickerOrder.deliveryDetails?.address}</p>
                <p className="font-mono font-bold pt-1">Tel: {activeStickerOrder.deliveryDetails?.phone}</p>
              </div>

              <div className="pt-2 border-t border-dashed border-black flex justify-between text-[10px]">
                <span>Zone: {activeStickerOrder.deliveryDetails?.zoneName}</span>
                <span>Prepaid Bank Transfer</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveStickerOrder(null)}
                className="btn sm ghost flex-1 text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn sm acc flex-1 text-xs font-bold"
              >
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
