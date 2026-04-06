import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dbo/login.dbo';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { UsersService } from 'src/common/services/user.service';
import { UtilService } from 'src/common/services/util/util.service';
import { AppException } from 'src/common/exeptions/app.exeptions';
import { JwtService } from '@nestjs/jwt';
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authSvc: AuthService, private readonly usersService: UsersService, private readonly utilService: UtilService,private readonly jwtService: JwtService) { }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException('El usuario no existe.');
    }
    const isMatch = await this.utilService.comparePasswords(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }
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
        const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findOneByUsername(payload.username);
    
    if (!user || user.refreshToken !== token) {
      throw new AppException('Token inválido o expirado', HttpStatus.FORBIDDEN,'2');
    }
    return this.authSvc.refresh(token);
  }

  @UseGuards(JwtAuthGuard) // Necesitamos saber quién es para borrar su token
  @Post('logout')
  async logout(@Request() req) {
    return this.authSvc.logout(req.user.userId);
  }
}