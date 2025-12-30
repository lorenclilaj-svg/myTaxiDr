// admin-web/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [stats, setStats] = useState({ activeRides: 0, onlineDrivers: 0 });
  const [liveDrivers, setLiveDrivers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
        router.push('/login');
        return;
    }

    const socket = io('http://localhost:3000', {
        extraHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('joinAdmin');
    });

    socket.on('driverLocation', (data) => {
      console.log('Driver update:', data);
      setLiveDrivers((prev) => {
        // Update or add driver
        const idx = prev.findIndex(d => d.driverId === data.driverId);
        if (idx > -1) {
            const newArr = [...prev];
            newArr[idx] = data;
            return newArr;
        }
        return [...prev, data];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Taxi Admin Dashboard (Albania)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Rides</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.activeRides}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Online Drivers</h3>
          <p className="text-3xl font-bold text-green-600">{liveDrivers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Revenue (Today)</h3>
          <p className="text-3xl font-bold text-purple-600">0 ALL</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Live Map</h2>
        <div className="bg-gray-200 h-96 flex items-center justify-center rounded">
          {/* Map Component would go here (Google Maps) */}
          <div className="text-center">
            <p className="text-gray-600 mb-2">Google Maps Area</p>
            <p className="text-sm">Live Drivers:</p>
            <ul className="text-xs text-left">
                {liveDrivers.map(d => (
                    <li key={d.driverId}>Driver {d.driverId}: {d.lat}, {d.lng}</li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
