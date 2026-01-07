import React from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
            </div>

            <Card className="max-w-md w-full bg-content1/80 backdrop-blur-md shadow-2xl border-none">
                <CardBody className="text-center py-12 px-8 flex flex-col items-center gap-6 z-10">
                    <div className="w-24 h-24 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-2 transform hover:scale-110 transition-transform duration-300">
                        <Icon icon="mdi:weight-lifter-off" width={48} height={48} />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-6xl font-black bg-gradient-to-r from-danger to-warning bg-clip-text text-transparent">
                            404
                        </h1>
                        <h2 className="text-2xl font-bold text-foreground">¿Perdiste el rumbo?</h2>
                        <p className="text-default-500 leading-relaxed">
                            Parece que la página que buscas no existe o ha sido movida. ¡Volvamos a ponerte en forma!
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full pt-6">
                        <Button
                            fullWidth
                            variant="bordered"
                            color="default"
                            startContent={<Icon icon="mdi:arrow-left" />}
                            onPress={() => navigate(-1)}
                            className="font-medium"
                        >
                            Volver
                        </Button>
                        <Button
                            fullWidth
                            color="primary"
                            variant="shadow"
                            startContent={<Icon icon="mdi:home" />}
                            onPress={() => navigate('/')}
                            className="font-bold"
                        >
                            Ir al Inicio
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
