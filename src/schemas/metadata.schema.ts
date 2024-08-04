import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString, IsObject } from 'class-validator';
import { Document, SchemaOptions } from 'mongoose';
 
// 스키마 옵션
const options: SchemaOptions = {
  timestamps: true,
};
 
// MongoDB의 가장 작은 단위가 Document, 모듈에서 사용할 타입을 export 시켜줌
export type MetaDataDocument = MetaData & Document;

// @Schema() 데코레이터을 사용해서 스키마 정의
@Schema(options)
export class MetaData extends Document {
   
  @Prop()
  @IsString()
  _dataset: string;
 
  @Prop()
  @IsString()
  _collection: string;
 
  @Prop()
  @IsString()
  publisher: string;
 
  @Prop()
  @IsString()
  publishDate: string;
 
  @Prop()
  @IsString()
  publishYear: string;
 
  @Prop()
  @IsString()
  title: string;
 
  @Prop()
  @IsString()
  content: string;
 
  @Prop()
  @IsString()
  creator: string;
 
  @Prop()
  @IsString()
  imgUrl: string;
 
  @Prop()
  @IsString()
  schemeURI: string;
 
  @Prop()
  @IsString()
  keyword: string;
 
  @Prop({
    type: {
      id: {
        type: Number
      }, 
      table: {
        type: String
      },
      database: {
        type: String
      }
    }
  })
  resourceInfo: {
    id: number, 
    table: string,
    database: string,
  };

 
}
 
// User 클래스를 스키마로 만들어준다.
export const MetaDataSchema = SchemaFactory.createForClass(MetaData);