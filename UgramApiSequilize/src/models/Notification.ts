import {Table, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import { User } from './User';

@Table
export class Notification extends Model<Notification> {
    
    @Column
    value:string;

    @Column
    isRead: boolean = false

    @Column
    authorId: string

    @ForeignKey(() => User)
    @Column
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
    
    @DeletedAt
	deletionDate: Date;
}