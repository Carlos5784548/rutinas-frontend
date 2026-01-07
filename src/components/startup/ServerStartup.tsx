import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export const ServerStartup: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[9999] text-white p-4">
            {/* Background ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full opacity-40 mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full opacity-40 mix-blend-screen" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative flex flex-col items-center max-w-md text-center z-10"
            >
                <motion.div
                    animate={{
                        boxShadow: ["0 0 0px rgba(79, 70, 229, 0)", "0 0 20px rgba(79, 70, 229, 0.5)", "0 0 0px rgba(79, 70, 229, 0)"]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="mb-10 p-8 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-md relative overflow-hidden"
                >
                    {/* Shine effect */}
                    <motion.div
                        className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                        animate={{ left: "200%" }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1 }}
                    />

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                        <Icon icon="lucide:loader-2" className="w-16 h-16 text-primary" />
                    </motion.div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon icon="lucide:dumbbell" className="w-8 h-8 text-white" />
                    </div>
                </motion.div>

                <h2 className="text-3xl font-bold mb-4 font-heading tracking-tight">
                    Conectando con el Servidor
                </h2>

                <p className="text-zinc-400 mb-8 leading-relaxed max-w-sm">
                    Estamos iniciando los servicios en la nube. <br />
                    <span className="text-zinc-500 text-sm">(Esto puede tomar hasta 50 segundos si el servidor estaba en reposo)</span>
                </p>

                <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-blue-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 50,
                            ease: "linear" // Approximate wake up time for Render free tier
                        }}
                    />
                </div>

                <motion.p
                    className="text-xs text-primary/80 font-medium"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    Preparando tu espacio de entrenamiento...
                </motion.p>
            </motion.div>
        </div>
    );
};
