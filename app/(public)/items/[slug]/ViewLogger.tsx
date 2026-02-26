'use client';

import { useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { logView } from '@/lib/analytics';

export function ViewLogger({ itemId }: { itemId: string }) {
  const sessionId = useSession();

  useEffect(() => {
    if (sessionId && itemId) {
      logView(itemId, sessionId);
    }
  }, [sessionId, itemId]);

  return null;
}
