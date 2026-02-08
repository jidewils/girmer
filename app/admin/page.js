'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (adminKey) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/subscribers?key=${adminKey}`);
      if (!res.ok) {
        if (res.status === 401) {
          setError('Invalid admin key');
          setIsAuthenticated(false);
        } else {
          setError('Failed to fetch data');
        }
        return;
      }
      const json = await res.json();
      setData(json);
      setIsAuthenticated(true);
      // Save key to session
      sessionStorage.setItem('girmer_admin_key', adminKey);
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for saved key
    const savedKey = sessionStorage.getItem('girmer_admin_key');
    if (savedKey) {
      setKey(savedKey);
      fetchData(savedKey);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(key);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 w-full max-w-md">
          <h1 className="text-2xl font-bold text-emerald-400 mb-6">Girmer Admin</h1>
          <form onSubmit={handleSubmit}>
            <label className="block text-sm text-gray-400 mb-2">Admin Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl"
            >
              {loading ? 'Loading...' : 'View Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-emerald-400">Girmer Admin</h1>
          <button
            onClick={() => fetchData(key)}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {data?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <p className="text-sm text-gray-400 mb-1">Total Downloads</p>
              <p className="text-3xl font-bold text-emerald-400">{data.stats.total}</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <p className="text-sm text-gray-400 mb-1">Today</p>
              <p className="text-3xl font-bold text-blue-400">{data.stats.today}</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <p className="text-sm text-gray-400 mb-1">This Week</p>
              <p className="text-3xl font-bold text-purple-400">{data.stats.thisWeek}</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <p className="text-sm text-gray-400 mb-1">Top Province</p>
              <p className="text-2xl font-bold text-orange-400">
                {Object.entries(data.stats.provinces || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
              </p>
            </div>
          </div>
        )}

        {/* Province Breakdown */}
        {data?.stats?.provinces && Object.keys(data.stats.provinces).length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-8">
            <h2 className="text-lg font-semibold mb-4">Province Breakdown</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(data.stats.provinces)
                .sort((a, b) => b[1] - a[1])
                .map(([prov, count]) => (
                  <div key={prov} className="bg-gray-800 rounded-lg px-4 py-2">
                    <span className="text-gray-300 font-medium">{prov}:</span>
                    <span className="text-emerald-400 ml-2">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Subscribers Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Recent Subscribers ({data?.subscribers?.length || 0})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Province</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Income</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.subscribers?.map((sub, i) => (
                  <tr key={sub.id || i} className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-200">{sub.name}</td>
                    <td className="py-3 px-4 text-gray-300">{sub.email}</td>
                    <td className="py-3 px-4 text-gray-400">{sub.province || '-'}</td>
                    <td className="py-3 px-4 text-gray-400">{sub.income ? `$${parseInt(sub.income).toLocaleString()}` : '-'}</td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {(!data?.subscribers || data.subscribers.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No subscribers yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export hint */}
        <p className="text-sm text-gray-600 mt-6 text-center">
          To export: Open browser console → copy `JSON.stringify(data.subscribers)`
        </p>
      </div>
    </div>
  );
}
