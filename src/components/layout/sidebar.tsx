import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button, Divider, User } from '@heroui/react';
import { Icon } from '@iconify/react';
import { getUserRole, authApi, decodeToken } from '../../services/api';

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
  };

  const allNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: 'lucide:layout-dashboard' },
    { label: 'Usuarios', path: '/usuarios', icon: 'lucide:users', roles: ['ADMIN'] },
    { label: 'Clientes', path: '/clientes', icon: 'lucide:user', roles: ['ADMIN', 'ENTRENADOR'] },
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
    <aside
      className={`${isOpen ? 'w-64' : 'w-20'
        } bg-content1 shadow-sm transition-all duration-300 ease-in-out fixed md:relative z-30 h-screen`}
    >
      <div className="flex flex-col h-full">
        <div className={`flex items-center justify-between h-16 px-4 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen ? (
            <div className="flex items-center">
              <Icon icon="lucide:dumbbell" className="h-8 w-8 text-primary" />
              <span className="ml-2 text-lg font-semibold text-foreground">FitManager</span>
            </div>
          ) : (
            <Icon icon="lucide:dumbbell" className="h-8 w-8 text-primary" />
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

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md transition-colors ${isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-foreground-600 hover:bg-default-100'
                    }`
                  }
                >
                  <Icon icon={item.icon} className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span className="ml-3 text-sm">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Divider />

        <div className="p-4 space-y-3">
          {isOpen && userInfo && (
            <div className="px-2 py-2 bg-default-100 rounded-lg">
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
  );
};