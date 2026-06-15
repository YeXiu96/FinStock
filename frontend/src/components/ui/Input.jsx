import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={`
            block w-full rounded-lg border shadow-sm
            focus:ring-primary-500 focus:border-primary-500 sm:text-sm
            ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            ${error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-neutral-300'}
            disabled:bg-neutral-100 disabled:text-neutral-500
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
