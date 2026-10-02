import bcrypt from 'bcrypt';
import {randomBytes} from 'crypto';

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex');
  return await bcrypt.hash(password + salt, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
