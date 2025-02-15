// ./src/index.js
import { Server } from 'socket.io';

module.exports = {
  register(/*{ strapi }*/) {},
  bootstrap({ strapi }) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: 'http://localhost:3000', // Adjust the origin as needed
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('joinSession', (chatSessionId) => {
        socket.join(chatSessionId);
      });

      socket.on('sendMessage', async (data) => {
        const { content, chatSessionId } = data;
        console.log(content, chatSessionId)

        // Save message to Strapi
        const message = await strapi.services['api::message.message'].create({
          data: {
            Content: content,
            chat_session: chatSessionId,
            timestamp: new Date()
          },
        });

        // Emit the message back to the client
        io.to(chatSessionId).emit('receiveMessage', message);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    strapi.io = io;
  },
};
