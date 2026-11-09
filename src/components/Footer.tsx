import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-ink text-[#C9D1E3] py-14 mt-20 text-sm">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 font-extrabold text-xl text-white">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pri to-[#38C6B3] flex items-center justify-center text-white text-base">
                🏝️
              </span>
              <span>LessonLagoon</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Teacher-crafted worksheets, slides, and learning packs aligned with the Maldives National Curriculum.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              © {new Date().getFullYear()} LessonLagoon Pvt Ltd · Malé, Maldives
            </div>
          </div>

          {/* Subjects */}
          <div>
            <b className="text-white block mb-3 font-bold text-sm tracking-wide">Popular Subjects</b>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/#all" className="hover:text-white transition">Mathematics</Link></li>
              <li><Link href="/#all" className="hover:text-white transition">Dhivehi Language & Thaana</Link></li>
              <li><Link href="/#all" className="hover:text-white transition">English & Phonics</Link></li>
              <li><Link href="/#all" className="hover:text-white transition">Science & Reef Biology</Link></li>
              <li><Link href="/#all" className="hover:text-white transition">Islam & Quranic Studies</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <b className="text-white block mb-3 font-bold text-sm tracking-wide">Community & Perks</b>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/points" className="hover:text-white transition">🪙 Loyalty Points & Rewards</Link></li>
              <li><Link href="/request" className="hover:text-white transition">📝 Request a Resource</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition">❓ Frequently Asked Questions</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">⚙️ Teacher Backend (Admin)</Link></li>
            </ul>
          </div>

          {/* Legal & Licence */}
          <div>
            <b className="text-white block mb-3 font-bold text-sm tracking-wide">Licence & Policies</b>
            <ul className="space-y-2 text-slate-400 text-xs leading-relaxed">
              <li><span className="text-white font-medium">Single-Teacher Licence:</span> Every purchase includes classroom usage rights for your students. Please do not redistribute files.</li>
              <li className="pt-2"><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Notice</Link></li>
              <li><Link href="/delivery" className="hover:text-white transition">Printing & Island Delivery</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

