import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dbo/login.dbo';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authSvc: AuthService) {}
@Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authSvc.login(loginDto);
  }

@UseGuards(JwtAuthGuard)
@Get('me')
getProfile(@Request() req) {
  // Ahora req.user existe gracias a la JwtStrategy
  return req.user;
}

@Post('refresh')
async refresh(@Body('refreshToken') token: string) {
  return this.authSvc.refresh(token);
}

@UseGuards(JwtAuthGuard) // Necesitamos saber quién es para borrar su token
@Post('logout')
async logout(@Request() req) {
  return this.authSvc.logout(req.user.userId);
}
}