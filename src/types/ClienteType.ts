import { WebSocket } from 'ws';

export type ClienteType = {
    id: string,
    socket: WebSocket
}