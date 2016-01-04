var http = require("http");

appUrl= process.env.TOM_HOST  || '0.0.0.0',
appPort=process.env.TOM_PORT || 8081 
http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("We are currently under maintence, please try after some time....Thank you for patience");
  response.end();
}).listen(appPort, appUrl, function(err){
    console.log("Listening on " + appUrl + ", server_port " + appPort)
});
