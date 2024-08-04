import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { EnumToString } from 'src/common/helpers/enumToString';

export class NewsDto {
  
  @IsArray()
  @IsNotEmpty()
  article: any[];

}
