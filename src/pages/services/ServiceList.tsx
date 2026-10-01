import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api';

interface Category {
  _id: string;
  name: string;
}

interface Service {
  _id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  pricingType: string;
  basePrice: number;
  estimatedDurationMinutes?: number;
  isActive: boolean;
  sortOrder: number;
}

export default function ServiceList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const categoryId = searchParams.get('categoryId') ?? '';

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryId) params.categoryId = categoryId;
      const res = await api.get('/admin/services', { params });
      setServices(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [categoryId]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete service "${name}"?`)) return;
    try {
      await api.delete(`/admin/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch {
      // silent
    }
  };

  const handleToggleActive = async (svc: Service) => {
    try {
      const res = await api.patch(`/admin/services/${svc._id}`, {
        isActive: !svc.isActive,
      });
      setServices((prev) => prev.map((s) => (s._id === svc._id ? res.data : s)));
    } catch {
      // silent
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    fetchServices();
  };

  const getCategoryName = (id: string) =>
    categories.find((c) => c._id === id)?.name ?? '—';

  const pricingLabel = (type: string) => {
    const map: Record<string, string> = {
      fixed: 'Fixed',
      hourly: 'Per Hour',
      starting_from: 'Starting From',
    };
    return map[type] ?? type;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} services</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-lg text-sm"
        >
          + Add Service
        </button>
      </div>

      <div className="mb-4">
        <select
          value={categoryId}
          onChange={(e) => {
            if (e.target.value) {
              setSearchParams({ categoryId: e.target.value });
            } else {
              setSearchParams({});
            }
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <ServiceForm
          service={editing}
          categories={categories}
          defaultCategoryId={categoryId}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : services.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No services found</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{svc.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{svc.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{getCategoryName(svc.categoryId)}</td>
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-medium">₹{svc.basePrice}</span>
                    <span className="text-xs text-gray-400 ml-1">{pricingLabel(svc.pricingType)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {svc.estimatedDurationMinutes ? `${svc.estimatedDurationMinutes} min` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(svc)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        svc.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setEditing(svc); setShowForm(true); }}
                        className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(svc._id, svc.name)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ServiceForm({
  service,
  categories,
  defaultCategoryId,
  onClose,
  onSaved,
}: {
  service: Service | null;
  categories: Category[];
  defaultCategoryId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? defaultCategoryId ?? '');
  const [name, setName] = useState(service?.name ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [pricingType, setPricingType] = useState(service?.pricingType ?? 'fixed');
  const [basePrice, setBasePrice] = useState(service?.basePrice ?? 0);
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(
    service?.estimatedDurationMinutes ?? '',
  );
  const [sortOrder, setSortOrder] = useState(service?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(service?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = {
        categoryId,
        name,
        description,
        pricingType,
        basePrice,
        estimatedDurationMinutes: estimatedDurationMinutes ? Number(estimatedDurationMinutes) : undefined,
        sortOrder,
        isActive,
      };
      if (service) {
        await api.patch(`/admin/services/${service._id}`, data);
      } else {
        await api.post('/admin/services', data);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {service ? 'Edit Service' : 'New Service'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type *</label>
          <select
            required
            value={pricingType}
            onChange={(e) => setPricingType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Per Hour</option>
            <option value="starting_from">Starting From</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹) *</label>
          <input
            type="number"
            required
            min={0}
            step={0.01}
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
          <input
            type="number"
            min={1}
            value={estimatedDurationMinutes}
            onChange={(e) => setEstimatedDurationMinutes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            id="svc-active"
            className="rounded"
          />
          <label htmlFor="svc-active" className="text-sm text-gray-700">Active</label>
        </div>
        <div className="sm:col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? 'Saving...' : service ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
