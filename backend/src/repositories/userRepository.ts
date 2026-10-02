import { JsonDatabase } from '../config/jsonDatabase';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

const db = new JsonDatabase<User>('users');

export class UserRepository {
  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return db.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.findBy('email', email);
  }

  async findById(id: string): Promise<User | null> {
    return db.findById(id);
  }
}

export const userRepository = new UserRepository();
