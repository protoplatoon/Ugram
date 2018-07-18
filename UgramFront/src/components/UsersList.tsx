import * as React from 'react';
import {Api} from '../Api/Api';
import {Link} from 'react-router-dom'
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import {Button} from 'react-bootstrap'
import { connect } from 'react-redux';
import { itemsFetchData } from '../actions';
import * as ReactGA from 'react-ga';

require('../../scss/users');

class UsersList extends React.Component<any, any> {
	
	api:Api = new Api();
	
	currentPage:number = 0;
	perPage = '';

    styleCenter = {
		textAlign: 'center',
		margin: '10px'
    }
    Margin = {
        'padding': '10px'
    }

	constructor(props) {
		super(props);
		this.state = {
			users: [],
			isLoaded: false,
			nbPage: this.props.items.totalPages
		}
		this.getUsers(0);
		ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        
	}
	
	getUsers(page:number) {
		let api = new Api;

		if (this.getUrlParameter("perPage").length > 0)
			this.perPage = '&perPage=' + this.getUrlParameter("perPage")
		let url = api.baseUrl + '/users?page=' + page + this.perPage;
		this.props.fetchData(url);
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
		this.getUsers(this.currentPage);
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

	normalize(user) {
		if (user.pictureUrl != null && user.pictureUrl.length == 0) {
			user.pictureUrl = 'https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.50.50/p50x50/10354686_10150004552801856_220367501106153455_n.jpg?oh=58094ae96718bcfcbd53cfea5151eaf5&oe=5B137D2F';
		}
	}

	render() {
		if (this.state.hasErrored) {
            return <p>Sorry! There was an error loading the items</p>;
        }

        if (this.state.isLoading) {
            return <p>Loading…</p>;
        }
		let styleTest = {
			display: 'inline-block',
			textAlign: 'center'
		}

		let buttonsPage = [];
		if (this.props.items && this.props.items.totalPages > 0)
			for (var i = 0; i < this.props.items.totalPages; i = i + 1) {
				var str:string = "/users?page=" + i + this.perPage;
				let number:number = i + 1;
				if (i == this.currentPage) {
					buttonsPage.push(<Link key={i} to={str} replace><Button bsStyle="primary">{number}</Button></Link>);
				} else {
					buttonsPage.push(<Link key={i} to={str} replace><Button>{number}</Button></Link>);
				}
			}

        return (
			<div className="container" style={this.Margin}>
				<div className='users-list'>
					{ this.props.items && this.props.items.items && this.props.items.items.map &&
						this.props.items.items.map((user, i) => {
							this.normalize(user);
							var str:string = "/profile/" + user.id;
							return (
							<Link key={i} to={str} replace className="MyLink" style={{ textDecoration: 'none' }}>
								<div className="users" key={i}>
									<div className="m-4">
										<img className="mb-3" src={user.pictureUrl}></img>
										<h2 className="">{user.firstName} {user.lastName}</h2>
										<h6 className="">{user.phoneNumber}</h6>
										<h6 className="">{user.email} </h6>
                                    </div>
								</div>
							</Link>)
						})
					}
				</div>
				<div style={this.styleCenter}>
						{buttonsPage}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	//console.log('state')
	//console.log(state);
    return {
        items: state.items,
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

export default connect(mapStateToProps, mapDispatchToProps)(UsersList);