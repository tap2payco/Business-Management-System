"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface BusinessSettings {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
  logo?: string;
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBusinessDetails();
  }, []);

  async function loadBusinessDetails() {
    try {
      const res = await fetch('/api/settings/business');
      const data = await res.json();
      setBusiness(data);
    } catch (error) {
      console.error('Failed to load business details:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business)
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setMessage('Settings saved successfully');
    } catch (error) {
      setMessage('Error saving settings');
      console.error('Settings update error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Failed to upload logo');

      const { url } = await res.json();
      
      // Update local state
      setBusiness(prev => prev ? { ...prev, logo: url } : null);
      
      // Immediately save to database
      if (business) {
        const saveRes = await fetch('/api/settings/business', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...business, logo: url })
        });
        
        if (!saveRes.ok) throw new Error('Failed to save logo to database');
      }
      
      setMessage('Logo uploaded and saved successfully');
    } catch (error) {
      setMessage('Error uploading logo');
      console.error('Logo upload error:', error);
    }
  }

  if (!business) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Business Settings</h1>

      {message && (
        <div className={`p-4 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Logo Section */}
          <div>
            <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo
            </label>
            <div className="flex items-center space-x-4">
              {business.logo && (
                <div className="relative w-32 h-32">
                  <Image
                    src={business.logo}
                    alt="Business logo"
                    fill
                    sizes="128px"
                    className="object-contain rounded"
                  />
                </div>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-sm"
              />
            </div>
          </div>

            {/* Business Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={business.name}
                onChange={e => setBusiness({ ...business, name: e.target.value })}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={business.email || ''}
                onChange={e => setBusiness({ ...business, email: e.target.value })}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={business.phone || ''}
                onChange={e => setBusiness({ ...business, phone: e.target.value })}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                value={business.address || ''}
                onChange={e => setBusiness({ ...business, address: e.target.value })}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                value={business.currency}
                onChange={e => setBusiness({ ...business, currency: e.target.value })}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TZS">TZS - Tanzanian Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
                Default Tax Rate (%)
              </label>
              <input
                id="taxRate"
                type="number"
                value={business.taxRate * 100}
                onChange={e => setBusiness({ ...business, taxRate: Number(e.target.value) / 100 })}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}