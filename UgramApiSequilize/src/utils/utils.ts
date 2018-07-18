import {PictureApi} from '../models/PictureApi'
import {Picture} from '../models/Picture'
import {AccessToken} from '../models/AccessToken'
import { User } from '../models';
import { UserApi } from '../models/UserApi';
import {SequelizeRepository} from '../repository/SequelizeRepository'
import {Logger} from './logger'

var aws = require('aws-sdk');

const repository: SequelizeRepository = new SequelizeRepository();

aws.config.update({
    accessKeyId: 'AKIAJSWHKIELBIDZ6VAA' ,
    secretAccessKey: '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',
    region : 'ca-central-1'
});

export class Utils {

    static getUserApi(user: User): UserApi {
        let userApi = new UserApi;

        if (user == null)
            return userApi
        if (!user.previous) {
            userApi.id = user.id
            userApi.email = user.email;
            userApi.firstName = user.firstName;
            userApi.lastName = user.lastName;
            userApi.pictureUrl = user.pictureUrl;
            userApi.registrationDate = user.registrationDate;
            userApi.phoneNumber = user.phoneNumber;
            return userApi;
        } else {
            userApi.id = user.id
            userApi.email = user.previous("email");
            userApi.firstName = user.previous("firstName");
            userApi.lastName = user.previous("lastName");
            userApi.pictureUrl = user.previous("pictureUrl");
            userApi.registrationDate = user.previous("registrationDate");
            userApi.phoneNumber = user.previous("phoneNumber");
        }
        return userApi;
    }
    static getToken(userId: string, clientId: string): any {
       // Logger.info('user ' + userId + ' try to get a token')
        AccessToken.findOne({where : {userId: userId}})
                .then((dbtoken) => {
                    if (dbtoken != null && dbtoken != undefined)
                    {
                        console.log('find dbToken for you');
                        console.log(dbtoken.value);
                        return dbtoken;
                    } else {
                        var expirationDate = new Date(new Date().getTime() + (3600 * 1000));
                        console.log('Try to get new Access Token');
                        let accessToken = new AccessToken;
                        accessToken.userId = userId;
                        accessToken.clientId = clientId;
                        accessToken.value = Utils.getUid(256);
                        accessToken.expirationDate = expirationDate.getTime();
                        return accessToken.save()
                    }
                }).catch((err) => {
                    console.log('err ' + err);
                    return undefined
                })
    }

    static getPictureApi(picture: Picture) : PictureApi {
        if (picture === null || picture.previous === null)
        {
            //res.send('Id Inconnue');
            return null;
        }
        var pictureApi:PictureApi = new PictureApi();
        //console.log(user);
        pictureApi.id = picture.previous('id');
        var d = new Date(picture.previous('creationDate'));
        pictureApi.createdDate = d.getTime();
        pictureApi.description = picture.previous('description');
        var tmp = picture.previous('tags');
        pictureApi.url = picture.previous('url');
        pictureApi.userId = picture.previous('userId');
        var tags:string[] = new Array();
        if (tmp !== null && tmp !== undefined) {
            tmp.forEach((tag) => {
                tags.push(tag.value);
            })
        }
        pictureApi.tags = tags;
        var tmp = picture.previous('mentions');
        var mentions:string[] = new Array();
        if (tmp !== null && tmp !== undefined) {
            tmp.forEach((mention) => {
                mentions.push(mention.value);
            })
        }
        pictureApi.mentions = mentions;
        
        picture.likes = picture.previous('likes');
        console.log(picture.likes)
        if (picture != null && picture.likes != null
            && picture.likes != undefined)
            pictureApi.nbLike = picture.likes.length;
        pictureApi.likes = picture.likes;
        
        return pictureApi;
    }

    /**
     * Return a unique identifier with the given `len`.
     *
     * @param {Number} length
     * @return {String}
     * @api private
     */
    static getUid(length: number) : string {
        let uid:string = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charsLength = chars.length;
        for (let i = 0; i < length; ++i) {
            uid += chars[Math.floor(Math.random() * (charsLength))];
        }
        return uid;
    }



    static sendAndSave(filename, picture, req, res) {
        console.log(filename);
        console.log('!!!!!!!!!!!!')
        var s3 = new aws.S3();

        if (!req.files.file)
            return res.status(400).send('No files were uploaded.');
        // else {
        //     console.log("test : !!! : ")
        //     console.log(req.files.file)
        // }
            
        var params = {
            Bucket: 'images-ugram-team-09',
            Key: filename,
            PartNumber: 1,
            Body: req.files.file.data
        };
        let file = req.files.file;
        if (file.truncated) {
            console.log("file too big")
            //Logger.info("user " + req.user.id + " try to send a file too big")
            res.status(413).send("file too big")
        } else {
            s3.upload(params, function(err, data) {
                console.log("upload end")
                console.log(data)
                if (err) {
                    //Logger.error(err)
                    console.log(err);
                    res.status(400).send('Not Ok')
                    return err;
                } else {
                    console.log('try to log')
                    //Logger.info("user " + req.user.id + " upload file " + picture.url)
                    console.log('file upload')
                    repository.savePicture(picture);
                    res.status(200).send('Ok')
                    return data;
                }
            });
        }   
    } 
}