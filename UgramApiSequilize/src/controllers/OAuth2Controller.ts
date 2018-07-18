'use strict';
import { Router, Request, Response } from 'express';
import * as oauth2orize from 'oauth2orize'
import * as passport  from 'passport';
import * as login from 'connect-ensure-login';
import {Client, AuthorizationCode, AccessToken, User, RefreshToken} from '../models'
import {Utils} from '../utils/utils';
//import {Logger} from '../utils/logger';

// Create OAuth 2.0 server
const server = oauth2orize.createServer();
const router: Router = Router();

// 3600 pour des token valide 1 h
// teamps avant l'expiration du access token en seconde
//const tokenTimeBeforeExpiration = 3600;
const tokenTimeBeforeExpiration = 3600;

server.serializeClient((client, done) => {
    done(null, client.id);
});

server.deserializeClient((id, done) => {
    Client.findById(id)
    .then(client => {
        if (!client || client == undefined) {
            console.log('fail to deserialize client')
            return done(null, false);
        }
        return done(null, client);
    });
});

// sauvegarde l'authorizationCodes pour permettant au site web de recuperer 
// un access token par exemple ou a postMan qui se sert de ce code pour demander un token
// il faut bien surveiller ces token car ils sont une potentielle faille de securité
server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
    const code = Utils.getUid(16);
    console.log('Try to get new Code ');
    // ce code ne doit pas marcher plus d'une minute et encore il revrait etre a usage unique je pense
    var expirationDate = new Date(new Date().getTime() + (60 * 1000));
    let authorizationCodes = new AuthorizationCode;
    authorizationCodes.clientId = client.id;
    authorizationCodes.redirectUri = redirectUri;
    authorizationCodes.userId = user.id;
    authorizationCodes.expirationDate = expirationDate.getTime();
    authorizationCodes.value = code;
    authorizationCodes.save()
    .then(() => {
        console.log('return code')
        return done(null, code);
    }).catch((err) => {
        console.log(err);
        return done(null, false, { error: 'fail to save authorization code'});
    });
}));

server.grant(oauth2orize.grant.token((client, user, ares, done) => {
    const token = Utils.getUid(255);

    var expirationDate = new Date(new Date().getTime() + (tokenTimeBeforeExpiration * 1000));
    console.log('Try to get new Access Token');
    let accessToken = new AccessToken;
    accessToken.userId = user.id;
    accessToken.clientId = client.clientId;
    accessToken.value = token;
    accessToken.expirationDate = expirationDate.getTime();
    accessToken.save()
    .then(() => {
        console.log('return token')
        return done(null, token);
    }).catch((err) => {
        console.log(err);
        return done(null, false, { error: 'fail to save new access token'});
    });
}));


// Used to exchange authorization codes for access token
// methode appeler par postman quand on demande un token Oauth2 par exemple
// et qu'il se demerde pour recuperer le token ou directement dans /login
// ou quand on refresh la page du site web /callback?code=XXXXX appel cette methode en boucle !!!
server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {
    console.log('try to receiv an access token 1 code : ' + code)
    //console.log(client);
    AuthorizationCode.findOne({where : {value : code}})
    .then((dbAuthCode) => {
        //console.log(dbAuthCode);
        // detruit le authCode pour plus que qu'il fonctionne
        dbAuthCode.destroy();
        if (!dbAuthCode || dbAuthCode == undefined) {
            console.log('Error : ');
            return done(null);
        }
        console.log('client id ')
        console.log(client.id);
        //console.log('client : ' + client.id + ' authCode Client : ' + authCode.clientId);
        if (client.id != dbAuthCode.clientId) {
            console.log('client id invalid')
            return done(null, false);
        }
           
        //console.log('on avance encore');
        //console.log('redirect uri : ' + redirectURI + ' authCode redirectUri : ' + authCode.redirectUri);
        if (redirectURI !== dbAuthCode.redirectUri) {
            console.log('redirect url invalid')
            return done(null, false);
        }
           
        //console.log('et on creer le token');
        const token = Utils.getUid(255);
        const refreshToken = Utils.getUid(255);
        var expirationDate = new Date(new Date().getTime() + (tokenTimeBeforeExpiration * 1000));
        // authCode.userId == 1 pour bob et 2 pour joe
        // et authCode.clientId == 1 pour abc123 donc l'id du client
        //console.log('ClientId ' + authCode.clientId);
        console.log('UserId ' + dbAuthCode.userId + ' have a new token : ' + dbAuthCode.userId);

        let newrefreshToken = new RefreshToken;
        newrefreshToken.userId = dbAuthCode.userId;
        newrefreshToken.clientId = dbAuthCode.clientId;
        newrefreshToken.value = refreshToken;
        newrefreshToken.clientSecret = client.clientSecret;
        newrefreshToken.save().then(()=> {
            console.log('new refresh token save, now try to save new Access token');
            let newAccesstoken = new AccessToken;
            newAccesstoken.value = token;
            newAccesstoken.userId= dbAuthCode.userId
            newAccesstoken.clientId = dbAuthCode.clientId
            newAccesstoken.expirationDate = expirationDate.getTime();
            newAccesstoken.save()
            .then(()=>{
                console.log('new access token save')
                //console.log('on essaie de sauvegarder le refresh token');
                //console.log('on essaie de sauvegarder l access token');
                dbAuthCode.destroy();
                return done(null, token, refreshToken, { expires_in: expirationDate });
            }).catch((err) => {
                console.log(err);
                return done(null, false, { error: 'fail to save new access token'});
            });
        }).catch((err) => {
            console.log(err);
            return done(null, false, { error: 'fail to save new refresh token'});
        });
    }).catch((err) => {
        console.log(err);
        return done(null, false, { error: 'fail to find authorization code'});
    });
}));

// methode appeler quand on demande le token en post avec tous les parametres
// genre quand je fais une requete curl en cpp pour avoir le token
server.exchange(oauth2orize.exchange.password((client: Client, username, password, scope, done) => {
    // Validate the client
    console.log('try to receiv a new access token 2 ' + client.id)
    //console.log(client)
    try {
        Client.findOne({where : {id: client.id}})
        .then((dbClient: Client) => {
            if (!dbClient || dbClient == undefined) {
                console.log('dbClient = null !!!!');
                return done('fail to find client');
            }
            if (!dbClient)
                return done(null, false);
            if (dbClient.clientSecret !== client.clientSecret) {
                console.log('Client Secret invalid');
                return done(new Error('Client Secret invalid'));
            }
            // Validate the user
            // console.log('try to validate the user 1');
            User.findById(username)
            .then(user => {
                if (user == null || user == undefined)
                    return done(null);
                if (password !== user.password) {
                    console.log('Try to send an invalid Password for ' + username);
                    return done(new Error('Invalid Password'));
                }
                //if (token infini pour cette utilisateur, le retouner direct)
                AccessToken.findOne({where : {userId: user.id}})
                .then((dbtoken) => {
                    if (dbtoken != null && dbtoken != undefined)
                    {
                        console.log('find dbToken for you');
                        user.update({isDisable: false}).then()
                        console.log(dbtoken.value);
                        return done(null, dbtoken.value, {id: user.id});
                    } else {
                                                // Everything validated, return the token
                        const token = Utils.getUid(255);
                        // refreshToken sert au client pour qu'il  puisse réobtenir un token quand il sera
                        // perimé 
                        var refreshToken = Utils.getUid(255);
                        var expirationDate= null;
                        if (tokenTimeBeforeExpiration > 0)
                            expirationDate = new Date(new Date().getTime() + (tokenTimeBeforeExpiration * 1000));
       
                        // save the new token in db.
                        // save aussi le refreshToken en fonction du clientId
                        let newrefreshToken = new RefreshToken;
                        newrefreshToken.userId = user.id;
                        newrefreshToken.clientId = client.id;
                        newrefreshToken.value = refreshToken;
                        newrefreshToken.clientSecret = client.clientSecret;
                        newrefreshToken.save().then(()=> {
                            console.log('new refresh token save, now try to save new Access token');
                            let newAccesstoken = new AccessToken;
                            newAccesstoken.value = token;
                            newAccesstoken.userId= user.id
                            newAccesstoken.clientId = client.id
                            if (expirationDate)
                                newAccesstoken.expirationDate = expirationDate.getTime();
                            newAccesstoken.save()
                            .then(()=>{
                                console.log('new access token save !!!!!!')
                                user.update({isDisable: false}).then()
                                //console.log('on essaie de sauvegarder le refresh token');
                                //console.log('on essaie de sauvegarder l access token');
                                return done(null, token, refreshToken, { expires_in: expirationDate , id: user.id});
                            }).catch((err) => {
                                console.log(err);
                                return done(null, false, { error: 'fail to save new access token'});
                            });
                        }).catch((err) => {
                            console.log(err);
                            return done(null, false, { error: 'fail to save new refresh token'});
                        });
                    }
                })

            });
        });
    }
    catch (e) {
        console.log('tes la salle ******' + e);
    }
}));

// methode appeler pour le refresh token pour avoir un nouveau access token
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
    // console.log('Authentification 3 pour avoir un token pour ' + client.id);
    RefreshToken.findOne({where : {clientId: client.id}})
    .then((localRefreshToken) => {
        //console.log(localRefreshToken);
        //console.log(client);
        if (!localRefreshToken)
            return done(null, false);
        if (localRefreshToken.id !== client.id)
            return done(new Error('Client Id is incorrect'));
        if (localRefreshToken.clientSecret !== client.clientSecret)
            return done(new Error('Client Password is incorrect'));
        if (localRefreshToken.value !== refreshToken)
            return done(new Error('incorrect refresh_token'));
        const newAccesstoken = Utils.getUid(255);
        var expirationDate = new Date(new Date().getTime() + (tokenTimeBeforeExpiration * 1000));
        //console.log('try to save new access token');
        let accessToken = new AccessToken;
        accessToken.value= newAccesstoken;
        accessToken.userId = localRefreshToken.userId
        accessToken.clientId = client.clientId
        accessToken.expirationDate = expirationDate.getTime();
        accessToken.save()
        .then(() => {
            return done(null, newAccesstoken, refreshToken, { expires_in: expirationDate });
        }).catch((err) => {
            return done(err);
        });
    });
}));

// methode appeler par le router (point d'entré')
module.exports.authorization = [
    login.ensureLoggedIn('/login'),
    server.authorization((clientId, redirectUri, done) => {
        console.log('try to find the client ' + clientId);
        Client.findOne({where: {id: clientId}})
        .then(client => {
            if (!client) {
                console.error('fail to find client')
                return done(null);
            }
            return done(null, client, redirectUri);
        });
    }, (client, user, done) => {
        if (client.isTrusted) {
            console.log('client not trusted')
            return done(null, true);
        }
        console.log('user ' + user.id + ' try to connect with client ' + client.clientId);
        AccessToken.findOne({where : {userId: user.id, clientId: client.clientId}})
        .then(token => {
            if (token) {
                console.log('find token !!!')
                return done(null, true);
            }
            console.log('fail to find token')
            return done(null, false);
        });
    }),
    (request, response) => {
        console.log('return dialog decision')
        response.render('dialog', { transactionId: request.oauth2.transactionID, user: request.user, client: request.oauth2.client });
    },
];

exports.decision = [
    login.ensureLoggedIn('/login'),
    server.decision()
];

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];


// // route pour le dialog OAuth2 (authorise l'appli a recup les info ou non)
// router.get('/oauth/token', passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
//     server.token(), server.errorHandler(), (req: Request, res: Response) => {
//     console.log('handle /token get request')
//     res.send('coucou');
// });

// // post la reponse pour savoir si l'utilisateur accepte ou non de partager ses infos
// router.post('/dialog/authorize/decision', login.ensureLoggedIn('/login'),
//     server.decision(), (req: Request, res: Response) => {
//     console.log('handle decision');
//     res.send('coucou');
// });

// // url pour recupere un token oauth2
// router.post('/dialog/authorize', login.ensureLoggedIn('/login'), 
//     server.authorization((clientId, redirectUri, done) => {
//         console.log('try to find the client ' + clientId);
//         Client.findOne({where: {clientId: clientId}})
//         .then(client => {
//             if (!client) {
//                 console.error('fail to find client')
//                 return done(null);
//             }
//             return done(null, client, redirectUri);
//         });
//     }, (client, user, done) => {
//         if (client.isTrusted) {
//             console.log('client not trusted')
//             return done(null, true);
//         }
//         console.log('user ' + user.id + ' try to connect with client ' + client.clientId);
//         AccessToken.findOne({where : {userId: user.id, clientId: client.clientId}})
//         .then(token => {
//             if (token) {
//                 console.log('find token !!!')
//                 return done(null, true);
//             }
//             console.log('fail to find token')
//             return done(null, false);
//         });
//     }), (req: any, res: Response) => {
//         console.log('authorization request');
//         res.render('dialog', { transactionId: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
// });

//export const OAuth2Controller: Router = router;
