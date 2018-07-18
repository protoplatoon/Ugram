import * as React from 'react';
import axios from 'axios'
import UploadPanel from './UploadPanel'
import {Link} from 'react-router-dom'
import PictureCard from './PictureCard'
import {Api} from '../Api/Api';
import {Button, ButtonToolbar, DropdownButton, MenuItem} from 'react-bootstrap'
import * as ReactGA from 'react-ga';

export class PicturesList extends React.Component<any, any> {
	
	api:Api = new Api();
	
	currentPage:number = 0;

    styleCenter = {
        textAlign: 'center',
        'padding': '10px'
    }

	perPage:number = 10;

	constructor(props) {
		super(props);
		this.updatePage()
		this.getPictures(this.currentPage);
		this.state = {
			pictures: [],
			user:'',
			nbPage: '',
			hasError: true,
			value: 'sortDate'
		};
		this.sortOnChange = this.sortOnChange.bind(this);
		this.perPageOnChange = this.perPageOnChange.bind(this);
		//console.log(this.props.match.params);
		ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        
	}

	/**
	 * refrech Page since child component
	 */
	handlerUpload() {
		//e.preventDefault(); // stop le submit
		// décommenter ça si on veut que la page soit a 0
		// apres qu'on ai upload une image
		this.currentPage = 0;
		//console.log('call handler after upload picture')
		this.getPictures(this.currentPage);
	}

	perPageOnChange(e) {
		this.perPage = parseInt(e.target.value);
		this.getPictures(this.currentPage);
		ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        
		// this.props.history.push({
		// 	pathname: '/pictures',
		// 	search: ''
		// });
		this.forceUpdate();
	}

	getPictures = (page: number) => {
        this.api.getPictures(page, this.perPage)
            .then((result) => {
				//console.log(result);
				let tmp = result.data.items;
				//console.log(result);
                this.setState({
					pictures: tmp,
					nbPage: result.data.totalPages,
					hasError: false,
					value: 'sortDate'
				}, () => {
					this.state.pictures.sort(function (a, b) {
						return b.id - a.id;
					});
					this.forceUpdate();
				});
				
                //console.log(this.state.pictures);
            })
            .catch((err) => console.error(err));
    }

	componentWillMount () {
        //console.log('Pictures Mounted')
	}

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
	}	
	
	onRouteChanged() {
		this.updatePage();
		this.getPictures(this.currentPage);
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
	}

	sortOnChange(event) {
		//console.log('sort after change');
		this.setState({value: event.target.value});
		//console.log('sort result : ');
		if (event.target.value === 'sortDate') {
			this.state.pictures.sort(function (a, b) {
				return b.id - a.id;
			});
			//console.log(this.state.pictures);
		} else if (event.target.value == 'sortLike') {
			this.state.pictures.sort(function (a, b) {
				//console.log(a);
				var nameA = a.nbLike;
				var nameB = b.nbLike;
				if (nameA > nameB) {
					return -1;
				}
				if (nameA < nameB) {
					return 1;
				}
				return 0;
			});
			//console.log(this.state.pictures);
		} else {
			this.state.pictures.sort(function (a, b) {
				//console.log(a);
				var nameA = a.userId.toUpperCase();
				var nameB = b.userId.toUpperCase();
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0;
			});
			//console.log(this.state.pictures);
		}
			
		//display(intro);
	 }

	componentDidMount() {
		window.addEventListener('scroll', this.onScroll, false);
	}
	
	componentWillUnmount() {
		//window.removeEventListener('scroll', this.onScroll, false);
	}
	
	onScroll = () => {
		if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 1000) &&
			this.currentPage < this.state.nbPage) {
			//this.onPaginatedSearch();
		}
	}

	onPaginatedSearch() {
		//console.log(this.currentPage++);
		this.getPictures(this.currentPage);
		this.forceUpdate();
	}

	render() {
		if (this.state.hasError)
			return (<div>Wait Pictures ...</div>);
		if (this.state.pictures !== undefined) {
			// create les boutons pour changer de pages
			let buttonsPage = [];
			for (var i = 0; i < this.state.nbPage; i = i + 1) {
				var str:string = "/pictures?page=" + i;
				let number:number = i + 1;
				if (i == this.currentPage) {
					buttonsPage.push(<Link key={i} to={str} replace><Button bsStyle="primary">{number}</Button></Link>);
				} else {
					buttonsPage.push(<Link key={i} to={str} replace><Button>{number}</Button></Link>);
				}
				
			}
			return (
				<div style={this.styleCenter}>
					<div className="container">
						{/* TODO retourner l'uploader que si on est connecté */}
						{/* <UploadPanel action={this.handlerUpload.bind(this)}></UploadPanel> */}
						<div className="row">
							<div className="offset-sm-3 offset-md-4 offset-lg-4"></div>
							<div className="col-sm-3 col-md-2 col-lg-2">
								<select className="custom-select mt-2" onChange={this.sortOnChange} value={this.state.value}>
									<option value="sortDate">Date</option>
									<option value="sortUser">User</option>
									<option value="sortLike">Like</option>
								</select>
								{/* <ButtonToolbar>
									<DropdownButton
										title="Date"
										id="dropdown-size-large"
										onChange={this.sortOnChange} value={this.state.value}
									>
										<MenuItem value="sortDate" eventKey="1">Date</MenuItem>
										<MenuItem value="sortUser" eventKey="2">User</MenuItem>
									</DropdownButton>
								</ButtonToolbar> */}
							</div>
							<div className="col-sm-3 col-md-2 col-lg-2">
								<select className="custom-select mt-2" onChange={this.perPageOnChange} value={this.perPage}>
									<option value="10">10</option>
									<option value="30">30</option>
									<option value="50">50</option>
									<option value="70">70</option>
								</select>
                            </div>
						</div>
{/*						<div>
							{buttonsPage}
						</div>*/}
						<div className="user-list" >
							{
								this.state.pictures.map((picture, i) => {
									return <PictureCard key={i} action={this.handlerUpload.bind(this)} picture={picture} editMode={false}></PictureCard>
								})
							}
						</div>
						<div>
							{buttonsPage}
						</div>
					</div>
				</div>
			);
		} 
		return (<div>No Picture ! =)</div>);
    }
}