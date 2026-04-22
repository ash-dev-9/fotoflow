"use client";

import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function Alert({
  type,
  title,
  message,
  onDismiss,
  dismissible = true,
}: AlertProps) {
  const styles = {
    success: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      icon: "text-green-500",
      title: "text-green-900",
      text: "text-green-800",
      button: "hover:bg-green-500/20",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "text-red-500",
      title: "text-red-900",
      text: "text-red-800",
      button: "hover:bg-red-500/20",
    },
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      icon: "text-yellow-500",
      title: "text-yellow-900",
      text: "text-yellow-800",
      button: "hover:bg-yellow-500/20",
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: "text-blue-500",
      title: "text-blue-900",
      text: "text-blue-800",
      button: "hover:bg-blue-500/20",
    },
  };

  const style = styles[type];
  const Icon =
    type === "success" ? CheckCircle : type === "error" ? XCircle : type === "warning" ? AlertCircle : Info;

  return (
    <div className={`${style.bg} ${style.border} rounded-lg border p-4`}>
      <div className="flex gap-3">
        <Icon className={`${style.icon} h-5 w-5 flex-shrink-0`} />
        <div className="flex-1">
          {title && <p className={`${style.title} font-semibold`}>{title}</p>}
          <p className={`${style.text} text-sm`}>{message}</p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${style.button} flex-shrink-0 rounded p-1 transition`}
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Form error display
 */
interface FormErrorProps {
  errors?: Record<string, string>;
  fieldName?: string;
}

export function FormError({ errors, fieldName }: FormErrorProps) {
  if (!errors) return null;

  const error = fieldName ? errors[fieldName] : Object.values(errors)[0];

  if (!error) return null;

  return (
    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {error}
    </p>
  );
}

/**
 * Field wrapper with error display
 */
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function FormField({ label, error, required, helperText, ...props }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition ${
          error
            ? "border-red-500/50 bg-red-500/5 text-slate-100 focus:border-red-500 focus:outline-none"
            : "border-white/10 bg-slate-950/50 text-slate-100 focus:border-[#5B7CFF] focus:outline-none"
        }`}
      />
      {error && <FormError fieldName="" errors={{ field: error }} />}
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

/**
 * Loading skeleton
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-700 ${className}`}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}

/**
 * Error boundary fallback
 */
interface ErrorBoundaryFallbackProps {
  error: Error;
  reset?: () => void;
}

export function ErrorBoundaryFallback({ error, reset }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] px-4">
      <div className="max-w-md text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 mb-6">{error.message}</p>
        {reset && (
          <button
            onClick={reset}
            className="inline-flex rounded-lg bg-[#5B7CFF] px-6 py-2 font-medium text-white transition hover:bg-[#7C4DFF]"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
