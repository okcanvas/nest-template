import {
  IsString,
  IsNumber,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { EnumToString } from 'src/common/helpers/enumToString';
import { SexTypeEnum, OSTypeEnum } from 'src/modules/enums';
import { ApiProperty  } from '@nestjs/swagger';

export class ProfileDto {

  @ApiProperty({ example: '홍길동' })
  @IsOptional()
  @IsString()
  nickname: string;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 'xxxx-xxxx-xxxx-xxxx' })
  @IsOptional()
  @IsString()
  pushToken: string;

  @ApiProperty({ example: 'https://s3-boksaeng.s3.ap-northeast-2.amazonaws.com/images/1671857170280-8ae5c5ccb7bccf8547bc36e936a7dba9207f8a805f73b6cb7aecca99f113f4a9b94416b5f2d4bf1f31a9966fac447a6e' })
  @IsOptional()
  @IsString()
  profileImage: string;

  @ApiProperty({ example: 'male' })
  @IsOptional()
  @IsEnum(SexTypeEnum, {
    message: `Invalid option. Valids options are ${EnumToString(SexTypeEnum)}`,
  })
  sex: string;

  @ApiProperty({ example: 'android' })
  @IsOptional()
  @IsEnum(OSTypeEnum, {
    message: `Invalid option. Valids options are ${EnumToString(OSTypeEnum)}`,
  })
  osType: string;

  @ApiProperty({ example: '2023-01-01' })
  @IsOptional()
  @IsString()
  birthday: string;

  @ApiProperty({ example: true})
  @IsOptional()
  @IsBoolean()
  isPush: boolean;

  @ApiProperty({ example: '0.0.0' })
  @IsOptional()
  @IsString()
  version: string;

  @ApiProperty({ example: '자기소개' })
  @IsOptional()
  @IsString()
  intro: string;



}
