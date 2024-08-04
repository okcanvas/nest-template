import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { User, Auth } from 'src/common/decorators';
import { LogService } from './log.service';
import { BoksaengDto, BoksaengProgressDto, BoksaengSearchDto } from './dtos';

@ApiTags('Log')
@Controller('log')
export class LogController {

  constructor(
    private readonly service: LogService,
  ) {}

  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: '' }) 
  @Get('/api/:lastId')
  async getLog(
    @User() user: any,
    @Param('lastId', ParseIntPipe) lastId: number
  ) {
    return await this.service.getLog(user.userId, lastId)
  }

  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: '' }) 
  @Get('/error/:lastId')
  async getError(
    @User() user: any,
    @Param('lastId', ParseIntPipe) lastId: number
  ) {
    return await this.service.getError(user.userId, lastId)
  }

  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: '' }) 
  @Get('/summary')
  async getSummary(
    @User() user: any,
    @Query() query: any
  ) {
    return await this.service.getSummary(user.userId, query)
  }

  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: '' }) 
  @Get('/summary/hour')
  async getSummaryHour(
    @User() user: any,
    @Query() query: any
  ) {
    return await this.service.getSummaryHour(user.userId, query)
  }

  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: '' }) 
  @Get('/summary/week')
  async getSummaryWeek(
    @User() user: any,
    @Query() query: any
  ) {
    return await this.service.getSummaryWeek(user.userId, query)
  }

  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: '' }) 
  @Get('/summary/month')
  async getSummaryMonth(
    @User() user: any,
    @Query() query: any
  ) {
    return await this.service.getSummaryMonth(user.userId, query)
  }

  

  /*
  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: '' }) 
  @Get(':boksaengId')
  async getByBoksaengId(
    @User() user: any,
    @Param('boksaengId', ParseIntPipe) boksaengId: number
  ) {
    return await this.service.getByBoksaengId(user.userId, boksaengId)
  }
  
  @ApiOperation({ summary: '복생이 생성' })
  @Auth()
  @ApiBearerAuth('access-token')  
  @Post()
  async createBoksaeng(
    @User() user: any,
    @Body() dto: BoksaengDto, 
  ) {
    return await this.service.createBoksaeng(user.userId, dto);
  }

  @ApiOperation({ summary: '복생이 수정' })
  @Auth()
  @ApiBearerAuth('access-token')  
  @Put(':boksaengId')
  async editBoksaeng(
    @User() user: any,
    @Param('boksaengId') boksaengId: number, 
    @Body() dto: BoksaengDto
  ) {
    return await this.service.editBoksaeng(user.userId, boksaengId, dto);
  }

  @ApiOperation({ summary: '복생이 삭제' })
  @Auth()
  @ApiBearerAuth('access-token')  
  @Delete('/:boksaengId')
  async deleteBoksaeng(
    @User() user: any,
    @Param('boksaengId') boksaengId: number
  ) {
    return await this.service.deleteBoksaeng(user.userId, boksaengId);
  }

  @ApiOperation({ summary: '복생이 다운로드' })
  @Auth()
  @ApiBearerAuth('access-token')  
  @Post('download/:boksaengId')
  async downloadBoksaeng(
    @User() user: any,
    @Param('boksaengId') boksaengId: number
  ) {
    return await this.service.downloadBoksaeng(user.userId, boksaengId);
  }


  ////////


  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'date : 2022-01-01' })
  @Get('list/date/:date')
  async getBoksaengListByDate(
    @User() user: any,
    @Param('date') date: string,
  ) {
    return await this.service.getBoksaengListByDate(user.userId, date)
  }

  @Auth()
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: '' })
  @Get('list/:boksaengListId')
  async getBoksaengListById(
    @User() user: any,
    @Param('boksaengListId') boksaengListId: number,
  ) {
    return await this.service.getBoksaengListById(user.userId, boksaengListId)
  }


  @Auth()
  @ApiBearerAuth('access-token')  
  @Delete('/list/:boksaengListId')
  async deleteBoksaengList(
    @User() user: any,
    @Param('boksaengListId') boksaengListId: number
  ) {
    return await this.service.deleteBoksaengList(user.userId, boksaengListId);
  }

  @Auth()
  @ApiBearerAuth('access-token')  
  @ApiOperation({ summary: '학습 변경사항' }) 
  @Put('/list/:boksaengListId')
  async updateBoksaengList(
    @User() user: any,
    @Param('boksaengListId') boksaengListId: number,
    @Body() dto: any
  ) {
    return await this.service.updateBoksaengList(user.userId, boksaengListId, dto);
  }

  @Auth()
  @ApiBearerAuth('access-token')  
  @ApiOperation({ summary: '학습 진행률' }) 
  @Put('/list/:boksaengListId/progress')
  async progressBoksaengList(
    @User() user: any,
    @Param('boksaengListId') boksaengListId: number,
    @Body() dto: BoksaengProgressDto
  ) {
    return await this.service.progressBoksaengList(user.userId, boksaengListId, dto);
  }
  */
  
 




}

