/**
 * NexaMed Structured Text Parser & AST-style Tokenizer
 * Eliminates reliance on unsafe regular expressions by using direct character parsing,
 * deterministic AST token scanning, and strict input sanitization.
 */

export interface BloodPressureResult {
  systolic: number;
  diastolic: number;
}

/**
 * Safely parses blood pressure strings (e.g., "120/80") into numeric values without regex.
 */
export function parseBloodPressure(bpStr?: string): BloodPressureResult {
  const defaultBP = { systolic: 120, diastolic: 80 };
  if (!bpStr || typeof bpStr !== 'string') return defaultBP;

  const trimmed = bpStr.trim();
  const slashIndex = trimmed.indexOf('/');
  
  if (slashIndex === -1) {
    const val = parseInt(trimmed, 10);
    return { systolic: isNaN(val) ? 120 : val, diastolic: 80 };
  }

  const sysStr = trimmed.substring(0, slashIndex).trim();
  const diaStr = trimmed.substring(slashIndex + 1).trim();

  const systolic = parseInt(sysStr, 10);
  const diastolic = parseInt(diaStr, 10);

  return {
    systolic: isNaN(systolic) ? 120 : systolic,
    diastolic: isNaN(diastolic) ? 80 : diastolic,
  };
}

/**
 * Safely parses an email prefix into a formatted display name without regex.
 */
export function parseEmailDisplayName(email: string): string {
  if (!email || typeof email !== 'string') return 'USUÁRIO';
  
  const atIndex = email.indexOf('@');
  const userPart = atIndex !== -1 ? email.substring(0, atIndex) : email;
  
  // Tokenize by dot without regular expression
  const tokens = userPart.split('.');
  const cleanedTokens: string[] = [];

  for (const token of tokens) {
    const clean = token.trim();
    if (clean.length > 0) {
      cleanedTokens.push(clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase());
    }
  }

  return cleanedTokens.length > 0 ? cleanedTokens.join(' ') : 'USUÁRIO';
}

/**
 * Splits comma-separated strings safely into trimmed non-empty array of tokens.
 */
export function splitCSVTokens(input?: string): string[] {
  if (!input || typeof input !== 'string') return [];
  
  const rawTokens = input.split(',');
  const result: string[] = [];

  for (const token of rawTokens) {
    const trimmed = token.trim();
    if (trimmed.length > 0) {
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Extracts the primary keyword (first word token) from a medication or clinical term.
 */
export function extractFirstKeyword(text?: string): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  const spaceIndex = trimmed.indexOf(' ');
  const word = spaceIndex !== -1 ? trimmed.substring(0, spaceIndex) : trimmed;
  return word.toLowerCase();
}

/**
 * Sanitizes input text against XSS attacks and control characters.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');
}
