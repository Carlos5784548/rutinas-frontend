import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  actionPath?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'lucide:inbox',
  actionLabel,
  actionPath,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-default-100 rounded-full p-4 mb-4">
        <Icon icon={icon} className="h-8 w-8 text-default-500" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-default-600 max-w-md mb-6">{description}</p>
      
      {(actionLabel && (actionPath || onActionClick)) && (
        <Button
          color="primary"
          as={actionPath ? Link : undefined}
          to={actionPath}
          onPress={onActionClick}
          startContent={<Icon icon="lucide:plus" className="h-4 w-4" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};