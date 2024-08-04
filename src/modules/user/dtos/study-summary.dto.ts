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
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty  } from '@nestjs/swagger';

export class StudySummaryDto {

  @ApiProperty({ example: '2023-01-01' })
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2023-01-31' })
  @IsNotEmpty()
  @IsString()
  endDate: string;


}
