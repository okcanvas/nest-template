type ObjectType = Record<string, number | string | boolean>;
/**
 * @param {Map} map
 * @param {*} any
 * @return {*}
 */
export const mapToObj = (map: Map<string, any>): ObjectType => {
  const obj: ObjectType = {};
  for (const [k, v] of map) {
    obj[k] = v;
  }
  return obj;
};
