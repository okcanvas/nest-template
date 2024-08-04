import { Transform } from 'class-transformer';
import { isNumberString } from 'class-validator';

export function TransformTimestamp() {
  return Transform(({ value }) => {
    if (isNumberString(value)) value = Number(value);
    //
    if ((typeof value === 'number') && (value.toString().length == 13)) {
      value = Math.ceil(value / 1000);
    }
    return value;
  });
}




/*
export function TransformTimestamp() {
  return Transform(({ value }) => {
    if (typeof value === 'object') {
      //  timezone 이 포함된 경우...
      value = new Date(value).getTime();
    }
    if ((typeof value === 'string')) {
      if ((/^[0-9]+$/.test(value))) {
        //  support "1548221490638"
        value = parseInt(value)
      } else {
        //  replace
        value = value.replace(new RegExp(/-/gm), '/');
        value = new Date(value).getTime();
      }
    }
    if ((typeof value === 'number') && (value.toString().length === 13)) {
      //  10자리로 변환
      value = Math.ceil(value / 1000);
    }
    return value;
  });
}
*/