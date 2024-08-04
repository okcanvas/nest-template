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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EnumToString } from 'src/common/helpers/enumToString';
import { DayTypeEnum } from 'src/modules/enums';
import { ApiProperty  } from '@nestjs/swagger';

//boksaengId = -1(default,전체검색)
//categorySubjectId = -1(default,전체검색)
//times = -1(default)
export class BoksaengSearchDto {

  @ApiProperty({ example: -1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  boksaengId: number;

  @ApiProperty({ example: -1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categorySubjectId: number;

  @ApiProperty({ example: -1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  times: number;


  
}


