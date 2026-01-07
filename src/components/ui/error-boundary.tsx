import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                    {/* Background Decor */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute bottom-10 left-10 w-96 h-96 bg-danger rounded-full blur-3xl"></div>
                        <div className="absolute top-10 right-10 w-64 h-64 bg-warning rounded-full blur-3xl"></div>
                    </div>

                    <Card className="max-w-md w-full bg-content1/80 backdrop-blur-md shadow-2xl border-none z-10">
                        <CardBody className="text-center py-12 px-8 flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-2 animate-pulse">
                                <Icon icon="mdi:alert-decagram" width={48} height={48} />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-4xl font-black text-danger">
                                    Algo salió mal
                                </h1>
                                <p className="text-default-500 leading-relaxed">
                                    Ha ocurrido un error inesperado en la aplicación. No te preocupes, podemos solucionarlo.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full pt-6">
                                <Button
                                    fullWidth
                                    variant="bordered"
                                    color="default"
                                    startContent={<Icon icon="mdi:home" />}
                                    onPress={() => window.location.href = '/'}
                                    className="font-medium"
                                >
                                    Volver al Inicio
                                </Button>
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="shadow"
                                    startContent={<Icon icon="mdi:refresh" />}
                                    onPress={() => window.location.reload()}
                                    className="font-bold"
                                >
                                    Recargar Página
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
