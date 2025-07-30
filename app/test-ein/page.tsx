'use client';

import { useState } from 'react';

export default function TestEINPage() {
  const [ein, setEin] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEIN = async () => {
    if (!ein || !restaurantName) {
      alert('Please enter both EIN and restaurant name');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/verify-ein', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ein: ein,
          restaurantName: restaurantName
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Test error:', error);
      setResult({ error: 'Network error during test' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🧪 EIN Verification Test</h1>
        
        <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              EIN (Format: 12-3456789)
            </label>
            <input
              type="text"
              placeholder="12-3456789"
              value={ein}
              onChange={e => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '-' + value.slice(2, 9);
                }
                setEin(value);
              }}
              maxLength={10}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              placeholder="McDonald's Corporation"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <button
            onClick={testEIN}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Testing...' : 'Test EIN Verification'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-zinc-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result:</h2>
            
            <div className={`p-4 rounded-lg ${result.valid ? 'bg-green-900 border border-green-500' : 'bg-red-900 border border-red-500'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-xl ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                  {result.valid ? '✅' : '❌'}
                </span>
                <span className="font-semibold">
                  {result.valid ? 'EIN Verification Passed' : 'EIN Verification Failed'}
                </span>
              </div>
              
              {result.error && (
                <p className="text-red-300 text-sm mb-2">
                  <strong>Error:</strong> {result.error}
                </p>
              )}
              
              {result.registeredName && (
                <p className="text-green-300 text-sm mb-2">
                  <strong>Registered Name:</strong> {result.registeredName}
                </p>
              )}
              
              {result.businessType && (
                <p className="text-blue-300 text-sm mb-2">
                  <strong>Business Type:</strong> {result.businessType}
                </p>
              )}
              
              {result.address && (
                <p className="text-purple-300 text-sm">
                  <strong>Address:</strong> {JSON.stringify(result.address)}
                </p>
              )}
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-gray-400 hover:text-white">
                Raw API Response
              </summary>
              <pre className="mt-2 p-3 bg-zinc-800 rounded text-xs overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="mt-6 bg-blue-900 rounded-xl p-4">
          <h3 className="font-semibold mb-2">💡 Test Cases to Try:</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Valid EIN with exact business name match</li>
            <li>• Valid EIN with partial business name match</li>
            <li>• Invalid EIN format (should show format error)</li>
            <li>• Valid EIN with wrong business name</li>
            <li>• Non-existent EIN</li>
          </ul>
        </div>
        
        <div className="mt-4 text-center">
          <a 
            href="/register" 
            className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            ← Back to Registration
          </a>
        </div>
      </div>
    </div>
  );
}
