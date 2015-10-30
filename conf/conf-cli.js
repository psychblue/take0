/*
Configuration CLI Client
*/

//Modules
var net = require('net');
//Socket Path
var path = '/tmp/take-conf.sock';

var clientSocket = net.connect({path: path}, function(){
  console.log('Connected...');
});

clientSocket.on('data', function(data){
  console.log(data.toString());
});

process.stdin.resume();
process.stdin.on('data', function(chunk){
  clientSocket.write(chunk);
});
