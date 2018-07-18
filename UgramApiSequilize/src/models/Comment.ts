import {Table, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import {Picture} from './Picture'
import { User } from './User';

@Table
export class Comment extends Model<Comment> {
    
    @Column
    title:string;

    @Column
    value:string;
    
    @ForeignKey(() => Picture)
    @Column
    pictureId: number;
    
    @BelongsTo(() => Picture)
    picture: Picture;

    @ForeignKey(() => User)
    @Column
    userId: string;

    @BelongsTo(() => User)
    user: User;
}