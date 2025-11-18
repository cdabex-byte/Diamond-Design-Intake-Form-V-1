import React from 'react';
import { Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  sublabel?: string;
}

export const Input: React.FC<InputProps> = ({ label, sublabel, className, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-diamond-400 mb-1">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    {sublabel && <p className="text-xs text-slate-400 mb-2">{sublabel}</p>}
    <input
      className={cn(
        "w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-diamond-500 focus:ring-1 focus:ring-diamond-500 transition-all",
        className
      )}
      {...props}
    />
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  sublabel?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, sublabel, className, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-diamond-400 mb-1">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    {sublabel && <p className="text-xs text-slate-400 mb-2">{sublabel}</p>}
    <textarea
      className={cn(
        "w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-diamond-500 focus:ring-1 focus:ring-diamond-500 transition-all min-h-[100px]",
        className
      )}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-diamond-400 mb-1">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    <select
      className={cn(
        "w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-diamond-500 focus:ring-1 focus:ring-diamond-500 transition-all",
        className
      )}
      {...props}
    >
      <option value="" disabled>Select an option</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, className }) => (
  <div 
    onClick={() => onChange(!checked)}
    className={cn("flex items-center gap-3 cursor-pointer group select-none", className)}
  >
    <div className={cn(
      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
      checked ? "bg-diamond-500 border-diamond-500" : "bg-slate-900 border-slate-700 group-hover:border-diamond-500/50"
    )}>
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>
    <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">{label}</span>
  </div>
);

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  withDetails?: boolean;
  detailsValue?: string;
  onDetailsChange?: (val: string) => void;
  detailsPlaceholder?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selected,
  onChange,
  withDetails,
  detailsValue,
  onDetailsChange,
  detailsPlaceholder
}) => {
  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-diamond-400 mb-2">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <div
              key={opt}
              onClick={() => toggleOption(opt)}
              className={cn(
                "cursor-pointer flex items-center p-3 rounded border transition-all",
                isSelected 
                  ? "bg-diamond-900/30 border-diamond-500 text-diamond-100" 
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:border-diamond-500/50"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center mr-3",
                isSelected ? "bg-diamond-500 border-diamond-500" : "border-slate-500"
              )}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">{opt}</span>
            </div>
          );
        })}
      </div>
      {withDetails && (
        <input
          type="text"
          value={detailsValue}
          onChange={(e) => onDetailsChange?.(e.target.value)}
          placeholder={detailsPlaceholder || "Other details..."}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-diamond-500"
        />
      )}
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 10 }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-2">
        <label className="block text-sm font-medium text-slate-300">{label}</label>
        <span className={cn(
          "font-mono text-lg font-bold",
          value < 5 ? "text-red-400" : "text-diamond-400"
        )}>
          {value}/{max}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-diamond-500"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Unused</span>
        <span>Fully Integrated</span>
      </div>
    </div>
  );
};