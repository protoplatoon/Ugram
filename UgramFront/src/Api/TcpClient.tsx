//import openSocket from 'socket.io-client';
const io = require('socket.io-client') 
var env = 'dev'
var baseUrl = 'http://localhost:3000';
if (env === 'production') {
    baseUrl = 'http://ugram-team-09.us-east-1.elasticbeanstalk.com';
}

//const baseUrl = 'http://ugram-team-09.us-east-1.elasticbeanstalk.com:80';
// port tcp du server real time
const socket = io(baseUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 99999
})
//const  socket = openSocket('http://localhost:4242');
export class TcpClient {


    constructor() {
        
    }

    connectToChat(user) {
        //socket.connect("http://localhost:4242")
        //console.log("connect to online chat whit " + user.id)
        socket.emit('new user', user.id, (data)=> {
            if(data){
                //console.log(data)
            }
        });
    }

    handleConnect(cb) {
        socket.on('connect', function () {
            //console.log('connected to server');
            cb();
        });
    }

    sendRefreshNotif(): any {
        socket.emit('get notif');
    }

    sendRefreshMessage(): any {
        //console.log("refresh message")
        //socket.emit('get notif');
    }

// test open socket client vers l'api pour envoyer des message instantané
    subscribeToTimer(user, cb) {
        //console.log("subscribeToTimer ")

        
        //socket.connect("http://localhost:4242")
        //const socket = openSocket('http://localhost:4242');
        //let socket = openSocket('http://localhost:4242');
        //var io = socketIo('http://localhost:4242')
       socket.on('timer', timestamp => {
           cb(null, timestamp)
        });
        socket.emit('subscribeToTimer', 1000);
    }

    getNotifications(user, cb) {
        socket.on('notif', notif => {
            //console.log("receiv new notif : " + notif)
            cb(null, notif)
         });
    }

    getMessages(user, cb) {
        socket.on('new message', (data) => {
            //console.log("get Message tcpClient " + data)
            cb(null, data)
         });
    }

    getUsers(user, cb) {
        socket.on('get users', (data) => {
            //console.log("get Users tcpClient " + data)
            cb(null, data)
         });
    }

    sendMessage(message, username) {
        socket.emit('send private message', message, username);
    }

    getNotif(user, cb) {
        socket.on('refresh notif', (user) => {
            //console.log("refresh !!!!!!! notif ")
            cb(null, user)
        })
    }

    connect() {
        socket.emit('connect');
    }

    logout() {
        //socket.disconnect();
        socket.emit('exit chat');
    }
}