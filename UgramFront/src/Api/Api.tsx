import * as React from 'react';
import _ from 'lodash';
import axios, {AxiosPromise} from 'axios'
import {User} from '../Models/User'
import {Picture} from '../Models/Picture'
const qs = require('qs');


var env = 'dev'
var baseUrl = 'http://localhost:3000';
if (env === 'production') {
    baseUrl = 'http://ugram-team-09.us-east-1.elasticbeanstalk.com';
}

export class Api {


    // baseUrl: string = 'http://api.ugram.net'; // api livrable 1
    //baseUrl: string = 'http://ec2-54-236-15-255.compute-1.amazonaws.com:5000'; // api livrable 2
    // dev adress
    //baseUrl: string = 'http://ugram-team-09.us-east-1.elasticbeanstalk.com';
    // production adress ci dessous
    //baseUrl: string = 'http://ec2-54-236-15-255.compute-1.amazonaws.com:5000';

    baseUrl = baseUrl;

    facebookAuth = baseUrl + '/auth/facebook';

    googleAuth = baseUrl + '/auth/google';

    // pour le login (provider oauth2 pour recuperer le token et ca c'est le client par default)
    clientId = 'abc123';

    clientSecret = 'ssh-password'

    tokenPrefix: string = "Bearer ";

    pictures:string =  '';

    nbPage:number = 0;

    hasError:boolean = true;

	constructor() {

    }

	DeleteProfile(user: any, token: any): any {
		const config = {
            headers: {
                'Authorization': this.tokenPrefix + token
            }
        }
        return axios.delete(baseUrl + '/users/' + user.id, config);
	}

    editProfile(user:User, token):AxiosPromise {
        const config = {
            headers: {
                'Authorization': this.tokenPrefix + token
            }
        }
        return axios.put(baseUrl + '/users/' + user.id, user, config);
    }

    getUserInfo(userId:number):AxiosPromise {
        return axios.get(baseUrl + '/users/' + userId);
    }

    getAllUsers(): any {
        return axios.get(baseUrl + '/users?perPage=' + 99999);
    }

    likePicture(pictureId:number, token:string):AxiosPromise {
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': this.tokenPrefix + token
            }
        }
        return axios.post(baseUrl + '/pictures/' + pictureId + '/like'/* ?access_token=' + token*/, '', config);
    }

    unlikePicture(pictureId:number, token:string):AxiosPromise {
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': this.tokenPrefix + token
            }
        }
        return axios.post(baseUrl + '/pictures/' + pictureId + '/unlike', '', config);
    }

    deletePicture(pictureId:number, userId:number, token:string):AxiosPromise {
        const config = {
            headers: {
                'Authorization': this.tokenPrefix + token
            }
        }
        return axios.delete(baseUrl + '/users/' + userId + '/pictures/' + pictureId, config);
    }

    getUsers = (page:number):AxiosPromise => {
        return axios.get(baseUrl + '/users?page=' + page + "&perPage=10");
    }

    getPicturesUser = (userId:number, page):AxiosPromise => {
        return axios.get(baseUrl + '/users/' + userId + '/pictures?page=' + page);
    }

    getPictures = (page: number, perPage:number = 0):AxiosPromise => {
        if (perPage == 0)
            return axios.get(baseUrl + '/pictures?page=' + page);
        else
            return axios.get(baseUrl + '/pictures?page=' + page + "&perPage=" + perPage);
    }

    getPicture = (pictureId: number, token: string):AxiosPromise => {
        return axios.get(baseUrl + '/pictures/' + pictureId + '?access_token=' + token);
    }

    saveComment(pictureId:number, comment: string, token: string): any {
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': this.tokenPrefix + token
            }
        }
        return axios.post(baseUrl + '/pictures/' + pictureId + '/comments', qs.stringify({comment: comment}), config);
    }
    
	deleteComment(pictureId:number, commentId: number, token: string): any {
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': this.tokenPrefix + token
            }
        }
        return axios.delete(baseUrl + '/pictures/' + pictureId + '/comments/' + commentId, config);
    }

    getNotifications(userId:number, token: string, isRead: boolean): any {
        return axios.get(baseUrl + '/users/' + userId + '/notifications?access_token=' + token + '&isRead=' + isRead);
    }

    getMessages(userId:number, token: string, isRead: boolean): any {
        return axios.get(baseUrl + '/users/' + userId + '/messages?access_token=' + token + '&isRead=' + isRead);
    }

    readNotifications(userId:number, token: string): any {
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': this.tokenPrefix + token
            }
        }
        return axios.post(baseUrl + '/users/' + userId + '/notifications', '', config);
    }

    fileUpload(file, comment, tags: string, mentions: string, userId, token) :AxiosPromise {
        if (file == undefined || file == null)
            return
        const url = baseUrl + '/users/' + userId + '/pictures';
        // add file a l'objet html de type file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', comment);
        let tmp:string = tags;

        // TODO verifier le parser qui marche pas parfaitement quand on upload
        if (tags !== undefined
            && tags.length > 0) {

            // supprime les # au debut des tags
            while (tmp.charAt(0) == '#') {
                tmp = tmp.slice(1);
            }
        }
        if (tmp!= undefined && ((tmp.length > 0
            && tmp.charAt(0) != '#') || (tmp.length > 1
                && tmp.charAt(0) == '#') )) {
            var tmpTags:string[] = tmp.split('#');
            // add tags in data
            for(var i=0;i<tmpTags.length;i++){
                tmpTags[i]= "#" + tmpTags[i];
            }
            if (tmp.length > 0)
                formData.append('tags', tmpTags.toString());
        }
        // header de la requete post
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                'Authorization': this.tokenPrefix + token
            }
        }
        tmp = mentions;
        if (mentions !== undefined
            && mentions.length > 0) {
            // supprime les @ au debut des mentions
            while (tmp.charAt(0) == '@') {
                tmp = tmp.slice(1);
            }
        }
        if (tmp != undefined) {
            var tmpTags:string[] = tmp.split('@');
            // add tags in data
            for(var i=0;i<tmpTags.length;i++){
                tmpTags[i]= "@" + tmpTags[i];
            }
            if (tmp.length > 0)
                formData.append('mentions', tmpTags.toString());
        }
        // post l'image
        return axios.post(url, formData, config);
    }

    editPicture(picture:Picture, tags:string, mentions:string, userId, token) {
        const config = {
            headers: {
                'Authorization': this.tokenPrefix + token
            }
        }
        //console.log('test' + tags)
        let tmp:string = tags;
        if (tags !== undefined
            && tags.length > 0) {

            // supprime les # au debut des tags
            while (tmp.charAt(0) == '#') {
                tmp = tmp.slice(1);
            }
        }
        //console.log('test1')
        if (tmp != undefined) {
            var tmpTags:string[] = tmp.split('#');
            // add tags in data
            for (var i = 0; i < tmpTags.length; i++) {
                tmpTags[i] = "#" + tmpTags[i];
            }
                picture.tags = tmpTags;
        }
        // header de la requete post
        //console.log('test2')
        tmp = mentions;
        if (mentions !== undefined
            && mentions.length > 0) {
            // supprime les @ au debut des mentions
            while (tmp.charAt(0) == '@') {
                tmp = tmp.slice(1);
            }
        }
        if (tmp != undefined) {
            var tmpTags:string[] = tmp.split('@');
            // add tags in data
            for (var i = 0; i < tmpTags.length; i++) {
                tmpTags[i] = "@" + tmpTags[i];
            }
            //if (tmp.length > 0)
                picture.mentions = tmpTags;
        }
        //console.log('test!!!!!!!!!!!')
        return axios.put(baseUrl + '/users/' + userId + '/pictures/' + picture.id, picture, config);
    }

    searchPicture(search: string, perPage:number = 10): any {
        const config = {
            headers: {
            }
        }
        return axios.get(baseUrl + '/pictures?search=' + search + '&perPage=' + perPage, config);
    }

    searchUser(search: string, perPage:number = 10): any {
        const config = {
            headers: {
            }
        }
        return axios.get(baseUrl + '/users?search=' + search + '&perPage=' + perPage, config);
    }
}
