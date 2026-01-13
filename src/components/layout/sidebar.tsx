import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button, Divider, User } from '@heroui/react';
import { Icon } from '@iconify/react';
import { getUserRole, authApi, decodeToken } from '../../services/api';
import logoRutinas from '../../assets/logo-rutinas-pro.png';
import { usePagos } from '../../hooks/usePagos';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: ('ADMIN' | 'ENTRENADOR' | 'CLIENTE')[]; // Allowed roles for this item
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = getUserRole();
  const { pagos } = usePagos();

  const unreadCount = React.useMemo(() => {
    if (userRole === 'CLIENTE') return 0;
    return pagos.filter(p => !p.visto).length;
  }, [pagos, userRole]);

  // Get user information from token
  const userInfo = React.useMemo(() => {
    const payload = decodeToken();
    if (!payload) return null;

    return {
      email: payload.sub || payload.email || 'Usuario',
      role: payload.rol || 'Usuario',
      name: payload.name || payload.sub || 'Usuario'
    };
  }, []);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
    if (window.innerWidth < 768 && isOpen) {
      onToggle();
    }
  };

  const handleItemClick = () => {
    if (window.innerWidth < 768 && isOpen) {
      onToggle();
    }
  };

  const allNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: 'lucide:layout-dashboard' },
    { label: 'Usuarios', path: '/usuarios', icon: 'lucide:users', roles: ['ADMIN'] },
    { label: 'Clientes', path: '/clientes', icon: 'lucide:user', roles: ['ADMIN', 'ENTRENADOR'] },
    { label: 'Pagos', path: '/pagos', icon: 'lucide:banknote', roles: ['ADMIN', 'ENTRENADOR'] },
    { label: 'Ajustes', path: '/ajustes-pago', icon: 'lucide:settings', roles: ['ENTRENADOR'] },
    { label: 'Rutinas', path: '/rutinas', icon: 'lucide:clipboard-list', roles: ['ADMIN', 'ENTRENADOR', 'CLIENTE'] },
    { label: 'Ejercicios', path: '/ejercicios', icon: 'lucide:dumbbell', roles: ['ADMIN', 'ENTRENADOR'] },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => {
    if (!item.roles) return true; // No role restriction
    if (!userRole) return false; // No role detected, hide item
    return item.roles.includes(userRole);
  });

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`${isOpen ? 'w-64' : 'w-0 md:w-20'
          } bg-content1 shadow-sm transition-all duration-300 ease-in-out fixed md:relative z-30 h-screen overflow-hidden border-r border-default-100`}
      >
        <div className="flex flex-col h-full w-full">
          <div className={`flex items-center justify-between h-16 px-4 shrink-0 ${isOpen ? 'justify-between' : 'justify-center'}`}>
            {isOpen ? (
              <div className="flex items-center justify-center w-full px-2">
                <img src={logoRutinas} alt="Rutinas Pro" className="h-12 w-auto object-contain" />
              </div>
            ) : (
              <img src={logoRutinas} alt="Rutinas Pro" className="h-8 w-auto object-contain" />
            )}

            <Button
              isIconOnly
              variant="light"
              aria-label="Toggle sidebar"
              className="md:flex hidden"
              onPress={onToggle}
            >
              <Icon
                icon={isOpen ? 'lucide:chevron-left' : 'lucide:chevron-right'}
                className="h-5 w-5"
              />
            </Button>
          </div>

          <Divider />

          <nav className="flex-1 overflow-y-auto py-6 overflow-x-hidden">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={handleItemClick}
                    className={({ isActive: active }) =>
                      `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative whitespace-nowrap ${(item.path === '/' && location.pathname === '/') || (item.path !== '/' && location.pathname.startsWith(item.path))
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-default-600 hover:text-default-900 hover:bg-default-100 font-medium'
                      }`
                    }
                  >
                    {/* Active Indicator Dot */}
                    {((item.path === '/' && location.pathname === '/') || (item.path !== '/' && location.pathname.startsWith(item.path))) && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary-500 rounded-r-full" />
                    )}

                    <Icon
                      icon={item.icon}
                      className={`h-5 w-5 flex-shrink-0 transition-colors ${((item.path === '/' && location.pathname === '/') || (item.path !== '/' && location.pathname.startsWith(item.path)))
                        ? 'text-primary-500'
                        : 'text-default-400 group-hover:text-default-600'
                        }`}
                    />
                    <span className={`ml-3 text-sm transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 md:opacity-0 hidden md:block -translate-x-2'}`}>
                      {item.label}
                    </span>

                    {/* Notification Badge for Payments */}
                    {item.label === 'Pagos' && unreadCount > 0 && (
                      <span className={`ml-auto flex items-center justify-center bg-primary-500 text-white text-[10px] font-bold rounded-full h-5 w-5 shadow-lg shadow-primary-500/30 ring-2 ring-content1 transition-all duration-300 ${!isOpen && 'absolute top-1 right-2'}`}>
                        {unreadCount > 9 ? '+9' : unreadCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <Divider />

          <div className="p-4 space-y-3 shrink-0">
            {isOpen && userInfo && (
              <div className="px-2 py-2 bg-default-100 rounded-lg whitespace-nowrap overflow-hidden">
                <User
                  name={userInfo.name}
                  description={userInfo.role}
                  avatarProps={{
                    name: userInfo.name.charAt(0).toUpperCase(),
                    className: "bg-primary text-white"
                  }}
                  classNames={{
                    name: "text-sm font-medium",
                    description: "text-xs text-default-500"
                  }}
                />
              </div>
            )}

            <Button
              variant="flat"
              color="danger"
              className={`w-full justify-start ${!isOpen && 'justify-center'}`}
              startContent={isOpen ? <Icon icon="lucide:log-out" className="h-5 w-5" /> : undefined}
              onPress={handleLogout}
            >
              {isOpen ? 'Cerrar Sesión' : <Icon icon="lucide:log-out" className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};