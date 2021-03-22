import { Logger } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayDisconnect } from '@nestjs/websockets';
import { OnGatewayInit } from '@nestjs/websockets';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserOnlineService } from './user-online/user-online.service';

@WebSocketGateway()
export class MessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private userOnlineService: UserOnlineService) {

  }
  @WebSocketServer() public server: Server;
  private logger: Logger = new Logger('MessagesGateway');
  public busyUsers = [];

  userSocketMap: Map<string, Set<string>> = new Map();


  afterInit(server: any) {
    console.log('Gateway initialized');
  }


  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    let userId = client.handshake.query.userId;
    console.log(userId);
    client.join(userId);
    this.addClientToMap(userId, client.id);
  }


  handleDisconnect(client: Socket): void {
    let userId = client.handshake.query.userId;
    this.logger.log(`Client disconnected: ${client.id}`);
    this.removeClientFromMap(userId, client.id);
    client.leave(userId);

    // this.userSocketMap.forEach((v,k) => {
    //   v.forEach(element =>{
    //     this.logger.log(element);
    //   });
    // });
  }


  addClientToMap(userId: string, socketId: string): void {

    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set([socketId]));
      this.userOnlineService.set(userId, 'online');
    } else {
      this.userSocketMap.get(userId).add(socketId);
    }
  }


  removeClientFromMap(userId: string, socketId: string): void {
    if (this.userSocketMap.has(userId)) {
      let userSocketSet = this.userSocketMap.get(userId);

      this.logger.log(socketId);
      userSocketSet.delete(socketId);
      if (userSocketSet.size === 0) {
        this.userSocketMap.delete(userId);
        this.userOnlineService.set(userId, Date.now());
      }
    }
  }

  @SubscribeMessage('video-call')
  async onVideoCall(client, data: any) {
    const event: string = 'video-call';
    client.broadcast.to(data.userId).emit(event, data);
  }

  @SubscribeMessage('video-call-accept')
  async onVideoCallAccept(client, data: any) {
    const event: string = 'video-call-accept';
    client.broadcast.to(data.userId).emit(event, data);
  }

  @SubscribeMessage('video-call-reject')
  async onVideoCallReject(client, data: any) {
    const event: string = 'video-call-reject';
    client.broadcast.to(data.userId).emit(event, data);
  }

  @SubscribeMessage('get-busy-user')
  async getBusyUser(client) {
    const event: string = 'get-busy-user';
    client.broadcast.emit(event, this.busyUsers);
  }

  @SubscribeMessage('busy-user')
  async busyUser(client) {
    this.busyUsers.push({
      id: client.userId,
      username: client.username
    });
    client.broadcast.emit('get-busy-user', this.busyUsers);
  }

  @SubscribeMessage('end-video-call')
  async endVideoCall(client,data: any) {
    if (this.busyUsers.length > 0) {
      var usr1 = this.busyUsers.find(a => a.username == client.username);
      var index1 = this.busyUsers.indexOf(usr1);
      this.busyUsers.splice(index1, 1);

      var usr2 = this.busyUsers.find(a => a.username == data.toname);
      var index2 = this.busyUsers.indexOf(usr2);
      this.busyUsers.splice(index2, 1);
  }
  client.broadcast.to(data.userId).emit('video-call-ended', data);
  client.broadcast.emit('get-busy-user', this.busyUsers);
  }

  @SubscribeMessage('call-request')
  async callRequest(client, data: any) {
    client.broadcast.to(data.userId).emit('call-request', {
      username: client.username,
      data: data
  });
  }

}


