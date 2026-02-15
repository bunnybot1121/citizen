import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden transition-all duration-300 active:scale-95 font-heading font-semibold rounded-2xl flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 border-b-4 border-brand-700 active:border-b-0 active:translate-y-1",
        secondary: "bg-secondary-700 text-white shadow-lg shadow-secondary-700/20 hover:bg-secondary-800 border-b-4 border-secondary-900 active:border-b-0 active:translate-y-1",
        outline: "border-2 border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100",
        ghost: "text-slate-600 hover:bg-black/5",
        white: "bg-white text-brand-600 shadow-md hover:bg-gray-50",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-3 text-sm",
        lg: "px-6 py-4 text-base w-full",
        icon: "w-10 h-10 p-0",
    };

    const sizeClass = props.size ? sizes[props.size] : sizes.md;

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white rounded-3xl p-5 shadow-soft border border-warm-200/50 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const Input = ({ icon: Icon, className = '', ...props }) => {
    return (
        <div className="relative">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <input
                className={`w-full bg-warm-50 border-2 border-transparent focus:border-brand-300 focus:bg-white rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300 font-body ${className}`}
                {...props}
            />
        </div>
    );
};
