const IotDataRecord = new Map();
const slittingRecord = new Map();

export const MIN_SLITTING_LINE = 1;
export const MAX_SLITTING_LINE = 20;

for (let line=MIN_SLITTING_LINE; line <= MAX_SLITTING_LINE; line++) {
  slittingRecord.set(line, {
    line: line,
    lot: '',
    position: 0,
    process: process.pid,
    timestamp: 0,
  });
}

export interface SlittingDataInterface {
  line: number;
  lot: string;
  position: number;
  process: number;
  timestamp: number;
}

export const IotData = {
  setData: (key: string, data: any) => {
    IotDataRecord.set(key, data);
  },
  
  getData: (key: string): any => {
    const data = IotDataRecord.get(key) || {};
    return data;
  },

  slitting: {
    get: () => {
      return slittingRecord;
    },
    getList: () => {
      const result = [];
      for (let line=MIN_SLITTING_LINE; line<=MAX_SLITTING_LINE; line++) {
        result.push(slittingRecord.get(line) || {});
      }
      return result;
    },
    setLine: (line: number, data: any) => {
      if (line >= MIN_SLITTING_LINE && line <= MAX_SLITTING_LINE) {
        const lineData = slittingRecord.get(line);
        if (Object.keys(data).includes('lot')) lineData['lot'] = data.lot || '';
        if (Object.keys(data).includes('position')) lineData['position'] = data.position || 0;
        if (Object.keys(data).includes('process')) lineData['process'] = data.process || 0;
        if (Object.keys(data).includes('timestamp')) lineData['timestamp'] = data.timestamp || 0;
        //slittingRecord.set(line, data);
      }
    },
    getLine: (line: number): SlittingDataInterface => {
      if (line >= MIN_SLITTING_LINE && line <= MAX_SLITTING_LINE) {
        return slittingRecord.get(line);
      }
      return null;
    }
  }


}
