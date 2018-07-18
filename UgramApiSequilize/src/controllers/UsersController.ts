import { Router, Request, Response } from 'express';
import {User} from '../models/User'
import {Picture} from '../models/Picture'
import {Tag} from '../models/Tag'
import {Mention} from '../models/Mention'
import {SequelizeRepository} from '../repository/SequelizeRepository'
import {Utils} from '../utils/utils'
import {PictureApi} from '../models/PictureApi'
import { userInfo } from 'os';
import {UserApi} from '../models/UserApi'
import * as login from 'connect-ensure-login';
import * as passport from 'passport'
import { AccessToken, RefreshToken, Like } from '../models';
import {Logger} from '../utils/logger';
import { Comment } from '../models';
import { Notification } from '../models/Notification';
import { PictureSave } from '../models/PictureSave';
import { Message } from '../models/Message';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const router: Router = Router();

const repository: SequelizeRepository = new SequelizeRepository();

//------------------ Public Route ---------------

// return users list
router.get('/', (req: Request, res: Response) => {
    // Website you wish to allow to connect
    res.setHeader('Content-Type', 'application/json');
    Logger.info("user " + req.ip  + " get /users")
    User.findAll({raw: true})
    .then((users => {
        users.forEach((user) => {
            if (user === null || user.previous === null)
            {
                res.send('Id Inconnue');
                return;
            }
            //console.log(user);
        })

        var items:any = new Object;
        //User.count().then((nb: number) => {
            let search = '';
            console.log(req.query)
            if (req.query.search && req.query.search.length > 0) {
                console.log("search :!!!!!!!!!!" + req.query.search)
                search = req.query.search;
            }

            var items:any = new Object;
            items.items = users;
            items.totalPages = 1;
            
            let nbEntriesPerPage:number = 10;
            //console.log('perPage ' + req.query.perPage)
            if (req.query.perPage > 0) {
                nbEntriesPerPage = <number>req.query.perPage;
                console.log('per page : ' + nbEntriesPerPage)
            }
    
            items.totalPages = Math.floor(users.length / nbEntriesPerPage);
            if (users.length % nbEntriesPerPage != 0 && nbEntriesPerPage > 1) {
                items.totalPages += 1;
            }
    
            let nb1 = users.length - (+nbEntriesPerPage + 1);
            let nb2 = users.length
            //console.log(req)
            if (req.query.page > 0
                || req.query.page == 0
                || req.query.page == undefined) {
                console.log('page !!!! ' + req.query.page)
                // respond with error
    
                let num:number = req.query.page;
                if (num == undefined) {
                    num = 0;
                }
                //num++
                num++;
                //console.log('num ' + <number>(<number>+num + <number>1))
                nb1 = users.length - (nbEntriesPerPage * (+num + 1));
                nb1 = nb1 + +nbEntriesPerPage;
                nb2 = users.length - (nbEntriesPerPage * (num))
                nb2 = nb2 + +nbEntriesPerPage
            }

            //console.log(items);
            const Op = Sequelize.Op;

            if (search.length > 0) {
                var param = {where: {
                    isDisable: 0,
                    [Op.and]: {
                        [Op.or]: [
                            {
                                id: {
                                    [Op.like]: '%' + search + '%'
                                }
                            },
                            {
                                email: {
                                    [Op.like]: '%' + search + '%'
                                }
                            },
                            {
                                firstName: {
                                    [Op.like]: '%' + search + '%'
                                }
                            },
                            {
                                lastName: {
                                    [Op.like]: '%' + search + '%'
                                }
                            },
                            {
                                phoneNumber: {
                                    [Op.like]: '%' + search + '%'
                                }
                            }
                        ]
                    }
                }}
                
            } else {
                param = <any>{raw:true, where: {
                     isDisable: //{
                         0
                    //     [Op.gte]: (nb1)
                    //     ,
                    //     [Op.lt]: (nb2)
                     //}
                }}
            }
            
            User.findAll(param)
                .then((users => {
                    let usersApi = new Array;
                    
                    if (users != null && users != undefined) {
                        //console.log(users)
                        users.sort(function (a, b) {
                            return a.idNumber - b.idNumber;
                        });
                        let nbUser:number = 0;
                        // users.forEach(user => {
                        //     let userapi = new UserApi;
                        //     userapi.id = user.id;
                        //     userapi.email = user.email;
                        //     userapi.lastName = user.lastName;
                        //     userapi.firstName = user.firstName;
                        //     userapi.phoneNumber = user.phoneNumber;
                        //     userapi.registrationDate = user.registrationDate;
                        //     userapi.pictureUrl = user.pictureUrl;
                        //     if (nbUser < nbEntriesPerPage)
                        //     {
                        //         nbUser++;
                        //         usersApi.push(userapi);
                        //     }
                        // })
                        for (let i = 0; i < users.length; i++) {
                        if (+i >= +nb1 && +i < +nb2 /*|| usersApi.length < nbEntriesPerPage)*/) {
                                //console.log('add user final !! : ' + i)
                                if (users[i].isDisable == false)
                                    usersApi.push(Utils.getUserApi(users[i]));
                            }
                        }
                        items.totalEntries = usersApi.length;
                        items.items = usersApi
                    } else {
                        items.items = new Array;
                    }
                    items.items = usersApi;
                    items.totalEntries = users.length;
                    res.send(items);
                    return
                    //res.status(200).send('Dommage Ya Personne')
                }))
           
        //});
    })).catch((err) => {
        Logger.error(err);
        console.log(err);
        res.send('=(')
    })
});

// return user par id
router.get('/:id', (req: Request, res: Response) => {
    let id = req.params.id;
    Logger.info("user " + req.ip  + " get /users/" + id)
    User.findById(id, {where: {isDisable: 0}, attributes: [ 'id', 'email', 'firstName', 'lastName', 'phoneNumber', 'pictureUrl', 'registrationDate']})
    .then((user) => {
        if (user === null || user.previous === null)
        {
            res.status(404).send('User ' + req.params.id + ' does not exist.')
            return;
        }
        user.firstName = user.previous('firstName');
        user.lastName = user.previous('lastName');
        user.pictureUrl = user.previous('pictureUrl');
        user.phoneNumber = user.previous('phoneNumber');
        user.age = user.previous('age');
        user.email = user.previous('email');
        user.registrationDate = user.previous('registrationDate');
        
        let userapi = new UserApi;
        userapi.id = user.id;
        userapi.email = user.email;
        userapi.lastName = user.lastName;
        userapi.firstName = user.firstName;
        userapi.phoneNumber = user.phoneNumber;
        userapi.registrationDate = user.registrationDate;
        userapi.pictureUrl = user.pictureUrl;
        
        //console.log('find : ')
        //console.log(user);
        res.status(200).send(userapi);
    }).catch((err) => {
        console.log(err);
        Logger.error(err);
        res.send(';)')
    });
});

// return toutes les images d'un user
router.get('/:userId/pictures', (req: Request, res: Response) => {
    let id = req.params.userId;
    res.setHeader('Access-Control-Allow-Origin', '*');
    let search = '';
    Logger.info("user " + req.ip  + " get /users/" + id + "/pictures")
    
    console.log(req.query)
    if (req.query.search && req.query.search.length > 0) {
        console.log("search :!!!!!!!!!!" + req.query.search)
        search = req.query.search;
    }


    User.findById(req.params.userId, {where: {isDisable: 0}})
    .then((user) => {
        //
        if (user === null || user === undefined) {
            res.status(404).send('User ' + req.params.userId + ' does not exist.')
        } else {
            Picture.findAll({include:[Tag, Mention, Like, Comment], attributes: [ 'id', 'creationDate', 'description', 'url', 'userId']
            , where: {userId: id}})
            .then((pictures => {
                // modifie la chaque picture pour qu'elles aient le bon format
                // var picturesApi:PictureApi[] = new Array();
                // pictures.forEach((picture) => {
                //     let pictureApi:PictureApi = Utils.getPictureApi(picture);
                //     if (pictureApi != null)
                //         picturesApi.push(pictureApi);
                //    // console.log(pictureApi);
                // })
                // var items:any = new Object;
                // // met dans une variable items pour faire comme sur leurs api
                // items.items = picturesApi;
                // items.items.sort(function (a, b) {
                //     return b.id - a.id;
                // });
                // Picture.count().then((nb) => {
                   
                //     items.totalPages = nb / 20;
                //     items.totalEntries = nb;
                //     console.log(items);
                //     res.status(200).send(items);
                // });

                var picturesApi:PictureApi[] = new Array();
        
                pictures.forEach((picture) => {
                    let add = false;
                    let pictureApi:PictureApi = Utils.getPictureApi(picture);
                    if ((pictureApi != null && search == '')) {
                        picturesApi.push(pictureApi);
                        //console.log('No search')
                        add = true;
                    } else if (pictureApi != null && search.length > 0
                        && add === false) {
                        pictureApi.mentions.forEach(mention => {
                            if (mention.indexOf(search) !== -1) {
                                add = true;
                                console.log('find mention match')
                            }
                            
                        })
                        if (add === false) {
                            pictureApi.tags.forEach(tag => {
                                if (tag.indexOf(search) !== -1) {
                                    console.log('find tags match')
                                    add = true;
                                }
                            })
                        } 
                        if (add === false && pictureApi.description.indexOf(search) !== -1) {
                            add = true;
                            console.log('find description match')
                        }
                        if (add === false && pictureApi.userId.toString().indexOf(search) !== -1) {
                            add = true;
                            console.log('find userId match')
                        }
                        if(add)
                            picturesApi.push(pictureApi);
                    }
                   // console.log(pictureApi);
                })
                var items:any = new Object;
                items.items = picturesApi;
                items.totalPages = 1;
                
                let nbEntriesPerPage:number = 20;
                //console.log('perPage ' + req.query.perPage)
                if (req.query.perPage > 0) {
                    nbEntriesPerPage = <number>req.query.perPage;
                    console.log('per page : ' + nbEntriesPerPage)
                }
        
                items.totalPages = Math.floor(picturesApi.length / nbEntriesPerPage);
                if (picturesApi.length % nbEntriesPerPage != 0 && nbEntriesPerPage > 1) {
                    items.totalPages += 1;
                }
        
                let nb1 = picturesApi.length - (+nbEntriesPerPage + 1);
                let nb2 = picturesApi.length
                //console.log(req)
                if (req.query.page > 0
                    || req.query.page == 0
                    || req.query.page == undefined) {
                    console.log('page !!!! ' + req.query.page)
                    // respond with error
        
                    let num:number = req.query.page;
                    if (num == undefined) {
                        num = 0;
                    }
                    //num++
                    num++;
                    //console.log('num ' + <number>(<number>+num + <number>1))
                    nb1 = picturesApi.length - (nbEntriesPerPage * (+num + 1));
                    nb1 = nb1 + +nbEntriesPerPage;
                    nb2 = picturesApi.length - (nbEntriesPerPage * (num))
                    nb2 = nb2 + +nbEntriesPerPage
                  }
        
                // enlever des element de picturesApi
                // prendre de  x > nb2 && x < nb1
        
                console.log('nb1 ' + nb1 + ' nb2 ' + nb2)
                let newTab = new Array<PictureApi>();
                for (let i = 0; i < items.items.length; i++) {
                    //console.log(i)
                    if (+i >= +nb1 && +i < +nb2) {
                       // console.log('add picture final !! : ' + i)
                        newTab.push(items.items[i]);
                    }
                }
                newTab.sort(function (a, b) {
                    return b.id - a.id;
                });
                items.items = newTab;
                items.totalEntries = picturesApi.length;
                res.send(items);
        
            })).catch((err) => {
                console.log(err);
                Logger.error(err)
                res.status(400).send("Error in get user's picture")
            }) 
        }
    })
});

// return une image d'un user
router.get('/:userId/pictures/:pictureId', (req: Request, res: Response) => {
    let pictureId = req.params.pictureId;
    res.setHeader('Access-Control-Allow-Origin', '*');

    let height = req.params.height

    if (height == undefined)
        height = 128
    

    //res.setHeader("Access-Control-Allow-Origin", "tamere");
    //res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    // TODO check if user exist before else return  "User 'userId' does not exist.
    User.findById(req.params.userId, {where: {isDisable: 0}})
    .then((user) => {
        //
        if (user === null || user === undefined) {
            res.status(404).send('User ' + req.params.userId + ' does not exist.')
        } else {
            Picture.findById(pictureId, {include:[Tag, Mention, Like, Comment], attributes: [ 'id', 'creationDate', 'description', 'url', 'userId']})
            .then((pict) => {
                // reaffecte les attribut de l'image (ils disparaissent alors 
                // qu'ils sont toujours en base de données ils sont toutes fois
                // dans le previous)
                var pictureApi = Utils.getPictureApi(pict);
                if (pictureApi != null) {
                    //var Jimp = require("jimp");

                    // open a file called "lenna.png"
                    // Jimp.read(pictureApi.url, function (err, lenna) {
                    //     if (err) {
                    //         res.status(500).send("error pour lire l'image");
                    //         throw err;
                    //     }
                    //     lenna.resize(256, 256)            // resize
                    //             .quality(60)                 // set JPEG quality
                    //             .greyscale()                 // set greyscale
                    //             .write("lena-small-bw.jpg"); // save
                        
                        res.send(pictureApi);
                    //});
                }
                else
                    res.status(404).send('Picture ' + pictureId + ' does not exist for user ' + req.params.userId);
                //console.log(pict);
            }).catch((err) => {
                console.log(err);
                Logger.error(err)
            });
        }
    })
});

// return une image d'un user modifié 
// prend l'image en parametre demandé modifie sa taille et retourn l'url de celle ci
router.get('/:userId/pictures/:pictureId/download',  passport.authenticate('bearer', { session: false }),
(req: Request, res: Response) => {
    let pictureId = req.params.pictureId;
    res.setHeader('Access-Control-Allow-Origin', '*');

    let height = parseInt(req.query.height)
    console.log(height)
    if (height == undefined || height == NaN)
        height = 128
    
    //res.setHeader("Access-Control-Allow-Origin", "tamere");
    //res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    // TODO check if user exist before else return  "User 'userId' does not exist.
    User.findById(req.params.userId, {where: {isDisable: 0}})
    .then((user) => {
        //
        if (user === null || user === undefined) {
            res.status(404).send('User ' + req.params.userId + ' does not exist.')
        } else {
            Picture.findById(pictureId, {include:[Tag, Mention, Like, Comment], attributes: [ 'id', 'creationDate', 'description', 'url', 'userId']})
            .then((pict) => {
                // reaffecte les attribut de l'image (ils disparaissent alors 
                // qu'ils sont toujours en base de données ils sont toutes fois
                // dans le previous)
                var pictureApi = Utils.getPictureApi(pict);
                if (pictureApi != null) {

                    // if l'image de taille height && pictureId == pictureId dans PictureSave, alors ne pas la creer et retourner l'url direct
                    PictureSave.findOne({where :{pictureId: pictureId, height: height}})
                    .then(picture => {
                        if (picture != undefined && picture != null) {
                            picture.url = picture.previous("url");
                            console.log("return")
                            console.log(picture)
                            return res.status(200).send(picture.url).end();
                        } else {
                            var Jimp = require("jimp");

                             // open a file called "lenna.png"
                            Jimp.read(pictureApi.url, function (err, picture) {
                                if (err) {
                                    res.status(500).send("error pour lire l'image");
                                    throw err;
                                }
                                // doit resize a la taille voulu
                                picture.resize(Jimp.AUTO, height)            // resize
                                        .quality(60)                 // set JPEG quality
                                        //.greyscale()                 // set greyscale
                                        .write("lena-small-bw.jpg"); // save
                                
                                let pictureIdAmazon = Utils.getUid(10);
                                
                                var aws = require('aws-sdk');

                                aws.config.update({
                                    accessKeyId: 'AKIAJSWHKIELBIDZ6VAA' ,
                                    secretAccessKey: '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',
                                    region : 'ca-central-1'
                                });

                                var s3 = new aws.S3();
                                var fs = require('fs');

                                // else {
                                //     console.log("test : !!! : ")
                                //     console.log(req.files.file)
                                // }
                                    console.log(picture)
                        
                                let tmpName = "./lena-small-bw.jpg"
                                fs.readFile(tmpName, function (err, data) {
                                    if (err)
                                        throw err; // Something went wrong!
                                    var s3 = new aws.S3();
                                    var params = {
                                        Bucket: 'images-ugram-team-09',
                                        Key: user.id + '/' + pictureIdAmazon + '.jpg',
                                        PartNumber: 1,
                                        Body: data
                                    };
                                    s3.upload(params, function (err, data) {
                                        // Whether there is an error or not, delete the temp file
                                        fs.unlink(tmpName, function (err) {
                                            if (err) {
                                                console.error(err);
                                            }
                                            console.log('Temp File Delete');
                                        });
                        
                                        console.log("PRINT FILE:", data);
                                        if (err) {
                                            console.log('ERROR MSG: ', err);
                                            res.status(500).send(err);
                                        } else {
                                            console.log('Successfully uploaded data');
                                            let newPictureSave = new PictureSave;
                                            newPictureSave.url = data.Location;
                                            newPictureSave.height = height;
                                            newPictureSave.pictureId = pictureId
                                            newPictureSave.save().then()
                                            res.status(200).send(data.Location).end();
                                        }
                                    });
                                });
                            });      
                        }
                    }).catch(err => {
                        res.status(500).send(err)
                    })
                }
                else
                    res.status(404).send('Picture ' + pictureId + ' does not exist for user ' + req.params.userId);
                //console.log(pict);
            }).catch((err) => {
                console.log(err);
                Logger.error(err)
            });
        }
    })
});

//----------------- Private Route --------------------------

// delete user
router.delete('/:id', passport.authenticate('bearer', { session: false }),
 (req: any, res) => {
    let id = req.params.id;
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token")
        return;
    }
    //console.log('try destroy user')
    User.findOne({where: {
        id: req.params.id,
        isDisable: false
    }, include: [Notification, Like, Comment]}).then((user) => {
        if (user == null) {
            res.status(404).send('User Id Not found')
            return;
        }
        // force = true supprime la ligne alors que sans ca met juste delateAt a l'heure de suppression
        //let promise = new Promise(function() {});
        user.likes = user.previous("likes")
        user.comments = user.previous("comments")
        user.notifications = user.previous("notifications")
        Logger.info("destroy " + user.id)
        console.log(user.likes)
        if (user.likes != undefined && user.likes != null)
            user.likes.forEach(like => {
                console.log("delete Like")
                like.destroy({ force: true }).then()
            })
        console.log("like supprimé")
        if (user.notifications != null && user.notifications != null)
            user.notifications.forEach(notif => {
                notif.destroy({ force: true }).then()
            })
        console.log("notif supprimé")
        if (user.comments != undefined && user.comments != null)
            user.comments.forEach(comment => {
                comment.destroy({ force: true }).then()
            })
        console.log("comment supprimé, essaie de supprimer le user")
        // on peut enfin supprimer le user
        const Op = Sequelize.Op;
        // remove all image a user.id where userId == user.id from Picture
        console.log("remove picture where user id = " + user.id)
             
        Picture.findAll({
            where: {userId: user.id}
        }).then(pictures => {
            console.log("picture lenght : " + pictures.length)
            pictures.forEach(picture => { 
                console.log("destroy picture : " + picture.id + " userId " + picture.userId)
                picture.tags.forEach(tag => {
                    //console.log('delete tag ' + tag.value)
                    //tag.destroy({force: true}).then();
                    tag.destroy().then();
                })
                // supprime les mention 
                picture.mentions.forEach(mention => {
                    //console.log('delete mention ' + mention.value)
                    //mention.destroy({force: true}).then();
                    mention.destroy().then();
                })
                //picture.destroy({force: true}).then();
                picture.destroy().then();
            })
        }).catch(err => {
            // fail to get all picture of userId
            console.error(err);
        })
        AccessToken.findAll({where: {userId: user.id}})
        .then(tokens => {
            if (tokens != null && tokens != undefined) {
                tokens.forEach(token => {
                //token.destroy({force: true}).then()
                    token.destroy({ force: true }).then()
                });
            }
        }).catch(err => {
            console.log("err for destroy user's access token")
            Logger.error(err)
        })
        RefreshToken.findAll({where: {userId: user.id}})
             .then(refresh_tokens => {
                if (refresh_tokens != null && refresh_tokens != undefined) {
                    refresh_tokens.forEach(token => {
                        //token.destroy({force: true}).then()
                        token.destroy().then()
                    });
                }
                console.log("refresh token delete")
             }).catch(err => {
                 console.log("err for destroy user's access token")
                 Logger.error(err)
             })
             // TOODO Attendre que tout soit supprimé putain sinon probleme de clé partagé
             user.update({isDisable: true})
             .then(() => {
                 console.log("User Disable !!!!!!!")
                // reindex tous les id vu qu'on supprime une ligne dans la base
                // !!!!!!!!!!!! si on utilise raw, on peut pas faire de save ou de destroy
                // !! utilise attribute a la place
                // User.findAll({raw: true, where: {id :{[Op.ne]: user.id}}})
                // .then(users => {
                //     let id = 1;
                //     //  console.log(users)
                //     var prevSave = new Boolean(false);
                //     var isFirst = new Boolean(true);
                //     //var myBreak = false;
                //     for (let i = 0; i < users.length;i++) {
                //         //console.log('forrrr ' + users[i].id)
                //         if (users[i] != undefined) {
                            
                //             prevSave = false;
                //             isFirst = false;
                //             //console.log('if')
                //             // console.log(user)
                //             // de la grosse merde ce save et find 
                //             User.findById(users[i].id, {attributes: [ 'id', 'email', 'firstName', 'lastName', 'phoneNumber', 'pictureUrl', 'creationDate', 'registrationDate']})
                //             .then(user => {
                //             if (user != null)
                //                 {
                //                     //console.log(user)
                //                     user.firstName = user.previous('firstName');
                //                     user.lastName = user.previous('lastName');
                //                     user.pictureUrl = user.previous('pictureUrl');
                //                     user.phoneNumber = user.previous('phoneNumber');
                //                     user.age = user.previous('age');
                //                     user.email = user.previous('email');
                //                     user.idNumber = user.previous('idNumber');
                //                     user.unique_id = user.previous('unique_id');
                //                     user.provider = user.previous("provider");
                //                 // console.log('edit user ' + user.id)
                //                     user.idNumber = id;
                //                     id = id + 1;
                //                     user.save().then(() => {
                //                         prevSave = true;
                //                         console.log('reindexation save !!!!!!!!!!')
                //                         //myBreak = true;
                //                     }).catch(err => {
                //                         console.log(err);
                //                         i++;
                //                     })
                //                 }
                //             })
                //             //users[i].idNumber = id++;
                //             //users[i].save().then().catch((err)=> {console.log(err)});
                //             //users[i].update({idNumber: id++}).then().catch((err)=> {console.log(err)});
                            
                //         } else {
                //                 continue;
                //             }
                //     }
                //     console.log('user destroy')
                // }).catch(err => {
                //     console.log("Fail to find all users for reindexation !!!!")
                //     console.log(err)
                // })
            }).catch(err => {
                console.log("Delte Fail !!!!!!!!!!!!!!! :")
                console.log(err)
            })

           
        res.status(200).send(`Delete User, ${id}`);
    })
    // delete user console.log(req.user.id);
    //res.status(200).send(`Delete User, ${id}`);
});

// edit user
router.put('/:id', passport.authenticate('bearer', { session: false }),
(req: any, res: Response) => {
    let id = req.params.id;
    var newUser:User = req.body;
    //console.log('data send : ')
    //console.log(req.user);
    // verifie que le token utiliser sert bien a modifier le userId id passé en parametre
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token ;)")
        return;
    }

    // req.user contien l'utilisateur qui a ete envoyé

    User.findById(id, {attributes: [ 'id', 'email', 'firstName', 'lastName', 'phoneNumber', 'pictureUrl', 'creationDate', 'registrationDate']})
    .then((user) => {
        if (user === null || user.previous === null)
        {
            res.status(404).send('User ' + req.params.id + ' does not exist.')
            return;
        }
        //console.log(user)
        user.firstName = user.previous('firstName');
        user.lastName = user.previous('lastName');
        user.pictureUrl = user.previous('pictureUrl');
        user.phoneNumber = user.previous('phoneNumber');
        user.age = user.previous('age');
        user.pictureUrl = user.previous('pictureUrl');
        user.email = user.previous('email');
        user.unique_id = user.previous('unique_id');
        user.idNumber = user.previous('idNumber');
        user.provider = user.previous('provider');
        var d = new Date(user.creationDate);
        user.registrationDate = d.getTime();
        console.log('find : ')
        console.log(user.firstName);
        user.firstName= newUser.firstName;
        user.lastName= newUser.lastName;
        if (newUser.age != null && newUser.age != undefined)
            user.age= newUser.age;
        user.phoneNumber= newUser.phoneNumber;
        user.email= newUser.email;
        user.pictureUrl = newUser.pictureUrl
        user.save().then(()=> {
            //res.status(200).send(`Edit User, ${id}`);
            var p = Utils.getUserApi(user);
            res.status(200).send(p);
        })
    }).catch((err) => {
        Logger.error(err)
        res.send('Error in edit user')
    });    
});

// add an image
router.post('/:userId/pictures', passport.authenticate('bearer', { session: false }), (req: any, res: Response) => {
    let pictureId = req.params.pictureId;
    let id = req.params.userId;
    var pictureBody = req.body;
    console.log('data send : ')
    console.log(pictureBody);
    //console.log(req)
    // verifie que le token utiliser sert bien a modifier le userId id passé en parametre
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token ;)")
        return;
    }
    Logger.info("user " + req.user.id + " with ip : " + req.ip + " try to add a picture")

    // req.user contien l'utilisateur qui a ete envoyé
    User.findById(id, {raw: true})
    .then((user) => {
        if (user === null || user.previous === null)
        {
            res.status(404).send('User ' + req.params.id + ' does not exist.')
            return;
        }
        //console.log(req.body)
        //Logger.info("add picture with body : ")
        //if (req.files.file != undefined && req.files.file.ReadStream.path != undefined)
        //   console.log(req.files.file.ReadStream.path)
        
        
        //creer l'image en base et mettre les bonne valeur pour 
        //les tag et les mentions plus uploar l'image une fois 
        // qu'on a l'id de l'image save sur amazon et repondre

        //flow userImage ---> api verify and save image on amazon --> save in his database the link if succeed
        

        let picture:Picture = new Picture();
        Picture.count()
        .then((number) => {
            let pictureIdAmazon = Utils.getUid(10);
            picture.description = req.body.description;
            // server d'image amazon
            picture.url = 'https://s3.ca-central-1.amazonaws.com/images-ugram-team-09/' + user.id + '/' + pictureIdAmazon + '.jpg';
            picture.userId = user.id;
            if (req.body.tags != null && req.body.tags === Array) {
                //console.log(req.body.tags)
                let array = req.body.tags.split(",");
                array.forEach(tag => {
                    let newTag = new Tag();
                    newTag.value = tag;
                    newTag.picture = picture;
                    picture.tags.push(newTag);
                })
            } else if (req.body.tags != null) {
                let newTag = new Tag();
                //console.log("save un seul tag a verifier")
                newTag.value = req.body.tags;
                newTag.picture = picture;
                picture.tags.push(newTag);
            }
            //console.log(picture.tags)
            if (req.body.mentions != null && req.body.mentions === Array) {
                let array = req.body.mentions.split(",");
                array.forEach(mention => {
                    let newMention = new Mention();
                    newMention.value = mention;
                    newMention.picture = picture;
                    picture.mentions.push(newMention);
                })
            } else if (req.body.mentions != null) {
               // console.log("on fais quoi de ces mention !!!! : ")
                //console.log(req.body.mentions)
                let newMention = new Mention();
                    newMention.value = req.body.mentions;
                    newMention.picture = picture;
                    picture.mentions.push(newMention);
            }
            //if (picture != null && )
            // exemple upload
            Logger.info('user ' + user.id + ' try to save picture ' + picture.url)
            Utils.sendAndSave(user.id + '/' + pictureIdAmazon + '.jpg', picture, req, res)
            // return reponse =) 
           
        }).catch(err => {
            console.log(err)
            res.status(400).send('Bad request')
        })
        
    }).catch((err) => {
        console.log(err);
        res.send('Error ;)')
    });
});

// edit une image d'un user
router.put('/:userId/pictures/:pictureId', passport.authenticate('bearer', { session: false }), (req: any, res: Response) => {
    let pictureId = req.params.pictureId;
    let id = req.params.userId;
    var pictureBody:PictureApi = req.body;
    console.log('data send : ')
    console.log(pictureBody);
    // verifie que le token utiliser sert bien a modifier le userId id passé en parametre
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token")
        return;
    }

    // req.user contien l'utilisateur qui a ete envoyé
    User.findById(id, {attributes: [ 'id']})
    .then((user) => {
        if (user === null || user.previous === null)
        {
            res.status(404).send('User ' + req.params.id + ' does not exist.')
            return;
        }
        //console.log(user)
        
        // get image where userId == user.id && pictureBody.id == pictureId
        Picture.findOne({where: {id:pictureId},include:[Tag, Mention], attributes: [ 'id', 'creationDate', 'description', 'url', 'userId']})
        .then((picture => {
           console.log('try to edit picture ' + pictureId)
           if (picture == null) {
                res.status(404).send('Picture Id Not found')
                return;
            }
           //console.log(picture)
           //console.log('by : ')
           //console.log(pictureBody);
           picture.description = pictureBody.description;
           picture.url = user.previous('url');
           picture.userId = user.previous('userId');
           // TODO edit tags
           // recupere les tags
           picture.tags = picture.previous('tags');
           picture.mentions = picture.previous('mentions');
           picture.likes = picture.previous("likes")
           picture.comments = picture.previous("comments")
            // delete les tags
            picture.tags.forEach(tag => {
                console.log('delete tag ' + tag.value)
                tag.destroy({ force: true }).then();
            })
            // delete les mentions
            picture.mentions.forEach(mention => {
                    console.log('delete mention ' + mention.value)
                    mention.destroy({ force: true }).then();
            })
            // ajoute les nouveau tag

            pictureBody.tags.forEach(newTag => {
                let tag = new Tag;
                console.log("test value : " + newTag)
                if ((newTag.charAt(0) != '#' && newTag.length == 1)
                    || (newTag.charAt(0) == '#' && newTag.length > 1)) {
                    tag.value = <any>newTag;
                    tag.pictureId = pictureId;
                    picture.tags.push(tag);
                    tag.save().then();
                } 
            })

            pictureBody.mentions.forEach(newMentions => {
                let mention = new Mention;
                console.log("test value mention : " + newMentions)
                if ((newMentions.charAt(0) != '@' && newMentions.length == 1)
                    || (newMentions.charAt(0) == '@' && newMentions.length > 1)) {
                    mention.value = <any>newMentions;
                    picture.mentions.push(mention);
                    mention.pictureId = pictureId;
                    mention.save().then();
                }
            })

            // quand on modie une image on touche pas au comment et au like normalement
            // pictureBody.comments.forEach(comment => {
            //     let newComment = new Comment();
            //     console.log("resave comment : " + comment)
            //     newComment.value = <any>comment;
            //     picture.comments.push(comment);
            //     newComment.pictureId = pictureId;
            //     newComment.save().then();
            // })

            // pictureBody.likes.forEach(like => {
            //     let newLike = new Like();
            //     console.log("resave comment : " + like)
            //     newLike.value = <any>like;
            //     picture.likes.push(newLike);
            //     newLike.pictureId = pictureId;
            //     newLike.userId = picture.userId;
            //     newLike.user = user;
            //     newLike.save().then();
            // })

            picture.save()
            .then(()=> {
                res.status(200).send("OK")
            }).catch(err => {
                console.log(err)
                res.status(400).send("Save Fail in edit picture")
            })

           
        })).catch((err) => {
            console.log(err);
            res.status(400).send('Bad request')
        })
        // save image
        // picture.save().then(()=> {
        //     res.status(200).send(`Edit Picture, of user ${id}`);
        // })
        
    }).catch((err) => {
        console.log(err);
        res.send('Error find user')
    });
});

// delete une image d'un user
router.delete('/:userId/pictures/:pictureId', passport.authenticate('bearer', { session: false }), (req: any, res: Response) => {
    let pictureId = req.params.pictureId;
    let id = req.params.userId;
    console.log('delete : ' + pictureId)
    // verifie que le token utiliser sert bien a modifier le userId id passé en parametre
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token")
        return;
    }

    // req.user contien l'utilisateur qui a ete envoyé
    User.findById(id, {attributes: [ 'id']})
    .then((user) => {
        if (user === null || user.previous === null)
        {
            res.status(404).send('User ' + req.params.id + ' does not exist.')
            return;
        }

        // TODO delete tag et delete mention before delete picture !!!!
        


        // get image pictureId where pictureId == id
        Picture.findOne({where: {id:pictureId},include:[Tag, Mention, Like, Comment], attributes: [ 'id', 'creationDate', 'description', 'url', 'userId']})
        .then((picture => {
            if (picture == null) {
                res.status(404).send('Picture Id Not found')
                return;
            }

            picture.tags = picture.previous('tags');
            picture.mentions = picture.previous('mentions');
            picture.likes = picture.previous('likes')
            picture.comments = picture.previous('comments');
            //console.log(picture.tags)
            
           //console.log('try to delete picture ' + pictureId)

           
           picture.tags.forEach(tag => {
                //console.log('delete tag ' + tag.value)
                tag.destroy({ force: true }).then();
           })
           picture.mentions.forEach(mention => {
               //console.log('delete mention ' + mention.value)
                mention.destroy({ force: true }).then();
           })
           picture.likes.forEach(like => {
                like.destroy({ force: true }).then();
            })
            picture.comments.forEach(comments => {
                comments.destroy({ force: true }).then();
            })
           picture.destroy().then();
           res.status(200).send("OK")
        })).catch((err) => {
            console.log(err);
            res.status(400).send('Bad request')
        })
    }).catch((err) => {
        console.log(err);
        res.send('Error ;)')
    });
});

// get notification for a user
router.get("/:userId/notifications", passport.authenticate('bearer', { session: false }), 
(req: any, res) => {
    let id = req.params.userId;
    //req.set   
    let isRead:boolean = false;
    console.log('perPage ' + req.query.isRead)
    if (req.query.isRead == 'true') {
       isRead = true;
       console.log("IsRead ========= true! !!!!!!!!")
    }
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token")
        return;
    }
    if (id != null && id != undefined) {
        User.findById(id, {attributes: ['id'], include: [Notification]})
        .then((user) => {
            user.notifications = user.previous("notifications")
            user.notifications
           // console.log(user.notifications)
            if (user === null || user.previous === null)
            {
                res.status(404).send('User ' + req.params.id + ' does not exist.')
                return;
            }
            let finalNotif = new Array;
            if (isRead == true) {
                res.status(200).send(user.notifications);
            } else {
                user.notifications.forEach(notif => {
                    notif.isRead = notif.previous("isRead")
                    notif.authorId = notif.previous("authorId")
                    if (notif.isRead == false) {
                        finalNotif.push(notif)
                    }
                });
                res.status(200).send(finalNotif);
            }
           
            
        })
        .catch(err => {
            res.status(500).send('Fail to get notification for this user')
        })
    } else {
        res.status(400).send('userId == null or undefined')
    }
})

// read notifications for a user
router.post("/:userId/notifications", passport.authenticate('bearer', { session: false }), 
(req: any, res) => {
    let id = req.params.userId;
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token")
        return;
    }
    if (id != null && id != undefined) {
        User.findById(id, {attributes: ['id'], include: [Notification]})
        .then((user) => {
            user.notifications = user.previous("notifications")
            //console.log(user)
            if (user === null || user.previous === null)
            {
                res.status(404).send('User ' + req.params.id + ' does not exist.')
                return;
            }
            Notification.findAll({where: {userId: id}})
            .then(notifications => {
                if (notifications == null || notifications == undefined
                    || notifications.length == 0) {
                    res.status(400).send("No notification to read")
                } else {
                    console.log("remove notification of " + req.user.id + " there is " + notifications.length + " notifications")
                    notifications.forEach(notification => {
                        notification.update({isRead: true}).then().catch(err => console.error(err));
                    })
                    res.status(200).send("Notification read");
                }
            })
            
        })
        .catch(err => {
            res.status(500).send('Fail to get notification for this user')
        })
    } else {
        res.status(400).send('userId == null or undefined')
    }
});

// get messages for a user
router.get("/:userId/messages", passport.authenticate('bearer', { session: false }), 
(req: any, res) => {
    let id = req.params.userId;
    //req.set   
    let isRead:boolean = false;
    console.log('perPage ' + req.query.isRead)
    if (req.query.isRead == 'true') {
       isRead = true;
       console.log("IsRead ========= true! !!!!!!!!")
    }
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token")
        return;
    }
    if (id != null && id != undefined) {
        console.log("try to find user with message id : " + id)
        User.findById(id, {attributes: ['id']})
        .then((user) => {
            //user.messages = user.previous("messages")
            //console.log(user)
           // console.log(user.notifications)
            if (user === null || user.previous === null)
            {
                res.status(404).send('User ' + req.params.id + ' does not exist.')
                return;
            }
            let finalMessage = new Array;
            console.log("find messages !! !")
            Message.findAll({where: {[Op.or]: [{srcUserId: id}, {destUserId: id}]}, attributes: ['id', 'value', 'srcUserId', 'destUserId', 'title', 'isRead', 'updatedOn']})
            .then(messages => {
                if (messages == null || messages == undefined) {
                    res.status(200).send("message is null or undefined");
                } else {
                    if (isRead == true) {
                        messages.forEach(message => {
                            message.isRead = message.previous("isRead")
                            message.srcUserId = message.previous("srcUserId")
                            message.destUserId = message.previous("destUserId")
                            finalMessage.push(message)
                        });
                        res.status(200).send(finalMessage);
                    } else {
                        messages.forEach(message => {
                            message.isRead = message.previous("isRead")
                            message.srcUserId = message.previous("srcUserId")
                            message.destUserId = message.previous("destUserId")
                            if (message.isRead == false) {
                                finalMessage.push(message)
                            }
                        });
                        res.status(200).send(finalMessage);
                    }
                }
            }).catch(err => {
                res.status(500).send('Fail to get all messages for this user')
            })
        })
        .catch(err => {
            res.status(500).send('Fail to get user')
        })
    } else {
        res.status(400).send('userId == null or undefined')
    }
})

// read messages for a user
router.post("/:userId/messages", passport.authenticate('bearer', { session: false }), 
(req: any, res) => {
    let id = req.params.userId;
    if (req.user == undefined || id != req.user.id) {
        console.log(req.user.id + ' essaie de modifier le profie de ' + id)
        res.status(400).send("It's not your token")
        return;
    }
    if (id != null && id != undefined) {
        User.findById(id, {attributes: ['id'], include: [Message]})
        .then((user) => {
            user.messages = user.previous("messages")
            //console.log(user)
            if (user === null || user.previous === null)
            {
                res.status(404).send('User ' + req.params.id + ' does not exist.')
                return;
            }
            Message.findAll({where: {isRead:false, [Op.or]: [{srcUserId: id}, {destUserId: id}]}})
            .then(messages => {
                if (messages == null || messages == undefined
                    || messages.length == 0) {
                    res.status(400).send("No messages to read")
                } else {
                    console.log("remove messages of " + req.user.id + " there is " + messages.length + " messages")
                    messages.forEach(message => {
                        message.update({isRead: true}).then().catch(err => console.error(err));
                    })
                    res.status(200).send("messages read");
                }
            })
            
        })
        .catch(err => {
            res.status(500).send('Fail to get messages for this user')
        })
    } else {
        res.status(400).send('userId == null or undefined')
    }
});

export const UsersController: Router = router;