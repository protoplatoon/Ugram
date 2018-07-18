import * as React from 'react';
import {Api} from '../Api/Api';
import {Link} from 'react-router-dom'
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import {Button} from 'react-bootstrap'
import { connect } from 'react-redux';
import { itemsFetchData } from '../actions';
import {TcpClient} from '../Api/TcpClient'
import { user } from '../reducers/userReducer';
import * as ReactGA from 'react-ga';

require('../../scss/messages');

class Messages extends React.Component<any, any> {
	

	api:Api = new Api();
	
	tcpClient = new TcpClient();

	currentPage:number = 0;
	perPage = '';

    styleCenter = {
		textAlign: 'center',
		margin: '10px'
    }

	constructor(props) {
		super(props);
		this.state = {
			users: [],
			isLoaded: true,
			messages: [],
			onlineUser: [],
			currentMessage: "",
			currentDest: ""
		}

		ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        

		this.tcpClient.getMessages(this.props.user ,(err, data) => {
			// TODO tu as une nouvelle notification ici dans this.state.notif !!!! il faut l'afficher correctement =)
			//console.log("receiv message " + data)
			this.setState({
				messages: this.state.messages.push(data)
			}, () => {
				this.getMessages(this.props.user)
			})
		});

		this.tcpClient.getUsers(this.props.user ,(err, data) => {
			// TODO tu as une nouvelle notification ici dans this.state.notif !!!! il faut l'afficher correctement =)
			
			//console.log("receiv getUsers " + data)
			if (data == "") {

			} else {
				this.setState({
					onlineUser: data
				}, () => {
					this.forceUpdate();
				})
			}
			
		});
		//this.readNotifications();

	}

	readNotifications() {
		if (this.props.user.authenticated && this.props.notifications.length > 0) {

		}
	}

	endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};
	

	sendMessage(message, username) {
		this.tcpClient.sendMessage(message, username)
	}

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
	}	
	
	onRouteChanged() {
		//console.log("ROUTE CHANGED");
		//this.updatePage();
	}

	getMessages(user) {
        if (user.id != -1 && user.authenticated) {
            this.api.getMessages(user.id, user.token, true)
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

	getUrlParameter(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(this.props.location.search);
		//console.log(this.props.location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};
	
	updatePage() {
		this.currentPage = this.props.match.params.page;
		if (this.currentPage === undefined)
			this.currentPage = 0;
		var page:number = parseInt(this.getUrlParameter("page"));
		if (this.currentPage === 0
			|| (this.currentPage === undefined && page !== 0))
			this.currentPage = page;
		if (isNaN(page) || page === 0) {
			this.currentPage = 0;
		}
		this.perPage = this.getUrlParameter('perPage')
	}

	onClickSendMessage(e): any {
		//console.log("send " + this.state.currentMessage + " to " + this.state.currentDest)
		if (this.state.currentDest != '')
			this.tcpClient.sendMessage(this.state.currentMessage, this.state.currentDest)
	}

	handleCurrentMessageChange(e) {
		this.setState({ currentMessage: e.target.value }
			, () => {
			//this.change = true;
				//console.log(this.state.search)
				//this.refreshPictureAndUser();
			});
	}

	render() {
		//console.log(this.props)
		if (this.state.hasErrored) {
            return <p>Sorry! There was an error loading the items</p>;
        }

        if (this.state.isLoading) {
            return <p>Loading…</p>;
		}
		
		if (!this.props.user.authenticated) {
            return <p>Sorry! You are not connected</p>;
        }
		let styleTest = {
			display: 'inline-block',
			textAlign: 'center'
		}


		// if (!this.state.isLoaded)
		// 	return (<div>Wait for Users ...</div>)

		let buttonsPage = [];
		//console.log('test : ')
		//console.log(this.props.items)
		// if (this.props.items && this.props.items.totalPages > 0)
		// 	for (var i = 0; i < this.props.items.totalPages; i = i + 1) {
		// 		var str:string = "/users?page=" + i + this.perPage;
		// 		let number:number = i + 1;
		// 		if (i == this.currentPage) {
		// 			buttonsPage.push(<Link key={i} to={str} replace><Button bsStyle="primary">{number}</Button></Link>);
		// 		} else {
		// 			buttonsPage.push(<Link key={i} to={str} replace><Button>{number}</Button></Link>);
		// 		}
		// 	}

        return (
			<div className="">
				<h1 style={this.styleCenter}>
					{/* Liste des utilisateurs ici */}
					Messages List
				</h1>
				{/* <div style={this.styleCenter}>
					{buttonsPage}
				</div> */}
				<div className="row">
					<div className="col-3">
						<h3 className="font-light">Online Users</h3>
						<ul id="users" className="">
						{ this.state.onlineUser && this.state.onlineUser.map &&
							this.state.onlineUser.map((user, i) => {
								//console.log(user)
								
								return (
								<li key={i} className="">
									<div className="onlineUser" key={i}>
										{user}
									</div>
								</li>)
							})
						}
						</ul>
					</div>
					<div className="col-9">
						<h3 className="font-light">Chat</h3>
						<div id="chat" className="">
						{ this.state.messages && this.state.messages.map &&
							this.state.messages.map((message, i) => {
								//console.log(message.srcUserId + " say to " + message.destUserId)
								//console.log(message)
								return (
								<div key={i} className="">
									<p className="" key={i}>
										{message.srcUserId} say to {message.destUserId} : {message.value}
									</p>
								</div>)
							})
						}
						</div>
						<div>
							<input value={this.state.currentMessage} onChange={e => this.handleCurrentMessageChange(e)} type="text" placeholder="Message" id="message"/>
							<button type="" onClick={e => {this.onClickSendMessage(e)}}>Send</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	//console.log('state')
	//console.log(state);
	if (state.items.sort) {
		// state.items = state.items.sort((a, b) => {
		// 	return (b.id - a.id)
		// })
	}
    return {
        notifications: state.items,
        hasErrored: state.itemsHasErrored,
		isLoading: state.itemsIsLoading,
		user: state.user
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchData: (url) => dispatch(itemsFetchData(url))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Messages);