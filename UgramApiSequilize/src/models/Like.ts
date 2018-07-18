import {Table, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import {Picture} from './Picture'
import { User } from '.';

@Table
export class Like extends Model<Like> {
    
    @Column
    value:string;

    @ForeignKey(() => User)
    @Column
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Picture)
    @Column
    pictureId: number;
    
    @BelongsTo(() => Picture)
    picture: Picture;
}