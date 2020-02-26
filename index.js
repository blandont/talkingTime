// Blandon Tang
// Server side code
/**
 * TODO: setup unique nickname validation on chatroom join on server side
 * TODO: Scroll up text (starts from bottom)
 * TODO: Chat log history displayed on user join - just needs timestamps
 * TODO: Current user display
 * TODO: Nickname change
 * TODO: Nickname color change
 * TODO: Bold Messages
 * TODO: Cookies - cookie-parser library or handle client side
 * 
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var chance = require('chance').Chance();
// var cookieParser = require('cookie-parser');

// var connectedUsers = {}; // array of all connected user objects
var connectedUsers = []; // array of all connected user objects
var chatHistory = [];

// app.use(cookieParser());
app.use(express.static('assets'));

// Whenever user makes get request to server
app.get('/', function(req, res){
	// res.cookie('name', 'hello');
	// console.log('Cookies: ', req.cookies)
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	console.log('A user has connected with ID: ' + socket.id);
	// console.log('display chat history');
	// console.log(cookies);
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

	// socket.emit('displayChatLog', {chatHistory});

	socket.on('joinChat', function(req, callback) {
        let nameTaken = false;

        // connectedUsers.push(socket.id);
        // let newUserName = chance.animal();
        // connectedUsers[socket.id]['username'] = newUserName;
        // console.log(connectedUsers);
        // let username = chance.animal();
        
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
			console.log(req.username + " has joined the chatroom");
		    connectedUsers[socket.id] = req;
			socket.join(req.room);
			// console.log("heres what you missed");
			io.to(`${socket.id}`).emit('showChatLog', chatHistory); // emit only to new joinee
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

	socket.emit('message', {
		username: 'System',
		text: 'Howdy, try out these commands: \n/nick - change your nickname\n/nickcolor - change nickname color',
		timestamp: moment().valueOf()
	});

	socket.on('message', function(message) {
		message.timestamp = moment().valueOf();
		io.to(connectedUsers[socket.id].room).emit('message', message);
		chatHistory.push({user:message.username, msg:message.text});
		// console.log(chatHistory);
	});

});

http.listen(3000, function() {
	console.log('Listening on port *3000');
});