import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    index: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    title,
    description,
    index
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Card className="border border-divider">
                <CardBody className="flex flex-col items-center text-center p-6">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Icon icon={icon} className="text-primary text-2xl" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{title}</h3>
                    <p className="text-foreground-500 text-small">{description}</p>
                </CardBody>
            </Card>
        </motion.div>
    );
};