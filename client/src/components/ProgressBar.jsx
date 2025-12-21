import React from 'react';

const ProgressBar = ({ progress, showLabel = false, size = 'md' }) => {
  const getProgressColor = () => {
    if (progress === 100) return 'from-success to-success/80';
    if (progress >= 70) return 'from-primary to-secondary';
    if (progress >= 40) return 'from-warning to-warning/80';
    return 'from-text/30 to-text/40';
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-1.5';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  const getLabelSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-sm';
      default: return 'text-xs';
    }
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={`font-medium ${getLabelSize()} text-text`}>
            Progress
          </span>
          <span className={`font-semibold ${getLabelSize()} text-text`}>
            {progress}%
          </span>
        </div>
      )}
      
      <div className="w-full bg-background rounded-full overflow-hidden">
        <div
          className={`bg-gradient-to-r ${getProgressColor()} ${getHeight()} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        >
          {progress > 0 && progress < 100 && (
            <div className="h-full w-full bg-gradient-to-r from-white/20 to-transparent"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;