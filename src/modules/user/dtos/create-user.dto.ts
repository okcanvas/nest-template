import {
  IsString,
  IsNumber,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { EnumToString } from 'src/common/helpers/enumToString';

export class CreateUserDto {

  @IsString()
  devideId: string;

  @IsOptional()
  @IsString()
  nickname: string;

  //@IsOptional()
  @IsNumber()
  categoryId: number;

}
