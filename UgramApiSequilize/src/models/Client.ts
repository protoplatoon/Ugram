import {Table, Default, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt, Unique} from 'sequelize-typescript';
import { isString } from 'util';

@Table
export class Client extends Model<Client> {
    @Unique
    @PrimaryKey
    @Column
    id:string;

    @Column
    clientSecret: string;
    
    @Column
    isTrusted: boolean;

    @CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
    
    @DeletedAt
	deletionDate: Date;
}