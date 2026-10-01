import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  status: string;
  addresses: {
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    pincode: string;
    isDefault: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/admin/customers/${id}`);
      setCustomer(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const toggleStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/customers/${id}/status?status=${newStatus}`);
      setCustomer(res.data);
    } catch {
      // silent
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Loading...</div>;
  }

  if (!customer) {
    return <div className="text-center text-gray-400 py-12">Customer not found</div>;
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    blocked: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <Link to="/customers" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Back to Customers
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{customer.phone}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[customer.status] ?? 'bg-gray-100'}`}>
          {customer.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Name', value: customer.name },
                { label: 'Phone', value: customer.phone },
                { label: 'Email', value: customer.email ?? '—' },
                { label: 'Status', value: customer.status },
                { label: 'Joined', value: new Date(customer.createdAt).toLocaleString() },
                { label: 'Last Updated', value: new Date(customer.updatedAt).toLocaleString() },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-gray-500">{item.label}</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Addresses ({customer.addresses.length})
            </h2>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-gray-400">No addresses saved</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((addr, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      {addr.label && (
                        <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {addr.label}
                        </span>
                      )}
                      {addr.isDefault && (
                        <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ''}
                    </p>
                    <p className="text-gray-500">
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ''} — {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {customer.status !== 'blocked' ? (
                <button
                  onClick={() => toggleStatus('blocked')}
                  disabled={updating}
                  className="w-full py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Block Customer'}
                </button>
              ) : (
                <button
                  onClick={() => toggleStatus('active')}
                  disabled={updating}
                  className="w-full py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Unblock Customer'}
                </button>
              )}
              {customer.status === 'inactive' && (
                <button
                  onClick={() => toggleStatus('active')}
                  disabled={updating}
                  className="w-full py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Activate Customer'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
