import * as React from 'react';
import {Api} from '../Api/Api';
import {Link} from 'react-router-dom'
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import {Button} from 'react-bootstrap'
import { connect } from 'react-redux';
import { itemsFetchData } from '../actions';
import {TcpClient} from '../Api/TcpClient'
import * as ReactGA from 'react-ga';

require('../../scss/notifications');

class Notifications extends React.Component<any, any> {
	
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
		}
		// abonnement lors de la creation du composant
		// mais si on change de route la methode sera 
		// appelée quand meme
		if (this.tcpClient.getNotif) {
			this.tcpClient.getNotif(this.props.user ,(err, user) => {
				// TODO tu as une nouvelle notification ici dans this.state.notif !!!! il faut l'afficher correctement =)
				//console.log("Refresh final notif")
				this.getNotifications(this.currentPage);
			});
		}
		//this.readNotifications();
		this.getNotifications(0);
		ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        
	}

	readNotifications() {
		if (this.props.user.authenticated && this.props.notifications.length > 0) {
			this.api.readNotifications(this.props.user.id, this.props.user.token)
			.then(result => {
				//console.log(result)
				if (result.status == 200) {
					//console.log("refresh notif")
					this.getNotifications(0)
				}
			})
		}
	}

	endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};
	
	
	getNotifications(page:number) {
		let api = new Api;
		//console.log("location : " + window.location.href)
		// si l'utilisateur et sur la toute qui se fini par /notifications alors refresh les notifs
		if (this.endsWith(window.location.href, "/notifications")) {
			if (this.getUrlParameter("perPage").length > 0)
				this.perPage = '&perPage=' + this.getUrlParameter("perPage")
			let url = api.baseUrl + '/users/' + this.props.user.id + '/notifications?page=' + page + '&access_token=' + this.props.user.token + '&isRead=true';
			this.props.fetchData(url);
		}

		// this.api.getUsers(page)
        //     .then((result) => {
		// 		console.log(result);
        //         this.setState({
		// 			users: result.data.items,
		// 			isLoaded: true,
		// 			nbPage: result.data.totalPages
		// 		});
        //         //console.log(this.state.users);
        //     })
        //     .catch((err) => console.log(err));
	}

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
	}	
	
	onRouteChanged() {
		//console.log("ROUTE CHANGED");
		this.updatePage();
		this.getNotifications(this.currentPage);
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
					Notifications List
				</h1>
				{/* <div style={this.styleCenter}>
					{buttonsPage}
				</div> */}
				<div className='notifications-list'>
					<div className="container">
						{ this.props.notifications && this.props.notifications.map &&
							this.props.notifications.map((notification, i) => {
								return (
								<div key={i} className="my-notification">
									<p className="" key={i}>
										{notification.value}
									</p>
								</div>)
							})
						}
					</div>
				</div>
				{/* <div style={this.styleCenter}>
						{buttonsPage}
				</div> */}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	//console.log('state')
	//console.log(state);
	if (state.items.sort) {
		state.items = state.items.sort((a, b) => {
			return (b.id - a.id)
		})
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

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);