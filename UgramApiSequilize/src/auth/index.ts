'use strict';
var passport = require('passport')
var Strategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
import {User, Client, AccessToken} from '../models';

const Sequelize = require('sequelize');
const io = require('socket.io-client') 

// port tcp du server real time

// socket tcp pour envoyer des notification au client
const socket = io("http://localhost:4242")


passport.serializeUser((user: User, done) => {
    console.log('serialize client')
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
   User.findById(id)
   .then((user: User) => {
       console.log('deserialise')
        done(null, user)
   }).catch(err => {
       done (null, err)
   })
});

// export const UGRAM_WEBSITE = {
//     'BASEURL': 'https://s3.ca-central-1.amazonaws.com/ugram-team-09/index.html',   
// };
/**
 * Strategy local pour se tester le mot de passe (ne donne pas de token)
 */
passport.use('local', new Strategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, username, password, done) => {
        User.findById(username)
        .then((user) => {
            //console.log('user find');
            if (user == null || user == undefined) {
                console.log('petite **** tu essaies de mettre un mauvais user');
                return done(null, false, req.flash('loginMessage', 'User does not exist'));
            }
            if (user.password !== password) {
                return done(null, false, req.flash('loginMessage', 'Bad Password'));
            }
            user.update({isDisable: false}).then()
            return done(null, user);
        });
    }
));

// Strategy pour s'enregister un utilisateur
passport.use('local-register', new Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {

        // email regex : |/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
        // if username pourri return error 
        if (username.match('[<>*!?\'\"]+') != null) {
            console.log('username pourri ' + username);
            return done(null, false, req.flash('registerMessage', 'bad username, forbidden char [\'<>*!?%\"]'));
        }
        
        if (username.match('^(fb+)[0-9]+$') != null
            || username.match('^(google+)[0-9]+$') != null) {
            console.log('username pourri format reservé ' + username);
            return done(null, false, req.flash('registerMessage', 'bad username, reserved format'));
        }

        if (username.match("^[0-9]*$") != null) {
            console.log('username dois contenir au moins une lettre ' + username + ' n est pas valide');
            return done(null, false, req.flash('registerMessage', 'bad username, the username field must have at least one character'));
        }
        const Op = Sequelize.Op;
        console.log("Check User registration")
        User.findById(username, {where: {
            isDisable: 1
        }})
        .then((user)=> {
            console.log(user)
            if (user != null && user != undefined) {
                //
                console.log("OLALALALALA tu reutilise un compte supprimé")
                //return done(null, false, req.flash('registerMessage', 'tu reutilise un compte supprimé connecte toi direct pour le reactiver'));
            }
        }).catch(err => {
            console.log('fail to find delete user')
            console.error(err)
        })

        console.log('register');
        User.findById(username)
        .then((user) => {
            if (user != null && user != undefined) {
                console.log('user exist');
                return done(null, false, req.flash('registerMessage', 'user exist'));
            }
            //TODO check si le username est bien une adresse mail valide
            // si pas bon retourner return done(null, false, req.flash('registerMessage', 'invalid email'));
        
            //console.log('register : ' + username + ' ' + password);
            let newUser:User = new User()
            newUser.id = username
            newUser.firstName = username;
            newUser.password = password;
            console.log('new id = ' + newUser.id);
            newUser.save()
            .then(res => {
                return done(null, newUser);
            }).catch((err) => {
                return done(null, false, req.flash('registerMessage', 'Fail to save new User'));
            })
        });
    }
));

// Strategy pour s'enregister un utilisateur
// pas encore utilisé
passport.use('oauth-register', new Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
            console.log("oauth register !!!!!!! : ")
            // email regex : |/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
            // if username pourri return error 
            if (username.match('[<>*!?\'\"]+') != null) {
                console.log('username pourri ' + username);
                return done('bad username, forbidden char [\'<>*!?%\"]', false, req.flash('registerMessage', 'bad username, forbidden char [\'<>*!?%\"]'));
            }
    
            if (username.match('^(fb+)[0-9]+$') != null
                || username.match('^(google+)[0-9]+$') != null) {
                console.log('username pourri format reservé ' + username);
                return done('bad username, reserved format', false, req.flash('registerMessage', 'bad username, reserved format'));
            }
            // if (username.match('[a-zA-Z]+[0-0]') == null)
            //     check = true
    
            if (username.match("^[0-9]*$") != null) {
                console.log('username dois contenir au moins une lettre ' + username + ' n est pas valide');
                return done('bad username, username dois contenir au moins une lettre', false, req.flash('registerMessage', 'bad username, username dois contenir au moins une lettre'));
            }
    
            User.findById(username)
            .then((user) => {
                if (user != null && user != undefined) {
                    console.log('user exist');
                    user.email = null
                    return done(null, user, req.flash('registerMessage', 'user exist'));
                } else {
                    Client.findOne({where : {id: req.body.client_id}})
                    .then(client => {
                        //console.log('client secret: ' + clientSecret)
                        //console.log(client);
                        if (!client) {
                            req.body.client_id = null
                            console.log("Bad Client id")
                            return done(null, user, {error: "bad credential"});
                        }
                            
                        if (client.clientSecret !== req.body.client_secret) {
                            req.body.client_secret = null;
                            console.log("Bad Client secret")
                            return done(null, user, {error: "bad credential"});
                        }

                        if ("password" !== req.body.grant_type) {
                            req.body.grant_type = null;
                            console.log("Bad grant type")
                            return done(null, user, {error: "bad grant_type"});
                        }
                        //console.log('return client');
                        console.log('!!!!!! !!! register : ' + username + ' ' + password);
                        let newUser:User = new User()
                        newUser.id = username
                        newUser.email = username
                        newUser.firstName = username;
                        newUser.password = password;
                        console.log('new id = ' + newUser.id);
                        newUser.save()
                        .then(res => {
                            return done(null, newUser);
                        }).catch((err) => {
                            return done("Fail to save new User", false, req.flash('registerMessage', 'Fail to save new User'));
                        })
                    });
                    
                }

                // if (boolean == false) {
                //    // req.body.client_id = null;
                //     return done(null, user, req.flash('registerMessage', 'bad credential'));
                // }
                //TODO check si le username est bien une adresse mail valide
                // si pas bon retourner return done(null, false, req.flash('registerMessage', 'invalid email'));
            }).catch(err => {
                console.log(err)
                return done("Bad Request", true, {error: "bad request"});
            });
        }
));


function verifyClientIdAndSecret(clientId, clientSecret): any {
    console.log('try to verify client ' + clientId)
    Client.findOne({where : {id: clientId}})
    .then(client => {
        //console.log('client secret: ' + clientSecret)
        //console.log(client);
        if (!client)
            return false;
        if (client.clientSecret !== clientSecret)
            return false;
        //console.log('return client');
        return true;
    });
}

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * Verify client id et client secret 
 */
function verifyClient(clientId, clientSecret, done) {
    //console.log('try to verify client ' + clientId)
    Client.findOne({where : {id: clientId}})
    .then(client => {
        //console.log('client secret: ' + clientSecret)
        //console.log(client);
        if (!client)
            return done(null, false);
        if (client.clientSecret !== clientSecret)
            return done(null, false);
        //console.log('return client');
        return done(null, client);
    });
}

passport.use(new BasicStrategy(verifyClient));

passport.use(new ClientPasswordStrategy(verifyClient));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token). If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
//methode appeler quand on fais une requete avec un access_token en post
passport.use(new BearerStrategy(
    (accessToken, done) => {
        console.log('try to find an access_token in db');
        AccessToken.findOne({ attributes: ['id', 'value', 'userId', 'clientId', 'expirationDate'], where: {value: accessToken}})
        .then((token) => {
            //console.log(token);
            if (token == null || token == undefined) {
                console.log('token introuvable ?? ' + accessToken);
                console.log('token = ' + token)
                return done(null, false);
            }
            console.log('User Token Expiration Date = ' + token.expirationDate);
            //console.log('Date = ' + new Date());
            // check si le token est expiré ou non pour acceder à la ressource
            // if (new Date().getTime() > token.expirationDate) {
            //     // supprime l'ancien token de la base de donnée
            //     token.destroy().then();
            //     console.log('Token is expired');
            //     done(false, false, { error_description: 'Token is expired' });
            // } else {
                if (token.userId) {
                    User.findById(token.userId)
                    .then((user) => {
                        if (user == null)
                        {
                            return done(null, false);
                        }
                        done(null, user, { scope: '*' });
                    }).catch((err) => {
                        console.log(err);
                        done(false, false, { scope: '*' });
                    });
                } else {
                    // verifie que le token appartien bien au client
                    Client.findById(token.clientId)
                    .then((client) => {
                        if (!client) {
                            console.log('client id does not exist')
                            return done(null, false);
                        }
                        done(null, client, { scope: '*' });
                    });
                }
            //} // pour l'expiration du token
        }).catch((err) => {
            console.log(err);
        });
    }
));

var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./confauth');
// =========================================================================
// FACEBOOK ================================================================
// =========================================================================
passport.use(new FacebookStrategy({
    // pull in our app id and secret from our auth.js file
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    scope: ['user_friends'],
    profileFields: ['emails', 'displayName', 'photos', 'first_name', 'last_name']
},
    // facebook will send back the token and profile
    function (token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
            // let user;
            //console.log('fbid: ' + profile.id); // users facebook id                   
            //console.log('token: ' + token); // the token that facebook provides to the user (on l'utilisera comme mot de passe en gros)                 
            console.log('name:  ' + profile.displayName);
            //console.log('email: ' + profile.emails[0].value);
            User.findById('fb' + profile.id)
            .then((user) => {
                console.log('find user : ')
                if (user != null && user != undefined)
                    user.provider = user.previous('provider');
                //console.log(user)
                if ((user == null || user == undefined)) {
                    console.log('user fb new !!!!!!!!: ')
                    console.log(profile);
                    //console.log(profile.photos[0].value)
                    let user = new User;
                    user.id = 'fb' + profile.id;
                    user.password = token;
                    if (profile.name.givenName != null)
                        user.firstName = profile.name.givenName;
                    if (profile.name.familyName != null)
                        user.lastName = profile.name.familyName;
                    user.pictureUrl = profile.photos[0].value;
                    user.email = profile.emails[0].value;
                    user.provider = 'facebook';
                    User.count()
                    .then(number => {
                        console.log('!!!!!!!! number ' + (+number + 1))
                        user.idNumber = +number + 1
                        user.registrationDate = new Date().getTime();
                        console.log("registration date : " + user.registrationDate)
                        user.save()
                        .then(() => {
                            console.log('end of save new user');
                            return done(null, user);
                        }).catch((err) => {
                            console.log(err);
                            return done(null, null);
                            // return done(null, profile);
                            // surment que l'id du mec sur facebook existe deja en base de donnée (peut probable mais possible ...)
                        });
                    })
                    //User.initializeId(user);
                    
                    //console.log(profile)
                   
                    // save ces information en base de donnée 
                    // ou si l'id existe deja en fonction de l'id
                    // retourner directement le user correspondant
                } else if ((user != null && (user.provider == 'ls' || user.provider == 'google'))) {
                    //console.log(user);
                    // un mec a deja pri ton id fb donc on peut pas creer
                    // le user avec le meme id ???
                    return done("Sorry, I am not able to connect you with the facebook provider, a stupid person has already taken your id with google or ls provider : " + user.id + ' facebook not accepted', null);
                } else {
                    user.update({isDisable: false}).then()
                    socket.emit('get notif', user);
                    // update friends list 

                    console.log("!!!!!!!!!!!!!!! User facebook friends")
                    if (profile.friends)
                        console.log(profile.friends)

                    return done(null, user);
                }
            }).catch(err => {
                console.log(err)
                return done(null, null);
            })
        });
    }
));

var GoogleStrategy = require('passport-google-oauth2').Strategy;
 
passport.use(new GoogleStrategy({
    clientID:     configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    {
        // asynchronous
        process.nextTick(function () {
            // let user;
            //console.log('fbid: ' + profile.id); // users facebook id                   
            //console.log('token: ' + token); // the token that facebook provides to the user (on l'utilisera comme mot de passe en gros)                 
            console.log('name:  ' + profile.displayName);
            //console.log('email: ' + profile.emails[0].value);
            User.findById('google' + profile.id)
            .then((user) => {
                console.log('find user : ')
                if (user != null && user != undefined)
                    user.provider = user.previous('provider');
                //console.log(user)
                if ((user == null || user == undefined)) {
                    console.log('user google new !!!!!!!!: ')
                    console.log(profile);
                    //console.log(profile.photos[0].value)
                    let user = new User;
                    user.id = 'google' + profile.id;
                    user.password = refreshToken;
                    if (profile.name.givenName != null)
                        user.firstName = profile.name.givenName;
                    if (profile.name.familyName != null)
                        user.lastName = profile.name.familyName;
                    user.pictureUrl = profile.photos[0].value;
                    user.email = profile.emails[0].value;
                    user.provider = 'google';
                    User.count()
                    .then(number => {
                        console.log('!!!!!!!! number ' + (+number + 1))
                        user.idNumber = +number + 1
                        user.registrationDate = new Date().getTime();
                        console.log("registration date : " + user.registrationDate)
                        user.save()
                        .then(() => {
                            console.log('end of save new user');
                            return done(null, user);
                        }).catch((err) => {
                            console.log(err);
                            return done(null, null);
                            // return done(null, profile);
                            // surment que l'id du mec sur facebook existe deja en base de donnée (peut probable mais possible ...)
                        });
                    })
                    //User.initializeId(user);
                    
                    //console.log(profile)
                   
                    // save ces information en base de donnée 
                    // ou si l'id existe deja en fonction de l'id
                    // retourner directement le user correspondant
                } else if ((user != null && (user.provider == 'ls' || user.provider == 'facebook'))) {
                    //console.log(user);
                    // conflit d'id
                    // un mec a deja pri ton id fb donc on peut pas creer
                    // le user avec le meme id ???
                    return done("Sorry, I am not able to connect you with the google provider, a stupid person has already taken your id with facebook or ls provider : " + user.id, null);
                } else {
                    user.update({isDisable: false}).then()
                    socket.emit('get notif', user);
                    return done(null, user);
                }
                    
            }).catch(err => {
                console.log(err)
                return done(null, null);
            })
        });
    }
  }
));