import React, { Children, cloneElement, createContext, isValidElement, useContext, useMemo, useState } from "react";

const cn = (...classes) => classes.flat().filter(Boolean).join(" ");

const sizeClasses = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-sm",
  lg: "h-10 px-6 text-base",
  icon: "h-9 w-9 p-0",
};

const variantClasses = {
  default: "bg-[#22C55E] text-white hover:bg-[#16A34A] border border-[#22C55E]",
  outline: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-900 border border-transparent hover:bg-gray-100",
  destructive: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
  link: "bg-transparent text-[#22C55E] underline-offset-4 hover:underline border border-transparent px-0",
};

export function Button({ className = "", variant = "default", size = "default", asChild = false, children, ...props }) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    sizeClasses[size] || sizeClasses.default,
    variantClasses[variant] || variantClasses.default,
    className,
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn(children.props.className || "", classes),
      ...props,
    });
  }

  return <button className={classes} {...props}>{children}</button>;
}

export function Input({ className = "", ...props }) {
  return <input className={cn("w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20", className)} {...props} />;
}

export function Label({ className = "", ...props }) {
  return <label className={cn("block text-sm font-medium text-gray-800", className)} {...props} />;
}

export function Badge({ className = "", variant = "default", ...props }) {
  const variants = {
    default: "bg-[#22C55E] text-white",
    secondary: "bg-gray-100 text-gray-900",
    outline: "border border-gray-300 text-gray-900 bg-white",
    destructive: "bg-red-600 text-white",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant] || variants.default, className)} {...props} />;
}

export function Separator({ className = "", ...props }) {
  return <hr className={cn("border-0 border-t border-gray-200", className)} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={cn("min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20", className)} {...props} />;
}

export function Switch({ checked, defaultChecked = false, onCheckedChange, ...props }) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const active = isControlled ? checked : internalChecked;
  const toggle = () => {
    const next = !active;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  };
  return (
    <button type="button" role="switch" aria-checked={active} onClick={toggle} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", active ? "bg-[#22C55E]" : "bg-gray-300")} {...props}>
      <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white transition-transform", active ? "translate-x-5" : "translate-x-1")} />
    </button>
  );
}

export function ConfirmDialog({
  open,
  title = "Please confirm",
  description = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-3 text-sm text-gray-600">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>{cancelText}</Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className = "", children }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value ?? internalValue;
  const setValue = (next) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const contextValue = useMemo(() => ({ value: activeValue, setValue }), [activeValue]);
  return <TabsContext.Provider value={contextValue}><div className={className}>{children}</div></TabsContext.Provider>;
}

export function TabsList({ className = "", children }) {
  return <div className={cn("inline-grid rounded-xl bg-gray-100 p-1", className)}>{children}</div>;
}

export function TabsTrigger({ value, className = "", children }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;
  return <button type="button" onClick={() => ctx?.setValue(value)} className={cn("inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors", active ? "bg-[#22C55E] text-white shadow" : "text-gray-600 hover:bg-white hover:text-[#22C55E]", className)}>{children}</button>;
}

export function TabsContent({ value, className = "", children }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className={className}>{children}</div>;
}

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export function ImageWithFallback({ className = "", src, alt, style, ...props }) {
  const [didError, setDidError] = useState(false);
  if (didError) {
    return <div className={cn("inline-block bg-gray-100 text-center align-middle", className)} style={style}><div className="flex h-full w-full items-center justify-center"><img src={ERROR_IMG_SRC} alt="Error loading image" {...props} data-original-url={src} /></div></div>;
  }
  return <img src={src} alt={alt} className={className} style={style} {...props} onError={() => setDidError(true)} />;
}
