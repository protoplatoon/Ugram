import * as React from 'react';
import {User} from '../Models/User'
import PictureCard from './PictureCard'
import {Picture} from '../Models/Picture'
import {Link} from 'react-router-dom'
import UploadPanel from './UploadPanel'
import {Button} from 'react-bootstrap'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loginRequest, manualLogout } from '../actions';
import {Confirm} from './Confirm';
import {Api} from '../Api/Api';
import * as ReactGA from 'react-ga';

class Profile extends React.Component<any, any> {
	
	
	api:Api = new Api();

	currentPage:number = 0;

    styleCenter = {
        'textAlign': 'center',
        'padding': '50px'
	}
	
	styleProfile = {
        'textAlign': 'center',
		'padding': '10px'
		
    }

    MarginButton = {
        'marginRight': '0px',
        'marginLeft': '0px'
    }

	change:boolean = false;

	HideInputStyle = {
		'display': 'none'
    }

	ShowLabelStyle = {
		display: '',
	}

	constructor(props) {
		super(props);
		this.state = {
			pictures: [],
			user: new User,
			nbPage: '',
			hasError: false,
			userIsLoaded: true,
			isMyProfile: false,
			isMounted: false,
			pictureIsLoaded: true
		};
		this.getUserInfo(this.props.match.params.userId);
		this.getPictures(0);
		this.handleSaveProfile = this.handleSaveProfile.bind(this);
		this.handleCancelEdition = this.handleCancelEdition.bind(this);
		this.handleEditProfile = this.handleEditProfile.bind(this);
		this.handleDeleteProfile = this.handleDeleteProfile.bind(this);
		this.onConfirm =  this.onConfirm.bind(this);
		ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        
	}

	onConfirm() {
		//console.log('onConfirm')
		this.handleDeleteProfile()
	}

	handleDeleteProfile() : any {
		//console.log('delete : ' + this.props.user.id)
		let token = this.props.user.token;

		if (token != null && token != undefined) {
			//console.log('user token ' + token)
			if (this.HideInputStyle.display == '') {
				this.HideInputStyle = { 
					
					display: 'none'
				}
			
				this.ShowLabelStyle = {
					
					display: '',
				}
			} else {
				this.HideInputStyle = {
				display: ''}
				this.ShowLabelStyle = {
				display: 'none'};
			}
			this.api.DeleteProfile(this.state.user, token)
			.then((result) => {
				//console.log('result of edition : ')
				//console.log(result);
				this.props.logout();
				this.props.history.push('/')
				//this.forceUpdate();
				this.change = false;
				//console.log(this.state.pictures);
			}).catch((err) => {
				//console.log(err)
				this.forceUpdate();
				//console.log(err)
			});
		}
	}

	getUserInfo(userId:number) {
		this.api.getUserInfo(userId)
            .then((result) => {
				//console.log("user info : ");
				//console.log(result);
                this.setState({
					user: result.data,
					userIsLoaded: false,
				}, () => this.forceUpdate());

				//console.log(result);
            })
            .catch((err) => {
				this.setState({
					hasError: true,
				})
				//console.log(err)
			});
	}

	getPictures = (page: number) => {
		this.api.getPicturesUser(this.props.match.params.userId,
			page)
            .then((result) => {
				//console.log(result);
                this.setState({
					pictures: result.data.items,
					nbPage: result.data.totalPages,
					hasError: false,
					pictureIsLoaded: false
				}, () => {
					if (this.state.userIsLoaded && this.state.isMounted)
						this.forceUpdate()
						//console.log("refresh User Picture done")
					});			
                //console.log(this.state.pictures);
            })
            .catch((err) => {
				this.setState({
					hasError: true,
				})
				//console.log(err)
			});
	}

	updatePicture() {
		//console.log('update Picture !!')
		this.getPictures(this.currentPage);
	}
	
	componentWillMount() {
		this.setState({
			isMounted: true
		})
		//console.log("isMounted")
	}	

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location && 
			this.state.isMounted == true) {
			//console.log("did update")
			this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
	}
	
	onRouteChanged() {
		this.updatePage();
		this.getPictures(this.currentPage);
		this.getUserInfo(this.props.match.params.userId)
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
		// setTimeout(() => {
		// 	console.log('attente ....')
		// 	// Yay! Can invoke sync or async actions with `dispatch` 
		// 	this.getPictures(this.currentPage);
		// 	this.forceUpdate();
		//   }, 500);
		this.getPictures(this.currentPage);
		// this.props.history.push({
		// 	pathname: '/profile/' + this.props.match.params.userId,
		// 	search: ''
		// })
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

	convertTimestamp(timestamp) {
		// convert 1518043095000 en 2018-02-07, 5:38 PM
		var d = new Date(timestamp),
			  yyyy = d.getFullYear(),
			  mm = ('0' + (d.getMonth() + 1)).slice(-2),
			  dd = ('0' + d.getDate()).slice(-2),
			  hh = d.getHours(),
			  h = hh,
			  min = ('0' + d.getMinutes()).slice(-2),
			  ampm = 'AM',
			  time;	  
		  if (hh > 12) {
			  h = hh - 12;
			  ampm = 'PM';
		  } else if (hh === 12) {
			  h = 12;
			  ampm = 'PM';
		  } else if (hh == 0) {
			  h = 12;
		  }
		  time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
		  return time;
	  }


	handleEditProfile() {
		//console.log('handle edit Profile click')
		//let tmp = this.HideInputStyle;
		if (this.HideInputStyle.display == '') {
			this.HideInputStyle = { 
				
				display: 'none'
			}
		
			this.ShowLabelStyle = {
				
				display: '',
			}
		} else {
			this.HideInputStyle = {
			display: ''}
			this.ShowLabelStyle = {
			display: 'none'};
		}
		//this.ShowLabelStyle = tmp;
		this.forceUpdate();
	}

	handleSaveProfile() {
		//console.log('save profile with user ');
		//console.log(this.state.user)
		let token = this.props.user.token;

		if (this.change) {
			if (token != null && token != undefined) {
				//console.log('user token ' + token)
				let tmp = this.HideInputStyle;
				if (this.HideInputStyle.display == '') {
					this.HideInputStyle = {
						display: 'none'
					}
				
					this.ShowLabelStyle = {
						display: '',
					}
				} else {
					this.HideInputStyle = {
					display: ''}
					this.ShowLabelStyle = {
					display: 'none'};
				}
				this.ShowLabelStyle = tmp;
				this.api.editProfile(this.state.user, token)
				.then((result) => {
					//console.log('result of edition : ')
					//console.log(result);
					if (this.state.isMounted)
						this.forceUpdate();
					this.change = false;
					//console.log(this.state.pictures);
				}).catch((err) => {
					//console.log(err)
					if (this.state.isMounted)
						this.forceUpdate();
					//console.log(err)
				});
			}
				
		}


		
	}

	handleFirstNameChange(e) {
		let tmpUser:User = this.state.user;
		tmpUser.firstName = e.target.value;
		this.setState({ user: tmpUser});
		this.change = true;
	}

	handleLastNameChange(e) {
		let tmpUser:User = this.state.user;
		tmpUser.lastName = e.target.value;
		this.setState({ user: tmpUser});
		this.change = true;
	}

	handlePhoneNumberChange(e) {
		let tmpUser:User = this.state.user;
		tmpUser.phoneNumber = e.target.value;
		this.setState({ user: tmpUser});
		this.change = true;
	}

	handleEmailChange(e) {
		let tmpUser:User = this.state.user;
		tmpUser.email = e.target.value;
		this.setState({ user: tmpUser});
		this.change = true;
	}

	handleCancelEdition() {
		this.handleEditProfile();
		this.getUserInfo(this.props.match.params.userId);
	}

	render() {
		if ((this.state.pictureIsLoaded || this.state.userIsLoaded
			|| this.state.user == null))
			return (<div>Wait for Profile ...</div>)

		let buttonsPage = [];
		for (var i = 0; i < this.state.nbPage; i = i + 1) {
			var str:string = "/profile/" + this.props.match.params.userId + "/pictures?page=" + i;
			let number:number = i + 1;
			if (i == this.currentPage) {
				buttonsPage.push(<Link key={i} to={str} replace><Button bsStyle="primary">{number}</Button></Link>);
			} else {
				buttonsPage.push(<Link key={i} to={str} replace><Button>{number}</Button></Link>);
			}
		}

		let styleTest = {
			display: 'none'
		}

		// affiche la photo de profit que si y'en a peut etre une ^^
		if (this.state.user && this.state.user.pictureUrl && this.state.user.pictureUrl.length > 0) {
			styleTest = {
				display: ''
			}
		} else if (this.state.user != null && this.state.user.pictureUrl != null && this.state.user.pictureUrl.length == 0) {
			this.state.user.pictureUrl = 'https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.50.50/p50x50/10354686_10150004552801856_220367501106153455_n.jpg?oh=58094ae96718bcfcbd53cfea5151eaf5&oe=5B137D2F';
		} else if (this.props.user != null && !this.props.user.authenticated){
			let error = this.state.user
			//console.log('error')
			//console.log(this.props.user)
			this.props.history.push('/')
		}
		// si je suis sur mon profil alors, retouner cette page qui permettra d'etiter le profile et de supprimer ou editer ses images
		if (this.props.match.params.userId === this.props.user.id 
			&& this.props.user.authenticated)
			{
				//console.log('testooooo')
			return (<div style={this.styleCenter}>

					{/* <h1>
						{this.props.match.params.userId}
					</h1> */}
					{/* TODO Permettre de modifier ces champs si dessous !! */}
					<div className="container">
						<div className="row">
							<div className="col-sm-4">
								<img className="user" style={styleTest} src={this.state.user.pictureUrl}></img>
							</div>
							<div className="col-sm-8">
								{/*<div className="row" style={this.ShowLabelStyle}>
									<p className="col"> Registration : </p>
									<p className="col-8">{this.convertTimestamp(this.state.user.registrationDate)}</p>
								</div>*/}
								<div className="" style={this.ShowLabelStyle}>
									<p className="col-12">{this.state.user.firstName}</p>
								</div>
								<div className="" style={this.ShowLabelStyle}>
									<p className="col-12">{this.state.user.lastName}</p>
								</div>
								<div className="" style={this.ShowLabelStyle}>
									<p className="col-12">{this.state.user.phoneNumber}</p>
								</div>
								<div className="" style={this.ShowLabelStyle}>
									<p className="col-12">{this.state.user.email}</p>
								</div>
								<div className="" style={this.HideInputStyle}>
									<input className="input-group-text col-12" placeholder="First Name" type="text" value={this.state.user.firstName} onChange={ this.handleFirstNameChange.bind(this) }/></div>
								<div className="" style={this.HideInputStyle}>
									<input className="input-group-text col-12" placeholder="Last Name" type="text" value={this.state.user.lastName} onChange={ this.handleLastNameChange.bind(this) }/>
								</div>
								<div className="" style={this.HideInputStyle}>
									<input className="input-group-text col-12" placeholder="Phone Number" type="text" value={this.state.user.phoneNumber} onChange={ this.handlePhoneNumberChange.bind(this) }/>
								</div>
								<div className="" style={this.HideInputStyle}>
									<input className="input-group-text col-12" placeholder="Email" type="text" value={this.state.user.email} onChange={ this.handleEmailChange.bind(this) }/>
								</div>

							</div>
                            <div className="col-sm-6">
                                <button className="btn btn-secondary btn-block" onClick={this.handleEditProfile} style={this.ShowLabelStyle}>
                                    <i className="fas fa-edit"></i> Edit your profile
                                </button>
                            	<div className="form-inline">
									<button className="col-sm-3 btn btn-secondary btn-block" onClick={this.handleCancelEdition} style={this.HideInputStyle}>
										<i className="fas fa-times"></i> Cancel
									</button>

									{  this.change &&
									<button className="col-sm-3 btn btn-secondary btn-block" onClick={this.handleSaveProfile} style={this.HideInputStyle}>
										<i className="fas fa-save"></i> Save
									</button>
									}
									<Confirm
										onConfirm={this.onConfirm}
										body="Are you sure you want to delete your account ?"
										showCancelButton="true"
										// confirmText="Confirm Delete"
										title="Deleting Account">
										<button className="col-sm-3 btn btn-danger" style={this.HideInputStyle}>
											<i className="fas fa-trash"></i> Delete
										</button>
									</Confirm>
									{/* <button className="btn btn-danger" onClick={this.handleDeleteProfile} style={this.HideInputStyle}>
												<i className="fas fa-trash"></i>
										</button> */}
								</div>
                            </div>
                            <UploadPanel action={this.handlerUpload.bind(this)}></UploadPanel>
						</div>
						{/* <div className="row" style={this.ShowLabelStyle}>
							<p className="col">Last Name : </p>
							<p className="col-8">{this.state.user.lastName}</p>
						</div>
						<div className="row" style={this.ShowLabelStyle}>
							<p className="col">Number : </p>
							<p className="col-8">{this.state.user.phoneNumber}</p>	
						</div>
						<div className="row" style={this.ShowLabelStyle}>
							<p className="col">Email : </p>
							<p className="col-8">{this.state.user.email}</p>
						</div>
						<div className="row" style={this.HideInputStyle}>
							<p className="col">First Name :</p> 
							<input className="col-8" type="text" value={this.state.user.firstName} onChange={ this.handleFirstNameChange.bind(this) }/></div>
						<div className="row" style={this.HideInputStyle}>
							<p className="col">Last Name : </p> 
							<input className="col-8" type="text" value={this.state.user.lastName} onChange={ this.handleLastNameChange.bind(this) }/>
						</div>
						<div className="row" style={this.HideInputStyle}>
							<p className="col">Number :</p> 
							<input className="col-8" type="text" value={this.state.user.phoneNumber} onChange={ this.handlePhoneNumberChange.bind(this) }/>
						</div>
						<div className="row" style={this.HideInputStyle}>
							<p className="col">Email :</p>
							<input className="col-8" type="text" value={this.state.user.email} onChange={ this.handleEmailChange.bind(this) }/>
						</div> */}
							
						{/* <button className="btn btn-secondary" onClick={this.handleEditProfile} style={this.ShowLabelStyle}>
							<i className="fas fa-edit"></i>
						</button>
						<div className="form-inline">
							<button className="btn btn-secondary" onClick={this.handleCancelEdition} style={this.HideInputStyle}>
								<i className="fas fa-times"></i>
							</button>
							
							{  this.change && 
								<button className="btn btn-secondary" onClick={this.handleSaveProfile} style={this.HideInputStyle}>
									<i className="fas fa-save"></i>
								</button>
							}
							<Confirm
								onConfirm={this.onConfirm}
								body="Are you sure you want to delete your account ?"
								showCancelButton="true"
								confirmText="Confirm Delete"
								title="Deleting Account">
								<button className="btn btn-danger" style={this.HideInputStyle}>
									<i className="fas fa-trash"></i>
								</button>
							</Confirm>							
						</div> */}
					</div>
					<div className="container Pictures">
						<hr></hr>
{/*						<h1>Pictures : </h1>
						<div>
							{buttonsPage}
						</div>*/}
						<div className='card-list'>
							{this.state.pictures && this.state.pictures.map &&
								this.state.pictures.map((picture, i) => {
									return <PictureCard key={i} action={this.updatePicture.bind(this)} picture={picture} editMode={true}></PictureCard>
								})
							}
						</div>
						<div>
							{buttonsPage}
						</div>
					</div>
				</div>);
			}
        return (
			<div  className="" style={this.styleProfile}>
				{/* <h1 style={this.styleCenter}>
					{this.props.match.params.userId}
				</h1> */}
                <div className="container">
					<div className="row">
						<div className="col-sm-4">
							<img className="user" style={styleTest} src={this.state.user.pictureUrl}></img>
						</div>
						<div className="col-sm-8">
							<div className="" style={this.ShowLabelStyle}>
								<p className="col-12">{this.state.user.firstName}</p>
							</div>
							<div className="" style={this.ShowLabelStyle}>
								<p className="col-12">{this.state.user.lastName}</p>
							</div>
							<div className="" style={this.ShowLabelStyle}>
								<p className="col-12">{this.state.user.phoneNumber}</p>
							</div>
							<div className="" style={this.ShowLabelStyle}>
								<p className="col-12">{this.state.user.email}</p>
							</div>
						</div>
					</div>
				</div>
				<div className="Pictures container">
					<hr></hr>
					<div className='card-list'>
						{this.state.pictures && this.state.pictures.map  && 
							this.state.pictures.map((picture, i) => {
								return <PictureCard key={i} action={this.updatePicture.bind(this)} picture={picture} editMode={false}></PictureCard>
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
}

function mapStateToProps(state) {
   // console.log('state : ');
   // console.log(state)
    //this.props.user = state.user;
	//console.log('return mapStateProps')
	//if (state.user == undefined || state.user == null)
	//	console.log('peut etre ca ??')
    return {
        user: state.user
    };
}

function mapDispatchToProps(dispatch) {
	//console.log('test')
    return { 
		actions: bindActionCreators(loginRequest, dispatch),
		logout: () => dispatch(manualLogout())
	}
  }
  
export default connect(mapStateToProps, mapDispatchToProps)(Profile);