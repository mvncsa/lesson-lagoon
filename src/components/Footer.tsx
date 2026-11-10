'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      }
    } catch (err) {
      console.warn('Newsletter subscribe failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-ink text-[#C9D1E3] py-14 mt-20 text-sm">
      <div className="wrap space-y-12">
        {/* Newsletter Subscription Banner */}
        <div className="bg-[#1F2D4E] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-5 h-5 text-acc" />
              <span>Get Weekly Lesson Packs & Freebies</span>
            </h3>
            <p className="text-xs text-slate-300">
              Join 500+ Maldivian teachers receiving curated national curriculum materials and flash sales.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-acc font-bold text-sm bg-acc/10 py-2.5 px-4 rounded-xl border border-acc/20">
              <CheckCircle2 className="w-5 h-5" />
              <span>You're subscribed! Check your inbox for updates.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                required
                placeholder="teacher@school.edu.mv"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 text-white placeholder-slate-400 border border-slate-600 rounded-xl px-4 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-acc w-full sm:w-64"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn acc whitespace-nowrap text-xs py-2 px-5 font-bold"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>

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

