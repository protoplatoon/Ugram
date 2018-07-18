import { Router, Request, Response } from 'express';
import {Picture} from '../models/Picture'
import {PictureApi} from '../models/PictureApi'
import {Tag} from '../models/Tag'
import {Mention} from '../models/Mention'
import {SequelizeRepository} from '../repository/SequelizeRepository'
import { Utils } from '../utils/utils';
import {Logger} from '../utils/logger';
import * as passport from 'passport'
import { Comment, Like, User } from '../models';
import { Notification } from '../models/Notification';

const io = require('socket.io-client') 

// port tcp du server real time

// socket tcp pour envoyer des notification au client
const port = process.env.PORT || 3000;
const socket = io("http://localhost:" + port)

const Sequelize = require('sequelize');
const router: Router = Router();

const repository: SequelizeRepository = new SequelizeRepository();

router.get('/', (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    Logger.info("user " + req.ip + " try to get pictures")
    let search = '';
    var items:any = new Object;


    //console.log(req.query)
    if (req.query.search && req.query.search.length > 0) {
        console.log("search :!!!!!!!!!!" + req.query.search)
        search = req.query.search;
    }
    const Op = Sequelize.Op;
    let nbEntriesPerPage:number = 20;
    console.log('perPage ' + req.query.perPage)
    if (req.query.perPage > 0) {
        nbEntriesPerPage = req.query.perPage;
        console.log('per page : ' + nbEntriesPerPage)
    }

    var    param = <any>{include:[Tag, Mention, Like, Comment], attributes: [ 'id', 'creationDate', 'description', 'url', 'userId']}
    
    // if (search.length > 0) {
    //     var param = 
    //     {
    //         where: {
    //             [Op.or]: [
    //                 {
    //                     description: {
    //                         [Op.like]: '%' + search + '%'
    //                     }
    //                 },
    //                 {
    //                     userId: {
    //                         [Op.like]: '%' + search + '%'
    //                     }
    //                 }
    //             ]
    //         },
    //         include:[Tag, Mention], attributes: [ 'id', 'creationDate', 'description', 'url', 'userId']}
        
    // }

    Picture.findAll(param)
    .then((pictures => {
        // modifie la chaque picture pour qu'elles aient le bon format
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
                if (add === false && pictureApi.description != null && pictureApi.description.indexOf(search) !== -1) {
                    add = true;
                    console.log('find description match')
                }
                if (add === false && pictureApi.userId != null && pictureApi.userId.toString().indexOf(search) !== -1) {
                    add = true;
                    console.log('find userId match')
                }
                pictureApi.comments = picture.comments;
                pictureApi.likes = picture.likes;
                if(add)
                    picturesApi.push(pictureApi);
            }
           // console.log(pictureApi);
        })
        
        var items:any = new Object;
        items.items = picturesApi;
        items.totalPages = 1;
        
        let nbEntriesPerPage:number = 5;
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
                //console.log('add picture final !! : ' + i)
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
        res.send('=(')
    })
});

router.get("/:id", (req, res) => {
    // retourne une image precise avec les commentaire
    let id:number = req.params.id;
    if (id != null && id != undefined) {
        Picture.findOne({where: {id: id}, include: [Comment, Tag, Mention, Like], attributes: ['userId','description','url']})
        .then(picture => {
            if (picture != null && picture != undefined) {
                // // find picture 
                picture.url = picture.previous("url");
                picture.description = picture.previous("description");
                picture.userId = picture.previous("userId");
                // picture.tags = picture.previous("tags");
                // picture.comments = picture.previous("comments")
                if (picture.comments != null && picture.comments != undefined
                    && picture.comments.length > 0) {
                    res.status(200).send(picture)
                } else {
                    res.status(200).send(picture)
                }
            } else {
                res.status(404).send("Picture not found")
            }
        }) 
    } else {
        res.status(400).send("Id undefined or null")
    }
    
})

router.get("/:id/comments", (req, res) => {
    // retourne les comment de l'image req.params.id
    let id = req.params.id;

    if (id != null && id != undefined) {
        Picture.findOne({where: {id: id}, include: [Comment]})
        .then(picture => {
            if (picture != null && picture != undefined) {
                // find picture 
                picture.comments = picture.previous("comments")
                if (picture.comments != null && picture.comments != undefined
                    && picture.comments.length > 0) {
                    res.status(200).send(picture.comments)
                } else {
                    res.status(200).send(picture.comments)
                }
            } else {
                res.status(404).send("Picture not found")
            }
        }) 
    } else {
        res.status(400).send("Id undefined or null")
    }
})

router.delete("/:id/comments/:commentId", passport.authenticate('bearer', { session: false }), (req: any, res) => {
    // retourne les comment de l'image req.params.id
    let id = req.params.id;
    let commentId = req.params.commentId;

    if (id != null && id != undefined) {
        Picture.findOne({where: {id: id}, include: [Comment]})
        .then(picture => {
            if (picture != null && picture != undefined) {
                // find picture 
                picture.comments = picture.previous("comments")
                if (picture.comments != null && picture.comments != undefined
                    && picture.comments.length > 0) {
                        Comment.findById(commentId)
                        .then(comment => {
                            if (comment == null || comment == undefined) {
                                res.status(404).send("Comment not found")
                                return
                            }
                            comment.userId = comment.previous("userId")
                            if (comment.userId == undefined || comment.userId != req.user.id) {
                                console.log(req.user.id + ' essaie de modifier le profie de ' + id)
                                res.status(400).send("It's not your Comment")
                                return;
                            }
                            comment.destroy().then();
                            res.status(200).send("Comment remove")
                        }).catch(err => {
                            res.status(404).send("No Comment found")
                        })
                } else {
                    res.status(404).send("No Comment found")
                }
            } else {
                res.status(404).send("Picture not found")
            }
        }) 
    } else {
        res.status(400).send("Id undefined or null")
    }
})


router.post("/:id/comments", passport.authenticate('bearer', { session: false }), (req: any, res) => {
    // retourne les comment de l'image req.params.id
    let bodyComment = req.body.comment;
    let id = req.params.id;
    console.log("Try to post comment in picture " + id)
    console.log(bodyComment)
    console.log(req.body)
    if (bodyComment != null && bodyComment != undefined) {
        // on a recu un comment pour l'id
        Picture.findOne({where: {id: id}, include: [Comment]})
        .then(picture => {
            if (picture != null && picture != undefined
                && picture.previous != null) {
                picture.userId = picture.previous("userId")
                console.log('userId ' + picture.userId)
                 let newComment = new Comment;
                 newComment.value = bodyComment;
                 newComment.pictureId = id;
                 newComment.picture = picture;
                 newComment.userId = req.user.id;
                 User.findById(req.user.id, {attributes: ['firstName', 'lastName']})
                 .then(user => {
                     if (user != null && user != undefined) {
                        user.firstName = user.previous("firstName")
                        user.lastName = user.previous("lastName")
                        console.log("user firstName " + user.firstName)
                        newComment.title = user.firstName + " " + user.lastName;
                        newComment.save().then(() => {
                            // TODO notify picture.userId if req.user.id != picture.userId
                            if (picture.userId != req.user.id) {
                               console.log("notify " + picture.userId + " que " + req.user.id + " a commenté sa photo")
                               let newNotification = new Notification;
       
                               // notifier les socket ou username == picture.userId serait parfait
       
       
                               // send message tcp pour dire de notifier l'utilisateur qui correspond a la notification
       
                               let notif = user.firstName + " " +  user.lastName + " a commenté ta photo " + picture.id + ". Il a écrit : " + bodyComment;
       
                               newNotification.value = notif;
                               // connect to tcp server and notif picture.userId
                              
                               socket.emit('send notif', notif, picture.userId);
                               socket.emit('get notif', picture.userId);
                               newNotification.userId = picture.userId;
                               newNotification.save()
                               .then(() => {
                                   res.status(200).send("Comment Save")
                                   return;
                               }).catch(err => {
                                   res.status(500).send("Fail to save new notification")
                                   return;
                               })
                            } else {
                               res.status(200).send("Comment Save")
                            }
                        })
                        .catch(err => {
                            res.status(500).send("Fail to save new comment")
                        });
                     } else {
                        res.status(500).send("Fail to save new comment")
                     }
                 })
                 
            } else {
                res.status(404).send("Picture not found")
            }
        }) 
    } else {
        res.status(400).send("comment key is undefined or null in body")
    }
})


// ajoute un like a une photo =) 
router.post('/:pictureId/like', passport.authenticate('bearer', { session: false }),
 (req: any, res: Response) => {
    let id = req.user.id;
    let pictureId = req.params.pictureId;
    console.log("try to find " + pictureId + " par " + id)
    // userId add un like sur la photo pictureId
    Picture.findOne({where: {id: pictureId}, include: [Like], attributes: ['id', 'userId']})
    .then(picture => {
        if (picture == null || picture == undefined) {
            res.status(404).send("Picture not found")
        } else {
            // le user et l'image existe
            // on verifie que l'utilisateur a pas deja like la photo
            picture.userId = picture.previous("userId")
            picture.likes = picture.previous("likes")
            //console.log(picture.likes)
            if (picture.likes.length > 0) {
                console.log("verifie si le mec a pas deja like la photo")
                var alreadyAdd = false;
                picture.likes.forEach(like => {
                    if (like.userId == id)
                        alreadyAdd = true;
                })
                if (alreadyAdd) {
                    res.status(403).send("Picture " + pictureId + " already like by " + id)
                }  else {
                    let newLike = new Like;
                    newLike.userId = id;
                    // on met ce qu'on veut c'est genre le type de like
                    newLike.value = "1";
                    newLike.pictureId = pictureId;
                    newLike.picture = picture;
                    newLike.save().then(() => {
                        if (picture.userId != req.user.id) {
                            console.log("notify " + picture.userId + " que " + req.user.id + " a liker sa photo")
                            let newNotification = new Notification;
                            User.findById(req.user.id, {attributes: ['firstName', 'lastName']})
                            .then(user => {
                                if (user != null && user != undefined) {
                                    user.firstName = user.previous("firstName")
                                    user.lastName = user.previous("lastName")
                                    newNotification.value = user.firstName + " " + user.lastName + " a liké ta photo " + picture.id;
                                    newNotification.userId = picture.userId;
                                    newNotification.authorId = req.user.id
                                    socket.emit('send notif', newNotification.value , picture.userId);
                                    socket.emit('get notif', picture.userId);
                                    newNotification.save().then(() => {
                                        res.status(200).send("Like & Notification Save")
                                    }).catch(err => {
                                        res.status(500).send("Fail to save new notification")
                                    })
                                } else {
                                    res.status(500).send("Fail to save new notification because user is null")
                                }
                            }).catch(err => {
                                res.status(500).send("Fail to get user")
                            })
                        } else {
                            res.status(200).send("Like Save")
                        } 
                    }).catch(err => {
                        res.status(500).send("Fail to save new Like")
                    })
                }
            } else {
                console.log("pas de like alors add le like")
                let newLike = new Like;
                newLike.userId = id;
                // on met ce qu'on veut c'est genre le type de like
                newLike.value = "1";
                newLike.pictureId = pictureId;
                newLike.picture = picture;
                newLike.save().then(() => {
                    if (picture.userId != req.user.id) {
                        console.log("notify " + picture.userId + " que " + req.user.id + " a liker sa photo")
                        let newNotification = new Notification;
                        User.findById(req.user.id, {attributes: ['firstName', 'lastName']})
                        .then(user => {
                            if (user != null && user != undefined) {
                                user.firstName = user.previous("firstName")
                                user.lastName = user.previous("lastName")
                                newNotification.value = user.firstName + " " + user.lastName + " a liké ta photo " + picture.id;
                                newNotification.userId = picture.userId;
                                newNotification.authorId = req.user.id
                                console.log("try to send notif to " + picture.userId)
                                socket.emit('send notif', newNotification.value , picture.userId);
                                socket.emit('get notif', picture.userId);
                                newNotification.save().then(() => {
                                    res.status(200).send("Like & Notification Save")
                                }).catch(err => {
                                    res.status(500).send("Fail to save new notification")
                                })
                            } else {
                                res.status(500).send("Fail to save new notification because user is null")
                            }
                        }).catch(err => {
                                res.status(500).send("Fail to get user")
                        })
                    } else {
                        res.status(200).send("Like Save")
                    }
                }).catch(err => {
                    res.status(500).send("Fail to save new Like")
                })
            }
        }
    }).catch(err => {
        res.status(500).send("Fail to get Picture")
    })
});

// unlike une photo =) 
router.post('/:pictureId/unlike', passport.authenticate('bearer', { session: false }),
 (req: any, res: Response) => {
    let id = req.user.id;
    let pictureId = req.params.pictureId;
    console.log("try to find " + pictureId + " par " + id)
    // userId add un like sur la photo pictureId
    Picture.findOne({where: {id: pictureId}, include: [Like], attributes: ['id', 'userId']})
    .then(picture => {
        if (picture == null || picture == undefined) {
            res.status(404).send("Picture not found")
        } else {
            // le user et l'image existe
            // on verifie que l'utilisateur a pas deja like la photo
            picture.userId = picture.previous("userId")
            picture.likes = picture.previous("likes")
            if (picture.likes.length > 0) {
                var isDelete = false;
                picture.likes.forEach(like => {
                    if (like.userId == id) {
                        // destroy le like du mec sur la photo
                        isDelete = true;
                        like.destroy().then(() => {
                            // unlike ok
                            // mais comme c'est asynchrone on suppose que ca va marcher
                        })
                    }
                })
                if (isDelete) {
                    res.status(200).send("Picture " + pictureId + " is now unlike by " + id)
                }  else {
                    res.status(400).send("Picture " + pictureId + " not like by " + id)
                }
            } else {
                res.status(400).send("No like on this picture")
            }
        }
    }).catch(err => {
        res.status(500).send("Fail to get Picture")
    })
});



// route pas demander mais elle retourne une image en fonction d'un id
// router.get('/:id', (req: Request, res: Response) => {
//     let id = req.params.id;

//     repository.getPictureById(id)
//     .then((pict) => {
//         // reaffecte les attribut de l'image (ils disparaissent alors 
//         // qu'ils sont toujours en base de données ils sont toutes fois
//         // dans le previous)
//         var pictureApi = Utils.getPictureApi(pict);
//         if (pictureApi != null)
//             res.send(pictureApi);
//         else
//             res.send('Picture : ' + id + ' not exist');
//         //console.log(pict);
//     }).catch((err) => {
//         console.log(err);
//     });
// });

export const PicturesController: Router = router;

    // let user:User = new User();
    // //const person = User.build({userName: 'bob', lastName: 99});
    // user.lastName = 'T';
    // user.firstName = 'A';
    // // exemple creer une image 
    // let picture:Picture = new Picture();
    // picture.description = "test";
    // picture.url = "http://test";
    // var tag = new Tag();
    // tag.value = 'tag1';
    // tag.picture = picture;
    // picture.tags.push(tag);
    // var tag = new Tag();
    // tag.value = 'tag2';
    // tag.picture = picture;
    // picture.tags.push(tag);
    // var mention = new Mention();
    // mention.value = 'unmec'
    // mention.picture = picture;
    // picture.mentions.push(mention);

    // repository.savePicture(picture);