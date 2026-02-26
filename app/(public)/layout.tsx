import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME || 'Electronics Catalog';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop top nav */}
      <header className="hidden lg:block border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-brand-700">{SHOP_NAME}</Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-brand-600">Home</Link>
              <Link href="/sold" className="text-sm font-medium text-gray-700 hover:text-brand-600">Recently Sold</Link>
              <Link href="/warranty" className="text-sm font-medium text-gray-700 hover:text-brand-600">Warranty</Link>
              <Link href="/returns" className="text-sm font-medium text-gray-700 hover:text-brand-600">Returns</Link>
              {user && (
                <Link href="/admin/dashboard" className="text-sm font-medium text-brand-600 hover:text-brand-700">Admin</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="lg:hidden border-b border-gray-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-brand-700">{SHOP_NAME}</Link>
          {user && (
            <Link href="/admin/dashboard" className="text-sm font-medium text-brand-600">Admin</Link>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link href="/warranty" className="hover:text-gray-700">Warranty</Link>
              <Link href="/returns" className="hover:text-gray-700">Returns</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white lg:hidden">
        <div className="flex justify-around items-center h-16">
          <Link href="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-brand-600 min-w-[44px] min-h-[44px] justify-center">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px]">Home</span>
          </Link>
          <Link href="/sold" className="flex flex-col items-center gap-1 text-gray-600 hover:text-brand-600 min-w-[44px] min-h-[44px] justify-center">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px]">Sold</span>
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-[#25D366] min-w-[44px] min-h-[44px] justify-center"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-[10px] font-medium">WhatsApp</span>
          </a>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
