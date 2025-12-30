// admin-web/app/drivers/page.tsx
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
        const res = await axios.get('http://localhost:3000/users/drivers/all'); // Need to create this endpoint or similar
        setDrivers(res.data);
    } catch (e) {
        console.error(e);
    }
  };

  const approveDriver = async (id: number) => {
      try {
          await axios.patch(`http://localhost:3000/users/drivers/${id}/status`, { isApproved: true });
          fetchDrivers();
      } catch (e) {
          alert("Failed to approve");
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Driver Management</h1>
      <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map(driver => (
                      <tr key={driver.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{driver.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{driver.user?.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              {driver.isApproved ?
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span> :
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Pending</span>
                              }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              {!driver.isApproved && (
                                  <button onClick={() => approveDriver(driver.userId)} className="text-indigo-600 hover:text-indigo-900">Approve</button>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}
