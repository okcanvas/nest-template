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
  Min, 
  Max
} from 'class-validator';
import { EnumToString } from 'src/common/helpers/enumToString';
import { DayTypeEnum } from 'src/modules/enums';
import { ApiProperty  } from '@nestjs/swagger';

export class BoksaengProgressDto {

  @ApiProperty({
    example: 23,
  })
  @IsNotEmpty()
  @IsNumber()
  boksaengListId: number;

  @ApiProperty({
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  //@Min(0)
  //@Max(100)
  progress: number;

  @ApiProperty({
    example: 3600,
  })
  @IsNotEmpty()
  @IsNumber()
  time: number;


  
}


