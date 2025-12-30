import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from './pricing.service';
import { RideStatus, Prisma } from '@prisma/client';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class RidesService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
    private gateway: AppGateway
  ) {}

  async requestRide(passengerId: number, data: { originLat: number, originLng: number, destLat: number, destLng: number, originAddress: string, destAddress: string }) {
    const estimate = await this.pricingService.estimateRide(data.originLat, data.originLng, data.destLat, data.destLng);

    const ride = await this.prisma.ride.create({
      data: {
        passengerId,
        ...data,
        estimatedPrice: estimate.estimatedPrice,
        distanceKm: estimate.distanceKm,
        durationMin: estimate.durationMin,
        status: RideStatus.REQUESTED
      }
    });

    // Notify nearby drivers via Socket
    this.gateway.notifyDriversOfNewRide(ride);

    return ride;
  }

  async acceptRide(userId: number, rideId: number) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new UnauthorizedException('User is not a driver');
    if (!driver.isApproved) throw new UnauthorizedException('Driver is not approved');

    // Transaction to ensure atomic acceptance
    const ride = await this.prisma.$transaction(async (prisma) => {
        const r = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!r) throw new NotFoundException('Ride not found');
        if (r.status !== RideStatus.REQUESTED) throw new BadRequestException('Ride is no longer available');

        return prisma.ride.update({
            where: { id: rideId },
            data: {
                driverId: driver.id,
                status: RideStatus.ACCEPTED,
                acceptedAt: new Date()
            },
            include: { passenger: true, driver: { include: { user: true } } }
        });
    });

    // Notify Passenger
    this.gateway.notifyPassengerRideUpdate(ride.passengerId, ride);

    return ride;
  }

  async updateStatus(rideId: number, status: RideStatus) {
    const ride = await this.prisma.ride.update({
        where: { id: rideId },
        data: {
            status,
            [status.toLowerCase() + 'At']: new Date() // Sets arrivedAt, startedAt, etc.
        },
        include: { passenger: true }
    });

    this.gateway.notifyPassengerRideUpdate(ride.passengerId, ride);
    return ride;
  }

  async completeRide(rideId: number) {
      // Finalize price, create payment pending
      const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
      if (!ride) throw new NotFoundException();

      const updatedRide = await this.prisma.ride.update({
          where: { id: rideId },
          data: {
              status: RideStatus.COMPLETED,
              completedAt: new Date(),
              finalPrice: ride.estimatedPrice // In real app, re-calculate based on actual GPS trace
          },
          include: { passenger: true }
      });

      this.gateway.notifyPassengerRideUpdate(updatedRide.passengerId, updatedRide);
      return updatedRide;
  }

  async getRideHistory(userId: number, role: 'PASSENGER' | 'DRIVER') {
      if (role === 'PASSENGER') {
          return this.prisma.ride.findMany({ where: { passengerId: userId }, orderBy: { requestedAt: 'desc' } });
      } else {
          // find driver ID first
          const driver = await this.prisma.driver.findUnique({ where: { userId } });
          if (!driver) return [];
          return this.prisma.ride.findMany({ where: { driverId: driver.id }, orderBy: { requestedAt: 'desc' } });
      }
  }
}
