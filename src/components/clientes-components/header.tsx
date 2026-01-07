import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
    action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    showBackButton = false,
    action
}) => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-divider">
            <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center gap-3">
                    {showBackButton && (
                        <Button
                            isIconOnly
                            variant="light"
                            aria-label="Volver"
                            onPress={() => navigate(-1)}
                            className="text-foreground"
                        >
                            <Icon icon="lucide:arrow-left" width={20} />
                        </Button>
                    )}
                    <h1 className="text-lg font-semibold">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {action}
                    <Button
                        isIconOnly
                        variant="light"
                        color="danger"
                        aria-label="Cerrar sesión"
                        onPress={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}
                    >
                        <Icon icon="lucide:log-out" width={20} />
                    </Button>
                </div>
            </div>
        </header>
    );
};