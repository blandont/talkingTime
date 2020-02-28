// Blandon Tang
// Client Side Code
/**
 *  TODO: Move the username generation to backend code
 * https://socket.io/docs/emit-cheatsheet/
 */

const socket = io();
var $loginForm = $('#login-form');
var $loginArea = $('#login-area');
var $msgForm = $('#message-form');
var $messageArea = $('#messages');
let $username;
var usersOnline = {};


socket.on('connect', function() {
    
    $username = chance.animal(); // Assign user random animal for nickname
	// $username = 'jim'
	$room = 'chatroom';
	// the following cookie code only handles one (most recent) cookie at a time
	// document.cookie = "username=" + $username;
	// console.log(document.cookie);
	socket.emit('joinChat', {
	    username: $username,
		room: $room,
		color: '#000000' // default nickname color is black
        // age: 'yaoza'
	}, function(data) {
	    if (data.nameAvailable) {
		    $(".room-title").text('Welcome to the chatroom ' + $username + '!');
			$messageArea.show();
        }
        else {
			alert(data.error);
			// alert("reload soon")
            Location.reload();
		}
	});
});

function scrollSmoothToBottom(id) {
	var div = document.getElementById(id);
	$('#' + id).animate({
		scrollTop: div.scrollHeight - div.clientHeight
	}, 500);
}

socket.on('message', function(message) {
	let momentTimestamp = moment.utc(message.timestamp);
	// console.log(usersOnline);
	console.log("username color is: " + message.color);
	let $message = $('#messages');
	$message.append("<p style='color: "+ message.color +";'><strong>" + message.username + "</strong> <span class='time'>" + momentTimestamp.local().format('h:mma') + "</span></p>");
	// $message.append('<p style="color: '+ message.color +';"><strong>' + message.username + '</strong> <span class="time">' + momentTimestamp.local().format("h:mma") + '</span></p>');
	$message.append('<div class="wrap-msg"><p>' + message.text + '</p></div>');
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
	console.log(connectedUsers);
	let allUsers = "";
	Object.keys(connectedUsers).forEach(function(socketID){
		
		// userArray.push({ID: socketID, nickname: connectedUsers[socketID].username})
		// console.log(connectedUsers[socketID].username); // get all usernames present in chatroom
		allUsers += "<p>" + connectedUsers[socketID].username + "</p>";
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
		console.log(socket.id);
		console.log(usersOnline[socket.id].username);
		socket.emit('message', {
			username: $username.trim(),
			text: $message.val(),
			color: usersOnline[socket.id].color
		});
	}
	$message.val('');
});