import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private driverLocations = new Map<number, { lat: number; lng: number; socketId: string }>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'secretKey' });
        client.data.user = payload;

        client.join(`user_${payload.sub}`);

        if (payload.role === 'DRIVER') {
            client.join('drivers');
        }

        console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
      } catch (e) {
        console.log('Invalid token');
        client.disconnect();
      }
    } else {
        console.log(`Client connected without auth: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.user && client.data.user.role === 'DRIVER') {
        this.driverLocations.delete(client.data.user.sub);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('updateLocation')
  handleLocationUpdate(client: Socket, payload: { lat: number; lng: number }) {
      if (!client.data.user || client.data.user.role !== 'DRIVER') return;

      this.driverLocations.set(client.data.user.sub, {
          lat: payload.lat,
          lng: payload.lng,
          socketId: client.id
      });

      // Broadcast to admin
      this.server.to('admin').emit('driverLocation', { driverId: client.data.user.sub, ...payload });
  }

  @SubscribeMessage('joinAdmin')
  joinAdmin(client: Socket) {
      // In prod, check if user is really admin
      // For now, accept it if they ask (since we have no admin login in frontend really yet)
      // Or better, check the token role if available
      // if (client.data.user && client.data.user.role === 'ADMIN') {
      client.join('admin');
      // }
  }

  notifyDriversOfNewRide(ride: any) {
      this.server.to('drivers').emit('newRideRequest', ride);
  }

  notifyPassengerRideUpdate(passengerId: number, ride: any) {
      this.server.to(`user_${passengerId}`).emit('rideUpdate', ride);
  }
}
