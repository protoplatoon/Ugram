import {Table, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import { User } from './User';

@Table
export class Message extends Model<Message> {
    
    @Column
    title:string;

    @Column
    value:string;
    
    @ForeignKey(() => User)
    @Column
    srcUserId: string;

    @BelongsTo(() => User)
    srcUser: User;

    @ForeignKey(() => User)
    @Column
    destUserId: string;

    @BelongsTo(() => User)
    destUser: User;

    @Column
    isRead: boolean = false

    @CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
    
    @DeletedAt
	deletionDate: Date;
}