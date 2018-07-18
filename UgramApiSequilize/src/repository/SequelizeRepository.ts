import {Picture} from '../models/Picture'
import {Tag} from '../models/Tag'
import {Mention} from '../models/Mention'
import {User} from '../models/User'
import * as Promise from 'bluebird';
import { Like } from '../models';

export class SequelizeRepository {

    getPictureByIdAndUser(pictureId: number, userId: string): Promise<Picture> {
        return Picture
        .findOne({
            where: {id: pictureId, userId:userId},
            //attributes: ['id', 'description', 'url'],
            include: [Tag, Mention]
            , attributes: {}
            //,attributes: ['description', 'url']
        });
    }

    savePicture(picture:Picture) {
        picture.save()
        .then((picture) =>  {
            console.log('Save New Picture : ' + picture.description + ' with id : ' + picture.id)
            if (picture.tags !== undefined && picture.tags !== null)
                picture.tags.forEach((tag) => {
                    tag.pictureId = picture.id;
                    tag.save().then((tag) => {
                        //console.log('save tag : ');
                        //console.log(tag);
                    }).catch((err) => {console.log(err)})
                })
            if (picture.mentions !== undefined && picture.mentions !== null)
                picture.mentions.forEach((mention) => {
                    mention.pictureId = picture.id;
                    mention.save().then((mention) => {
                        //console.log('save mention : ')
                        //console.log(mention);
                    }).catch((err) => {console.log(err)})
                })
        }).catch((err) => {console.log(err)})
    }

    getPictureById(id: number): Promise<Picture> {
        return Picture
        .findOne({
            where: {id: id},
            //attributes: ['id', 'description', 'url'],
            include: [Tag, Mention, Like]
            , attributes: {}
            //,attributes: ['description', 'url']
        });
    }

    saveUser(user:User) {

    }
}