// Blandon Tang
// Client Side Code
/**
 *  TODO: Move the username generation to backend code
 */

const socket = io();
var $loginForm = $('#login-form');
var $loginArea = $('#login-area');
var $msgForm = $('#message-form');
var $messageArea = $('#messages');
let $username;


socket.on('connect', function() {
    
    $username = chance.animal(); // Assign user random animal for nickname
	// $username = 'jim'
	$room = 'chatroom';
	// the following cookie code only handles one (most recent) cookie at a time
	// document.cookie = "username=" + $username;
	// console.log(document.cookie);
	socket.emit('joinChat', {
	    username: $username,
        room: $room//,
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
	var momentTimestamp = moment.utc(message.timestamp);
	// console.log(message.chatLog);
	var $message = $('#messages');
	$message.append('<p><strong>' + message.username + '</strong> <span class="time">' + momentTimestamp.local().format("h:mma") + '</span></p>');
	$message.append('<div class="wrap-msg"><p>' + message.text + '</p></div>');
	scrollSmoothToBottom('messages');
});

socket.on('showChatLog', function(chatHistory){
	// console.log(chatHistory);
	// TODO: Need original timestamp for the messages
	var $message = $('#messages');
	chatHistory.forEach(function(message){
		$message.append('<p><strong>' + message.user + '</strong> <span class="time">' + 'momentTimestamp.local().format("h:mma")' + '</span></p>');
		$message.append('<div class="wrap-msg"><p>' + message.msg + '</p></div>');
	});
})

$msgForm.on('submit', function(e) {
	e.preventDefault(); // prevent default form reload
	let $message = $('#messageInput');
	let invalidInput = /<(.|\n)*?>/g;
	if (invalidInput.test($message.val()) == true) {
		alert('html tags are not allowed');
    }
    else {
		//chatHistory.push({user:$username.trim(),msg:$message.val()})
		socket.emit('message', {
			username: $username.trim(),
			text: $message.val()//,
			// chatLog: chatHistory
		});
	}
	$message.val('');
});