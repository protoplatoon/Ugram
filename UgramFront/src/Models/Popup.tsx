import { Message } from "./Message";

export class Popup {
    user: any;
	username:string;
    id:string;
    currentMessage:string;
    messages: Array<Message> = new Array;
}