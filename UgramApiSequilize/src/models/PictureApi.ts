import {Tag} from './Tag'
import {Mention} from './Mention'
import { Like } from './Like';
import {Comment} from './Comment'

export class PictureApi {
    
    id:number = 0;
    
    createdDate:number = 0;
    
    description: string = '';
    
    mentions: string[] = new Array();

    tags: string[] = new Array();

    url: string = '';

    userId: number = 0;
    
    likes: Like[];

    comments: Comment[];

    nbLike: number = 0;
}