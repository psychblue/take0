/*
Configuration CLI Client
*/

//Modules
var net = require("net");
//Socket Path
var path = "/tmp/take-conf.sock";

var clientSocket = net.connect({path: path}, function(){
  console.log("=============== T.A.K.E. CLI ===============");
  console.log("Connected...");
  process.stdout.write(">>> ");
});

clientSocket.on("error", function(err){
  console.log(err.toString());
  process.exit(1);
});

clientSocket.on("data", function(data){
  console.log(data.toString());
  process.stdout.write(">>> ");
});

process.stdin.resume();
process.stdin.on("data", function(chunk){
  clientSocket.write(chunk);
});
