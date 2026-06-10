import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const { password: _, ...result } = user;
    return result;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = { sub: user.id, username: user.username };
    return {
      ...user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(data: { username: string; password: string; name: string; email?: string; phone?: string }) {
    const existing = await this.userService.findByUsername(data.username);
    if (existing) {
      throw new UnauthorizedException('用户名已存在');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userService.create({
      ...data,
      password: hashedPassword,
    });
    const { password: _, ...result } = user;
    const payload = { sub: result.id, username: result.username };
    return {
      ...result,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
