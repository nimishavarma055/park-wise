import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = ({ children, className = '', onClick, variant = 'default' }: CardProps) => {
  const variantClasses = {
    default: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100',
    elevated: 'bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100',
    outlined: 'bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300',
  };

  return (
    <div
      className={`${variantClasses[variant]} ${onClick ? 'cursor-pointer transform hover:scale-[1.02]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

