"use client";

import { useState, useEffect } from 'react';

export default function SystemCheckPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function checkSystem() {
    try {
      // Check 1: Database Connection & Items
      const itemsRes = await fetch('/api/items?limit=1');
      let itemsData;
      try {
        itemsData = await itemsRes.json();
      } catch (e) {
        itemsData = "Failed to parse JSON";
      }
      
      // Check 2: Quotes Schema
      const quotesRes = await fetch('/api/quotes?limit=1');
      let quotesData;
      try {
        quotesData = await quotesRes.json();
      } catch (e) {
        quotesData = "Failed to parse JSON";
      }

      setStatus({
        items: itemsRes.ok ? '✅ OK' : `❌ Failed: ${JSON.stringify(itemsData)}`,
        quotes: quotesRes.ok ? '✅ OK' : `❌ Failed: ${JSON.stringify(quotesData)}`,
        connection: '✅ Connected'
      });
    } catch (err: any) {
      setStatus({
        error: err.message,
        connection: '❌ Failed'
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkSystem();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Health Check</h1>
      
      {loading ? (
        <div>Running diagnostics...</div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 border rounded bg-white shadow-sm">
            <h3 className="font-semibold mb-2">Checks</h3>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
          
          <div className="bg-blue-50 p-4 rounded text-blue-800 text-sm">
            <p className="font-bold">Instructions:</p>
            <p>If you see ❌ Failed for Items, you need to run the `emergency_fix.sql` script.</p>
            <p>If you see ❌ Failed for Quotes, you need to run the `emergency_fix.sql` script.</p>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Run Check Again
          </button>
        </div>
      )}
    </div>
  );
}
