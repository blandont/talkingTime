// Blandon Tang
// Client Side Code
/**
 * https://socket.io/docs/client-api/#socket-id -- socket io documentation
 * https://socket.io/docs/emit-cheatsheet/  -- socket io cheatsheet
 * https://stackabuse.com/git-merge-branch-into-master/ -- git branching cheatsheet
 */

const socket = io();
var $loginForm = $('#login-form');
var $loginArea = $('#login-area');
var $msgForm = $('#message-form');
var $messageArea = $('#messages');
let $username;
var usersOnline = {}; // equivalent to connectedUsers in serverside

socket.on('connect', function() {
    socket.emit('joinChat', {
	    username: 'newUserName',
		room: 'chatroom',
		color: '#000000' // default nickname color is black
	});
});

socket.on('message', function(message) {
	let momentTimestamp = moment.utc(message.timestamp);
	// console.log("on message: " + socket.id);
	// console.log(usersOnline);
	// console.log("username color is: " + message.color);
	let $message = $('#messages');
	$message.append("<p><span style='color: "+ message.color +";'><strong>" + message.username + "</strong></span><span class='time'> " + momentTimestamp.local().format('h:mma') + "</span></p>");
	if (message.userID == socket.id){ // Message is sent by own client then do something to that msg (bold in this case)
		$message.append('<div class="wrap-msg"><p><strong>' + message.text + '</strong></p></div>');
		// TODO: Instead of bold I could move this to the opposite side of the chat and italicize?
	}
	else { // If message comes from other user
		$message.append('<div class="wrap-msg"><p>' + message.text + '</p></div>');
	}
	scrollSmoothToBottom('messages');
});

socket.on('showChatLog', function(chatHistory){
	// console.log(chatHistory);
	var $message = $('#messages');
	chatHistory.forEach(function(message){
		var momentTimestamp = moment.utc(message.time);
		$message.append('<p><strong>' + message.user + '</strong> <span class="time">' + momentTimestamp.local().format("h:mma") + '</span></p>'); //.format("h:mma")
		$message.append('<div class="wrap-msg"><p>' + message.msg + '</p></div>');
	});
})

socket.on('usersPresent', function(connectedUsers){
	usersOnline = connectedUsers;
	$username = usersOnline[socket.id].username;
	$(".room-title").text('Welcome to the chatroom ' + $username + '!'); // change name display at top

	let allUsers = "";
	Object.keys(connectedUsers).forEach(function(socketID){
		
		// userArray.push({ID: socketID, nickname: connectedUsers[socketID].username})
		// console.log(connectedUsers[socketID].username); // get all usernames present in chatroom
		allUsers += "<p><span style='color: "+ connectedUsers[socketID].color +";'><strong>" + connectedUsers[socketID].username + "</strong></span></p>"; // change color of name in online list as well
		// console.log(allUsers);
	});
	$('#connectedUsers').html(allUsers); // display all users
})

$msgForm.on('submit', function(e) {
	e.preventDefault(); // prevent default form reload
	let $message = $('#messageInput');
	let invalidInput = /<(.|\n)*?>/g;
	if (invalidInput.test($message.val())) {
		alert('html tags are not allowed');
    }
    else {
		// console.log(socket.id);
		// console.log(usersOnline[socket.id].username);
		socket.emit('message', {
			username: $username.trim(),
			text: $message.val(),
			color: usersOnline[socket.id].color,
			userID: socket.id
		});
	}
	$message.val('');
});

function scrollSmoothToBottom(id) {
	var div = document.getElementById(id);
	$('#' + id).animate({
		scrollTop: div.scrollHeight - div.clientHeight
	}, 500);
}