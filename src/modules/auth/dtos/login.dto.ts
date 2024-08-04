import {
  IsString,
  IsNumber,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsEnum,
  IsNotEmpty
} from 'class-validator';
import { EnumToString } from 'src/common/helpers/enumToString';
import { SexTypeEnum } from 'src/modules/enums';
import { ApiProperty  } from '@nestjs/swagger';

export class LoginDto {

  @ApiProperty({ example: 'okcanvas@naver.com' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'mbs123' })
  @IsNotEmpty()
  @IsString()
  password: string;

}


