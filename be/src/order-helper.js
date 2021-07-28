const sequelize = require('./db');

module.exports = {
  changeOrder: async function(oldOrder, newOrder, table, where, whereParams){
    if (newOrder == oldOrder) return;

    let sign = '+';
    // from 1 to 3
    if (newOrder > oldOrder) sign = '-';

    let replacements = {
      minOrder: Math.min(oldOrder, newOrder),
      maxOrder: Math.max(oldOrder, newOrder)
    };

    for(let key of Object.keys(whereParams)) {
      replacements[key] = whereParams[key];
    }

    let qry = 'update "' + table + '" set "order"="order"' + sign + '1 where ' + where + ' and "order">' + (sign === '+' ? '=' : '')  + ':minOrder and "order"<' + (sign === '+' ? '' : '=') + ':maxOrder';

    console.log('order query', qry, replacements, oldOrder, newOrder);

    await sequelize.query(qry, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE
    });
  }
};
