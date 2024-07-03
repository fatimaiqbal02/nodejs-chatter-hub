const socket = io('/');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.getElementById('messages');
const activeMembersList = document.getElementById('active-members');
var audio = new Audio('ting.mp3');

//to ask the user name when he joins the chat
const askUserName = () => {
    name = prompt("Enter your name to join");
    if (!name || name.trim() === '') {
        name = 'Anonymous';
    }
    socket.emit('new-user-joined', name);
};

// Call askUserName function when the page loads
askUserName();

//to append any new message
const appendMessage = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);

    // Scroll to the bottom of the message container
    messageContainer.scrollTop = messageContainer.scrollHeight;

    //sound plays if user receive messages from other user((on left side)
    if (position == 'left') {
        audio.play();
    }
}

const updateActiveMembers = (members) => {
    activeMembersList.innerHTML = '';
    members.forEach(member => {
        const li = document.createElement('li');
        li.textContent = member === name ? `${member} (You)` : member;
        activeMembersList.appendChild(li);
    });
};

//when user sends the message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`, 'right');         //Append user's own message on right side
    socket.emit('send', message);
    messageInput.value = '';
});

//when other user joins
socket.on('user-joined', name => {
    appendMessage(`${name} joined the chat`, 'left'); // Append other user's join message on the left
    socket.emit('request-active-users'); // Request active users list
});

//when other user send message
socket.on('receive', data => {
    appendMessage(`${data.name}: ${data.message}`, 'left'); // Append received message on the left

});

//when other user left the chat
socket.on('left', name => {
    appendMessage(`${name} left the chat`, 'left'); // Append other user's leave message on the left
    socket.emit('request-active-users'); // Request updated active users list
});

socket.on('active-users', users => {
    updateActiveMembers(users);
});
