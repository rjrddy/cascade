import { api } from './api';

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', res.token);
}

export async function signup(email: string, password: string) {
  const res = await api.post('/auth/signup', { email, password });
  localStorage.setItem('token', res.token);
}
