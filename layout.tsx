import './globals.css';
import Header from '@/components/Header';
export const metadata={title:'ALL PROMINENT GHANA — Buy • Sell • Advertise',description:'A Ghana-focused marketplace and advertising platform.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/>{children}<footer className="mt-16 bg-gray-950 text-white"><div className="container py-10"><b>ALL PROMINENT GHANA</b><p className="text-gray-400 mt-2">Buy • Sell • Advertise • Connect</p><p className="text-gray-500 text-sm mt-6">© 2026 All Prominent Ghana</p></div></footer></body></html>}
