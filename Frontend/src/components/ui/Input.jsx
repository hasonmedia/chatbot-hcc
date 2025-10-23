/**
 * Simple Input Component
 * Clean, accessible input with consistent styling
 */
import React from 'react';

const Input = ({
    className = '',
    size = 'md',
    error = false,
    value,
    onChange,
    placeholder = "",
    type = "text",
    disabled = false,
    onKeyPress,
    ...props
}) => {
    // Base input styles
    const baseClasses = 'block w-full border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';

    // Size variants
    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-4 py-4 text-base'
    };

    // State variants
    const stateClasses = error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    const inputClasses = `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${className}`.trim();

    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClasses}
            {...props}
        />
    );
};

export { Input };
