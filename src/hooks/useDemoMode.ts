'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Demo mode: when ?demo=1 is in the URL, transfers are simulated (no real signing).
 * Use this to show the full UI flow when WebAuthn/signing is blocked (e.g. TLS at a venue).
 */
export function useDemoMode(): boolean {
  const searchParams = useSearchParams();
  return searchParams?.get('demo') === '1';
}
