import React from 'react';
import { Alert, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface ErrorAlertProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onRetry, onDismiss }) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  if (!isVisible) return null;
  
  const title = error?.title || 'Error';
  const message = error?.message || 'Ha ocurrido un error inesperado';
  const details = error?.details || '';
  
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };
  
  return (
    <Alert 
      title={title}
      description={
        <div className="space-y-2">
          <p>{message}</p>
          {details && <p className="text-xs text-default-500">{details}</p>}
          <div className="flex gap-2 mt-2">
            {onRetry && (
              <Button 
                size="sm" 
                variant="flat" 
                color="primary"
                onPress={onRetry}
                startContent={<Icon icon="lucide:refresh-cw" className="h-4 w-4" />}
              >
                Reintentar
              </Button>
            )}
            <Button 
              size="sm" 
              variant="flat" 
              onPress={handleDismiss}
            >
              Cerrar
            </Button>
          </div>
        </div>
      }
      color="danger"
      className="mb-4"
      isVisible={isVisible}
    />
  );
};