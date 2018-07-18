import {Table, Default, DataType, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import {Tag} from './Tag'
import {Comment} from './Comment'
import {Like} from './Like'
import {Mention} from './Mention'

@Table
export class PictureSave extends Model<PictureSave> {
	
	@Column
    pictureId: number;

	@Column
    url: string = '';

	@Column
    height: number = 0;

    @Column
    width: number = 0;

	@CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
    
    @DeletedAt
	deletionDate: Date;
}