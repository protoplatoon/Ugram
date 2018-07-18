import {Table, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import {Picture} from './Picture'

@Table
export class Tag extends Model<Tag> {
    
    @Column
    value:string;

    @ForeignKey(() => Picture)
    @Column
    pictureId: number;
    
    @BelongsTo(() => Picture)
    picture: Picture;
}