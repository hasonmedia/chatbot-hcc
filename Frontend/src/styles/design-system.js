/**
 * Design System Constants
 * Simple, consistent design tokens for the entire application
 */

// ===================== COLORS =====================
export const colors = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  
  // Neutral colors  
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  
  // Status colors
  success: '#16a34a',
  warning: '#d97706', 
  error: '#dc2626',
  info: '#0ea5e9'
};

// ===================== SPACING =====================
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px  
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem'    // 64px
};

// ===================== TYPOGRAPHY =====================
export const typography = {
  fontFamily: {
    base: 'Inter, system-ui, -apple-system, sans-serif'
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem' // 30px
  },
  fontWeight: {
    normal: '400',
    medium: '500', 
    semibold: '600',
    bold: '700'
  }
};

// ===================== BORDERS =====================
export const borders = {
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem'       // 16px
  },
  width: {
    thin: '1px',
    thick: '2px'
  }
};

// ===================== SHADOWS =====================  
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
};

// ===================== BREAKPOINTS =====================
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet  
  lg: '1024px',  // Desktop
  xl: '1280px'   // Large desktop
};

// ===================== COMPONENT STYLES =====================
export const components = {
  // Button variants
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    sizes: {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-sm rounded-lg', 
      lg: 'h-12 px-6 text-base rounded-lg'
    },
    variants: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'hover:bg-gray-100 focus:ring-gray-500'
    }
  },
  
  // Input styles
  input: {
    base: 'block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors',
    sizes: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-4 py-4 text-base'
    }
  },
  
  // Card styles
  card: {
    base: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    padding: {
      sm: 'p-4',
      md: 'p-6', 
      lg: 'p-8'
    }
  }
};

// ===================== UTILITIES =====================
export const utils = {
  // Screen reader only
  srOnly: 'sr-only',
  
  // Focus styles
  focusVisible: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  
  // Transition presets  
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out', 
    slow: 'transition-all duration-300 ease-in-out'
  }
};