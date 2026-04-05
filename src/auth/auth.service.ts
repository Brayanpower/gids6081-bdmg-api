import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UtilService } from '../common/services/util/util.service';
import { UsersService } from 'src/common/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly utilService: UtilService,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginDto: any) {
    const { username, password } = loginDto;

    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException('El usuario no existe.');
    }

    const isMatch = await this.utilService.comparePasswords(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }
    const payload1 = { sub: user.id, username: user.username };

    const [refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload1, { expiresIn: '7d' }),
    ]);
    const payload = { sub: user.id, username: user.username, refreshToken: refreshToken };

    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '60s' })
    ]);

    await this.usersService.updateRefreshToken(user.id, refreshToken);
    await this.usersService.updateActiveToken(user.id, accessToken);

    return { accessToken, refreshToken };
  }

 async refresh(refreshToken: string) {
  try {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const user = await this.usersService.findOneByUsername(payload.username);
    
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const newAccessToken = this.jwtService.sign(
      { sub: user.id, username: user.username },
      { expiresIn: '60s' }
    );

    await this.usersService.updateActiveToken(user.id, newAccessToken);

    return { accessToken: newAccessToken };
  } catch (e) {
    throw new UnauthorizedException('Sesión expirada');
  }
}

  async logout(userId: number) {
  await this.usersService.updateRefreshToken(userId, null);
  await this.usersService.updateActiveToken(userId, null);
  return { message: 'Sesión cerrada correctamente' };
}
}