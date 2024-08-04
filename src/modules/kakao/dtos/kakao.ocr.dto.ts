import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty  } from '@nestjs/swagger';

export class KakaoOcrDto {

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  serviceId: number;
  
  @ApiProperty({ example: '질문내용' })
  @IsNotEmpty()
  @IsString()
  message: string;


}
