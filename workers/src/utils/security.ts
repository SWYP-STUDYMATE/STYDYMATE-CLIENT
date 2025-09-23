export async function hashSha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateState(prefix: string = 'state'): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function sanitizeFileName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

export function assertEnvVar(value: string | undefined, variableName: string): string {
  if (!value) {
    throw new Error(`Environment variable ${variableName} is required`);
  }
  return value;
}

