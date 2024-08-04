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
import { LanguageEnum } from 'src/modules/enums';
import { EnumToString } from 'src/common/helpers/enumToString';

export class KakaoKeywordDto {

  @ApiProperty({ example: [
    "기축 통화는 국제 거래에 결제 수단으로 통용되고 환율 결정에 기준이 되는 통화이다.",
    "1960년 트리핀 교수는 브레턴우즈 체제 에서의 기축 통화인 달러화의 구조적 모순을 지적했다.",
    "한 국가의 재화와 서비스의 수출입 간 차이인 경상 수지는 수입이 수출을 초과하면 적자이고, 수출이 수입을 초과하면 흑자이다."
  ]})
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  sentences: string[];

  @ApiProperty({ example: 'ko' })
  @IsNotEmpty()
  @IsEnum(LanguageEnum, {
    message: `Invalid option. Valids options are ${EnumToString(LanguageEnum)}`,
  })
  lang: string;
}
