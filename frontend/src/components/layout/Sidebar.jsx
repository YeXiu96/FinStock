import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X, LayoutDashboard, Receipt, Coffee, Package, FileText, Users, Settings, Truck, Wallet, ShoppingCart } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'MENU UTAMA',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['OWNER', 'KARYAWAN'] },
        { name: 'Kasir', path: '/kasir', icon: ShoppingCart, roles: ['KARYAWAN'] },
        { name: 'Transaksi', path: '/transaksi', icon: Receipt, roles: ['OWNER', 'KARYAWAN'] },
        { name: 'Pengeluaran', path: '/pengeluaran', icon: Wallet, roles: ['OWNER', 'KARYAWAN'] },
        { name: 'Menu', path: '/menu', icon: Coffee, roles: ['OWNER', 'KARYAWAN'] },
        { name: 'Persediaan', path: '/persediaan', icon: Package, roles: ['OWNER', 'KARYAWAN'] },
        { name: 'Laporan', path: '/laporan', icon: FileText, roles: ['OWNER', 'KARYAWAN'] },
        { name: 'Vendor', path: '/vendor', icon: Truck, roles: ['OWNER', 'KARYAWAN'] },
      ]
    },
    {
      title: 'PENGATURAN',
      items: [
        { name: 'Pengguna', path: '/pengguna', icon: Users, roles: ['OWNER'] },
        { name: 'Pengaturan', path: '/pengaturan', icon: Settings, roles: ['OWNER', 'KARYAWAN'] },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#002444] text-white transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0">
              <div className="w-4 h-4 border-2 border-[#002444] rounded-sm"></div>
            </div>
            <span className="text-sm font-bold text-white tracking-tight leading-none">
              FinStock <span className="text-[#83f5c6]">UMKM</span>
            </span>
          </div>
          <button onClick={toggleSidebar} className="ml-auto lg:hidden text-white/70">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navGroups.map((group, idx) => (
            <div key={group.title} className={idx > 0 ? 'mt-6' : ''}>
              <div className="px-8 mb-2 text-[11px] font-bold tracking-wider text-white/50">
                {group.title}
              </div>
              <ul className="space-y-1">
                {group.items.filter(item => {
                  if (!user) return false;
                  // Check if user's role is in the allowed roles
                  if (!item.roles.includes(user.role)) return false;
                  
                  // For OWNER, show all menus that include OWNER in roles
                  if (user.role === 'OWNER') return true;
                  
                  // For KARYAWAN, check permissions
                  if (user.role === 'KARYAWAN') {
                    const defaultPermissions = ['/', '/kasir', '/transaksi', '/menu', '/pengaturan'];
                    const userPermissions = (Array.isArray(user.permissions) && user.permissions.length > 0)
                      ? user.permissions
                      : defaultPermissions;
                    return userPermissions.includes(item.path);
                  }
                  
                  return false;
                }).map(item => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-4
                        ${isActive 
                          ? 'bg-white/10 text-white border-[#83f5c6] font-medium' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white border-transparent'}
                      `}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar();
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon size={18} className={isActive ? 'text-[#83f5c6]' : 'text-white/40 group-hover:text-white/70'} />
                          {item.name}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-6 mt-auto border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">
              {user?.nama?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.nama || 'User'}
              </p>
              <p className="text-xs text-white/50 truncate">
                {user?.role === 'OWNER' ? 'Owner / Admin' : 'Karyawan'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-red-300 hover:text-red-100 hover:bg-white/5 rounded-md transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

