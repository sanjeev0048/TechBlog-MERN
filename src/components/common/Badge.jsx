import React from 'react';

const Badge = ({ label, variant = "primary", onClick, active = false, className = "" }) => {
  const getVariantStyles = () => {
    if (active) {
      return "bg-blue-600 text-white shadow-sm";
    }
    switch (variant) {
      case "secondary":
        return "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "danger":
        return "bg-red-50 text-red-700 border border-red-200";
      case "primary":
      default:
        return "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60";
    }
  };

  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-150";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseStyles} ${getVariantStyles()} ${className} cursor-pointer`}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={`${baseStyles} ${getVariantStyles()} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;
