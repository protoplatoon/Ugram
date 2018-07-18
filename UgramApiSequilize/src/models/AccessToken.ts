import {Table, DataType, Default, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';

@Table
export class AccessToken extends Model<AccessToken> {
    @Column
    value:string;
    
    @Column
    userId: string;
    
    @Column
    clientId: string;
    
    @Column
    expirationDate: number;

    @CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
    
    @DeletedAt
	deletionDate: Date;
}