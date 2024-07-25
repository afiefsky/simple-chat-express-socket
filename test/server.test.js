const { expect } = require('chai');
const io = require('socket.io-client');
const http = require('http');

describe('Chat Application', function() {
    this.timeout(10000); // Increase timeout to 10 seconds

    let clientSocket;
    let serverSocket;

    beforeEach((done) => {
        const httpServer = http.createServer();
        const ioServer = require('socket.io')(httpServer);
        
        ioServer.on('connection', (socket) => {
            console.log('A user connected in test');
            serverSocket = socket;
            serverSocket.on('chat message', (msg) => {
                console.log('Server received chat message in test:', msg);
                ioServer.emit('chat message', msg);
            });
        });

        httpServer.listen(3001, () => {
            clientSocket = io.connect('http://localhost:3001', {
                reconnectionDelay: 0,
                forceNew: true,
                transports: ['websocket'],
            });

            clientSocket.on('connect', () => {
                console.log('Client connected in test');
                done();
            });
        });
    });

    afterEach((done) => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
        done();
    });

    it('should receive a message from another client', (done) => {
        const message = { username: 'testuser', text: 'Hello, world!' };
        console.log('Client emitting chat message in test:', message);
        clientSocket.emit('chat message', message);
        
        clientSocket.on('chat message', (msg) => {
            console.log('Client received chat message in test:', msg);
            try {
                expect(msg).to.eql(message);
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});
