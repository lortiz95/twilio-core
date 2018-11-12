// Subscribes a worker connected by socket to future events with tasks
const subscribeWorker = (socket, worker) => {
  socket.join(worker);
  console.log(`Subscribed worker: ${worker}`)
}

const subscribeClient = (socket, client) => {
  socket.join(client);
  console.log(`Subscribed client: ${client}`)
}

let server = undefined;

exports.run = (io) => {

  server = io;
  io.on('connection', function(socket) {    
    
    socket.on('connected', (worker) => {
      socket.emit('connected', 'server');
      subscribeWorker(socket, worker);
    });

    socket.on('clientConnected', (client) => {
      console.log('Client con id: ' + client)
      subscribeClient(socket, client)
    });

  });

}

exports.emitToSubscribedWorker = (worker, command, data) => {
  console.log('Emit command to worker: ' + worker)
  server.to(worker).emit(command, data)
}