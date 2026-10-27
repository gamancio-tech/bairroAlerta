import type { User } from '@prisma/client';
import { prisma } from '../config/prisma';

export type { User };

export type NewUser = Pick<User, 'name' | 'email' | 'password'>;

export class UserRepository {
  async create(data: NewUser): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}

export const userRepository = new UserRepository();
