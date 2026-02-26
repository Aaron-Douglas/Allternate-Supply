export async function logView(itemId: string, sessionId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/log-view', {
      method: 'POST',
      body: JSON.stringify({ itemId, sessionId }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return data.recorded;
  } catch {
    return false;
  }
}

export function logInquiry(itemId: string, sessionId: string, source: 'whatsapp' | 'form' = 'whatsapp'): void {
  fetch('/api/log-inquiry', {
    method: 'POST',
    body: JSON.stringify({
      itemId,
      sessionId,
      source,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}
