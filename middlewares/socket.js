module.exports.authenticateSocket = (socket, next) => {
    if (!socket.request.session || !socket.request.session.user) {
        next(new Error("You shall not pass"))
        return
    }

    // Create user property and desctructure from socket request
    socket.user = { ...socket.request.session.user }
    next()
}

module.exports.handleOnlineStatus = (
    socket,
    onlineUsers,
    io
) => {
    const userId = socket.user?.userId

    onlineUsers.push(userId);
    io.emit('updateOnlineUsers', onlineUsers);

    socket.on('disconnect', () => {
        const index = onlineUsers.indexOf(userId);
        const removeUser = index => onlineUsers.splice(index, 1)
        if (index > -1) removeUser(index)
        io.emit('updateOnlineUsers', onlineUsers);
    });
}