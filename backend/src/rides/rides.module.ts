import { Module, forwardRef } from '@nestjs/common';
import { RidesService } from './rides.service';
import { PricingService } from './pricing.service';
import { RidesController } from './rides.controller';
import { PrismaService } from '../prisma/prisma.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [RidesController],
  providers: [RidesService, PricingService, PrismaService],
  exports: [RidesService],
})
export class RidesModule {}
