// admin-web/app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [phone, setPhone] = useState('0000000000');
  const [password, setPassword] = useState('admin123');
  const router = useRouter();

  const handleLogin = async () => {
    try {
        const res = await axios.post('http://localhost:3000/auth/login', { phone, password });
        Cookies.set('token', res.data.access_token);
        router.push('/');
    } catch (e) {
        alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
            <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
            <input
                className="w-full border p-2 mb-4"
                placeholder="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
            />
            <input
                className="w-full border p-2 mb-4"
                placeholder="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
                Login
            </button>
        </div>
    </div>
  );
}
