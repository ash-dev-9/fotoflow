/**
 * Validation utilities for common patterns
 */

import { ValidationError } from "./errors";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

/**
 * Validate a single field
 */
export function validateField(
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | null {
  // Check if required
  if (rules.required && (!value || value.toString().trim() === "")) {
    return `${fieldName} is required`;
  }

  if (!value) return null;

  const stringValue = value.toString().trim();

  // Check minimum length
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }

  // Check maximum length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `${fieldName} must be at most ${rules.maxLength} characters`;
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return `${fieldName} is invalid`;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

/**
 * Validate multiple fields
 */
export function validateFields(
  data: Record<string, any>,
  schema: Record<string, ValidationRule>
): { valid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules, field);
    if (error) {
      errors[field] = error;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Common validation rules
 */
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 8,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  eventName: {
    required: true,
    minLength: 3,
    maxLength: 200,
  },
  url: {
    required: true,
    pattern: /^https?:\/\/.+/,
  },
};

/**
 * Sanitize and validate string input
 */
export function sanitizeString(value: any, maxLength: number = 1000): string {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): string | null {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"],
  } = options;

  if (!file) {
    return "File is required";
  }

  // Check file size
  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / 1024 / 1024}MB`;
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    return `File type must be one of: ${allowedMimeTypes.join(", ")}`;
  }

  // Check file extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) {
    return `File extension must be one of: ${allowedExtensions.join(", ")}`;
  }

  return null;
}

/**
 * Validate date
 */
export function validateDate(value: any): { valid: boolean; date?: Date; error?: string } {
  if (!value) {
    return { valid: false, error: "Date is required" };
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  if (date < new Date()) {
    return { valid: false, error: "Date must be in the future" };
  }

  return { valid: true, date };
}

/**
 * Assert validation - throws ValidationError if invalid
 */
export function assertValid(
  data: Record<string, any>,
  schema: Record<string, ValidationRule>
): asserts data {
  const result = validateFields(data, schema);
  if (!result.valid) {
    throw new ValidationError("Validation failed", result.errors);
  }
}
