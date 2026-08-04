import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

export function isBcryptHash(password: string): boolean {
  return /^\$2[aby]?\$/.test(password);
}
