"use client";
import { useState } from 'react';
import { signup } from '@/lib/auth';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await signup(email, password);
      window.location.href = '/dashboard';
    } catch (e: any) {
      setError('Signup failed');
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white shadow p-6 space-y-4 rounded">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-black text-white rounded p-2">Create account</button>
        <p className="text-sm text-gray-600">
          Have an account? <Link className="underline" href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
