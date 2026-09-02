'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const currencies = [
  ['GHS','GH₵'],['USD','$'],['EUR','€'],['GBP','£'],['CNY','¥']
];
export default function Header(){
  const [currency,setCurrency]=useState('GHS'); const [user,setUser]=useState(false);
  useEffect(()=>{const s=supabaseBrowser(); s.auth.getUser().then(({data})=>setUser(!!data.user)); const saved=localStorage.getItem('ap_currency'); if(saved)setCurrency(saved);},[]);
  return <header className="bg-white border-b sticky top-0 z-30"><div className="container flex items-center justify-between py-3 gap-4">
    <Link href="/" className="text-2xl font-black text-green-800">ALL <span className="text-yellow-500">PROMINENT</span><span className="text-gray-900"> GHANA</span></Link>
    <nav className="hidden md:flex gap-4 items-center"><Link href="/listings">Marketplace</Link><Link href="/ads">Advertise</Link><Link href="/dashboard">My Account</Link></nav>
    <div className="flex items-center gap-2"><select aria-label="Currency" className="border rounded-lg p-2" value={currency} onChange={e=>{setCurrency(e.target.value);localStorage.setItem('ap_currency',e.target.value)}}>{currencies.map(([c,s])=><option key={c} value={c}>{s} {c}</option>)}</select><Link href={user?'/dashboard':'/login'} className="px-3 py-2">{user?'Account':'Login'}</Link><Link href="/post" className="btn btn-primary hidden sm:inline-flex">Post an Ad</Link></div>
  </div></header>
}
