import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions } from 'mongoose';
 
// 스키마 옵션
const options: SchemaOptions = {
  timestamps: true,
};
 
// MongoDB의 가장 작은 단위가 Document, 모듈에서 사용할 타입을 export 시켜줌
export type UserDocument = User & Document;

// @Schema() 데코레이터을 사용해서 스키마 정의
@Schema(options)
export class User extends Document {
  
  @Prop({
    required: true,
    unique: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
 
  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
 
  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
 
  @Prop()
  @IsString()
  imgUrl: string;
 
}
 
// User 클래스를 스키마로 만들어준다.
export const UserSchema = SchemaFactory.createForClass(User);