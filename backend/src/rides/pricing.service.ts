import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculatePrice(distanceKm: number, durationMin: number, isNight: boolean = false): Promise<number> {
    // Fetch pricing rules from DB or Config
    // Hardcoding Albania defaults for now
    const BASE_FARE = 300; // ALL
    const PRICE_PER_KM = 100; // ALL
    const PRICE_PER_MIN = 20; // ALL
    const NIGHT_SURCHARGE = 1.5; // 50% more

    let price = BASE_FARE + (distanceKm * PRICE_PER_KM) + (durationMin * PRICE_PER_MIN);

    if (isNight) {
      price *= NIGHT_SURCHARGE;
    }

    return Math.ceil(price);
  }

  async estimateRide(originLat: number, originLng: number, destLat: number, destLng: number) {
    // In a real app, use Google Maps Distance Matrix API here
    // Simulating Euclidean distance for now (rough approximation)
    const R = 6371; // km
    const dLat = (destLat - originLat) * Math.PI / 180;
    const dLon = (destLng - originLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(originLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;

    // Assume 30km/h average speed in city
    const durationMin = (distanceKm / 30) * 60;

    const price = await this.calculatePrice(distanceKm, durationMin);

    return {
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationMin: Math.ceil(durationMin),
      estimatedPrice: price
    };
  }
}
