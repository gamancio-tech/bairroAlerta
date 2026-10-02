import { prisma } from '../config/prisma';
import { User } from '@prisma/client';

export { User };

export class UserRepository {
  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}

export const userRepository = new UserRepository();
