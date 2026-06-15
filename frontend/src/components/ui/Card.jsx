import React from 'react';

const Card = ({ children, className = '', title, subtitle, action, noPadding = false, topBorderColor }) => {
  
  const getGradientClass = () => {
    switch (topBorderColor) {
      case 'primary': return 'from-[#002444] to-[#1a3a5c]';
      case 'success': return 'from-[#006c4e] to-[#83f5c6]'; 
      case 'warning': return 'from-[#653e00] to-[#ffecc7]';
      case 'danger': return 'from-[#ba1a1a] to-[#ffdad6]';
      case 'indigo': return 'from-[#002444] to-[#1a3a5c]';
      default: return ''; 
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#c3c6cf]/40 overflow-hidden relative ${className}`}>
      {topBorderColor && (
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getGradientClass()}`}></div>
      )}
      {(title || action) && (
        <div className={`px-6 py-4 flex justify-between items-center bg-white ${noPadding ? 'border-b border-[#c3c6cf]/30' : ''}`}>
          <div>
            {title && <h3 className="text-sm font-bold text-neutral-800">{title}</h3>}
            {subtitle && <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default Card;


