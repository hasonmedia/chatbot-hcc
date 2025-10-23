/**
 * Responsive Utilities
 * Consistent breakpoints and responsive helpers
 */

// Standard breakpoints (mobile-first)
export const breakpoints = {
  sm: '640px',   // Mobile landscape  
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px'   // Large desktop
};

// Responsive utility classes for consistency
export const responsive = {
  // Container classes
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Grid classes
  gridCols: {
    mobile: 'grid-cols-1',
    tablet: 'sm:grid-cols-2 md:grid-cols-3', 
    desktop: 'lg:grid-cols-4 xl:grid-cols-5'
  },
  
  // Text sizes
  text: {
    xs: 'text-xs',
    sm: 'text-sm sm:text-base',
    base: 'text-sm sm:text-base lg:text-lg',
    lg: 'text-base sm:text-lg lg:text-xl',
    xl: 'text-lg sm:text-xl lg:text-2xl'
  },
  
  // Spacing
  padding: {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6', 
    lg: 'p-6 sm:p-8'
  },
  
  margin: {
    sm: 'm-3 sm:m-4',
    md: 'm-4 sm:m-6',
    lg: 'm-6 sm:m-8'
  },
  
  // Gap
  gap: {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  }
};

// Media query hooks (if needed for JavaScript)
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    
    return () => media.removeListener(listener);
  }, [matches, query]);
  
  return matches;
};

// Common responsive patterns
export const responsivePatterns = {
  // Sidebar layout
  sidebar: {
    container: 'flex min-h-screen',
    sidebar: 'hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0',
    main: 'flex-1 lg:pl-64',
    mobileMenu: 'lg:hidden fixed inset-0 z-40'
  },
  
  // Card grid
  cardGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
  
  // Form layout  
  form: {
    container: 'max-w-2xl mx-auto',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
    field: 'space-y-1',
    actions: 'flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end'
  }
};