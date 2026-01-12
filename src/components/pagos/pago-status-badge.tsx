import React from 'react';
import { Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { EstadoPago } from '../../types';

interface PagoStatusBadgeProps {
    status: EstadoPago;
}

export const PagoStatusBadge: React.FC<PagoStatusBadgeProps> = ({ status }) => {
    const config = {
        APROBADO: {
            color: 'success' as const,
            icon: 'lucide:check-circle',
            label: 'Aprobado',
            variant: 'flat' as const
        },
        PENDIENTE: {
            color: 'warning' as const,
            icon: 'lucide:clock',
            label: 'Pendiente',
            variant: 'flat' as const
        },
        RECHAZADO: {
            color: 'danger' as const,
            icon: 'lucide:x-circle',
            label: 'Rechazado',
            variant: 'flat' as const
        }
    };

    const { color, icon, label, variant } = config[status];

    return (
        <Chip
            color={color}
            variant={variant}
            startContent={<Icon icon={icon} className="mx-1" />}
            className="capitalize font-medium"
            size="sm"
        >
            {label}
        </Chip>
    );
};
