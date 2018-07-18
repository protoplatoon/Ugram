import * as React from 'react';
import {Picture} from '../Models/Picture';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deletePicture } from '../actions';
import ModalDisplay from './ModalDisplay'
import {Confirm} from './Confirm';
import {browserHistory} from 'react-router';
import { HashRouter, Route, Switch, Redirect, Link, replace } from 'react-router-dom';
import {Api} from '../Api/Api';
import axios, {AxiosPromise} from 'axios'
import * as ReactGA from 'react-ga';

require('../../scss/picture.scss')

export interface IPicture {
	picture: Picture;
	editMode: boolean;
}

var maxPictureSize = 0;
var tmpPictureUrl = ""
var currentCanvas;
var originWidth;
var originHeight;
var currentPicture;

class PictureCard extends React.Component<any, any> {

	unlisten: any;
	defaultMargin = {
		margin: "4px"
	};
	api:Api = new Api();

	isEnable = true;

	ModalStyle = {
		display: 'none'
	};

	HideLabelStyle = {
		display: 'none',
		'textAlign': 'left',
		padding: '0px'
	}

    NoMargin = {
        margin: '0px',
    }

	ShowLabelStyle = {
		display: 'inline-block',
		textAlign: 'left',
		padding: '0px'
	}

	ShowLikeButton = {

	}

	ShowUnlikeButton = {
		display: "none"
	}

	test = {
		display: 'block'
	}

    styleCenter = {
        textAlign: 'center',
    }

	change:boolean = false;

	constructor(props) {
		super(props);
		this.state = {
			ModalStyle: '',
			changeTags: '',
			changeMentions: '',
			delete: false,
			isEnable: true,
			picture: this.props.picture,
			comment: '',
			isLoading: false,
			size: 64,
			isOpen: false,
			currentSize: 64,
			isDownloading: false,
			isMounted: false
		}
		if (this.props.picture.description == null
		|| this.props.picture.description == undefined)
			this.props.picture.description = '';
		//console.log('construction dune image !!!!');
		//console.log(this.props.picture);
		this.clickPicture = this.clickPicture.bind(this);
		this.closeModal = this.closeModal.bind(this);
		//this.changeSize = this.changeSize.bind(this)
		this.componentWillMount = this.componentWillMount.bind(this)
		this.handleRefreshPicture()
	}

	componentDidMount() {
		//console.log(this.props.picture)
	}

	onConfirm(e) {
		this.handleDelete(e);
	}

	handleDescriptionChange(e) {
		let tmpPicture:Picture = this.props.picture;
		tmpPicture.description = e.target.value;
		this.setState({ picture: tmpPicture});
		this.change = true;
	}

	handleTagsChange(e) {
		this.setState({ changeTags: e.target.value});
		this.change = true;
		this.forceUpdate();
	}

	handleMentionsChange(e) {
		this.setState({ changeMentions: e.target.value });
		this.change = true;
		this.forceUpdate();
	}

	handleEditProfile() {
		//console.log('handle edit Profile click')
		let tmp = this.HideLabelStyle;
		this.HideLabelStyle = this.ShowLabelStyle;
		this.ShowLabelStyle = tmp;
		this.forceUpdate();
	}

	handleDelete(e) {
		//console.log('delete');
		//console.log(this.props);
		this.setState({
			delete: true
		}, () => {
			this.api.deletePicture(this.props.picture.id, this.props.picture.userId
				, this.props.user.token)
				.then((result) => {
					//console.log(result);
					//console.log(this.state.pictures);
					this.props.action();
					//this.forceUpdate();
				})
				.catch((err) => console.error(err));
		})

	}

	handleLike(e) {
		//console.log('like');
		//console.log(this.props.user.token);
		this.setState({
			delete: true,
			isEnable: false
		}, () => {
			this.api.likePicture(this.props.picture.id
				, this.props.user.token)
				.then((result) => {
					//console.log(result);
					//console.log(this.state.pictures);
					this.ShowLikeButton = {display: "none"}
					this.ShowUnlikeButton = {display: "inline-block"}
					this.setState({
						isEnable: true
					})
					this.handleRefreshPicture();
					//this.props.action();
				})
				.catch((err) => {
					console.error(err)
					this.ShowLikeButton = {display: "none"}
					this.ShowUnlikeButton = {display: "inline-block"}
					this.handleRefreshPicture();
					//this.props.action();
					this.setState({
						isEnable: true
					})
				});
		})
	}

	test2() {

	}

	

	componentWillMount() {
		this.setState({
			isMounted: true
		})
		if (this.props.history != null && this.props.history != undefined) {
			//console.log("Bind action on route change")

		}


		//console.log("isMounted")
	}

	componentWillUnmount() {
	}

	componentWillReceiveProps(nextProps) {
		//console.log("refresh here peux etre")
		//console.log(nextProps)
		this.setState({
			isMounted: true
		})
		this.setState({ picture: nextProps.picture })
		this.forceUpdate()
	}

	componentDidUpdate(prevProps) {
		//console.log("componentDidUpdate")
		//this.onRouteChanged();

		if (this.props.location !== prevProps.location) {
			//console.log("did update")
			//this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
	}

	onRouteChanged() {
		this.handleRefreshPicture();
	}


	handleUnlike(e) {
		//console.log('unlike');
		//console.log(this.props);
		this.setState({
			delete: true,
			isEnable: false
		}, () => {
			this.api.unlikePicture(this.props.picture.id
				, this.props.user.token)
				.then((result) => {

					//console.log(result);
					//console.log(this.state.pictures);
					this.ShowUnlikeButton = {display: "none"}
					this.ShowLikeButton = {display: "inline-block"}
					this.handleRefreshPicture();
					//this.props.action();
					this.setState({
						isEnable: true
					})
					this.forceUpdate();
				})
				.catch((err) => {
					this.setState({
						isEnable: true
					})
					this.handleRefreshPicture();
					this.ShowUnlikeButton = {display: "none"}
					this.ShowLikeButton = {display: "inline-block"}
					console.error(err)
				});
		})

	}

	handleEdit(e) {
		//console.log('edit');
		//console.log(this.props.picture);
		let tmp = this.HideLabelStyle;
		this.HideLabelStyle = this.ShowLabelStyle;
		this.ShowLabelStyle = tmp;
		let str = '';
		this.props.picture.mentions.map((mention, i) => {
			str += mention;
		});
		this.setState({
			changeMentions: str
		});
		str = '';
		this.props.picture.tags.map((tag, i) => {
			str += tag;
		});
		this.setState({
			changeTags: str
		});
		//console.log('now changeTags is : ');
		//console.log(this.state.changeTags);
		this.forceUpdate();
	}

	handleCancel(e) {
		//console.log('cancel');
		//console.log(this.props.picture);
		this.handleEditProfile();
		this.forceUpdate();
	}

	handleSave(e) {
		//console.log('save');
		//console.log(this.props.picture);
		if (this.change)
			this.api.editPicture(this.props.picture,
				this.state.changeTags, this.state.changeMentions
				, this.props.user.id, this.props.user.token)
				.then((result) => {
					//console.log('result of edition : ')
					//console.log(result);
					this.change = false;
					this.props.action();
					this.forceUpdate();
					//console.log(this.state.pictures);
				}).catch((err) => {
					this.forceUpdate();
					//console.log(err)
				});
		this.handleEditProfile();
		this.forceUpdate();
	}

	handleRefreshPicture() {
		if (this.props.picture != null) {
			this.api.getPicture(this.props.picture.id, this.props.user.token)
			.then(result => {
				//console.log("receiv refresh picture")
				//console.log(result)
				if (result.status == 200) {
					this.setState({
						picture: result.data
					}, () => {
						//console.log("lastUpdate " + this.props.picture.id);
						this.forceUpdate()
					})
				}
			}).catch(err => {
				console.error("Fail to get picture")
			})
		}

	}

	/*
     * Draw initial canvas on new canvas and half it's size
	 * Prend un Canvas en param
	 */
    halfSize(i) {
		//console.log("halfSize")
		//console.log(i)
        var canvas = document.createElement("canvas");
		
		//let ratio = originWidth / originHeight   


		//canvas.width = this.state.currentSize * ratio;

		//canvas.height = this.state.currentSize;
		canvas.width = i.width / 1.2;
		canvas.height = i.height / 1.2;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(i, 0, 0, canvas.width, canvas.height);
        return canvas;
	};

	download() {
		// fake server request, getting the file url as response
		setTimeout(() => {
		  const response = {
			file: this.props.picture.url,
		  };
		  // server sent the url to the file!
		  // now, let's download:
		 	window.open(response.file);
		  // you could also do:
		  //window.location.href = response.file;
		}, 100);
	  }

	handleDownload() {
		if (this.state.isDownloading) {
			//console.log("Download in progress ....")
			return
		}
		//console.log('Download Picture' + this.props.picture.id)
		//console.log(currentCanvas)
		//currentCanvas = this.convertImgToCanvas()

		//		this.download();
		// maxPictureSize = +img.height;
			// console.log(maxPictureSize)
		//currentCanvas = document.createElement("canvas");
		var currentPicture = document.images.namedItem("img" + this.props.picture.id);
		//currentPicture.crossOrigin = "Anonymous";
		// let canvas = document.createElement("canvas");
		// canvas.height = currentPicture.height;
		// canvas.width = currentPicture.width;
		// var context = canvas.getContext('2d');
		// context.drawImage(currentPicture, 0, 0, canvas.width, canvas.height);
		// console.log(canvas.toDataURL())

		// var img = new Image,
	    // canvas = document.createElement("canvas"),
    	// ctx = canvas.getContext("2d"),
    	// src = this.props.picture.url; // insert image url here

		// img.crossOrigin = "http://localhost:8080";

		// img.onload = function() {
		// 	console.log("onload")
		// 	canvas.width = img.width;
		// 	canvas.height = img.height;
		// 	ctx.drawImage( img, 0, 0 );
		// 	//localStorage.setItem("savedImageData", canvas.toDataURL("image/png") );
		// }
		// img.src = src;
		// make sure the load event fires for cached images too
		// if ( img.complete || img.complete === undefined ) {
		// 	img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
		// 	img.src = src;
		// }
		//console.log(currentPicture)
		// console.log(this.state.picture.url)
		const config = {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
		}
		// console.log("get " + this.state.picture.url)
		if (this.state.currentSize == currentPicture.height)
			this.download()
		else {
			//console.log("download")
			this.setState({isDownloading:true})
			axios.get(this.api.baseUrl + "/users/" + this.props.picture.userId + "/pictures/" + this.props.picture.id + "/download" + "?height=" + this.state.currentSize + '&access_token=' + this.props.user.token, config)
			.then(res => {
				this.setState({isDownloading:false})
				if (res.status == 200) {
					//console.log(res)
					//console.log(res.data)
					tmpPictureUrl = res.data
					//window.location.href = res.data
					window.open(res.data);
					// perd le socket
				}
				//console.log("res !!! ")
				//console.log(res)
				//let b = new Buffer(res.data);
				//console.log(b)
			}).catch(err => {
				this.setState({isDownloading : false})
				console.error(err)
			})
		}
		

			// originWidth = currentCanvas.width;
			// originHeight = currentCanvas.height;
			// currentCanvas.width = currentPicture.width;
			// currentCanvas.height = currentPicture.height;
			// var ctx = currentCanvas.getContext("2d");
			// ctx.drawImage(currentPicture, 0, 0, currentCanvas.width,currentCanvas.height);
			// console.log("currentCanvas : ")
			// let test = new ImageData(currentPicture.width, currentPicture.height);
			// test.data = currentCanvas.data
			// console.log(test.data)
			// //tmpPictureUrl = currentCanvas.getDataURL("image/png");
			// //tmpPictureUrl = this.props.picture.url
		 	// this.forceUpdate();

		// if (currentCanvas != null && currentCanvas != undefined) {
		// 	//currentCanvas.width = maxPictureSize;
		// 	//currentCanvas.height = originHeight;
		// 	let tmp = currentCanvas
		// 	//console.log(tmp.height + " " + this.state.currentSize)
		// 	while (tmp.height > this.state.currentSize) {
		// 		tmp = this.halfSize(tmp);
		// 		//console.log(currentCanvas)
		// 		//console.log(currentPicture)
		// 		//tmpPictureUrl = currentCanvas.toDataUrl();
		// 	}
		// 	console.log(tmp)
		// 	console.log(currentCanvas.toDataURL())
		// 	//tmpPictureUrl = tmp.toDataURL('image/png');
		// 	tmpPictureUrl = this.props.picture.url;
		// 	console.log(tmp)
		// 	this.forceUpdate();
		// }
		// var img = new Image();
		// img.onload = function () {
		// 	console.log(img);
		// 	//img.height contient la plus grande taille de l'image possible
		// 	// on créer donc un tableau de valeur a partir de cette taille
		// 	maxPictureSize = img.height;
		// };
		// img.src = this.state.picture.url
	}

	handleDisplayPicture(e) {
		ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview("/pictures/" + this.props.picture.id);
        
		this.handleRefreshPicture();
		// doit afficher l'image this.props.picture en grand
		// et faut aussi permettre d'editer les champs de l'image
		// quelque part
		//console.log(this.state.isOpen)
		if (this.state.isOpen == false) {
			//console.log("handle display")
			var img = document.images.namedItem("img" + this.props.picture.id);
			// un génie a dit de mettre cette ligne pour enlever mon erreur merci stackoverflow https://stackoverflow.com/questions/25753754/canvas-todataurl-security-error-the-operation-is-insecure?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
			//console.log("image : ")
			// fetch(img.src).then(resp => resp.blob())
			// .then(blob => {
			// 	console.log(blob.size);
			// 	}).catch(err => {
			// 		console.log("putain d'erreur ")
			// 		console.log(err)
			// 	});
			//console.log(img.height + " w " + img.width)
			// !!!!!! active l'input pour choisir la hauteur de l'image voulu 
			maxPictureSize = img.height;
			//this.forceUpdate();
			//console.log("url " + this.state.picture.url)
			//img.crossOrigin = "https://s3.ca-central-1.amazonaws.com/images-ugram-team-09/google112246082357326936532/dUHLnKT51y.jpg";
			//console.log(img)
			//img.crossOrigin = "https://s3.ca-central-1.amazonaws.com/"
			

			
			//img.
			// maxPictureSize = +img.height;
			// console.log(maxPictureSize)
			// currentCanvas = document.createElement("canvas");
			// originWidth = currentCanvas.width;
			// originHeight = currentCanvas.height;
			// currentCanvas.width = img.width;
			// currentCanvas.height = img.height;
			// var ctx = currentCanvas.getContext("2d");
			// ctx.drawImage(img, 0, 0, currentCanvas.width,currentCanvas.height);
			// tmpPictureUrl = currentCanvas.toDataUrl();
			// img.onload = function () {
			// 	console.log("onload")
			// 	console.log(img);
			// 	//img.height contient la plus grande taille de l'image possible
			// 	// on créer donc un tableau de valeur a partir de cette taille
			// 	maxPictureSize = +img.height;
			// 	console.log(maxPictureSize)
			// 	currentCanvas = document.createElement("canvas");
			// 	originWidth = currentCanvas.width;
			// 	originHeight = currentCanvas.height;
			// 	currentCanvas.width = img.width;
			// 	currentCanvas.height = img.height;
			// 	var ctx = currentCanvas.getContext("2d");
			// 	ctx.drawImage(img, 0, 0, currentCanvas.width,currentCanvas.height);
			// 	tmpPictureUrl = currentCanvas.toDataUrl();
			// };
			// img.src = this.state.picture.url
			// currentPicture = img
			this.setState({isOpen: true}, () => {

			})
		}
		

	}

	closeModal() {
		this.setState({isOpen: false}, () => {
			this.forceUpdate();
			//console.log("close modal " + this.state.isOpen)
		})
		//console.log('close Modal');
		this.ModalStyle = {
			display: "none"
		};
	}

	clickPicture() {
		//console.log('click on picture')
		this.ModalStyle = {
			display: "block"
		};
		this.forceUpdate();
	}

	handleKeyPress() {
		//console.log('keyPress');
		this.closeModal();
	}

	handleCommentChange(e) {
		this.setState({ comment: e.target.value }, () => {

		})
	}

	handleSizeChange(e) {
		// ok
		this.setState({ currentSize: e.target.value }, () => {
			//console.log("new Size : " + this.state.currentSize)
			
		})
	}

	handleSaveComment() {
		//console.log("save " + this.state.comment)
		this.setState({isLoading: true}, () => {
			this.api.saveComment(this.props.picture.id, this.state.comment, this.props.user.token)
			.then((result) => {
				if (result.code == 200) {
					//console.log("save comment OK")
				}
				this.setState({
					isLoading: false,
					comment: ''
				})
				this.handleRefreshPicture()
			}).catch(err => {
				console.error(err)
				this.setState({isLoading: false})
				this.handleRefreshPicture()
			})
		})
	}

	handleDeleteComment(commentId) {
		this.setState({isLoading: true}, () => {
			this.api.deleteComment(this.props.picture.id, commentId, this.props.user.token)
			.then((result) => {
				if (result.code == 200) {
					//console.log("comment delete")
				}
				this.setState({
					isLoading: false
				})
				this.handleRefreshPicture()
			}).catch(err => {
				console.error(err)
				this.setState({isLoading: false})
				this.handleRefreshPicture()
			})
		})
	}

	render () {
		let profile = "/profile/" ;

		if ((!this.state.isMounted))
			return (<div>Wait for Mounted ...</div>)


		if (this.props.user.authenticated
		&& !this.props.editMode)
		{
			this.ShowUnlikeButton = {display: "none"}
			this.ShowLikeButton = {display: "inline-block"}
			if (this.state.picture != null
				&& this.state.picture.likes != null
				&& this.state.picture.likes.length > 0) {
				this.state.picture.likes.forEach(like => {
					//console.log(like)
					if (like.userId == this.props.user.id) {
						//console.log("tu as deja liké la photo dude")
						this.ShowLikeButton = {display: "none"}
						this.ShowUnlikeButton = {display: "inline-block"}
						//console.log("Affiche le unlike putain ! sur " + this.props.picture.id)
					}
				});
			} else if (this.state.picture != null
			&& this.state.picture.likes != null
			&& this.state.picture.likes.length == 0) {
				//console.log("Afifiche le putain de like "  + this.props.picture.id)
				this.ShowUnlikeButton = {display: "none"}
				this.ShowLikeButton = {display: "inline-block"}
			}

			// retourn la card avec la possibilité de like la photo car on est connecté
			return (
			<div className="mycard" onClick = { e => this.handleDisplayPicture(e) }>
				<div id="" className="modal" style={this.ModalStyle}>
                    <button type="button" className="blanc close" data-dismiss="modal" onClick={this.closeModal} aria-label="Close">
                        <i aria-hidden="true" className="blanc fa fa-times"></i>
                    </button>
					<div className="modal-content">
                        <div className="modal-body">
							<div className="row">
								<div className="col-sm-8">
									<img className="modal-content" id={'img' + this.props.picture.id} src={this.props.picture.url}/>
								</div>
								<div className="col-sm-4">
									<section className="form-inline">
										<a style={this.NoMargin}>Published by <b> {this.props.picture.userId} </b> | <b> {this.state.picture.likes.length} like</b></a>
										<button style={this.ShowLikeButton}
												className="gris ml-auto"
												disabled={!this.state.isEnable}
												name = "like"
												onClick = { e => this.handleLike(e) }><i className="fas fa-heart"></i>
										</button>
										<button style={this.ShowUnlikeButton}
												name = "unlike"
												className="red ml-auto"
												disabled={!this.state.isEnable}
												onClick = { e => this.handleUnlike(e) }><i className="fas fa-heart"></i>
										</button>
									</section>
									<div className="form-inline">
										<div>height : </div>
										<input className="mr-2" value={this.state.currentSize} onChange={ this.handleSizeChange.bind(this) } type="range" id="size" min="64" max={maxPictureSize}/>
										<div style={this.NoMargin}> size : {this.state.currentSize}</div>
										<button onClick = { e => this.handleDownload() }  disabled={this.state.isDownloading} className="gris ml-auto" >
											<i className="fas fa-download"></i>
										</button>
										{this.state.isDownloading &&
                                			<div><i className="fas fa-spinner fa-spin"></i></div>
                            			}
									</div>
									<div>
										{this.state.picture && this.state.picture.comments != undefined &&
										this.state.picture.comments.map((comment, i) => {
											if (this.state.picture.comments.length > 0)
												return (
														<div key={i} className="form-inline">
															<a style={this.NoMargin}><b>{comment.title}</b> {comment.value}</a>
															{comment.userId == this.props.user.id &&
															<button className="gris ml-auto" disabled={this.state.isLoading} onClick={() => this.handleDeleteComment(comment.id)}>
																<i className="fa fa-times"></i>
															</button>
															}
														</div>)
										})
										}
									</div>
									<div className="form-inline">
										<div className="input-group mb-3">
											<input value={this.state.comment} onChange={ this.handleCommentChange.bind(this) } placeholder="Please write a comment" type="text" className="form-control" />
												<div className="input-group-append">
													<button style={this.NoMargin} onClick={this.handleSaveComment.bind(this)} disabled={this.state.isLoading} className="btn btn-outline-secondary" type="button">Add</button>
												</div>
										</div>
									</div>
								</div>
                            </div>
                        </div>
					</div>
				</div>
				<img id={"img" + this.props.id} onClick={this.clickPicture} src={this.props.picture.url}></img>
				<div className="mr-4 ml-4 mb-2">
					<section className="form-inline">
						<b>{this.state.picture.likes.length} like</b>
						<button style={this.ShowLikeButton}
								className="gris ml-auto"
								disabled={!this.state.isEnable}
								name = "like"
								onClick = { e => this.handleLike(e) }><i className="fas fa-heart"></i>
						</button>
                        <button style={this.ShowUnlikeButton}
                                name = "unlike"
                                className="red ml-auto"
                                disabled={!this.state.isEnable}
                                onClick = { e => this.handleUnlike(e) }><i className="fas fa-heart"></i>
                        </button>
					</section>
                    <div className="form-inline">
						<b>{this.props.picture.userId} (Id: {this.props.picture.id})</b>
					</div>
                    <div className="form-inline">
						{this.props.picture.description}
                    </div>
					<div className="form-inline blue">
						{
						this.props.picture.tags.map((tag, i) => {
							if (this.props.picture.tags.length > 0)
								return <div key={i} className=''> {tag}</div>
						})
					}
					</div>
					<div className="form-inline blue">
					{
						this.props.picture.mentions.map((mention, i) => {
							if (this.props.picture.mentions.length > 0)
								return <div key={i} className=''> {mention}</div>
						})
					}
					</div>
                </div>
			</div>);
		} else if (this.props.editMode) {
			// regarder si on a deja liké la photo
			//console.log(this.props.picture)
			this.ShowUnlikeButton = {display: "none"}
			this.ShowLikeButton = {display: "inline-block"}
			if (this.state.picture != null && this.state.picture != undefined
				&& this.state.picture.likes != null && this.state.picture.likes != undefined
				&& this.state.picture.likes.length > 0) {
				this.state.picture.likes.forEach(like => {
					//console.log(this.props.user.id + ' : ' + like.userId)
					if (like.userId == this.props.user.id) {
						//console.log("tu as deja liké la photo dude")
						this.ShowLikeButton = {display: "none"}
						this.ShowUnlikeButton = {display: "inline-block"}
						//console.log("Affiche le unlike putain ! sur " + this.props.picture.id)
					}
				});
			} else if (this.state.picture != null
				&& this.state.picture.likes != null
				&& this.state.picture.likes.length == 0) {
				//console.log("Afifiche le putain de like")
				this.ShowUnlikeButton = {display: "none"}
				this.ShowLikeButton = {display: "inline-block"}
			}

			// on est connecté et on sur la page de profile donc nos photos uniquement
			return (
			<div className="mycard" onClick = { e => this.handleDisplayPicture(e) }>
                <div id="" className="modal" style={this.ModalStyle}>
                    <button type="button" className="blanc close" data-dismiss="modal" onClick={this.closeModal} aria-label="Close">
                        <i aria-hidden="true" className="blanc fa fa-times"></i>
                    </button>
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-8">
                                    <img className="modal-content" id={'img' + this.props.picture.id} src={this.props.picture.url}/>
                                </div>
                                <div className="col-sm-4">
                                    <section className="form-inline">
                                        <a style={this.NoMargin}>Published by <b> {this.props.picture.userId} </b> | <b> {this.state.picture.likes.length} like</b></a>
                                        <button style={this.ShowLikeButton}
                                                className="gris ml-auto"
                                                disabled={!this.state.isEnable}
                                                name = "like"
                                                onClick = { e => this.handleLike(e) }><i className="fas fa-heart"></i>
                                        </button>
                                        <button style={this.ShowUnlikeButton}
                                                name = "unlike"
                                                className="red ml-auto"
                                                disabled={!this.state.isEnable}
                                                onClick = { e => this.handleUnlike(e) }><i className="fas fa-heart"></i>
                                        </button>
                                    </section>
                                    <div className="form-inline">
										<div>height : </div>
                                        <input className="mr-2" value={this.state.currentSize} onChange={ this.handleSizeChange.bind(this) } type="range" id="size" min="64" max={maxPictureSize}/>
                                        <div style={this.NoMargin}> size : {this.state.currentSize}</div>
                                        <button onClick = { e => this.handleDownload() }  disabled={this.state.isDownloading} className="gris ml-auto" >
                                            <i className="fas fa-download"></i>
                                        </button>
										{this.state.isDownloading &&
                                			<div><i className="fas fa-spinner fa-spin"></i></div>
                            			}
                                    </div>
                                    <div>
                                        {this.state.picture && this.state.picture.comments != undefined &&
                                        this.state.picture.comments.map((comment, i) => {
                                            if (this.state.picture.comments.length > 0)
                                                return (
                                                    <div key={i} className="form-inline">
                                                        <a style={this.NoMargin}><b>{comment.title}</b> {comment.value}</a>
                                                        {comment.userId == this.props.user.id &&
                                                        <button className="gris ml-auto" disabled={this.state.isLoading} onClick={() => this.handleDeleteComment(comment.id)}>
                                                            <i className="fa fa-times"></i>
                                                        </button>
                                                        }
                                                    </div>)
                                        })
                                        }
                                    </div>
                                    <div className="form-inline">
                                        <div className="input-group mb-3">
                                            <input value={this.state.comment} onChange={ this.handleCommentChange.bind(this) } placeholder="Please write a comment" type="text" className="form-control" />
                                            <div className="input-group-append">
                                                <button style={this.NoMargin} onClick={this.handleSaveComment.bind(this)} disabled={this.state.isLoading} className="btn btn-outline-secondary" type="button">Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
				<img id='img' onClick={this.clickPicture} src={this.props.picture.url}></img>
                <div className="mr-4 ml-4 mb-2">
                    <section className="form-inline">
                        <b>{this.state.picture.likes.length} like</b>
						<section className="ml-auto">
                        <Confirm
                            onConfirm={e => this.handleDelete(e)}
                            body="Are you sure ?"
                            showCancelButton="true"
							//confirmText="Confirm Delete"
                            title="Deleting Picture">
                            <button
                                className="red"
                                name = "delete"
                                style={this.ShowLabelStyle}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </Confirm>
                        <button
                            name = "edit"
                            className="blue"
                            onClick = { e => this.handleEdit(e) } style={this.ShowLabelStyle}><i className="fas fa-edit"></i>
                        </button>
                        <button
                            className="red"
                            name = "cancel"
                            onClick={ e => this.handleCancel(e) } style={this.HideLabelStyle}><i className="fas fa-times"></i>
                        </button>
                        <button
                            name = "save"
                            className="blue"
                            onClick={ e => this.handleSave(e) } style={this.HideLabelStyle}><i className="fas fa-save"></i>
                        </button>
                        <button style={this.ShowLikeButton}
                                className="gris"
                                disabled={!this.state.isEnable}
                                name = "like"
                                onClick = { e => this.handleLike(e) }><i className="fas fa-heart"></i>
                        </button>
                        <button style={this.ShowUnlikeButton}
                                name = "unlike"
                                className="red"
                                disabled={!this.state.isEnable}
                                onClick = { e => this.handleUnlike(e) }><i className="fas fa-heart"></i>
                        </button>
						</section>
					</section>
                    <div className="form-inline">
                        <b>(Id: {this.props.picture.id})</b>
                    </div>
                    <div className="form-inline">
                        <div className="col-sm-12" style={this.ShowLabelStyle}>{this.props.picture.description}</div>
                        <div className="col-sm-12" style={this.HideLabelStyle}><input placeholder="Description" type="text" className="input-group-text col-sm-12" value={this.props.picture.description} onChange={ this.handleDescriptionChange.bind(this) }/></div>
                    </div>
                    <div className="form-inline blue">
						<div style={this.ShowLabelStyle && this.test}>
							{
								this.props.picture.tags.map((tag, i) => {
									//console.log(tag);
									return (<div style={this.ShowLabelStyle} key={i}>{tag}</div>);
								})
							}
						</div>
                        <div className="col-sm-12" style={this.HideLabelStyle}>
                            <input placeholder="Tags" type="text" className="input-group-text col-sm-12" value={this.state.changeTags}
                                   onChange={ this.handleTagsChange.bind(this)}/>
                        </div>
                    </div>
                    <div className="form-inline blue">
                        <div className="col-sm-12" style={this.ShowLabelStyle}>
                            {
                                this.props.picture.mentions.map((mention, i) => {
                                    return (<div style={this.ShowLabelStyle} key={i}>{mention}</div>);
                                })

                            }
                        </div>
						<div className="col-sm-12" style={this.HideLabelStyle}>
							<input placeholder="Mentions" className="input-group-text col-sm-12" type="text" value={this.state.changeMentions}
								   onChange={ this.handleMentionsChange.bind(this)}/>
						</div>
                    </div>
                </div>
			</div>);
		}
		// affichage public des images
		return (
			<div className="mycard" onClick = { e => this.handleDisplayPicture(e) }>
                <div id="" className="modal" style={this.ModalStyle}>
                    <button type="button" className="blanc close" data-dismiss="modal" onClick={this.closeModal} aria-label="Close">
                        <i aria-hidden="true" className="blanc fa fa-times"></i>
                    </button>
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-8">
                                    <img className="modal-content" id={'img' + this.props.picture.id} src={this.props.picture.url}/>
                                </div>
                                <div className="col-sm-4">
                                    <section className="form-inline">
                                        <a style={this.NoMargin}>Published by <b> {this.props.picture.userId} </b> | <b> {this.state.picture.likes.length} like</b></a>
                                    </section>
                                    <div className="form-inline">
                                        {/* <input className="mr-2" value={this.state.currentSize} onChange={ this.handleSizeChange.bind(this) } type="range" id="size" min="128" max={maxPictureSize}/>
                                        <p style={this.NoMargin}> size : {this.state.currentSize}</p> */}
                                        <button onClick = { e => this.download() }  disabled={this.state.isDownloading} className="gris ml-auto" >
                                            <i className="fas fa-download"></i>
                                        </button>
                                    </div>
                                    <div>
                                        {this.state.picture && this.state.picture.comments != undefined &&
                                        this.state.picture.comments.map((comment, i) => {
                                            if (this.state.picture.comments.length > 0)
                                                return (
                                                    <div key={i} className="form-inline">
                                                        <a style={this.NoMargin}><b>{comment.title}</b> {comment.value}</a>
                                                        {comment.userId == this.props.user.id &&
                                                        <button className="gris ml-auto" disabled={this.state.isLoading} onClick={() => this.handleDeleteComment(comment.id)}>
                                                            <i className="fa fa-times"></i>
                                                        </button>
                                                        }
                                                    </div>)
                                        })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
				{/* a partir d'ici on a la card */}
				<img id='img' onClick={this.clickPicture} src={this.props.picture.url}></img>
                <div className="mr-4 ml-4 mb-2">
                    <section className="form-inline">
                        <b>{this.state.picture.likes.length} like</b>
                    </section>
                    <div className="form-inline">
                        <b>{this.props.picture.userId} (Id: {this.props.picture.id})</b>
                    </div>
                    <div className="form-inline">
                        {this.props.picture.description}
                    </div>
                    <div className="form-inline blue">
                        {
                            this.props.picture.tags.map((tag, i) => {
                                if (this.props.picture.tags.length > 0)
                                    return <div key={i} className=''> {tag}</div>
                            })
                        }
                    </div>
                    <div className="form-inline blue">
                        {
                            this.props.picture.mentions.map((mention, i) => {
                                if (this.props.picture.mentions.length > 0)
                                    return <div key={i} className=''> {mention}</div>
                            })
                        }
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
	 return {
		 user: state.user
	 };
 }

//  function mapDispatchToProps(dispatch) {
// 	 //console.log('test')
// 	 return {
// 		 deletePicture: (id, token) => dispatch(deletePicture(id, token))
// 	 }
//    }

 export default connect(mapStateToProps)(PictureCard);