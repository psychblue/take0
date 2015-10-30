/*
Conf Module
*/

//Modules
var fs = require('fs');
var net = require('net');
var logger = require('../logger/logger')(__filename);
var confManager = {};

//Socket Path
var path = '/tmp/take-conf.sock';

/*
CLI Server Init Function
*/
confManager.initServer = function(){

  var confServer = net.createServer(function(con){
    logger.info('User connected...');
    con.on('end', function(){
      logger.info('User disconnected...');
    });
    con.on('data', function(data){
      handleCmd(data, con);
    });
  });

  //Server Recovery
  confServer.on('error', function(err){
    logger.debug('confServer.on >>> ' + err.toString());
    if(err.code == 'EADDRINUSE'){
      var tmpSocket = new net.Socket();
      tmpSocket.on('error', function(err){
        logger.debug('tmpSocket.on >>> ' + err.toString());
        if(err.code == 'ECONNREFUSED'){
          fs.unlinkSync(path);
          confServer.listen(path, function(){
            logger.info('Configuration Server recovered...');
          });
        }
      });
      tmpSocket.connect({path: path}, function(){
        logger.info('Socket is used now... [ %s ]', path);
      });
    }
  });

  //Server Bind
  confServer.listen(path, function(){
    logger.info('Configuration Server is runnung...');
  });
}

/*
CLI Command Handling
*/
var handleCmd = function(data, con){
  var data = data.toString();
  data = data.substring(0, data.length-1);
  logger.debug('[CLI] Command: \'%s\'', data);
  var argc = data.split(' ');
  switch(argc[0]){
    case 'version':
      con.write('take-v0.0.1');
      break;
    default:
  }
}

module.exports = confManager;
