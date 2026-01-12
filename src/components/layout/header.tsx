import React from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { authApi, decodeToken, getUserRole } from '../../services/api';

import { Badge } from '@heroui/react';
import { usePagos } from '../../hooks/usePagos';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const role = getUserRole();
  const tokenData = decodeToken();
  const userName = tokenData?.nombre || tokenData?.sub || 'Usuario';
  const { pagos } = usePagos();

  const unreadCount = React.useMemo(() => {
    if (role === 'CLIENTE') return 0;
    return pagos.filter(p => !p.visto).length;
  }, [pagos, role]);

  const handleAction = (key: React.Key) => {
    switch (key) {
      case 'profile':
        if (role === 'ENTRENADOR') {
          navigate('/entrenador/perfil');
        } else {
          // For other roles, maybe a generic profile page later
          console.log('Profile for', role);
        }
        break;
      case 'logout':
        authApi.logout();
        navigate('/login');
        break;
      case 'notifications':
        navigate('/pagos');
        break;
      default:
        break;
    }
  };

  return (
    <header className="bg-content1 shadow-sm h-16 flex items-center px-4 md:px-6">
      <Button
        isIconOnly
        variant="light"
        aria-label="Menu"
        className="md:hidden"
        onPress={onMenuClick}
      >
        <Icon icon="lucide:menu" className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex justify-end items-center space-x-4">
        {role !== 'CLIENTE' && (
          <Badge
            content={unreadCount > 9 ? '+9' : unreadCount}
            color="danger"
            isInvisible={unreadCount === 0}
            shape="circle"
            size="sm"
          >
            <Button
              variant="light"
              isIconOnly
              aria-label="Notifications"
              onPress={() => navigate('/pagos')}
            >
              <Icon icon="lucide:bell" className="h-5 w-5" />
            </Button>
          </Badge>
        )}

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="light"
              className="flex items-center gap-2"
            >
              <Avatar
                name={userName}
                size="sm"
                className="transition-transform"
              />
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-[10px] text-default-400 capitalize">{role?.toLowerCase() || ''}</span>
              </div>
              <Icon icon="lucide:chevron-down" className="h-4 w-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" onAction={handleAction}>
            <DropdownItem key="profile" startContent={<Icon icon="lucide:user" className="h-4 w-4" />}>
              Mi Perfil
            </DropdownItem>
            <DropdownItem key="settings" startContent={<Icon icon="lucide:settings" className="h-4 w-4" />}>
              Configuración
            </DropdownItem>
            <DropdownItem key="logout" startContent={<Icon icon="lucide:log-out" className="h-4 w-4" />} className="text-danger" color="danger">
              Cerrar Sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};