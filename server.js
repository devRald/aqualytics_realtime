var app = require('./app');
var http = require('http');
var querystring = require('querystring');
var server = http.createServer(app);
var io = require('socket.io')(server);

var ipaddress = '127.0.0.1';
var port = 8080;
var userCount = 0;
server.listen(port,ipaddress, function () {
  console.log('listening on port ' + port);
});

io.on('connection',function(socket){
	console.log("Device Connected");
	socket.on('set params',function(params){
		console.log(params);
		//insertLog(ph);

		push_notification(params);
		socket.broadcast.emit("update params", params);
	})
})

app.post('/aqualytics', function(req, res, next){
	var id = req.query.device;
	var temp = req.query.temperature;
	var ph = req.query.ph;
	var d = {device:id,temperature:temp,ph:ph};
	//console.log(d)
	//insertLog(d);
	var noti = 0;
	if(ph>8.5){
		noti++;
	}else if(ph<3){
		noti++;
	}else if(ph<6){
		noti++;
	}
	io.emit('alert',{device_id:id,notifications:noti});
	io.emit('update params', d);
	res.send({"success":"posted"});
})

app.post('/aqualytics/notification', function(req, res, next){
	var id = req.query.device;
	var categ = req.query.category;
	var title = req.query.title;
	var reading = req.query.reading;
	var d = {device:id,category:categ,title:title,reading:reading};

	
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

var insert_notification = function(id,category,title,desc){
		console.log("insert")
}

var push_notification = function(data){
	if(data.ph > 8.5){
		insert_notification(data.device,"ph","High PH Level",`PH Level at ${data.ph}. There is a possible grow of algae.`)
		io.emit("alert",{id:data.device,type:"danger",title:"High PH Level",short:"Possible grow of algae"});	
	}

	if(data.ph <= 3){
		insert_notification(data.device,"ph","Very Low PH Level",`PH Level at ${data.ph}. Aquatic Resources are at risks.`)
		io.emit("alert",{id:data.device,type:"danger",title:"Very Low PH Level",short:"Aquatic Resources are at risks."});
	}else if(data.ph <= 6){
		insert_notification(data.device,"ph","Low PH Level",`PH Level at ${data.ph}. Watch out about the PH Level.`)
		io.emit("alert",{id:data.device,type:"warning",title:"Low PH Level",short:"Warning, Watch out.."});

	}
}