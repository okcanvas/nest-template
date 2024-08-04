import moment from 'moment';


//================================
//  ID List에서 중복제거
//================================
function uniqIds(array: any, field: any) {
  let Ids = [0];
  array.map(e => { 
    if (e[field]) Ids.push(e[field]) 
  });
  let set = new Set(Ids);
  return [...set];
}

//================================
//  CURRENT DATETIME - YYYY-MM-DD HH:mm:ss
//================================
function getCurrentDateTime(timeStamp?: any) {
  if (timeStamp) return moment.unix(timeStamp / 1000).format('YYYY-MM-DD HH:mm:ss');
  return moment.unix(Date.now() / 1000).format('YYYY-MM-DD HH:mm:ss');
}

//================================
//  WEEKLY RANG DATE OF DATE
//================================
function getWeeklyRang(timeStamp: Date) {
  var date = moment(timeStamp);
  var startDate = date.startOf('week').isoWeekday(7);
  var endDate = moment(startDate).add(6, 'days');
  return {
    startDate: moment(startDate).format('YYYY-MM-DD'),
    endDate: moment(endDate).format('YYYY-MM-DD'),
  };
}

//================================
//  MONTH RANG DATE OF DATE
//================================
function getMonthRang(timeStamp: Date) {
  var date = moment(timeStamp);
  return {
    startDate: date.startOf('month').format('YYYY-MM-DD'),
    endDate: date.endOf('month').format('YYYY-MM-DD'),
  };
}


//================================
//  GROUP SUM 비교함수
//================================
/**
 * @param {Array} array
 * @param {Array} props
 * @returns {Array}
 */
function groupBy(array: object[], props: any) {
  function getGroupedItems(item) {
    let returnArray = [];
    let i;
    for (i = 0; i < props.length; i++) {
        returnArray.push(item[props[i]]);
    }
    return returnArray;
  };
  let groups = {};
  let i;
  for (i = 0; i < array.length; i++) {
    const arrayRecord = array[i];
    const group = JSON.stringify(getGroupedItems(arrayRecord));
    groups[group] = groups[group] || [];
    groups[group].push(arrayRecord);
  }
  return Object.keys(groups).map((group) => {
    return groups[group];
  });
}

//================================
//  GROUP SORT 비교함수
//================================
/**
 * @param {Array} array
 * @param {Array} keys
 * @returns {Array}
 */
function sortBy(array, keys) {
  keys = keys || {};

  var obLen = function(obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };
  
  var obIx = function(obj, ix) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (size == ix) return key;
        size++;
      }
    }
    return false;
  };
  
  const keySort = function(a: any, b: any, d: any) {
    d = d !== null ? d : 1;
    // a = a.toLowerCase(); // this breaks numbers
    // b = b.toLowerCase();
    if (a == b) return 0;
    return a > b ? 1 * d : -1 * d;
  };
  
  var KL = obLen(keys);
  if (!KL) return array.sort(keySort);
  
  for ( var k in keys) {
    keys[k] = keys[k] == 'desc' || keys[k] == -1  ? -1 
            : (keys[k] == 'skip' || keys[k] === 0 ? 0 
            : 1);
  }
  
  array.sort(function(a, b) {
    var sorted = 0, ix = 0;
    while (sorted === 0 && ix < KL) {
      var k = obIx(keys, ix);
      if (k) {
        var dir = keys[k];
        sorted = keySort(a[k], b[k], dir);
        ix++;
      }
    }
    return sorted;
  });
  return array;
}



export {
  uniqIds,
  getCurrentDateTime,
  getWeeklyRang,
  getMonthRang,
  groupBy,
  sortBy
}







