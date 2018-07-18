import {Table, Default, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';

@Table
export class AuthorizationCode extends Model<AuthorizationCode> {
    @Column
    value:string;
    
    @Column
    userId: string;
    
    @Column
    clientId: string;

    @Column
    redirectUri: string;
    
    @Column
    expirationDate: number;

    @CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
    
    @DeletedAt
	deletionDate: Date;
}