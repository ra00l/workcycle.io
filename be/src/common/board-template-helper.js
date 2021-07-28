const db = require('../db/models');
const ObjectStatus = require('./status-enum');

module.exports = {
  buildNestsStructure: async function(tplBoard, withWorkItems) {
    const templateItems = [];
    const boardNests = await db.nest.findAll({where: {idBoard: tplBoard.id, status: ObjectStatus.Active}, raw: true});
    let boardWorkItems = [];
    if(withWorkItems)
      boardWorkItems = await db.workItem.findAll({where: {idBoard: tplBoard.id, status: ObjectStatus.Active}, raw: true});

    for(let tplNest of boardNests) {
      let clonedNest = { name: tplNest.name, color: tplNest.color, order: tplNest.order, items: [], defaultNest: tplBoard.idDefaultNest === tplNest.id };

      const nestItems = boardWorkItems.filter(bwi => bwi.idNest === tplNest.id);
      clonedNest.items = nestItems.filter(nwi => nwi.idParent === null);

      for(let rootWi in clonedNest.items) {
        addChildrenToWorkItem(rootWi, nestItems);
      }

      templateItems.push(clonedNest);
    }

    return templateItems;
  }
};

function addChildrenToWorkItem(workItem, allItems) {
  workItem.items = allItems.filter(wi => wi.idParent === workItem.id);
  if(workItem.items) {
    for (let child of workItem.items) {
      addChildrenToWorkItem(child, allItems);
    }
  }
}
