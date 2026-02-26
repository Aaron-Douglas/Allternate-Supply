'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useSession(): string {
  const [sessionId, setSessionId] = useState<string>('');
  useEffect(() => {
    const key = 'inv_session_id';
    let id = document.cookie.match(new RegExp(`${key}=([^;]+)`))?.[1];
    if (!id) {
      id = uuidv4();
      document.cookie = `${key}=${id}; path=/; SameSite=Lax`;
    }
    setSessionId(id);
  }, []);
  return sessionId;
}
