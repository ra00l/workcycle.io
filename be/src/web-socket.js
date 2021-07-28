const ioDef = require('socket.io');
const logger = require('./logger');

let io = null;

let count = 0;

function init(server) {
  console.log('web socket init!');
  io = ioDef(server);
  io.on('connection', function (socket) {
    console.log('new web socket connection');
    count++;


    socket.on('disconnect', function () {
      count--;

      console.log('new web socket disconnect');
      io.emit('news', {msg: 'Someone went home', count: count});

    });
  });
}

function pushEvent(type, payload) {
  logger.info('recv event ' + type, payload);

  payload._type = type;
  io.sockets.emit(type, payload);
}

module.exports = {
  init: init,
  pushEvent: pushEvent
};
