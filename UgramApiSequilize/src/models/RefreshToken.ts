import {Table, Default, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';

@Table
export class RefreshToken extends Model<RefreshToken> {
    @Column
    value:string;
    
    @Column
    userId: string;
    
    @Column
    clientId: string;
    
    @Column
    clientSecret: string;

    @CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
    
    @DeletedAt
	deletionDate: Date;
}