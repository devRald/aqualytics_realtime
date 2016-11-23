var app = require('./app');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

//var ipaddress = '127.0.0.1';
var ipaddress = '192.168.1.110';
var port = 8080;
var userCount = 0;
server.listen(port,ipaddress, function () {
  console.log('listening on port ' + port);
});

io.on('connection',function(socket){
	socket.on('set ph',function(ph){
		console.log(ph);
		socket.broadcast.emit("update ph", ph);
	})
})

//console.log(io.of('/'));

app.post('/aqualytics', function(req, res, next){
	var id = req.query.device;
	var temp = req.query.temperature;
	var ph = req.query.ph;
	var d = {device:id,temperature:temp,ph:ph};
	console.log(d)
	io.emit('update ph', d);
	res.send({});
})