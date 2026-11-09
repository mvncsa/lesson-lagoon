import React from 'react';

export default function DeliveryPolicyPage() {
  return (
    <div className="wrap py-12 max-w-3xl space-y-6 text-sm text-slate-800 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-ink tracking-tight">Printing & Island Delivery Policy</h1>
      <p className="text-xs text-mut">Last updated: November 2026</p>

      <div className="space-y-4 pt-4 border-t border-line text-xs">
        <h2 className="text-base font-bold text-ink">1. Production Times</h2>
        <p>
          Classroom print orders are produced in our Malé print workshop within 2 working days of BML payment approval.
        </p>

        <h2 className="text-base font-bold text-ink">2. Delivery Zones and Estimated Transit</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><b>Malé, Villimalé:</b> 1–2 days after printing (MVR 30.00)</li>
          <li><b>Hulhumalé:</b> 1–2 days after printing (MVR 40.00)</li>
          <li><b>Greater Malé Islands:</b> 2–3 days (MVR 60.00)</li>
          <li><b>Other Atolls:</b> 3–7 days via inter-atoll ferry or boat cargo (MVR 100.00, collected at harbor)</li>
        </ul>

        <h2 className="text-base font-bold text-ink">3. Digital Download Access</h2>
        <p>
          Printed orders always include full immediate digital download access as soon as your payment is approved. You do not need to wait for physical delivery to start preparing your lesson.
        </p>
      </div>
    </div>
  );
}

