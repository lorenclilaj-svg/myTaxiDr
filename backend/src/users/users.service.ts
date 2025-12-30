import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });
    // Auto-create driver profile if role is DRIVER (simplification for MVP)
    if (user.role === 'DRIVER') {
        await this.prisma.driver.create({ data: { userId: user.id } });
    }
    return user;
  }

  async setDriverStatus(userId: number, isApproved: boolean) {
    // Check if driver profile exists, if not create one
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { driverProfile: true } });
    if (!user) throw new Error('User not found');

    if (user.driverProfile) {
        return this.prisma.driver.update({
            where: { userId },
            data: { isApproved }
        });
    } else {
        return this.prisma.driver.create({
            data: {
                userId,
                isApproved
            }
        });
    }
  }

  async findAllDrivers() {
      return this.prisma.driver.findMany({
          include: { user: true }
      });
  }
}
