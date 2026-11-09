import React from 'react';

export default function TermsPage() {
  return (
    <div className="wrap py-12 max-w-3xl space-y-6 text-sm text-slate-800 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-ink tracking-tight">Terms of Service & Classroom Licence</h1>
      <p className="text-xs text-mut">Last updated: November 2026</p>

      <div className="space-y-4 pt-4 border-t border-line text-xs">
        <h2 className="text-base font-bold text-ink">1. Single-Teacher Classroom Licence</h2>
        <p>
          Every digital resource purchased or claimed free on LessonLagoon grants the purchasing educator a non-exclusive, non-transferable licence to print, project, and distribute copies exclusively to learners currently enrolled in their direct classroom.
        </p>

        <h2 className="text-base font-bold text-ink">2. Permitted and Prohibited Uses</h2>
        <p>
          You may adapt and print worksheets for your students. You may not resell, upload to shared public drives, redistribute to teachers outside your school department, or claim original authorship of the materials.
        </p>

        <h2 className="text-base font-bold text-ink">3. Payments & Bank Transfers</h2>
        <p>
          All prices are listed in Maldivian Rufiyaa (MVR). Bank transfers made through Bank of Maldives (BML) must include the exact order reference number. Access is unlocked upon verification of the transfer slip.
        </p>
      </div>
    </div>
  );
}

