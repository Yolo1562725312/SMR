import request from './request';

export function login(data: { username: string; password: string }) {
  return request.post('/auth/login', data);
}

export function register(data: { username: string; password: string; name: string; email?: string; phone?: string }) {
  return request.post('/auth/register', data);
}
