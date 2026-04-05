import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true, // ← necesario para acceder al token raw
    });
  }

  async validate(req: Request, payload: any) {
    // Extrae el token del header Authorization
    const token = req.headers['authorization']?.split(' ')[1];

    // Busca el usuario en BD
    const user = await this.usersService.findOneById(payload.sub);

    // Verifica que el token coincida con el activo en BD
    if (!user || user.activeToken !== token) {
      throw new UnauthorizedException('Sesión inválida. Inicia sesión de nuevo.');
    }

    return { userId: payload.sub, username: payload.username };
  }
}