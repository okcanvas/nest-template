export class SqlBuilder {
  private sqlList: string[];
  private parent: any;

  constructor(parent: any) {
    this.sqlList = [];
    this.parent = parent;
  }

  sqlAdd(text: string = '', params?: any) {
    const baseList = text.split('?');
    text = '';

    if (Array.isArray(params)) {
      params.forEach(function(item: any, index: number) {
        let newItem = '';
        if (Array.isArray(item)) {
          item.forEach(function(subitem: any) {
            if(typeof subitem == 'string') {
              subitem = "'"+subitem+"'";
            }
            newItem += (newItem === '') ? subitem : ', '+subitem;
          })
        } else {
          if(typeof item == 'string') {
            newItem = "'"+item+"'";
          } else {
            newItem = item;
          }
        }
        text += baseList.splice(0, 1) + newItem;
      })
    }

    baseList.forEach(function(line: any) {
      text += line;
    })
    
    this.sqlList.push(text);
    return this;
  }

  sqlString() {
    return this.sqlList.join(' ');
  }

  //  sql: any, value?: any, option = {}
  async sqlQuery(option = {}) {
    try {
      return await this.parent.query(this.sqlString(), null, option)
    } catch (e) {
      throw e;
    }
  }

}