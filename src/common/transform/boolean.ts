import { Transform } from 'class-transformer';
import { isNumberString } from 'class-validator';


export function TransformBoolean() {
  return Transform(({ value }) => {
    let res = ['1','Y','YES','TRUE'].includes(value.toString().toUpperCase()) ? 1 : 0;
    return res;
  });
}
