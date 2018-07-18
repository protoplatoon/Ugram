import * as React from 'react';
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import { HashRouter, Route, Switch, Redirect, Link, replace } from 'react-router-dom';
import { Component } from 'react';
import { connect , bindActionCreators} from 'react-redux';
import {manualLogout} from '../actions'
import { TcpClient } from '../Api/TcpClient';
import {Api} from '../Api/Api';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Popup } from '../Models/Popup';
import { Message } from '../Models/Message';

require('../../scss/notifications.scss')
//import 'react-notifications/lib/notifications.css';
require('../../scss/navbar.scss')

export interface UgramProps {
    title: string;
}

class Layout extends React.Component<any, any> {
    
    api:Api = new Api();

    t = new TcpClient;

    nbClick = 0;

    nbClick2 = 0;

    nbClickMessage = 0;

    Margin = {
        'marginRight': '10px'
    }

    MarginButton = {
        'marginRight': '0px',
        'marginLeft': '0px'
    }

    NoMargin = {
        margin: '0px',
    }

    showNotification = {

    }

    showMessage = {

    }

    userPanelStyle = {
        maxHeight: '400px',
        bottom: '0px'
    }

	constructor(props) {
		super(props);
		this.state = {
            timestamp: 'no timestamp yet',
            notif: '',
            onlineUsers: [],
            offlineUsers: [],
            users: [],
            currentMessage: ''
		};
        //console.log("Connect socket !!")
        // subscription for notification
        // handle la connexion du socket
        this.t.handleConnect(() => {
            // si on reconnecte le socket on reconnect aussi le chat 
            if (this.props.user.id != -1)
                this.t.connectToChat(this.props.user)
        });
		// this.t.subscribeToTimer(this.props.user ,(err, timestamp) => this.setState({ 
		//  	timestamp 
        // }));
        // methode appelé a chaque fois que on recois une notification
        this.t.getNotifications(this.props.user ,(err, notif) => {
            
            this.setState({ 
                notif: notif
            }, () => {
                //console.log("Add notif in layout" + this.state.notif)
                NotificationManager.info(this.state.notif);
            this.t.sendRefreshNotif()
            })
            // TODO tu as une nouvelle notification ici dans this.state.notif !!!! il faut l'afficher correctement =)
            this.getNotifications(this.props.user);
        });

        // get un message tcp
        this.t.getMessages(this.props.user ,(err, data) => {
            //console.log("get Message : ")
            //console.log(data)
            //console.log(data.displayname + " say : " + data.message)
            this.setState({ 
                message: data.message,
            }, () => {
                //console.log("Add notif in layout " + this.state.message)
                NotificationManager.info(data.displayname + " say : " + this.state.message);
                // TODO Add popup
                this.openPopup(data.user)
                //this.t.sendRefreshMessage()
                this.getMessagesPopup();

                // uncomment il new Notification is create before new Message in server
                // this.getNotifications(this.props.user)
            })
            // get les messages stocker dans l'api
            this.getMessages(this.props.user);
        });

		this.t.getUsers(this.props.user ,(err, data) => {
			// TODO tu as une nouvelle notification ici dans this.state.notif !!!! il faut l'afficher correctement =)
			
            //console.log("receiv getUsers " + data)
            //console.log(data)
			if (data == null || data == undefined) {

			} else {
                //console.log("getUsers online in layout !!!!")
                let res = new Array;
                data.forEach(element => {
                    //console.log(element)
                    if (element.id != -1 && element.id != this.props.user.id) {
                        res.push(element);
                    }
                });
                this.setState({
					onlineUsers: res
				}, () => {
                    //console.log("get users after " )
                    //console.log(this.state.onlineUsers)
                    this.getOfflineUsers()
					this.forceUpdate();
				})
			}
        });
        if (this.props.user.id !== -1) {
            //console.log(this.props.user)
            this.getMessages(this.props.user);
            this.getNotifications(this.props.user)
            this.getOfflineUsers();
        }
    }
    
    getOfflineUsers() {
        //console.log("request offline user for chat")
        this.api.getAllUsers().then(result => {
            if (result.status == 200) {
                this.setState({
                    users: result.data.items
                }, () => {
                    let res = new Array;
                    //console.log(this.state.users)
                    this.state.users.forEach(user => {
                        let add = true
                        this.state.onlineUsers.forEach(onlineUser => {
                            //console.log('online user ' + onlineUser)
                            if (user.id === onlineUser.id
                                || user.id == this.props.user.id
                                || user.id == -1
                                ) {
                                add = false;
                            }
                        })
                        if (add && user.id !== this.props.user.id
                            && user.id !== -1) {
                            res.push(user)
                        }
                    })
                    //console.log("res !!!!! ")
                    //console.log(this.state.offlineUsers)
                    this.setState({
                        offlineUsers: res
                    }, () => {
                        this.forceUpdate()
                    })
                })
            }
        })
    }

    componentDidUpdate(prevProps) {
        //this.t.logout();
        //console.log(prevProps)
        //this.t.connectToChat(this.props.user)
        if (this.props.location !== prevProps.location) {
			//console.log("route change !!")
		}
    }

    componentWillReceiveProps(nextProps) {
		//console.log("refresh Socket")
		//console.log(nextProps)
		//this.setState({ picture: nextProps.picture })
        this.t.logout();
        if (nextProps.id != -1) {
            //console.log(nextProps.user)
            this.t.connectToChat(nextProps.user)
            this.getNotifications(nextProps.user)
            //if (this.props.user.id !== -1) {
                this.getMessages(nextProps.user);
                this.getOfflineUsers();
            //}
            this.forceUpdate()
        }
	}
    
    componentWillMount() {
        //console.log(this.props)
        // this.props.location.listen((location, action) => {
        //     console.log("on route change");
        // });
    }

    componentWillUnmount() {
        //this.unlisten();
    }
    handleLogout() {
        //console.log("logout")
        this.t.logout();
        this.showNotification = {display: "none"}
        this.getOfflineUsers();
        this.props.actions()
        if (this.state.popups != undefined && this.state.popups.length > 0)
            this.state.popups.forEach(popup => {
                this.closePopup(popup.user.id)
            });
    }

    // recupere les message non lue a voir si c'est utile
    getMessages(user) {
        //console.log("getMessage notification")
        if (user.id != -1 && user.authenticated) {
            this.api.getMessages(user.id, user.token, false)
            .then((result) => {
                //console.log("receiv notif")
                //console.log(result)
                this.setState({
                    messages: result.data
                })
            }).catch(err => {
                //console.log("Error !!!! : ")
                //console.error(err)
                //NotificationManager.error(err);
            })
        }
    }

    getMessagesPopup() {
        //console.log("getMessage popup")
        if (this.props.user.id != -1 && this.props.user.authenticated) {
            this.api.getMessages(this.props.user.id, this.props.user.token, true)
            .then((result) => {
                if (result.status == 200) {
                   // console.log(result.data)
                    if (Array.isArray(result.data)) {
                        let popups = this.state.popups;
                        popups.forEach(popup => {
                            //popup.currentMessage = "";
                            popup.messages = new Array
                        })
                        result.data.forEach(message => {
                            //console.log("essaie de ranger " + message.value + " dans les popups")
                            popups.forEach(popup => {
                                
                                if ((popup.user.id == message.destUserId
                                    || popup.user.id == message.srcUserId)
                                    ) {
                                        if (popup.user.id == this.props.user.id
                                            && (popup.user.id == message.destUserId
                                                && popup.user.id == message.srcUserId)) {
                                                let newMessage = new Message;
                                                newMessage.value = message.value;
                                                newMessage.srcUserId = message.srcUserId;
                                                newMessage.destUserId = message.destUserId;
                                               // console.log("add message : " + message.value + " in popup " + popup.username)
                                                popup.messages.push(newMessage)
                                        } else if (popup.user.id !== this.props.user.id && (popup.user.id != message.destUserId
                                            || popup.user.id != message.srcUserId)) {
                                                let newMessage = new Message;
                                                newMessage.value = message.value;
                                                newMessage.srcUserId = message.srcUserId;
                                                newMessage.destUserId = message.destUserId;
                                               // console.log("add message 2 : " + message.value + " in popup " + popup.username)
                                                popup.messages.push(newMessage)
                                            }
                                        //console.log(popup.messages)
                                    }
                            })
                        });
                        // this.setState({
                        //     popups: popups
                        // })
                        this.forceUpdate()
                        this.state.popups.forEach(popup => {
                            var elem = document.getElementById( 'bottom' + popup.user.id );
                            elem.scrollIntoView()
                        })
                        this.forceUpdate()
                    }    
                }
            }).catch(err => {

            })
        }
    }

    getNotifications(user) {
        if (user.id != -1 && user.authenticated) {
            this.api.getNotifications(user.id, user.token, false)
            .then((result) => {
                //console.log("receiv notif")
                //console.log(result)
                this.setState({
                    notifications: result.data
                })
            }).catch(err => {
                //console.log("Error !!!! : ")
                //console.error(err)
                //NotificationManager.error(err);
            })
        }
        
    }

    clickMessage() {
       // console.log("click message")
        this.nbClickMessage++;
        // a tester pour voir si ca marche quand on a perdu internet et qu'on va dans l'onglet message
        // this.t.logout()
        // this.t.connectToChat(this.props.user)
        if (this.nbClickMessage > 1) {
            this.nbClickMessage = 0;
            // post notification read !
            if (this.state.notifications != undefined 
                && this.state.notifications.length > 0) {
                //this.api.readMessages(this.props.user.id, this.props.user.token)
                //.then(result => {
                   // console.log(result)
                  //  if (result.status == 200) {
          //              console.log("refresh notif")
                        this.getMessages(this.props.user)
                    //}
               // })
            }
            this.showMessage = {display: "none"}
            //console.log("if")
        } else {
            //console.log("else")
            
            this.showMessage = {
                display: "block"
            }
        }  
        this.forceUpdate()      
    }

    clicNotification() {
        //console.log("click notification " + this.nbClick)
        this.nbClick++;
        if (this.nbClick > 1) {
            this.nbClick = 0;
            //console.log("if")
            this.showNotification = {display: "none"}
            this.forceUpdate()
            // post notification read !
            if (this.state.notifications.length > 0) {
                this.api.readNotifications(this.props.user.id, this.props.user.token)
                .then(result => {
                   // console.log(result)
                    if (result.status == 200) {
          //              console.log("refresh notif")
                        this.getNotifications(this.props.user)
                    }
                })
            }
        } else {
            //console.log("else")
            
            this.showNotification = {
                display: "block"
            }
            this.forceUpdate()    
        }
         
    }

    clickUsersPanel() {
        this.nbClick2++;
        if (this.nbClick2 > 1) {
            //console.log("if")
            this.nbClick2 = 0;
            this.userPanelStyle = {
                maxHeight: '400px',
                bottom: '0px'
            }
            this.forceUpdate()
        } else {
            //console.log("else")
            
            this.userPanelStyle = {
                maxHeight: '40px',
                bottom: '0px',
            }
            this.forceUpdate()
        }
    }

    closePopup(username) {
        let popups = this.state.popups;
        //console.log("close popup " + username)
        let deletePopup = undefined;
        if (popups != undefined && popups != null) {
            popups.forEach(popup => {
                if (popup.id == username) {
                    //console.log("close modal " + popup.username)
                    deletePopup = popup
                }
            })
            if (deletePopup == undefined)
                return
            let index = popups.indexOf(deletePopup)
            if (index > -1) {
                //console.log("before delete : ")
                //console.log(popups)
                //console.log("delete " + index)
                popups.splice(index, 1)
                //console.log(popups)
            }
            this.setState({
                popups: popups
            }, () => {
                this.forceUpdate()
            })
        }
    }

    openPopup(user) {
        //console.log("openPopup")
        //console.log(username);
        if (this.props.user.id == -1)
            return
        let popups = this.state.popups;
        let isInPopup = false;
        if (popups != undefined) {
            popups.forEach(popup => {
                if (popup != undefined && popup.id == user.id)
                    isInPopup = true
            });
        }
        if (isInPopup == false) {
            let newPopup = new Popup;
            newPopup.user = user
            newPopup.id = user.id
            if (popups == undefined)
                popups = new Array
            popups.push(newPopup)
            this.setState({
                popups: popups
            }, () => {
                //console.log(popups)
                this.calculate_popups()
                this.getMessagesPopup();
                this.forceUpdate()
            })
        }
    }

    total_popups = 0;

    display_popups()
    {
        var right = 220;
        
        var i = 0;
        for(i; i < this.total_popups; i++)
        {
            if(this.state.popups[i] != undefined)
            {
                var element = document.getElementById(this.state.popups[i].id);
                element.style.right = right + "px";
                right = right + 320;
                element.style.display = "block";
            }
        }
        
        for(var j = i; j < this.state.popups.length; j++)
        {
            var element = document.getElementById(this.state.popups[j].id);
            element.style.display = "none";
        }
    }

	handleCurrentMessageChange(e, popup) {
        //console.log("new message : " + e.target.value)
        popup.currentMessage = e.target.value
        this.setState({
            currentMessage: e.target.value
        })
        //console.log(popup)
    }
    
    onClickSendMessage(message, destUserId): any {
		//console.log("in layout send " + message + " to " + destUserId)
		if (message != '') {
            this.t.sendMessage(message, destUserId)
            this.setState({
                currentMessage: ''
            })
            this.getMessagesPopup();
            
        }
			
	}

    calculate_popups()
    {
        var width = window.innerWidth;
        if(width < 540)
        {
            this.total_popups = 0;
        }
        else
        {
            width = width - 200;
            //320 is width of a single popup box
            this.total_popups = width/320;
        }
        
        this.display_popups();
        
    }

	render() {
        
        //if TODO !connected return la meme chose que si dessous mais sans profile/this.userId
		if (this.state.hasErrored) {
            return <p>Sorry! There was an error loading the items</p>;
        }
        //console.log(this.state)
        if (this.state.isLoading) {
            return <p>Loading…</p>;
        }
        
		return (<div>

            <nav className="App navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <header className="navbar-brand">
                        <h2>
                            <Link id="MyLink" to="/" replace>
                                {this.props.title}
                            </Link>
                        </h2>
                    </header>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className='navbar-nav mr-auto'>
                            <li className='navbar-brand '>
                                <Link className='active' id="MyLink" to="/users" replace>Users</Link>
                            </li>
                            <li className='navbar-brand'>
                                <Link id="MyLink" to="/pictures" replace>Pictures</Link>
                            </li>
                            <li className='navbar-brand'> <Link id="MyLink" to="/search" replace>Search</Link> </li>

                            {/* {this.props.user && this.props.user.authenticated == false &&
                                <li className='navbar-brand'>< Link id="MyLink" to="/login" replace>Login</Link> </li>
                            }
                            {this.props.user && this.props.user.authenticated &&
                                <li className='navbar-brand'><Link  id="MyLink" to="/" replace onClick={(e) => {this.props.actions()}}>Logout</Link> </li>
                            } */}
{/*                            <form className="form-inline my-2 my-lg-0">
                                <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"></input>
                                <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                            </form>*/}
                        </ul>
                        <ul className="navbar-nav">
                        {/* Affiche l'heure sur le server temps reel */}
                            {/* <li style={this.Margin} className="navbar-brand">
                                <p>
                                   {new Date(this.state.timestamp).toLocaleTimeString()}
                                </p>
                            </li> */}
                            {this.props.user.id && this.props.user.id != -1 && this.props.user.authenticated &&
                            <li style={this.Margin} className='navbar-brand'>
                                <Link className="btn btn-outline-primary my-2 my-sm-0" to={`/profile/${this.props.user.id}`} replace><i className="fas fa-user"></i> {this.props.user.id}</Link>
                            </li>
                            }
                            {/* TODO Bouton pour les messages !!!!! ci dessous */}
                            {/* {this.props.user.id && this.props.user.id != -1 && this.props.user.authenticated &&
                            <li style={this.Margin} onClick={e => this.clickMessage()} className='navbar-brand'>
                                <Link className="btn btn-outline-success my-2 my-sm-0 badge1" to={`/messages`} replace><i className="fas fa-comments"></i></Link>
                            </li>
                            } */}
                            <li style={this.Margin} id="notification_li" className="navbar-brand">
                                {this.props.user && this.props.user.authenticated == true &&  this.state.notifications != null && 
                                    <button style={this.MarginButton} onClick={e => this.clicNotification()} className="btn btn-outline-success my-2 my-sm-0 badge1" data-badge={this.state.notifications.length}><i className="fas fa-bell"></i></button>
                                }
                                {this.props.user && this.props.user.authenticated == true &&  this.state.notifications == null && 
                                    <button style={this.MarginButton} onClick={e => this.clicNotification()} className="btn btn-outline-success my-2 my-sm-0 badge1"><i className="fas fa-bell"></i></button>
                                }
                                <div style={this.showNotification} id="notifications">
                                    <div className="seeAll1"><a href="#/notifications">Notifications</a></div>
                                    <div id="spheight" className="notifications">
                                        {this.state.notifications && this.state.notifications != undefined &&
                                        this.state.notifications.map((notification, i) => {
                                            if (this.state.notifications.length > 0)
                                                return (
                                                    <div className="mr-4 ml-4" key={i}>
                                                        <div key={i} className="my-notification">
                                                            <div key={i} className=''> {notification.value}</div>
                                                        </div>
                                                    </div>)})}
                                    </div>
                                    <div className="seeAll"><a href="#/notifications">See All</a></div>
                                </div>

                            </li>
                            {/* <li style={this.Margin} className="navbar-brand">
                                {this.props.user && this.props.user.authenticated == true &&  this.state.notifications != null && 
                                    <button className="btn btn-outline-success my-2 my-sm-0 badge1" data-badge={this.state.notifications.length}><i className="fas fa-bell"></i></button>
                                }
                                {this.props.user && this.props.user.authenticated == true &&  this.state.notifications == null && 
                                    <button className="btn btn-outline-success my-2 my-sm-0 badge1"><i className="fas fa-bell"></i></button>
                                }
                            </li> */}
                            <li style={this.Margin} className="navbar-brand">
                                {this.props.user && this.props.user.authenticated == false &&
                                    <Link className="btn btn-outline-success my-2 my-sm-0" to="/login" replace><i className="fas fa-sign-in-alt"></i> Login</Link>
                                }
                                {/* {this.props.user && this.props.user.authenticated &&
                                    <img className="user nav-link" src={this.props.user.pictureUrl}></img>
                                } */}
                                {this.props.user && this.props.user.authenticated &&
                                    <Link className="btn btn-outline-danger my-2 my-sm-0" to="/" replace onClick={(e) => {this.handleLogout()}}><i className="fas fa-sign-out-alt"></i> Logout</Link>
                                }
                            </li>
                            <li className="navbar-brand">
                                {this.props.user && this.props.user.authenticated == false &&
                                    <Link className="btn btn-outline-primary my-2 my-sm-0" to="/register" replace><i className="fas fa-user-plus"></i> Register</Link>
                                }
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <NotificationContainer/>
            {this.state.popups && this.state.popups.map &&
                this.state.popups.map((popup, i) => {
                    let toto;
                    //console.log("draw popup in render " + popup.username)
                    return (<div key={i}>
                        <div className="popup-box chat-popup" id={popup.id}>
                            <div className="popup-head">
                                <div className="popup-head-left"><a href={`#/profile/${popup.user.id}`}>{popup.user.firstName + ' ' + popup.user.lastName}</a></div>
                                <div className="popup-head-right"><button onClick={e => this.closePopup(popup.id)}>&#10005;</button></div>
                                <div></div>
                            </div>
                            <div className="popup-messages" id="popup-messages">
                                {/* Display message */}
                                <div className="messages-content" id="messages-content"
                                    >
                                    <ul className="ul-messages" id="ul-messages">
                                        {popup && popup.messages.map &&
                                            popup.messages.map((message, i) => {
                                                if (message.destUserId == popup.user.id)
                                                    return (
                                                        <li key={i} className="him">
                                                            {message.value}
                                                        </li>
                                                    )
                                                return (
                                                    <li key={i} className="me">
                                                        {message.value}
                                                    </li>
                                                )
                                            })
                                        }
                                        <li className="bottom" id={`bottom${popup.user.id}`}></li>
                                    </ul>
                                    
                                </div>
                            </div>
                            <div className="form-inline">
                                <div className="input-group mb-3 ml-3">
                                    <input value={this.state.currentMessage} onChange={e => this.handleCurrentMessageChange(e, popup)} placeholder="Message" type="text" className="form-control" />
                                    <div className="input-group-append">
                                        <button style={this.NoMargin} onClick={e => {this.onClickSendMessage(popup.currentMessage, popup.user.id)}} className="btn btn-outline-secondary" type="button">Send</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>)
                })

            }
            {this.props.user.id != -1 && this.props.user.authenticated == true &&
                <div className="chat-sidebar peoples" style={this.userPanelStyle}>
                    <div className="header-chat" onClick={() => this.clickUsersPanel()}><b>Chat :</b></div>
                       <div className="">
                        <div className="p-2">online</div>
                           <hr></hr>
                        {this.state.onlineUsers && this.state.onlineUsers.map &&
                            this.state.onlineUsers.map((user, i) => {
                                if (user.id !== this.props.user.id
                                    && user.id != -1)
                                    //console.log(user)
                                    return (
                                    <div key={i}  onClick={e => {this.openPopup(user)}} className="sidebar-name">
                                        {/* <img width="30" height="30" src="" /> */}
                                        <span>{user.firstName + " " + user.lastName}</span>
                                    </div>
                                    )
                            })
                        }
                           <hr></hr>
                           <div className="pl-2">offline</div>
                           <hr></hr>
                           {this.state.offlineUsers && this.state.offlineUsers.map &&
                            this.state.offlineUsers.map((user, i) => {
                                if (user.id !== this.props.user.id)
                                    return (
                                    <div key={i}  onClick={e => {this.openPopup(user)}} className="sidebar-name">
                                        {/* <img width="30" height="30" src="" /> */}
                                        <span>{user.firstName + " " + user.lastName}</span>
                                    </div>
                                    )
                            }) 
                        }
                    </div>
                </div>  
            }
        </div>
      );
    }
}

function mapStateToProps(state){
    // access au store pour le mettre dans le props
    //console.log(state)
    return {
      user: state.user,
    };
  }

  const mapDispatchToProps = (dispatch) => {
    return {
        actions: () => dispatch(manualLogout())
    };
};

  export default connect(mapStateToProps, mapDispatchToProps)(Layout);