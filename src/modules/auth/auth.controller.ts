import { Controller, Post, Get, Put, UseGuards, Body, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
//import { Response as Res } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards';
import { User, Auth } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoginDto, LoginSnsDto, ProfileDto } from './dtos';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() dto: LoginDto, 
    @User() user: any,
    //@Response() res: Res
  )
  {
    return await this.authService.login(user);
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Post('logout')
  async logout(
    @User() user: any
  ) {
    return this.authService.logout(user.userId);
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Get('info')
  async info(
    @User() user: any
  ) {
    return await this.authService.info(user.userId);
  }


  @Auth()
  @ApiBearerAuth('access-token')
  @Get('profile')
  async profile(@User() user: any) {
    return await this.authService.profile(user.userId);
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Put('profile')
  async updateProfile(
    @User() user: any,
    @Body() dto: ProfileDto,
  ) {
    return await this.authService.update(user.userId, dto);
  }

  @Auth()
  @ApiBearerAuth('access-token')
  @Put('update')
  async updateUserInfo(
    @User() user: any,
    @Body() dto: ProfileDto,
  ) {
    return await this.authService.update(user.userId, dto);
  }

  /*
  @ApiOperation({ summary: '카카오 로그인' }) 
  @Post('/kakao/login')
  async kakaoLogin(
    @Body() dto: LoginSnsDto,
  ) {
    console.log(dto)
    const data = await this.authService.kakaoLogin(dto);
    console.log(data)
    return data;
  }

  @ApiOperation({ summary: '네이비 로그인' }) 
  @Post('/naver/login')
  async naverLogin(
    @Body() dto: LoginSnsDto,
  ) {
    return await this.authService.naverLogin(dto);
  }

  @ApiOperation({ summary: 'Google 로그인' }) 
  @Post('/google/login')
  async googleLogin(
    @Body() dto: LoginSnsDto,
  ) {
    return await this.authService.googleLogin(dto);
  }

  @ApiOperation({ summary: 'Apple 로그인' }) 
  @Post('/apple/login')
  async appleLogin(
    @Body() dto: LoginSnsDto,
  ) {
    return await this.authService.appleLogin(dto);
  }

  @ApiOperation({ summary: '회원 탈퇴' }) 
  @Auth()
  @ApiBearerAuth('access-token')
  @Put('/unregistry')
  async unregistry(
    @User() user: any,
  ) {
    return await this.authService.unregistry(user.userId);
  }
  */

}
