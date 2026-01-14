import React from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { authApi, decodeToken, getUserRole } from '../../services/api';

import { Badge, ScrollShadow } from '@heroui/react';
import { usePagos } from '../../hooks/usePagos';
import { pagosApi } from '../../services/pagos.service';
import { Pago } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const role = getUserRole();
  const tokenData = decodeToken();
  const userName = tokenData?.nombre || tokenData?.sub || 'Usuario';
  const { pagos, refresh } = usePagos();
  const unreadPagos = React.useMemo(() => pagos.filter(p => !p.visto), [pagos]);

  const unreadCount = React.useMemo(() => {
    if (role === 'CLIENTE') return 0;
    return unreadPagos.length;
  }, [unreadPagos, role]);

  const handleNotificationClick = async (pago: Pago) => {
    if (!pago.visto) {
      try {
        await pagosApi.marcarVisto(pago.id);
        refresh();
      } catch (error) {
        console.error("Error marking as viewed:", error);
      }
    }
    navigate('/pagos');
  };

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
      case 'view-all':
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
          <Dropdown placement="bottom-end" classNames={{ content: "w-[340px] p-0 overflow-hidden" }}>
            <DropdownTrigger>
              <Button
                variant="light"
                isIconOnly
                aria-label="Notifications"
                className="relative"
              >
                <Badge
                  content={unreadCount > 9 ? '+9' : unreadCount}
                  color="danger"
                  isInvisible={unreadCount === 0}
                  shape="circle"
                  size="sm"
                  className="border-2 border-background"
                >
                  <Icon icon="lucide:bell" className="h-5 w-5" />
                </Badge>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Notificaciones"
              className="p-0"
              onAction={(key) => {
                if (key === 'view-all') handleAction(key);
                else {
                  const pago = unreadPagos.find(p => p.id === Number(key));
                  if (pago) handleNotificationClick(pago);
                }
              }}
            >
              <DropdownItem key="header" isReadOnly className="h-12 border-b border-default-100 dark:border-default-50 cursor-default px-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Notificaciones</span>
                  <Button size="sm" variant="light" color="primary" className="h-7 px-2 min-w-0" onPress={() => navigate('/pagos')}>
                    Ver todo
                  </Button>
                </div>
              </DropdownItem>

              <DropdownItem key="content" isReadOnly className="p-0 hover:bg-transparent">
                <ScrollShadow className="max-h-[380px]">
                  {unreadPagos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-default-50/50">
                      <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center mb-3">
                        <Icon icon="lucide:bell-off" className="text-default-400 w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-default-600">No hay notificaciones nuevas</p>
                      <p className="text-xs text-default-400 mt-1">Te avisaremos cuando recibas un pago</p>
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-default-100">
                      {unreadPagos.slice(0, 5).map((pago) => (
                        <div
                          key={pago.id}
                          className="flex gap-3 p-4 hover:bg-default-50 transition-colors cursor-pointer group"
                          onClick={() => handleNotificationClick(pago)}
                        >
                          <div className="flex-shrink-0 relative">
                            <Avatar
                              name={pago.nombreCliente || 'C'}
                              size="sm"
                              className="bg-primary/10 text-primary border border-primary/20"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                            <p className="text-xs font-semibold text-default-900 truncate">
                              {pago.nombreCliente || 'Nuevo Pago'}
                            </p>
                            <p className="text-[11px] text-default-500 leading-tight">
                              Solicitud de pago para <span className="font-medium text-default-700">{pago.nombreRutina || 'Rutina'}</span>
                            </p>
                            <span className="text-[10px] text-default-400 mt-1 flex items-center gap-1">
                              <Icon icon="lucide:clock" className="w-3 h-3" />
                              {formatDistanceToNow(new Date(pago.fechaCreacion), { addSuffix: true, locale: es })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollShadow>
              </DropdownItem>

              <DropdownItem key="view-all" className="h-11 border-t border-default-100 text-center text-primary font-medium hover:bg-primary/5 transition-colors">
                Ver todas las notificaciones
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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