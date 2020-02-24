// Blandon Tang
// Client Side Code

const socket = io();
var $loginForm = $('#login-form');
var $loginArea = $('#login-area');
var $msgForm = $('#message-form');
var $messageArea = $('#message-area');
let $username;


socket.on('connect', function() {
    
    $username = chance.animal({type: 'pet'}); // Assign user random animal for nickname
    $room = 'chatroom';
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
            // Location.reload();
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
	var $message = $('#messages');
	$message.append('<p><strong>' + message.username + '</strong> <span class="time">' + momentTimestamp.local().format("h:mma") + '</span></p>');
	$message.append('<div class="wrap-msg"><p>' + message.text + '</p></div>');
	scrollSmoothToBottom('messages');
});

$msgForm.on('submit', function(e) {
	e.preventDefault(); // prevent default form reload
	let $message = $('#messageInput');
	let invalidInput = /<(.|\n)*?>/g;
	if (invalidInput.test($message.val()) == true) {
		alert('html tags are not allowed');
    }
    else {
		socket.emit('message', {
			username: $username.trim(),
			text: $message.val()
		});
	}
	$message.val('');
});