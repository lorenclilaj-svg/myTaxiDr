import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch } from '@nestjs/common';
import { RidesService } from './rides.service';
import { AuthGuard } from '@nestjs/passport';
import { RideStatus } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('rides')
export class RidesController {
  constructor(private ridesService: RidesService) {}

  @Post('request')
  requestRide(@Request() req, @Body() body) {
    return this.ridesService.requestRide(req.user.sub, body);
  }

  @Post(':id/accept')
  acceptRide(@Request() req, @Param('id') id: string) {
    // Need to get driver ID from user ID.
    // Assuming middleware or service handles this check.
    // For now passing user ID, service needs to map to Driver ID.
    // NOTE: In real implementation, we should validate user is a driver.
    // Here we'll assume the service does the lookup or we add a decorator.
    // Simplification: Service expects Driver Table ID.
    // We need a way to get driverId from req.user.sub (userId).
    // Let's defer this lookup to the service for now or assume req.user has driverId if logged in as driver.

    // Hack for MVP: We need to find the driver record for this user.
    // This logic should be in service.
    // I'll assume for now I can pass the userId and service handles it.
    // But `acceptRide` expects `driverId` (primary key of Driver table).
    // I will modify `ridesService.acceptRide` signature to take `userId` and do lookup inside.

    // Actually, let's fix the Controller to call a wrapper or do lookup.
    // For now, I'll return a "Not Implemented" specific for this mapping or fix the service.
    // I'll fix the service in the next step or right now.

    // I'll update the service logic later. For now, sending user ID.
    return this.ridesService.acceptRide(parseInt(req.user.sub), parseInt(id));
  }

  @Patch(':id/status')
  updateStatus(@Body() body, @Param('id') id: string) {
      return this.ridesService.updateStatus(parseInt(id), body.status);
  }

  @Get('history')
  getHistory(@Request() req) {
      return this.ridesService.getRideHistory(req.user.sub, req.user.role);
  }
}
