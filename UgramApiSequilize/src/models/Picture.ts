import {Table, Default, DataType, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import {Tag} from './Tag'
import {Comment} from './Comment'
import {Like} from './Like'
import {Mention} from './Mention'

@Table
export class Picture extends Model<Picture> {
	
	@Column
    url: string = '';

	@Column
    description: string = '';

    @Column
    userId: string = '';

    @HasMany(() => Like)
    likes: Like[] = new Array();

    @HasMany(() => Tag)
    tags: Tag[] = new Array();

    @HasMany(() => Mention)
    mentions: Mention[] = new Array();

    @HasMany(() => Comment)
    comments: Comment[] = new Array();

	@CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
    
    @DeletedAt
	deletionDate: Date;

}
