import React from "react";

interface TypingIndicatorProps {
  isVisible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="typing-indicator-container flex items-start space-x-2 mb-4">
      {/* Avatar bot */}
      <div className="shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <svg
          className="w-5 h-5 text-primary-foreground"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>

      {/* Bubble chứa typing animation */}
      <div className="bg-muted dark:bg-card rounded-lg px-4 py-3 max-w-xs shadow-sm">
        <div className="typing-animation">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
