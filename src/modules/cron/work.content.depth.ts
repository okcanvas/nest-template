import { Injectable, Logger } from '@nestjs/common';
import { MysqlService } from '@src/okcanvas-libs';
import moment from 'moment';
import { parseTime } from '@src/utils/timezone';



//=============================================================================
//  MAIN WORK
//=============================================================================
export const work = async (_this: any, targetAll = false) => {
  _this.logger.log(`==================================================`);
  _this.logger.log(`CRON FOR CONTENT DEPTH`);
  _this.logger.log(`==================================================`);

  const conn = await _this.mysql.getConnection();
  try {
    const contents = (targetAll === true) 
      ? await conn.model('content').select()
      : await conn.model('content').where({ isUpdate: 1 }).select();
      
    for (const content of contents) {
      const contentUnits = await conn.model('content_unit').where({ contentId: content.contentId }).select();
      const resultUnits = [];
      const aList = contentUnits.filter((e: any) => e.parentUnitId === 0);
      aList.map((aNode: any) => {
        aNode.depth = 0;
        aNode.depthName = (aNode.type === 'none') ? '대목차' : '문제';
        aNode.depthMap = {0: { contentUnitId: aNode.contentUnitId, unitName: aNode.unitName }};
        resultUnits.push(aNode);
        const bList = contentUnits.filter((e: any) => e.parentUnitId === aNode.contentUnitId);
        aNode.hasChildren = bList.length > 0;
        bList.map((bNode: any) => {
          bNode.depth = 1;
          bNode.depthName = (bNode.type === 'none') ? '중목차' : '문제';
          bNode.depthMap = {...aNode.depthMap, 1: { contentUnitId: bNode.contentUnitId, unitName: bNode.unitName }};
          resultUnits.push(bNode);
          const cList = contentUnits.filter((e: any) => e.parentUnitId === bNode.contentUnitId);
          bNode.hasChildren = cList.length > 0;
          cList.map((cNode: any) => {
            cNode.depth = 2;
            cNode.depthName = (cNode.type === 'none') ? '소목차' : '문제';
            cNode.depthMap = {...bNode.depthMap, 2: { contentUnitId: cNode.contentUnitId, unitName: cNode.unitName }};
            resultUnits.push(cNode);
            const dList = contentUnits.filter((e: any) => e.parentUnitId === cNode.contentUnitId);
            cNode.hasChildren = dList.length > 0;
            dList.map((dNode: any) => {
              dNode.depth = 3;
              dNode.depthName = (dNode.type === 'none') ? '' : '문제';
              dNode.depthMap = {...cNode.depthMap, 3: { contentUnitId: dNode.contentUnitId, unitName: dNode.unitName }};
              resultUnits.push(dNode);
            });
          });
        });
      });
  
      for (const unit of resultUnits) {
        await conn.model('content_unit')
        .where({ contentUnitId: unit.contentUnitId })
        .update({
          depth: unit.depth,
          depthName: unit.depthName,
          depthMap: JSON.stringify(unit.depthMap),
        });
      }
      //
      await conn.model('content').where({ contentId: content.contentId }).update({ isUpdate: 0 });
    }
  } catch (e) {
    //
  } finally {
    await conn.release();
  } 
}
