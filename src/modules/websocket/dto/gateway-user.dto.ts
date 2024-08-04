import {
  IsString,
  IsNumber,
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Socket } from 'socket.io';
import { ExtendedSocket } from '../interfaces/socket.interface';

export class gatewayUserDTO {
  socket: ExtendedSocket;
  userType: number;
  userId: number;
}

export class CommandDTO {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  command: string;
}