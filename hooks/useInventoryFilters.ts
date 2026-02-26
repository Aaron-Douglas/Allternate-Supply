'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export type FilterState = {
  category: string;
  status: string;
  q: string;
  min_price: string;
  max_price: string;
};

export function useInventoryFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: FilterState = {
    category: searchParams?.get('category') || '',
    status: searchParams?.get('status') || '',
    q: searchParams?.get('q') || '',
    min_price: searchParams?.get('min_price') || '',
    max_price: searchParams?.get('max_price') || '',
  };

  const setFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname ?? ''}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname ?? '/');
  }, [router, pathname]);

  return { filters, setFilter, clearFilters };
}
