import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img
      className="w-20 h-16"
      src="/logo.png"
      alt="Public Administration Chatbot Logo"
      {...props}
    />
  );
};
const HamburgerIcon = ({
  className,
  ...props
}: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn("pointer-events-none", className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

// Types
export interface Navbar01NavLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface Navbar01Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar01NavLink[];
  signInText?: string;
  signInHref?: string;
  ctaText?: string;
  ctaHref?: string;
  onSignInClick?: () => void;
  onCtaClick?: () => void;
}

const pathToNavigationLinks = (pathname: string): Navbar01NavLink[] => {
  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment.length > 0);
  if (pathSegments.length === 0) {
    return [{ href: "/", label: "Trang chủ", active: true }];
  }
  const lastSegment = pathSegments[pathSegments.length - 1];
  const label = lastSegment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu mỗi từ
    .join(" ");

  return [
    {
      href: pathname, // Dùng đường dẫn đầy đủ
      label: label,
      active: true,
    },
  ];
};
export const Navbar01 = React.forwardRef<HTMLElement, Navbar01Props>(
  (
    {
      className,
      logo,
      signInText = "Xin chào, ",
      signInHref = "#signin",
      ctaText,
      ctaHref,
      onSignInClick,
      onCtaClick,
      ...props
    },
    ref
  ) => {
    const location = useLocation();
    const currentPathname = location.pathname;
    const currentNavigationLinks = pathToNavigationLinks(currentPathname);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };

      checkWidth();

      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <header
        ref={combinedRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                    variant="ghost"
                    size="icon"
                  >
                    <HamburgerIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-48 p-2">
                  <NavigationMenu className="max-w-none">
                    <h1 className="text-md font-semibold text-foreground">
                      {currentNavigationLinks[0]?.label || "Trang"}
                    </h1>
                  </NavigationMenu>
                </PopoverContent>
              </Popover>
            )}
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl">{logo}</div>
                <span className="hidden font-bold text-xl sm:inline-block">
                  Chatbot hành chính công
                </span>
              </button>
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={(e) => {
                e.preventDefault();
                if (onSignInClick) onSignInClick();
              }}
            >
              {signInText}
            </Button>
            <Button
              size="sm"
              className="text-sm font-medium px-4 h-9 rounded-md shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                if (onCtaClick) onCtaClick();
              }}
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </header>
    );
  }
);

Navbar01.displayName = "Navbar01";

export { Logo, HamburgerIcon };
