import {AccessToken, RefreshToken , AuthorizationCode, Client, Mention, Tag, Picture, User, PictureApi, UserApi, Comment, Like} from './models'
import * as express from 'express'
import { Express } from 'express'
import { UsersController } from './controllers';
import { PicturesController } from './controllers';
import { LoginController } from './controllers';
import { SearchController } from './controllers'
import {Sequelize} from 'sequelize-typescript';
import {SequelizeRepository} from './repository/SequelizeRepository'
import * as passport from 'passport';
import * as path from 'path'
import * as flash from 'connect-flash';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { Utils } from './utils/utils';
import { Logger } from './utils/logger';
var ip = require('ip');

//import {UGRAM_WEBSITE} from './auth/confauth'
const oauth2 = require('./controllers/OAuth2Controller')
const login = require('./controllers/LoginController')
var cors = require('cors');
const fileUpload = require('express-fileupload');
const formData = require("express-form-data");
import axios, {AxiosPromise} from 'axios'
import { Notification } from './models/Notification';
import { PictureSave } from './models/PictureSave';
import { Message } from './models/Message';
var configAuth = require('./auth/confauth');

var usersTcp = [];
var connectionsTcp = [];


// Server API

const multipartyOptions = {
    autoFiles: true
  };

const repository: SequelizeRepository = new SequelizeRepository();

var database_config = require(path.join(__dirname, 'config', 'database'));

const node_env = process.env.NODE_ENV || "development";
let sequelize:Sequelize 

if (node_env == "development") {
    sequelize =  new Sequelize({
        operatorsAliases: false,
        database: database_config.development.database,
        dialect:  database_config.development.dialect,
        username: database_config.development.username,
        password: database_config.development.password,
        storage: database_config.development.storage,
        modelPaths: ['/src/models/*.ts']
    });
} else {
    sequelize =  new Sequelize({
        //operatorsAliases: false,
        dialect:  database_config.production.dialect,
        host: database_config.production.host,
        port: database_config.production.port,
        username: database_config.production.username,
        password: database_config.production.password,        
        database: database_config.production.database,
        // storage: database_config.production.storage,
        modelPaths: ['/src/models/*.ts']
    });
}

// test la connection sequelize
// executed "before" `sequelize.sync(...)`
sequelize.addHook('beforeBulkSync', function (options) {
    // this = sequelize instance
    console.log('beforeBulkSync')
  })
  
  // executed "after" `sequelize.sync(...)`
  sequelize.addHook('afterBulkSync', function (options) {
    // this = sequelize instance
    console.log('afterBulkSync')
    
    // add default client
    let client:Client = new Client;
    client.id = "abc123";
    //client.value = 'abc123'
    client.clientSecret = 'ssh-password'
    client.save()
    .then(() => {
        console.log('default client created')
    }).catch((err)=> {
        //console.log(err)
    })
  })
  
  sequelize.sync()
  .then(function(){
    console.log('done')
  })

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// drop and create database au demarrage 
// quand on change le model par exemple !!! =)
//sequelize.sync({force: true});

// ah tester mais update peut etre le modele sans drop les tables (marche pas faut regarder la doc)
sequelize.sync();

// defini nos models de base de données
sequelize.addModels([User, Tag, Mention, Picture, AccessToken, RefreshToken , AuthorizationCode, Client, Like, Comment, Notification, PictureSave, Message]);

console.log(database_config.development.database);

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const http = require('http');
//const server = http.createServer(app);

/** Server TCP pour les message instantanée ou pour les notification 
 * a voir c'est un test
 */
//const io = require('socket.io')(port);

io.on('connection', (socket) => {
    connectionsTcp.push(socket);

    socket.on('connect', (socket: any) => {
        console.log('Connected client on port %s.');
    })

    socket.on('disconnect', (data) => {
        console.log("A User connected with " + socket.username + " is now disconnected of online chat server")
        // supprime l'utilisateur TCP
        let deleteUser = null;
        let nbConnection = 0;
        usersTcp.forEach(user => {
            if (user.id == socket.username)
                deleteUser = user;
        })
        connectionsTcp.forEach(tmpSock => {
            if (socket.username == tmpSock.username) {
                ++nbConnection;
            }
        })
        console.log("!!!::::!!!! nbSocket for this user " + nbConnection)
        if (deleteUser != null && nbConnection < 2) {
            console.log("!!!!!!! DELETE USER")
            console.log("remove tcp user (Online chat user)")
            usersTcp.splice(usersTcp.indexOf(deleteUser), 1);
        }
        // if (usersTcp.indexOf(socket.username) != -1) { 
        //     console.log("remove tcp user (Online chat user)")
        //     usersTcp.splice(usersTcp.indexOf(socket.username), 1);
        // }
        // on a supprimé un user online alors on notifi tout le monde de la nouvelle liste
        io.sockets.emit('get users', usersTcp);
        // supprime la connection TCP 
        if (connectionsTcp.indexOf(socket) != -1) {
            console.log("remove connexion socket")
            connectionsTcp.splice(connectionsTcp.indexOf(socket), 1);
        }
        // supprime le timer sinon quand le socket reviens et resouscrit le timer, il le recoit 2 fois et on le spam
        clearInterval(socket.interval)
    })

    socket.on('exit chat', (data) => {
        console.log("Exit chat online : " + socket.username + "")
        // supprime l'utilisateur TCP
        let deleteUser = null;
        usersTcp.forEach(user => {
            console.log("try to find user " + user.id + " for disconnect !")
            if (user.id == socket.username) {
                deleteUser = user;
                console.log("!!!! find delete user")
                console.log(deleteUser)
            }
                
        })
        let nbClient = 0;
        connectionsTcp.forEach(tmpSock => {
            if (socket.username == tmpSock.username) {
                ++nbClient;
            }
        })
        console.log("!!!::::!!!! nbSocket for this user " + nbClient)
        //console.log()
        if (deleteUser !== null && nbClient < 2 && deleteUser.id == socket.username) {
            console.log("!!!!!!! Exit chat !!!!")
            console.log("remove tcp user (Online chat user) in exit chat tcp")
            console.log(usersTcp)
            usersTcp.splice(usersTcp.indexOf(deleteUser), 1);
            io.sockets.emit('get users', usersTcp);
            console.log("after !! : ")
            console.log(usersTcp)
        }
        // io.sockets.emit('get users', usersTcp);
        // if (usersTcp.indexOf(socket.username) != -1) {
        //     console.log("remove user of chat online ")
        //     usersTcp.splice(usersTcp.indexOf(socket.username), 1);
        //     console.log(usersTcp)
        //     io.sockets.emit('get users', usersTcp);
        // }
    })

    // permet d'envoyer un message a tous les autre utilisateur
    socket.on('send message', (data) => {
        console.log("Send message " + data)
        User.findById(socket.username)
        .then(user => {
            if (user != null) {
                user.firstName = user.previous("firstName")
                io.sockets.emit('new message', {message: data, username: socket.username
                    , displayname: user.firstName});
            }
        }).catch(err => {

        })
        
    })

    // permet d'envoyer un message a un utilisateur
    socket.on('send private message', (data, username) => {
        console.log("Send message " + data)
        User.findOne({where: {id: socket.username}}).
        then(user => {
            if (user == null || user == undefined) {
                console.log("send message to a inexisting user")
            } else {
                user.firstName = user.previous("firstName")
                let newMessage = new Message();
                newMessage.value = data;
                newMessage.destUserId = username;
                newMessage.srcUserId = socket.username
                newMessage.save().then(() => {
                    connectionsTcp.forEach(tmpSocket => {
                        if (username == tmpSocket.username) {
            
                            console.log(socket.username + " dit a " + username + " de resfresh ses notifs")
                            tmpSocket.emit('new message', {message: data, username: socket.username, displayname: user.firstName, user: user});
                        }
                    })
                })
            }
        }).catch(err => {
            console.error(err)
            console.error("user not found")
        })
    })

    // methode appeler par un utilisateur quand il se connect (pas de securité ^^ juste son username 'id')
    socket.on('new user', (data, callback) => {
        callback(true);
        // data = user.id dans la database
        socket.username = data;
        console.log("New User Chat in chat : " + socket.username)
        let isInOnlineUser = false;
        usersTcp.forEach(user => {
            if (user.id == data) {
                isInOnlineUser = true;
            }
        })
        if (!isInOnlineUser) {
            let user = new UserApi;
            user.id = socket.username;
            User.findOne({where: {id: user.id}})
            .then(dbuser => {
                if (dbuser == null || dbuser == undefined) {
                    // username not found 
                    return
                } else {
                    console.log("user find in new user tcp !!")
                    user.firstName = dbuser.previous("firstName")
                    user.lastName = dbuser.previous("lastName")
                    user.pictureUrl = dbuser.previous("pictureUrl")
                    console.log(usersTcp)
                    usersTcp.push(user);

                    console.log(usersTcp)
                    io.sockets.emit('get users', usersTcp);
                    console.log('emit ok !')
                    //console.log(usersTcp)
                    // nouveau user, dit au autre usersTcp la nouvelle liste de user online
                }
            }).catch(err => {
                console.error(err)
            })
        }
        io.sockets.emit('get users', usersTcp);

        // ici je pourrais faire a chaque new user je lance un interval (timer js) 
        // qui ba regarder les notification du mec et le notifier si besoin 
        // (mais reviens a faire bcp de requete c'est pas top) (et il fauddrait le supprimer dans disconect)

    })

    socket.on('get notif', (username) => {
        io.sockets.emit('get users', usersTcp);
        connectionsTcp.forEach(tmpSocket => {
            console.log(tmpSocket.username)
            if (username == tmpSocket.username) {
                console.log("dit a " + username + " de resfresh ses notifs")
                tmpSocket.emit('refresh notif');
            }
        }) 
    });

    socket.on('send notif', (notif, username) => {
        console.log("!!!!!!!!! Notify les " + username)
        connectionsTcp.forEach(tmpSocket => {
            if (username == tmpSocket.username) {
                console.log("tcp connection found for " + username)
                tmpSocket.emit('notif', notif);
            }  
        });
    });

    // methode pour recuperer l'heure du server
    socket.on('subscribeToTimer', (interval) => {
        console.log('client is subscribing to timer with interval ', interval);
        socket.interval = setInterval(() => {
            //console.log("send date to " + socket.username)
            socket.emit('timer', new Date());
        }, interval);
      });
});

// io.listen(4242);
// console.log('listening tcp port on ', 4242);

// server express pour l'api en gros ya un server TCP sur 4242
//                                   et un server http sur 3000

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// use it before all route definitions
//app.use(cors())
app.use(cors({credentials: true, origin: '*'}))
app.options('*', cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// ne pas enlever bodyParser ^^
app.use(bodyParser.json({  }));
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(bodyParser.json({limit: '150kb'}));
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
// limit: '150kb',
// extended: true
// })); 

//app.use(errorHandler());
//app.use(bodyParser.json({ limit: '2kb' }))
//app.use(express.limit('4M'));

app.use(session({ key: 'user_sid', secret: 'trucsecret', resave: false, saveUninitialized: false }));
// user flash pour les messages d'erreur
app.use(flash());

// // parse a data with connect-multiparty. 
// app.use(formData.parse(multipartyOptions));
// // clear all empty files (size == 0)
// app.use(formData.format());
// // change file objects to node stream.Readable 
// app.use(formData.stream());
// // union body and files
// app.use(formData.union());


//   250 000 => 250 ko
// 1 000 000 => 1 mo
app.use(fileUpload({
    limits: { fileSize: 5000000 },
  }));

// configure passport
require('./auth');
// initialise passport
app.use(passport.initialize());
// flash necessite d'utiliser session ...
app.use(passport.session());

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

app.use('/users', UsersController);
app.use('/search', SearchController);
app.use('/pictures', PicturesController);
app.use('/', LoginController);
// test 
app.post('/login', login.login);
// end test
//app.use('/', OAuth2Controller);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);

app.post('/oauth/register', passport.authenticate(['oauth-register']),
function(req:any, res) {
    console.log('new oauth register');
    // verifie client !!!
    //console.log(req.body)
    Client.findOne({where : {id: req.body.client_id}})
    .then(client => {
        //console.log('client secret: ' + clientSecret)
        //console.log(client);
        if (!client || !req.body.client_id) {
            res.status(403).send("Client not exist");
            return;
        }
        if (req.body.client_secret == null || client.clientSecret !== req.body.client_secret) {
            res.status(403).send("Client Secret Incoret");
            return;
        }
        if (req.user.email == null)
        {
            //console.log(req.flash("registerMessage"))
            res.status(403).send(req.flash("registerMessage")[0]);
            return
        }
        if (!req.body.grant_type || req.body.grant_type != "password") {
            res.status(400).send("Bad grant_type");
            return
        }
         console.log(req.user)
         res.status(200).send('User Register');
    }).catch(err => {
        res.status(400).send("Bad Request");
    });
});

// swagger route 

var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json'),
    swagger = require("swagger-node-express");

    // TODO !! deprecated trouver la methode pour la remplacer
swagger.setAppHandler(app);

swagger.addValidator(
    function validate(req, path, httpMethod) {
      //  example, only allow POST for api_key="special-key" 
      console.log('!!!!!!!! Validate ???')
      if ("POST" == httpMethod || "DELETE" == httpMethod || "PUT" == httpMethod) {
        var apiKey = req.headers["api_key"];
        if (!apiKey) {
            console.log("ApiKey == null")
          //apiKey = url.parse(req.url,true).query["api_key"];
        }
        if ("special-key" == apiKey) {
          return true; 
        }
        return false;
      }
      return true;
    }
  );

  //swagger.addModels(PictureApi);

  //swagger.addModels(JSON.stringify(UserApi));

  //swagger.configureSwaggerPaths("", "/api-docs", "");


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// route for facebook authentication and login
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_friends'] }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login',
    }), (req: any, res) => {
        console.log('connection facebook reussi !!!')
        Logger.info("user " + req.user.id + ' is connected')
        // faire quelque chose en fonction de cette connection 
        // cree un token pour ce mec par exemple et rediriger 
        // vers notre site avec le token a utiliser en param ou autre 
        // genre res.redirect('http://localhost:8081/auth/callback?token=123456789&userName=toto'); ?? je sais pas trop encore
        AccessToken.findOne({where : {userId: req.user.id}})
        .then((dbtoken) => {
            if (dbtoken != null && dbtoken != undefined)
            {
                console.log('find token so redirect : ' + configAuth.BASE_URL)
                res.redirect(configAuth.BASE_URL + '#/auth/callback?token=' + dbtoken.value + '&id=' + dbtoken.userId);
            } else {
                var expirationDate = new Date(new Date().getTime() + (3600 * 1000));
                let accessToken = new AccessToken;
                accessToken.userId = req.user.id;
                accessToken.clientId = '';
                accessToken.value = Utils.getUid(100);
                accessToken.expirationDate = expirationDate.getTime();
                return accessToken.save()
                .then((token) => {
                    console.log('return token')
                    console.log(token);
                   // res.send(token);
                    res.redirect(configAuth.BASE_URL + '#/auth/callback?token=' + token.value + '&id=' + token.userId);
                }).catch((err) => {
                    console.log('err !! : ')
                    console.log(err);
                    //res.send({ error: 'fail to save new access token'});
                    res.redirect(configAuth.BASE_URL);
                });
            }
        }).catch((err) => {
            console.log('err ' + err);
            //return undefined
            console.log(configAuth.BASE_URL);
            res.send(err).redirect(configAuth.BASE_URL);
        })
});

app.get('/auth/google',
  passport.authenticate('google', { scope: 
  	[ 'https://www.googleapis.com/auth/plus.login',
  	, 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

app.get('/auth/google/callback', 
    passport.authenticate( 'google', { 
        failureRedirect: '/auth/google/failure'
}), (req: any, res) => {
    console.log('connection google reussi !!!')
    Logger.info("user " + req.user.id + ' is connected')
    // faire quelque chose en fonction de cette connection 
    // cree un token pour ce mec par exemple et rediriger 
    // vers notre site avec le token a utiliser en param ou autre 
    // genre res.redirect('http://localhost:8081/auth/callback?token=123456789&userName=toto'); ?? je sais pas trop encore
    AccessToken.findOne({where : {userId: req.user.id}})
    .then((dbtoken) => {
        if (dbtoken != null && dbtoken != undefined)
        {
            console.log('find token so redirect : ' + configAuth.BASE_URL)
            res.redirect(configAuth.BASE_URL + '#/auth/callback?token=' + dbtoken.value + '&id=' + dbtoken.userId);
        } else {
            var expirationDate = new Date(new Date().getTime() + (3600 * 1000));
            let accessToken = new AccessToken;
            accessToken.userId = req.user.id;
            accessToken.clientId = '';
            accessToken.value = Utils.getUid(100);
            accessToken.expirationDate = expirationDate.getTime();
            return accessToken.save()
            .then((token) => {
                console.log('return token')
                console.log(token);
               // res.send(token);
                res.redirect(configAuth.BASE_URL + '#/auth/callback?token=' + token.value + '&id=' + token.userId);
            }).catch((err) => {
                console.log('err !! : ')
                console.log(err);
                //res.send({ error: 'fail to save new access token'});
                res.redirect(configAuth.BASE_URL);
            });
        }
    }).catch((err) => {
        console.log('err ' + err);
        //return undefined
        console.log(configAuth.BASE_URL);
        res.send(err).redirect(configAuth.BASE_URL);
    })
});


app.get('/', function(req:any, res:express.Response){
  req.logout();
  res.render('home');
});

server.listen(port, () => {
    Logger.info('Start Server on port ' + port + " ip : " + ip.address())
    console.log(`Listening at http://localhost:${port}/`);
});

