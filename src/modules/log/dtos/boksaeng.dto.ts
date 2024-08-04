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
import { EnumToString } from 'src/common/helpers/enumToString';
import { BoksaengTypeEnum } from 'src/modules/enums';
import { ApiProperty  } from '@nestjs/swagger';

export class BoksaengDto {

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  subjectId: number;

  @ApiProperty({
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  subjectUnitId: number;

  @ApiProperty({
    example: '복생이 타이틀'
  })
  @IsNotEmpty()
  @IsString()
  title: string;
  
  @ApiProperty({
    example: [
      {
        type: 'image',
        index: 1, 
        url: 'https://...',
        data: ['필요한 정보'],
        size: 123456,
      },
      {
        type: 'video',
        index: 2, 
        url: 'https://...',
        data: ['필요한 정보'],
        size: 123456,
      }
    ],
  })
  @IsArray()
  @IsNotEmpty()
  contents: any[];

  @ApiProperty({
    example: ['2023-01-01 08:00:00'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  dates: any[];

  
  
}

//  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjI0LCJpYXQiOjE2NzI4ODI2Njd9.koVupi4J9VgrdXRTfWIhHV9pYnC71muPuGqaXrXa0Rg
/*
[
  {"url": "", 
    "data": [], 
    "type": "image", 
    "index": 0
  }
]
*/
