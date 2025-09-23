"use client";
import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { api } from '@/lib/api';

export default function PlaidLinkButton() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post('/plaid/link/token/create', {});
        setToken(res.link_token);
      } catch {}
    })();
  }, []);

  const onSuccess = useCallback(async (public_token: string) => {
    await api.post('/plaid/item/public_token/exchange', { public_token });
    await api.post('/plaid/transactions/sync', {});
    window.location.reload();
  }, []);

  const { open, ready } = usePlaidLink({ token: token || '', onSuccess });

  return (
    <button onClick={() => open()} disabled={!ready} className="bg-black text-white rounded px-3 py-2">
      {ready ? 'Link Account' : 'Preparing...'}
    </button>
  );
}
