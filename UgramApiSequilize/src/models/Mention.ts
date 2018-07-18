import {Table, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import {Picture} from './Picture'

@Table
export class Mention extends Model<Mention> {
    @Column
    value:string;

    @ForeignKey(() => Picture)
    @Column
    pictureId: number;
    
    @BelongsTo(() => Picture)
    picture: Picture;
}