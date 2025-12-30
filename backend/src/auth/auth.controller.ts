import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req) {
    // Ideally use DTO validation here
    const user = await this.authService.validateUser(req.phone, req.password);
    if (!user) {
        throw new Error("Invalid credentials");
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() req) {
    return this.authService.register(req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
