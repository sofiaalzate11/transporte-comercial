import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByDocument(registerDto.documento);
    if (existing) {
      throw new ConflictException('El documento ya está registrado en el sistema');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.usersService.create({
      nombre: registerDto.nombre,
      documento: registerDto.documento,
      rol: registerDto.rol,
      passwordHash,
    });

    const token = this.generateToken(user.id, user.documento, user.rol);
    return {
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol, documento: user.documento },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByDocument(loginDto.documento);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.documento, user.rol);
    return {
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol, documento: user.documento },
      token,
    };
  }

  private generateToken(userId: string, documento: string, rol: string): string {
    const payload = { sub: userId, documento, rol };
    return this.jwtService.sign(payload);
  }
}
