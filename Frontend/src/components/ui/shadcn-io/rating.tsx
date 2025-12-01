'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingContextValue {
  value: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
}

const RatingContext = React.createContext<RatingContextValue | undefined>(
  undefined
);

const useRating = () => {
  const context = React.useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a Rating component');
  }
  return context;
};

interface RatingProps {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  ({ defaultValue = 0, value, onValueChange, disabled = false, children }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (newValue: number) => {
      if (disabled) return;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <RatingContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          disabled,
        }}
      >
        <div ref={ref} className="flex items-center gap-1">
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                index: index + 1,
              });
            }
            return child;
          })}
        </div>
      </RatingContext.Provider>
    );
  }
);

Rating.displayName = 'Rating';

interface RatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  index?: number;
}

export const RatingButton = React.forwardRef<
  HTMLButtonElement,
  RatingButtonProps
>(({ index = 1, className, ...props }, ref) => {
  const { value, onValueChange, disabled } = useRating();
  const isFilled = index <= value;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      onClick={() => onValueChange?.(index)}
      disabled={disabled}
      {...props}
    >
      <Star
        className={cn(
          'h-6 w-6 transition-colors',
          isFilled
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-muted stroke-muted-foreground'
        )}
      />
    </button>
  );
});

RatingButton.displayName = 'RatingButton';
