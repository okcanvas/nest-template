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
import { SnsTypeEnum } from 'src/modules/enums';
import { ApiProperty  } from '@nestjs/swagger';

export class LoginUUIDDto {

  @ApiProperty({
    example: 'xxxx-xxxx-xxxx-xxxx'
  })
  @IsString()
  uuid: string;

  @ApiProperty({
    example: '홍길동'
  })
  @IsString()
  nickname: string;

  @ApiProperty({
    example: 'https://s3-boksaeng.s3.ap-northeast-2.amazonaws.com/images/1671857170280-8ae5c5ccb7bccf8547bc36e936a7dba9207f8a805f73b6cb7aecca99f113f4a9b94416b5f2d4bf1f31a9966fac447a6e'
  })
  @IsOptional()
  @IsString()
  profileImage: string;


  
}

