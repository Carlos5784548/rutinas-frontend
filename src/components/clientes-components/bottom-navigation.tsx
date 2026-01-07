import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export const BottomNavigation = () => {
    const location = useLocation();

    const navItems = [
        { path: '/cliente-app', icon: 'lucide:home', label: 'Inicio' },
        { path: '/cliente-app/routines', icon: 'lucide:dumbbell', label: 'Rutinas' },
        { path: '/cliente-app/exercises', icon: 'lucide:list', label: 'Ejercicios' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-content1 shadow-lg border-t border-divider z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/cliente-app' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center justify-center w-1/3 h-full relative"
                        >
                            <div className="flex flex-col items-center justify-center">
                                <Icon
                                    icon={item.icon}
                                    className={`text-2xl ${isActive ? 'text-primary' : 'text-foreground-500'}`}
                                />
                                <span className={`text-tiny mt-1 ${isActive ? 'text-primary font-medium' : 'text-foreground-500'}`}>
                                    {item.label}
                                </span>
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="navigation-indicator"
                                    className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-t-md"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};