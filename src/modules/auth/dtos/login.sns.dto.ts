import {
  IsString,
  IsNumber,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsEnum,
} from 'class-validator';
import { EnumToString } from 'src/common/helpers/enumToString';
import { SnsTypeEnum } from 'src/modules/enums';
import { ApiProperty  } from '@nestjs/swagger';

export class LoginSnsDto {

  @ApiProperty({ example: 'kakao' })
  @IsNotEmpty()
  @IsEnum(SnsTypeEnum, {
    message: `Invalid option. Valids options are ${EnumToString(SnsTypeEnum)}`,
  })
  loginType: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  snsId: string;

  @IsOptional()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  profileImage: string;

  @IsOptional()
  @IsString()
  accessToken: string;

}

