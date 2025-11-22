import { headers } from 'next/headers';

// Simple in-memory store for rate limiting
// Note: This will reset if the serverless function/container restarts. 
// For production, use Redis or a database.
const rateLimitMap = new Map<string, { count: number; startTime: number }>();

/**
 * Rate Limit check
 * @param limit Max requests allowed
 * @param windowMs Time window in milliseconds
 * @returns true if request is within limit, false if exceeded
 */
export const rateLimit = async (limit: number = 20, windowMs: number = 60000): Promise<boolean> => {
  const headersList = await headers();
  // Use x-forwarded-for for proxied requests, fallback to unknown
  const ip = headersList.get('x-forwarded-for') || 'unknown-ip';
  
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, startTime: now };

  // Reset if window passed
  if (now - record.startTime > windowMs) {
    record.count = 0;
    record.startTime = now;
  }

  record.count++;
  rateLimitMap.set(ip, record);

  return record.count <= limit;
};

/**
 * Sanitize input text to remove HTML and scripts
 */
export const sanitize = (text: string): string => {
  if (!text) return '';
  // Remove HTML tags
  const stripped = text.replace(/<[^>]*>?/gm, '');
  // Basic trim
  return stripped.trim();
};

/**
 * Basic Spam Detection Heuristics
 */
export const isSpam = (text: string): boolean => {
  if (!text) return false;
  
  // 1. Length Check (Arbitrary limit, can be adjusted)
  if (text.length > 5000) return true;

  // 2. Caps Lock Abuse (> 70% caps if length > 50)
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const capsRatio = capsCount / text.length;
  if (text.length > 50 && capsRatio > 0.7) return true;

  // 3. Link Flooding (> 3 links)
  const linkCount = (text.match(/http/gi) || []).length;
  if (linkCount > 3) return true;

  // 4. Repeating characters flood (e.g., "goooooood")
  if (/(.)\1{9,}/.test(text)) return true;

  return false;
};
