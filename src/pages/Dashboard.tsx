import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { admin } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 mt-1">Welcome back, {admin?.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[
          { label: 'Customers', value: '—', color: 'bg-blue-50 text-blue-700' },
          { label: 'Partners', value: '—', color: 'bg-green-50 text-green-700' },
          { label: 'Bookings', value: '—', color: 'bg-amber-50 text-amber-700' },
          { label: 'Categories', value: '—', color: 'bg-purple-50 text-purple-700' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold mt-2 ${card.color} inline-block px-3 py-1 rounded-lg`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
