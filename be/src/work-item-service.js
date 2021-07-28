const db = require('./db/models');
const BoardType = require('./common/board-type-enum');
const ObjectType = require('./common/status-enum');

module.exports = {
  updateGoals: async function (idWorkItem, idWorkspace, tx) {
    //key === board.doneField && woData[key] == board.doneValue
    //1. find all workitems in goals that use this workitem as reference
    //2. calculate new percentage.
    //3. set that percentage
    const allWis = await db.select(`select id,"idBoard", "data" 
      from "workItem" 
      where "idBoard" in (select id from board where "boardType"=${BoardType.Goal} and "idWorkspace"=${idWorkspace} and status=${ObjectType.Active}) 
        and status=${ObjectType.Active} and "data" like '%${idWorkItem}%'`);
    for (let goalWi of allWis) {
      if (goalWi.data && goalWi.data.indexOf(idWorkItem) > -1) { //pre-check if item id is in data
        const goal = await db.board.findById(goalWi.idBoard);

        const workItemData = JSON.parse(goalWi.data);
        const goalData = JSON.parse(goal.dataStructure);
        const goalDoneField = goalData.find(f => f.originalType === 'percentage') || {};
        if (!goalDoneField || (goal.doneField && goal.doneField !== goalDoneField.id)) continue; //no percentage to update.

        const refField = goalData.find(d => d.originalType === 'dependency');

        const referencedWIs = workItemData[refField.id];
        if (referencedWIs && referencedWIs.length > 0 && referencedWIs.indexOf(idWorkItem) > -1) {
          //reference field found, time to update it!
          const refCnt = referencedWIs.length;
          let refDone = 0;
          for (let idWI of referencedWIs) {
            const wiRef = await db.workItem.findById(idWI);
            const wiBoard = await db.board.findById(wiRef.idBoard);
            //console.log('board: ', wiBoard.name, wiBoard.doneField, wiBoard.doneValue);
            if (wiBoard.doneField && wiBoard.doneValue) {
              const wiBoardData = JSON.parse(wiBoard.dataStructure);
              const goalDoneField = wiBoardData.find(f => f.id === wiBoard.doneField);

              const wiRefData = JSON.parse(wiRef.data);
              //console.log('work item: ', wiRef.title, wiBoard.doneField, wiRefData[wiBoard.doneField], wiBoard.doneValue);

              if (wiRefData[wiBoard.doneField] == wiBoard.doneValue) {
                refDone++;
                //console.log('--- ref increased');
              }
            }
          }

          const newVal = Math.round(100 * refDone / refCnt);
          const oldVal = workItemData[goalDoneField.id] || 0;

          console.log('percentage: ', newVal);
          if (newVal !== oldVal) {
            workItemData[goalDoneField.id] = Math.max(oldVal, newVal);

            const wi = await db.workItem.findById(goalWi.id);
            wi.data = JSON.stringify(workItemData);
            await wi.save({tx});
          }
        }
      }
    }
  }
}
;
