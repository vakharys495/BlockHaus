import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const iv = randomBytes(16);
const password = process.env.ENCRYPTION_KEY;

if (!password) {
  throw new Error('ENCRYPTION_KEY environment variable is not set');
}

export async function encrypt(text: string): Promise<string> {
  if (!password) throw new Error('Encryption not configured');
  
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const cipher = createCipheriv('aes-256-ctr', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export async function decrypt(encrypted: string): Promise<string> {
  if (!password) throw new Error('Encryption not configured');
  
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const decipher = createDecipheriv('aes-256-ctr', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}