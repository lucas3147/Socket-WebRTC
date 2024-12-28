import { RawData, WebSocket } from 'ws';
import { ClienteType } from './types/ClienteType';
import { ResponseServerType } from './types/ResponseType';

const server = new WebSocket.Server({ port: 3001 });

var clients : ClienteType[] = [];

server.on('connection', (socket) => {
    let id_cliente : string;

    socket.on('message', (event) => {
        let message = getRequest(event);
        if (message.type == 'register') {
            id_cliente = message.data;

            if (setClientId({id: id_cliente, socket})) {
                socket.send(JSON.stringify({
                    type: 'open',
                    data: id_cliente
                }));
            }
            else {
                socket.send(JSON.stringify({
                    type: 'user-limit',
                    data: 'Não é possível se conectar. Limite de clientes excedido!'
                }));
            }
        }
        if (message.type == 'message') {
            console.log('mensagem:', message.data);
            broadcast({
                type: 'message',
                data: message.data
            });
        }
        if (message.type == 'ice-candidate') {
            console.log('Candidato WebRtc detectado');

            const candidate = message.data;

            broadcast({
                type: 'ice-candidate',
                data: candidate
            });
        }
        if (message.type == 'offer') {
            console.log('Conexão WebRtc offer detectada');

            const localPeerDescription = message.data;

            broadcast({
                type: 'offer',
                data: localPeerDescription
            });
        }
        if (message.type == 'answer') {
            console.log('Resposta da Conexão WebRtc answer detectada');

            const localPeerDescription = message.data;

            broadcast({
                type: 'answer',
                data: localPeerDescription
            });
        }
        if (message.type == 'close-other-webcam') {

            broadcast({
                type: 'close-other-webcam',
                data: {}
            });
        }

        if (message.type == 'hang-up') {
            broadcast({
                type: 'hang-up',
                data: {}
            });
        }
    });

    socket.onclose = () => {
        let connectedClients : ClienteType[] | any = [];
        clients = clients.filter(client => client.id != id_cliente) as ClienteType[];
        clients.forEach(cliente => connectedClients.push(cliente));
        console.log(`Socket fechado!. ${connectedClients.length} Usuários conectados: ${connectedClients}`);
    };

    function broadcast(response : ResponseServerType) {
        clients.forEach(function (client) {
            if (client.id !== id_cliente) {
                client.socket.send(setResponse(response));
            }
        });
    }

    function setClientId(cliente : ClienteType) {
        if (!clientInclude(cliente.id)) {
            if (clients.length < 2) {
                clients.push(cliente);
                socket.send(JSON.stringify({
                    type: 'open',
                    data: cliente.id
                }));
                console.log('Cliente conectado :', cliente.id);
            }
            else {
                socket.send(JSON.stringify({
                    type: 'user-limit',
                    data: 'Não é possível se conectar. Limite de clientes excedido!'
                }));
                console.log('Limite de usuários excedido');
            }
        }
        else {
            console.log('Usuário já cadastrado');
            return false;
        }
    }
});

function generateClientId() {
    return Math.random().toString(36).substring(2, 15);
}

function getRequest(event : RawData) {
    return JSON.parse(event.toString());
}

function setResponse(response : ResponseServerType) {
    return JSON.stringify(response);
}

function clientInclude(id : string) {
    for (let client of clients) {
        if (client.id == id) {
            return true;
        }
    }
    return false;
}

console.log('Servidor WebSocket ouvindo na porta 3001');