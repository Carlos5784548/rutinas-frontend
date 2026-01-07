import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
  actionIcon?: string;
  onActionClick?: () => void;
  backLink?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionLabel,
  actionPath,
  actionIcon = 'lucide:plus',
  onActionClick,
  backLink
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        {backLink && (
          <Link 
            to={backLink}
            className="flex items-center text-sm text-default-600 hover:text-primary mb-2"
          >
            <Icon icon="lucide:arrow-left" className="h-4 w-4 mr-1" />
            Volver
          </Link>
        )}
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && <p className="text-default-600 mt-1">{description}</p>}
      </div>
      
      {(actionLabel && (actionPath || onActionClick)) && (
        <Button
          color="primary"
          as={actionPath ? Link : undefined}
          to={actionPath}
          onPress={onActionClick}
          startContent={<Icon icon={actionIcon} className="h-4 w-4" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};