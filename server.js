var app = require('./app');
var http = require('http');
var querystring = require('querystring');
var server = http.createServer(app);
var io = require('socket.io')(server);

//var ipaddress = '127.0.0.1';
var ipaddress = '192.168.43.163';
//var ipaddress = '192.168.0.103';
var port = 8080;
var userCount = 0;
server.listen(port,ipaddress, function () {
  console.log('listening on port ' + port);
});

io.on('connection',function(socket){
	console.log("Device Connected");
	socket.on('set ph',function(ph){
		console.log(ph);
		insertLog(ph);
		socket.broadcast.emit("update ph", ph);
	})
})

app.post('/aqualytics', function(req, res, next){
	var id = req.query.device;
	var temp = req.query.temperature;
	var ph = req.query.ph;
	var d = {device:id,temperature:temp,ph:ph};
	console.log(d)
	//insertLog(ph);
	io.emit('update ph', d);
	res.send({"success":"posted"});
})

var insertLog = function(q){
	var data = querystring.stringify(q);

	var options = {
	    host: 'localhost',
	    path: '/aqualytics/backend/api/v1/device/log',
	    method: 'POST',
	    headers: {
	        'Content-Type': 'application/x-www-form-urlencoded',
	        'Content-Length': Buffer.byteLength(data)
	    }
	};

	var httpreq = http.request(options, function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      console.log("body: " + chunk);
    });
    response.on('end', function() {
    })
  });
  httpreq.write(data);
  httpreq.end();
}