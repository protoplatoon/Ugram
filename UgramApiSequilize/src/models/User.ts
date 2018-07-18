import {Table, Default, Unique, BeforeCreate, DataType, AutoIncrement, PrimaryKey, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';
import { Notification } from './Notification';
import { Like, Comment } from '.';
import { Message } from './Message';

const Sequelize = require('sequelize');

@Table
export class User extends Model<User> {

	@PrimaryKey
	@Unique
	@Column(DataType.STRING)
	id: string;

	@Column(DataType.INTEGER)
	idNumber: number;
	
	@Column(DataType.STRING)
	password: string;
	
	@Column(DataType.STRING)
    firstName: string = '';

	@Column(DataType.STRING)
    lastName: string = '';

	@Column(DataType.STRING)
    provider: string = 'ls';

	@Column(DataType.INTEGER)
	age: number = 0;
	
	@Column(DataType.STRING)
	phoneNumber:string = "";
	
	@Column(DataType.STRING)
	pictureUrl:string = '';
	
	@Column(DataType.INTEGER)
	registrationDate:number;

	@Column(DataType.STRING)
	email: string = '';

	@HasMany(() => Notification)
	notifications: Notification[] = new Array();

	@HasMany(() => Message)
	messages: Message[] = new Array();
	
	@HasMany(() => Like)
	likes: Like[] = new Array();
	
	@HasMany(() => Comment)
    comments: Comment[] = new Array();

	@Column
	isDisable: boolean = false;

	@Column
	unique_id: number = 0;

	@CreatedAt
	creationDate: Date;
	
	@UpdatedAt
	updatedOn: Date;
	
	@DeletedAt
	deletionDate: Date;

	@BeforeCreate
	static initializeId(instance: User) {
	  // this will also be called when an instance is created
	  const Op = Sequelize.Op;
	  User.count().then((number) => {
		
		//console.log('!!!!!!!!!!!!!!!!!!!!!!!')
		User.findAll({order: [ [ 'creationDate', 'DESC' ] ], limit: 1, raw: true, where: {id :{[Op.ne]: instance.id} }})
		.then(user => {
			//console.log('!!!!!!!!!!!!!!!!!!!!!!!')
			if (user[0] == null || user[0] == undefined) {
				//console.log('azertyuio')
			  instance.unique_id = 1;
			} else {
				let test:number =(+user[0].unique_id + 1);
			  	instance.unique_id = test;
			}
			if (number == null || number == undefined || number == 0) {
				instance.idNumber = 1;
				//console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
			} else {
				let test:number = +number;
				instance.idNumber = test;
			// 	console.log("test !!!!!! : ")
			//   console.log(test)
			}
				
			let d = new Date(instance.creationDate);
			instance.registrationDate = d.getTime();
			instance.save().then();
		})
	  });
	}
}
