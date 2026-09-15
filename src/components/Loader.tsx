import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full py-16">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-[#FF2625] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 bg-[#FF2625] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 bg-[#FF2625] rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default Loader;
