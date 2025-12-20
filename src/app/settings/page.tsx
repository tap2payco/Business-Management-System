"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { getRoleName, canManageUsers } from '@/lib/permissions';

interface BusinessSettings {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
  logo?: string;
  invoiceTemplate: string;
  receiptTemplate: string;
}

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  createdAt: string;
}

type Tab = 'business' | 'templates' | 'users';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('business');
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // User invitation form state
  const [inviteForm, setInviteForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'member',
    password: ''
  });

  const currentUserRole = session?.user?.role || '';
  const canManageUsersPermission = canManageUsers({ role: currentUserRole, businessId: session?.user?.businessId || '' });

  useEffect(() => {
    loadBusinessDetails();
    if (canManageUsersPermission) {
      loadUsers();
    }
  }, [canManageUsersPermission]);

  async function loadBusinessDetails() {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/business');
      if (!res.ok) {
        if (res.status === 404) {
             // Handle case where business doesn't exist yet or data is missing
             console.warn('Business not found');
        }
        throw new Error('Failed to fetch business');
      }
      const data = await res.json();
      setBusiness(data);
    } catch (error) {
      console.error('Failed to load business details:', error);
      setMessage('Failed to load business details. Please try reloading.');
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
          const data = await res.json();
          setUsers(data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
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
      
      setBusiness(prev => prev ? { ...prev, logo: url } : null);
      
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

  async function handleInviteUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to invite user');
      }

      setMessage('User invited successfully');
      setInviteForm({ name: '', phone: '', email: '', role: 'member', password: '' });
      await loadUsers();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveUser(userId: string) {
    if (!confirm('Are you sure you want to remove this user?')) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove user');
      }

      setMessage('User removed successfully');
      await loadUsers();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  }

  if (loading && !business) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  if (!business) {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error loading settings.</strong>
                <span className="block sm:inline"> {message || 'Business profile not found.'}</span>
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Try signing out and signing in again to refresh your session.</p>
                </div>
            </div>
        </div>
    );
  }

  const templates = [
    { value: 'modern', label: 'Modern', description: 'Clean contemporary design with Outfit font' },
    { value: 'classic', label: 'Classic', description: 'Traditional layout with blue accents' },
    { value: 'minimal', label: 'Minimal', description: 'Ultra-clean black and white design' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {message && (
        <div className={`p-4 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('business')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'business'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          {canManageUsersPermission && (
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Team Members
            </button>
          )}
        </nav>
      </div>

      {/* Business Details Tab */}
      {activeTab === 'business' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo
              </label>
              <div className="flex items-center space-x-4">
                {business?.logo && (
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
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleLogoUpload}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={business?.name || ''}
                  onChange={e => setBusiness({ ...business!, name: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!business}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={business?.email || ''}
                  onChange={e => setBusiness({ ...business!, email: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={!business}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={business?.phone || ''}
                  onChange={e => setBusiness({ ...business!, phone: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={!business}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  value={business?.address || ''}
                  onChange={e => setBusiness({ ...business!, address: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  disabled={!business}
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  value={business?.currency || 'TZS'}
                  onChange={e => setBusiness({ ...business!, currency: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={!business}
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
                  value={business?.taxRate ? business.taxRate * 100 : 0}
                  onChange={e => setBusiness({ ...business!, taxRate: Number(e.target.value) / 100 })}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={!business}
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
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Invoice Template</h3>
            <p className="text-sm text-gray-600 mb-4">Choose the default template for your invoices</p>
            <div className="space-y-3">
              {templates.map((template) => (
                <label
                  key={template.value}
                  className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="invoiceTemplate"
                    value={template.value}
                    checked={business?.invoiceTemplate === template.value}
                    onChange={e => setBusiness({ ...business!, invoiceTemplate: e.target.value })}
                    className="mt-1 mr-3"
                    disabled={!business}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{template.label}</div>
                    <div className="text-sm text-gray-500">{template.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && canManageUsersPermission && (
        <div className="space-y-6">
          {/* Invite User Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Invite New User</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inviteName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="inviteName"
                    type="text"
                    value={inviteForm.name}
                    onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    id="inviteEmail"
                    type="email"
                    value={inviteForm.email}
                    onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="For notifications"
                  />
                </div>
                <div>
                  <label htmlFor="invitePhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="invitePhone"
                    type="tel"
                    value={inviteForm.phone}
                    onChange={e => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="invitePassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="invitePassword"
                    type="password"
                    value={inviteForm.password}
                    onChange={e => setInviteForm({ ...inviteForm, password: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="inviteRole"
                    value={inviteForm.role}
                    onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="admin">Admin - Can manage data</option>
                    <option value="member">Member - Read-only access</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Inviting...' : 'Invite User'}
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="text-lg font-medium p-6 pb-4">Team Members</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{user.phone}</div>
                        {user.email && <div className="text-xs text-gray-400">{user.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}