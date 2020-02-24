// Blandon Tang
// Server side code

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const moment = require('moment');
const chance = require('chance').Chance();
// var connectedUsers = {}; // array of all connected user objects
var connectedUsers = []; // array of all connected user objects

app.use(express.static('assets'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('A user has connected with ID: ' + socket.id);
    // connectedUsers.push(socket.id);
    // console.log(connectedUsers);

	socket.on('disconnect', function() {
		var userData = connectedUsers[socket.id];
		if (typeof userData !== 'undefined') { // if element does not exist
			socket.leave(connectedUsers[socket.id]);
			io.to(userData.room).emit('message', {
				username: 'System',
				text: userData.username + ' has left the chat',
				timestamp: moment().valueOf()
			});
			delete connectedUsers[socket.id];
		}
	});

	socket.on('joinChat', function(req, callback) {
        let nameTaken = false;

        // connectedUsers.push(socket.id);
        // let newUserName = chance.animal();
        // connectedUsers[socket.id]['username'] = newUserName;
        // console.log(connectedUsers);
        // let username = chance.animal();
        console.log(req.username + " has joined the chatroom");
        
		Object.keys(connectedUsers).forEach(function(socketId) {
		    if (connectedUsers[socketId].username.toLowerCase() === req.username.toLowerCase()) {
                nameTaken = true;
            }
		});

		if (nameTaken) {
		    callback({
                // nameAvailable: true
                nameAvailable: false,
				error: 'Sorry this username is taken!'
			});
        }
        else {
		    connectedUsers[socket.id] = req;
            socket.join(req.room);
			socket.broadcast.to(req.room).emit('message', {
			    username: 'System',
				text: req.username + ' has joined!',
				timestamp: moment().valueOf()
			});
			callback({
			    nameAvailable: true
			});
		}
	});

	socket.on('message', function(message) {
		message.timestamp = moment().valueOf();
		io.to(connectedUsers[socket.id].room).emit('message', message);
	});

	socket.emit('message', {
		username: 'System',
		text: 'Howdy, try out these commands: \n/nick - change your nickname\n/nickcolor - change nickname color',
		timestamp: moment().valueOf()
	});

});

http.listen(3000, function() {
	console.log('Listening on port *3000');
});