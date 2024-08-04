import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import Helper from '@src/okcanvas-libs/helper';

const logger: Logger = new Logger();
export const helper = Helper;

export const _Fail = (errno: number = 1000, message: string = undefined): any => {
  const response = {
    errno: errno,
    errmsg: message ? message : ERROR_MESSAGE[errno],
  };
  logger.log(`${response.errno} ${response.errmsg}`);
  return response;
};

export const _Success = (response: any): any => {
  return {
    errno: 0,
    data: response,
  };
};


const ERROR_MESSAGE = {
  //  서버
  1000: '서버 장애 입니다.',
  1001: '자료를 찾을 수없습니다.',
  1002: '사용 권한이 없습니다.',
  1003: 'not exists update data is empty',
  1004: 'PUSH TOKEN is empty',
  1005: '오늘 이후의 날짜로만 수정 가능',

  //  사용자
  5000: '이미 사용중인 닉네임',
  5001: '회원정보를 찾을 수 없습니다.',
  5002: 'SNS 로그인 실패',

  //  포인트
  5100: '공유 포인트는 하루에 한번만 지급됩니다.',
}
