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

    // 1. Buscar usuario
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException('El usuario no existe.');
    }

    // 2. Comparar (Asegúrate de que password sea "Linux" y user.password el hash)
    const isMatch = await this.utilService.comparePasswords(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }
     const payload1 = { sub: user.id, username: user.username};

    const [refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload1, { expiresIn: '7d' }),
    ]);
    // 3. Generar Payload
    const payload = { sub: user.id, username: user.username, refreshToken: refreshToken };

    // 4. Generar tokens (AccessToken: 60s, RefreshToken: 7d)
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '60s' })
    ]);

    // 5. Guardar Refresh Token en la base de datos
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      // message: 'Login exitoso',
      accessToken,
      refreshToken,
      // user: {
      //   id: user.id,
      //   username: user.username
      // }
    };
  }

  // --- Para el Refresh ---
async refresh(refreshToken: string) {
  try {
    // 1. Verificar que el token sea válido
    const payload = await this.jwtService.verifyAsync(refreshToken);
    
    // 2. Buscar usuario y verificar que el token coincida con el de la BD
    const user = await this.usersService.findOneByUsername(payload.username);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // 3. Generar nuevo Access Token (60s)
    const newAccessToken = this.jwtService.sign({ sub: user.id, username: user.username }, { expiresIn: '60s' });

    return { accessToken: newAccessToken };
  } catch (e) {
    throw new UnauthorizedException('Sesión expirada');
  }
}

// --- Para el Logout ---
async logout(userId: number) {
  // Borramos el token de la base de datos para invalidar sesiones
  await this.usersService.updateRefreshToken(userId, null);
  return { message: 'Sesión cerrada correctamente' };
}
}