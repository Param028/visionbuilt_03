import React, { useRef, useState } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertTriangle, X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Card ---
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div className={cn("glass-panel rounded-xl p-6", className)} {...props}>
      {className?.includes('hover:') ? null : <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none opacity-40"></div>}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// --- Button ---
interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  ...props 
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseStyles = "relative inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none overflow-hidden group border select-none";
  
  const variants = {
    primary: "bg-[rgba(33,37,41,0.72)] hover:bg-[rgba(73,80,87,0.78)] text-[#F8F9FA] border-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.12)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_44px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all duration-400 ease-out",
    secondary: "bg-[rgba(52,58,64,0.68)] hover:bg-[rgba(73,80,87,0.78)] text-[rgba(248,249,250,0.78)] hover:text-[#F8F9FA] border-[rgba(255,255,255,0.08)] backdrop-blur-md active:scale-[0.98] transition-all duration-400 ease-out",
    outline: "bg-transparent border-[rgba(255,255,255,0.08)] text-[rgba(248,249,250,0.78)] hover:text-[#F8F9FA] hover:bg-[rgba(73,80,87,0.78)] active:scale-[0.98] transition-all duration-400 ease-out",
    ghost: "bg-transparent border-transparent text-[rgba(248,249,250,0.56)] hover:text-[#F8F9FA] hover:bg-[rgba(52,58,64,0.68)] active:scale-[0.98] transition-all duration-400 ease-out"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-9 w-9 p-0"
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      buttonRef.current?.style.setProperty("--x", `${x}px`);
      buttonRef.current?.style.setProperty("--y", `${y}px`);
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Glare Effect Layer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div 
            className="absolute -inset-[100%] bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),rgba(255,255,255,0.08)_0%,transparent_50%)]" 
            style={{ willChange: "transform" }}
        />
      </div>

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : null}
        {children}
      </span>
    </motion.button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-xs font-semibold text-[rgba(248,249,250,0.78)] uppercase tracking-wider">{label}</label>}
      <input
        className={cn(
          "flex h-10 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-black/20 px-3 py-2 text-sm text-[#F8F9FA] placeholder:text-[rgba(248,249,250,0.4)] focus:outline-none focus:ring-2 focus:ring-[#B8C4D0]/10 focus:border-[#B8C4D0] transition-all duration-300",
          error && "border-red-500/50 focus:ring-red-500/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

// --- Textarea ---
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-xs font-semibold text-[rgba(248,249,250,0.78)] uppercase tracking-wider">{label}</label>}
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-black/20 px-3 py-2 text-sm text-[#F8F9FA] placeholder:text-[rgba(248,249,250,0.4)] focus:outline-none focus:ring-2 focus:ring-[#B8C4D0]/10 focus:border-[#B8C4D0] transition-all duration-300",
          error && "border-red-500/50 focus:ring-red-500/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

// --- Badge ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const styles = {
    default: "bg-secondary text-foreground border-divider",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-focus/30", styles[variant], className)}>
      {children}
    </span>
  );
};

// --- Tooltip ---
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={cn("relative flex items-center", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-content1 border border-divider rounded-lg text-xs text-foreground shadow-md backdrop-blur-md whitespace-normal w-[200px] text-center z-50 pointer-events-none"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-divider" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Confirmation Dialog ---
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, onClose, onConfirm, title, message, 
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md bg-content1 border border-divider rounded-2xl p-6 shadow-xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground"><X size={20} /></button>
        <div className="flex items-start gap-4">
           <div className={cn("p-3 rounded-full flex-shrink-0", variant === 'danger' ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500")}>
              <AlertTriangle size={24} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed mb-6">{message}</p>
              <div className="flex gap-3">
                  <Button variant="ghost" onClick={onClose} className="flex-1">{cancelText}</Button>
                  <Button 
                    onClick={onConfirm} 
                    className={cn("flex-1", variant === 'danger' ? "bg-rose-600 hover:bg-rose-700 text-white border-none shadow-none" : "")}
                  >
                      {confirmText}
                  </Button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
