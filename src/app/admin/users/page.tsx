"use client";

import React, { useEffect, useState } from 'react';
import { Mail, Phone, Building2, Shield, User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  isSuperAdmin: boolean;
  createdAt: string;
  business: {
    id: string;
    name: string;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Error loading users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.phone && user.phone.toLowerCase().includes(query)) ||
      (user.business.name.toLowerCase().includes(query))
    );
  });

  if (loading) return <div className="p-8">Loading users...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">System Users</h1>
            <p className="text-gray-500">Manage all users across the platform</p>
        </div>
        <div className="relative">
            <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
             <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No users found matching "{searchQuery}"
                      </td>
                  </tr>
              ) : (
                filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                                {user.isSuperAdmin && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                        Super Admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                            {user.email && (
                                <div className="flex items-center text-sm text-gray-500">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {user.email}
                                </div>
                            )}
                            <div className="flex items-center text-sm text-gray-500">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            {user.business.name}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                             user.role === 'OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                         }`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
