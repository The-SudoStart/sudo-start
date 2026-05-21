/**
 * Security utilities for SudoStart
 * Centralized validation, sanitization, and security helpers
 */

import { appCatalog } from './apps';

// Valid package IDs from the catalog (computed once for performance)
const VALID_PACKAGE_IDS = new Set(appCatalog.map((p) => p.id));

// Valid version ID patterns (alphanumeric, dots, hyphens, underscores, v prefix)
const VALID_VERSION_PATTERN = /^[a-zA-Z0-9._-]+$/;

// Valid package ID pattern (lowercase alphanumeric with hyphens)
const VALID_PACKAGE_ID_PATTERN = /^[a-z0-9-]+$/;

// Script ID pattern (alphanumeric only, for generated IDs)
const VALID_SCRIPT_ID_PATTERN = /^[a-z0-9]{10}$/;

// Dangerous shell characters that could enable command injection
const DANGEROUS_SHELL_CHARS = /[;&|`$(){}[\]\\'"\n\r<>]/;

// Path traversal patterns
const PATH_TRAVERSAL_PATTERN = /\.\.[\/\\]|^\/|\\|^\./;

/**
 * Validates that a package ID exists in the app catalog
 * Prevents prompt injection attacks via AI-generated package IDs
 */
export function isValidPackageId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (!VALID_PACKAGE_ID_PATTERN.test(id)) return false;
  return VALID_PACKAGE_IDS.has(id);
}

/**
 * Validates a version string to prevent command injection
 * Only allows safe characters: alphanumeric, dots, hyphens, underscores
 */
export function isValidVersion(version: string): boolean {
  if (!version || typeof version !== 'string') return false;
  // Must match safe pattern and not contain dangerous characters
  if (!VALID_VERSION_PATTERN.test(version)) return false;
  if (DANGEROUS_SHELL_CHARS.test(version)) return false;
  // Additional check: reasonable length
  if (version.length > 50) return false;
  return true;
}

/**
 * Sanitizes a version string for safe use in shell commands
 * Removes any potentially dangerous characters
 */
export function sanitizeVersion(version: string): string {
  if (!version || typeof version !== 'string') return '';
  // Remove all characters that aren't alphanumeric, dot, hyphen, or underscore
  return version.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 50);
}

/**
 * Validates a script share ID format
 * Script IDs are 10 character alphanumeric strings
 */
export function isValidScriptId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return VALID_SCRIPT_ID_PATTERN.test(id);
}

/**
 * Sanitizes a script ID to prevent path traversal
 */
export function sanitizeScriptId(id: string): string {
  if (!id || typeof id !== 'string') return '';
  // Remove any path separators and non-alphanumeric characters
  return id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
}

/**
 * Validates that a string doesn't contain path traversal attempts
 */
export function containsPathTraversal(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return PATH_TRAVERSAL_PATTERN.test(input);
}

/**
 * Validates that a string is safe for shell command interpolation
 * Checks for dangerous characters that could enable command injection
 */
export function isShellSafe(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return !DANGEROUS_SHELL_CHARS.test(input);
}

/**
 * Escapes a string for safe use in shell commands
 * Wraps in single quotes and handles embedded single quotes
 */
export function escapeShellArg(arg: string): string {
  if (!arg || typeof arg !== 'string') return "''";
  // Replace single quotes with '\'' (close quote, escaped quote, open quote)
  const escaped = arg.replace(/'/g, "'\\''");
  return `'${escaped}'`;
}

/**
 * Validates GROQ API key format
 * Groq keys start with "gsk_" and are alphanumeric with underscores
 */
export function isValidGroqApiKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  // Groq API keys start with 'gsk_' followed by alphanumeric and underscores
  return /^gsk_[a-zA-Z0-9]{32,}$/.test(key);
}

/**
 * Masks an API key for safe logging
 * Shows only first 8 and last 4 characters
 */
export function maskApiKey(key: string): string {
  if (!key || typeof key !== 'string' || key.length < 12) return '[REDACTED]';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

/**
 * Rate limiting store (in-memory, per-process)
 * For production, consider using Redis or similar
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining count
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window or expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return { allowed: true, remaining: maxRequests - 1, resetTime: newEntry.resetTime };
  }

  // Within existing window
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Cleans up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
