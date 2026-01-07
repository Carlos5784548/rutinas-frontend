import React from 'react';
import { Button, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerProps {
    duration: number;
    onComplete: () => void;
}

export const Timer: React.FC<TimerProps> = ({ duration, onComplete }) => {
    const [timeLeft, setTimeLeft] = React.useState(duration);
    const [isActive, setIsActive] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const intervalRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (isActive && !isPaused) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(intervalRef.current!);
                        setIsActive(false);
                        onComplete();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, isPaused, onComplete]);

    const startTimer = () => {
        setIsActive(true);
        setIsPaused(false);
    };

    const pauseTimer = () => {
        setIsPaused(true);
    };

    const resumeTimer = () => {
        setIsPaused(false);
    };

    const resetTimer = () => {
        setTimeLeft(duration);
        setIsActive(false);
        setIsPaused(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const progressValue = ((duration - timeLeft) / duration) * 100;

    return (
        <>
            <Button
                color="primary"
                variant="flat"
                onPress={onOpen}
                startContent={<Icon icon="lucide:timer" />}
                className="w-full"
            >
                Temporizador de descanso
            </Button>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Temporizador de descanso
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col items-center">
                                    <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                                        <Progress
                                            size="lg"
                                            value={progressValue}
                                            color="primary"
                                            showValueLabel={false}
                                            className="w-48 h-48 absolute"
                                            classNames={{
                                                indicator: "bg-primary",
                                                track: "bg-default-100"
                                            }}
                                        />
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={timeLeft}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-4xl font-semibold"
                                            >
                                                {formatTime(timeLeft)}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        {!isActive ? (
                                            <Button
                                                color="primary"
                                                onPress={startTimer}
                                                startContent={<Icon icon="lucide:play" />}
                                            >
                                                Iniciar
                                            </Button>
                                        ) : isPaused ? (
                                            <Button
                                                color="primary"
                                                onPress={resumeTimer}
                                                startContent={<Icon icon="lucide:play" />}
                                            >
                                                Continuar
                                            </Button>
                                        ) : (
                                            <Button
                                                color="warning"
                                                onPress={pauseTimer}
                                                startContent={<Icon icon="lucide:pause" />}
                                            >
                                                Pausar
                                            </Button>
                                        )}

                                        <Button
                                            color="danger"
                                            variant="light"
                                            onPress={resetTimer}
                                            startContent={<Icon icon="lucide:refresh-cw" />}
                                        >
                                            Reiniciar
                                        </Button>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};