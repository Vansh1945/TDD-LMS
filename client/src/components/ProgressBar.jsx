import React from 'react';

const ProgressBar = ({ progress }) => {
  const getProgressColor = () => {
    if (progress === 100) return 'from-green-400 to-green-600';
    if (progress >= 70) return 'from-blue-400 to-blue-600';
    if (progress >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-gray-400 to-gray-600';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className={`bg-gradient-to-r ${getProgressColor()} h-2.5 rounded-full transition-all duration-500 ease-in-out`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
