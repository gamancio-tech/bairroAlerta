import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// O bcrypt já gera e embute o salt no hash, não é preciso adicionar outro.
export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);
