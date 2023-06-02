import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {ChatHistory, ChatHistoryDocument} from './chat-history.schema';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  connectedClients: Map<string, string> = new Map();

  constructor(
      @InjectModel(ChatHistory.name)
      private chatHistoryModel: Model<ChatHistoryDocument>,
  ) {
  }

  @SubscribeMessage('connectClient')
  handleConnectClient(client: Socket, name: string): void {
    const clientId = client.id;
    this.connectedClients.set(clientId, name);
    this.sendClientList();
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, data: { client: string; message: string }): Promise<void> {
    const {client: selectedClient, message} = data;
    const senderId = client.id;
    const senderName = this.connectedClients.get(senderId);

    if (selectedClient === 'Broadcast') {
      // Broadcast the message to all clients
      this.server.emit('message', {sender: senderName, message});
      const recipient = 'Broadcast'; // Set recipient as 'Broadcast'

      // Store chat history in MongoDB with recipient set as 'Broadcast'
      await this.chatHistoryModel.create({
        sender: senderName,
        recipient,
        message,
      });
    } else {
      // Send the message to the selected client
      const recipientId = Array.from(this.connectedClients.entries()).find(([id, name]) => name === selectedClient)?.[0];
      if (recipientId) {
        // Emit the message to the sender and recipient
        client.emit('message', {sender: senderName, message}); // Send message to the sender
        client.to(recipientId).emit('message', {sender: senderName, message}); // Send message to the recipient
      }

      // Store chat history in MongoDB with the actual recipient value
      await this.chatHistoryModel.create({
        sender: senderName,
        recipient: selectedClient,
        message,
      });
    }
  }

  @SubscribeMessage('retrieveChatHistory')
  async handleRetrieveChatHistory(
      client: Socket,
      selectedClient: string,
  ): Promise<void> {
    const senderId = client.id;
    const senderName = this.connectedClients.get(senderId);

    if (selectedClient === 'Broadcast') {
      // Retrieve chat history from MongoDB where the recipient is "broadcast"
      const history = await this.chatHistoryModel
          .find({recipient: 'Broadcast'})
          .sort({createdAt: 1});

      client.emit('chatHistory', history);
    } else {
      // Retrieve chat history from MongoDB for the selected client
      const history = await this.chatHistoryModel
          .find({
            $or: [
              {sender: senderName, recipient: selectedClient},
              {sender: selectedClient, recipient: senderName},
            ],
          })
          .sort({createdAt: 1});

      client.emit('chatHistory', history);
    }
  }

  handleConnection(client: Socket): void {
    const clientId = client.id;
    this.connectedClients.set(clientId, '');
    this.sendClientList();
  }

  handleDisconnect(client: Socket): void {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    this.sendClientList();
  }

  sendClientList() {
    const clients = Array.from(this.connectedClients.values());
    this.server.emit('clientList', clients);
  }
}
