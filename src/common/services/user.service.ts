
import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'src/generated/prisma/client';
import { PrismaService } from './prisma.service';
import { UtilService } from './util/util.service';


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private readonly utilService: UtilService,
  ) { }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    // Encriptar la contraseña antes de guardar
    const hashedPassword = await this.utilService.hashPassword(data.password);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword, // Guardamos la contraseña encriptada
      },
    });
  }

  async findOneByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }


  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async updateActiveToken(userId: number, token: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { activeToken: token },
    });
  }
  async findOneById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
