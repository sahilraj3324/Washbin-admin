import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/customers', label: 'Customers', icon: '👤' },
  { to: '/partners', label: 'Partners', icon: '🔧' },
  { to: '/bookings', label: 'Bookings', icon: '📋' },
  { to: '/categories', label: 'Categories', icon: '📂' },
  { to: '/services', label: 'Services', icon: '⚙️' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-amber-400">Washbin</h2>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400 mb-3 truncate">{admin?.email}</div>
        <button
          onClick={logout}
          className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
