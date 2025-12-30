import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('drivers/all')
  async getAllDrivers() {
      // Logic to fetch all drivers
      return this.usersService.findAllDrivers();
  }

  @Patch('drivers/:id/status')
  async approveDriver(@Param('id') id: string, @Body() body: { isApproved: boolean }) {
      return this.usersService.setDriverStatus(parseInt(id), body.isApproved);
  }
}
