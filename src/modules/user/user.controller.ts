import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, EditUserDto, UserRegistrationDto } from './dtos';
import { User, Auth } from 'src/common/decorators';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { RolesBuilder, InjectRolesBuilder } from 'nest-access-control';
import { JwtService } from '@nestjs/jwt';
import { StudySummaryDto } from './dtos';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  @Auth()
  @ApiBearerAuth('access-token')
  @Get()
  async getAll() {
    const data = await this.userService.getAll();
    return data;
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Get('/getInfo')
  async getInfo(
    @User() user: any,
  ) {
    const data = await this.userService.getInfo(user.userId);
    return data;
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Put('update')
  async updateUserInfo(
    @User() user: any,
    @Body() dto: any,
  ) {
    return await this.userService.updateUserInfo(user.userId, dto);
  }

  /*
  @Auth()
  @ApiBearerAuth('access-token')
  @Get(':userId/info')
  async getInfo(@Param('userId') userId: number) {
    const data = await this.userService.getInfo(userId);
    return data;
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Get('/find/:snsId')
  async getFind(@Param('snsId') snsId: string) {
    const data = await this.userService.getFind(snsId);
    return data;
  }
  */


}
