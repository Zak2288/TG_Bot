import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
      branchId: user.branchId
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId
      }
    };
  }

  async register(userData: Partial<User>) {
    // Проверяем, не существует ли уже пользователь с таким email
    if (userData.email) {
      const existingUser = await this.usersService.findByEmail(userData.email);
      if (existingUser) {
        throw new UnauthorizedException('User with this email already exists');
      }
    } else {
      throw new UnauthorizedException('Email is required');
    }

    // Создаем нового пользователя
    const newUser = await this.usersService.create(userData);
    
    // Возвращаем токен и данные пользователя
    return this.login(newUser);
  }
} 