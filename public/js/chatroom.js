(function connect() {
    let socket = io.connect('http://localhost:3000/');

    let nickname = `anon_${new Date().valueOf()}`,
        nameField = document.querySelector('.card-header'),
        username = document.querySelector('#username'),
        usernameBtn = document.querySelector('#usernameBtn'),
        curUsername = document.querySelector('.card-header'),
        message = document.querySelector('#message'),
        messageBtn = document.querySelector('#messageBtn'),
        messageList = document.querySelector('#message-list'),
        info = document.querySelector('.info'),
        usersTotal = document.querySelector('.users-total')
    ;

    const set_initial_nickname = new Event('set_initial_nickname'),
        newUser = document.querySelector('.chat-users-list');

    function removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    };

    nameField.addEventListener('set_initial_nickname', data => {
        nameField.textContent = nickname;
        socket.emit('receive_nickname', {nickname: nickname});
    });

    nameField.dispatchEvent(set_initial_nickname);

    usernameBtn.addEventListener('click', e => {
        socket.emit('change_username', {username: username.value, oldUsername: curUsername.textContent});
        let users = document.querySelectorAll('li');
        users.forEach(userListItem => {
            userListItem.textContent == curUsername.textContent ? userListItem.textContent = username.value : userListItem.textContent;
        });
        curUsername.textContent = username.value;
        username.value = '';
    });

    messageBtn.addEventListener('click', e => {
        console.log(message.value);
        socket.emit('new_message', {message: message.value});
        message.value = '';
    });

    socket.on('receive_message', data => {
        console.log(data);
        let listItem = document.createElement('li');
        listItem.textContent = `${data.username}: ${data.message}`;
        listItem.classList.add('list-group-item');
        messageList.appendChild(listItem);
    });
    
    message.addEventListener('keypress', e => {
        socket.emit('typing');
    });

    socket.on('typing', data => {
        info.textContent = `${data.username} is typing...`;
        setTimeout(() => {
            info.textContent = ''
        }, 5000);
    });

    socket.on('users_connected', data => {
        removeAllChildNodes(newUser);
        data.users.forEach(connectedUser => {
            let userItem = document.createElement('li');
            userItem.textContent = connectedUser;
            newUser.appendChild(userItem);
        });
        usersTotal.textContent = data.users.length;
    });
})();