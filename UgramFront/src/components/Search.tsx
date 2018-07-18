import * as React from 'react';
import _ from 'lodash';
import {Api} from '../Api/Api'
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import axios from 'axios'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Component } from 'react';
import { connect } from 'react-redux';
import PictureCard from './PictureCard'
import {Link} from 'react-router-dom'
import { Tag } from '../Models/Tag';
import * as ReactGA from 'react-ga';

const Autocomplete = require("react-autocomplete") as any;

require('../../scss/search');

class Search extends React.Component<any, any> {

    currentPage: number = 0;
    
    perPage: number;

    api:Api = new Api();

    ShowPicture = { 
		
		display: ''
	}

	ShowUser = {
		
		display: '',
	}


    styleTitle = {
        textAlign: 'center',
		'padding': '20px'
    }
    
    autocompleteStyle = {
        display: "none"
    }
    Margin = {
        'padding-bottom': '20px'
    }

    change:Boolean = false;

	constructor(props) {
		super(props);
		this.state = {
            pictures: [],
            users: [],
            search: '',
            searchUserLoaded: false,
            searchPictureLoaded: false,
            autocompleteTab: new Array,
            isMounting: false
		}
		//console.log(this.props.match.params);
        this.componentDidUpdate = this.componentDidUpdate.bind(this)
        this.getPictures = this.getPictures.bind(this);
        this.perPageOnChange = this.perPageOnChange.bind(this);
        this.refreshPictureAndUser = this.refreshPictureAndUser.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        
    }

    componentDidMount() {
        this.setState({
            isMounting: true
        })
    }

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			//this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
    }	
    
    handleSearch(e) {
        //console.log(e.target.value)
        this.setState({ search: e.target.value }
        , () => {
        //this.change = true;
            //console.log(this.state.search)
            this.refreshPictureAndUser();
        });
		//this.forceUpdate();
    }

    refreshPictureAndUser() {

        if (this.state.search.length == 0) {
            this.setState({
                users: new Array,
                pictures: new Array
            }, () => {
                this.forceUpdate();
            }) 
            
        } else  {
            this.api.searchUser(this.state.search, this.perPage)
            .then((result) => {
    
                //console.log('result of search user : ')
                //console.log(result);
                this.setState({
                    users: result.data.items,
                    searchUserLoaded: true
                }, () => {
                    this.forceUpdate();
                }) 
                
                //this.change = false;
                //console.log(this.state.pictures);
            }).catch((err) => {
                //console.log(err)
                this.forceUpdate();
                //console.log(err)
            });
        //console.log("search picture with " + this.state.search)
        //if (this.state.search) {}
        this.api.searchPicture(this.state.search, this.perPage)
        .then((result) => {
            //console.log('result of search picture : ')
            //console.log(result);
            // create state.autocomplete
            let res = new Array
            if (this.state.search.length > 0) {

                this.state.pictures.forEach((picture, i) => {
                
                    // autocomplete sur les tag
                    
                    picture.tags.forEach((tag, j) => {
                        //console.log(tag)
                       
                        // if this.state.search contenu dans tag
                        if (tag.indexOf(this.state.search) != -1) {
                            let isAlreadyInRes = false
                            res.forEach(tmp => {
                                //console.log(tmp.value + " " + tag.substring(1))
                                //console.log(tmp.value == tag)
                                if (tmp.value == tag.substring(1)) {
                                    isAlreadyInRes = true
                                }
                            })
                            if (!isAlreadyInRes) {
                                //console.log("autocomplete : " + tag)
                                var tmpTag = new Tag
                                //var obj
                                if (tag.length > 0 && tag.charAt(0) == '#')
                                    tmpTag.value = tag.substring(1);
                                tmpTag.id = i + 't' + j;
                                
                                //console.log("autocomplete : " + tag + " done")
    
                                res.push(tmpTag);
                            }
                        }
                    })

                    // description

                    if (picture.description.indexOf(this.state.search) != -1) {
                        let isAlreadyInRes = false
                        res.forEach(tmp => {
                            if (tmp.value == picture.description) {
                                isAlreadyInRes = true
                            }
                        })
                        if (!isAlreadyInRes) {
                            //console.log("autocomplete : " + tag)
                            var tmpTag = new Tag
                            //var obj
                            if (picture.description.length > 0)
                                tmpTag.value = picture.description
                            tmpTag.id = i;
                            
                            //console.log("autocomplete : " + tag + " done")

                            res.push(tmpTag);
                        }
                    }


                    // autocomplete in mention
                    picture.mentions.forEach((mention, j) => {
                        //console.log(tag)
                       
                        // if this.state.search contenu dans tag
                        if (mention.indexOf(this.state.search) != -1) {
                            let isAlreadyInRes = false
                            res.forEach(tmp => {
                                //console.log(tmp.value + " " + tag.substring(1))
                                //console.log(tmp.value == tag)
                                if (tmp.value == mention) {
                                    isAlreadyInRes = true
                                }
                            })
                            if (!isAlreadyInRes) {
                                //console.log("autocomplete : " + tag)
                                var tmpTag = new Tag
                                //var obj
                                if (mention.length > 0 && mention.charAt(0) == '@')
                                    tmpTag.value = mention;
                                tmpTag.id = i + 'm' + j;
                                
                                //console.log("autocomplete : " + tag + " done")
    
                                res.push(tmpTag);
                            }
                        }
                    })

                })
            } else {
                result.data.items = new Array
            }
            // add un title Tag mais c'est encore plus moche
            // if (res.length > 0) {
            //     let titleTag = new Tag;
            //     titleTag.id = "title"
            //     titleTag.value = "Tag"
            //     res.unshift(titleTag)
            // }
               
            //console.log("res ")    
            //console.log(res)

            this.setState({
                autocompleteTab: res,
                pictures: result.data.items,
                searchPictureLoaded: true
            }, () => {
                this.forceUpdate();
            }) 
            
           
            //this.change = false;
            //console.log(this.state.pictures);
        }).catch((err) => {
            //console.log(err)
            this.forceUpdate();
            //console.log(err)
        });
        }

    }
	
	onRouteChanged() {
		//console.log('route change !!!!!!!!!!!')
    }
    
    getPictures(currentPage: number): any {
        //console.log("getPictures !!!!")
        this.refreshPictureAndUser();
    }

    perPageOnChange(e) {
		this.perPage = parseInt(e.target.value);
        
        this.getPictures(this.currentPage);
		// this.props.history.push({
		// 	pathname: '/pictures',
		// 	search: ''
		// });
		this.forceUpdate();
    }
    
    handleUpdate() {
        this.refreshPictureAndUser();
    }
    

	render() {
		let styleTest = {
			display: 'inline-block',
			textAlign: 'center'
        }
        
        let styleCenter = {
            textAlign: 'center'
        }

		return (<div className="container" style={this.styleTitle}>
                    <div className="row mb-4">
                        <div className="col-sm-10">
                        {this.state.autocompleteTab && this.state.autocompleteTab.map && 
                        this.state.autocompleteTab != undefined &&
                            <Autocomplete
                            getItemValue={(item) => item.value}
                            items={this.state.autocompleteTab}
                            renderItem={(item, isHighlighted) =>
                                <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                                    {item.value}
                                </div>
                            }
                            renderInput={(props) =>
                                <input placeholder="Search" className="form-control input-lg" {...props}/>
                            }
                            menuStyle={{
                                borderRadius: '3px',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '2px 0',
                                fontSize: '90%',
                                with: '100px',
                                textAlign: 'left',
                                zIndex:'900',
                                maxHeight: '50%'
                            }}
                            wrapperStyle={{maxHeight: "500px"}}
                            value={this.state.search}
                            onChange={(e) => {
                                        if (this.state.isMounting)
                                            this.setState({
                                                search: e.target.value
                                            }, () => {
                                                ReactGA.pageview(this.props.location.pathname + this.props.location.search + '/' + this.state.search);
                                                //console.log("refresh autocomplete")
                                                this.refreshPictureAndUser()
                                            // this.handleSearch(e)
                                            })
                                    }
                                    //this.handleSearch(e)
                            }
                            onSelect={(val) => {
                                if (this.state.isMounting)
                                    this.setState({
                                        search: val
                                    }, () => {
                                        //console.log("refresh autocomplete onSelect")
                                        this.refreshPictureAndUser()
                                    // this.handleSearch(e)
                                    })}
                            }
                            />
                        }
                        </div>

                        <div className="col-sm-2">
                                <select defaultValue="10" className="custom-select" onChange={this.perPageOnChange} value={this.perPage}>
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="30">30</option>
                                        <option value="50">50</option>
                                        <option value="70">70</option>
                                    </select>
                             </div>
                    </div>
                    <div>
                        <div className="panel-heading">
                            <h2>Pictures</h2>
                        </div>
                        <hr></hr>
                    </div>
                    <div className='card-list' style={this.ShowPicture}  id="picture">
                        {this.state.searchPictureLoaded && this.state.pictures.map &&
                            this.state.pictures.map((picture, i) => {
                                //console.log("draw picture")
                                //console.log(picture)
                                return <PictureCard key={i} action={this.handleUpdate.bind(this)} picture={picture} editMode={false}></PictureCard>
                            })
                        }
                    </div>
                    {/* affiche la liste de la rechercher user */}

                    <div>
                        <h2>Users</h2>
                        {/* <button data-toggle="collapse" data-target="#demo">Collapsible</button> */}
                        <hr></hr>
                        {/* affiche la liste de la rechercher user */}
                        <div id="users" style={this.ShowUser}>
                            {this.state.searchUserLoaded && this.state.users.map &&
                                this.state.users.map((user, i) => {
                                        //this.test(user);
                                        //console.log(user)
                                    if (user.pictureUrl != null && user.pictureUrl.length == 0) {
                                        user.pictureUrl = 'https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.50.50/p50x50/10354686_10150004552801856_220367501106153455_n.jpg?oh=58094ae96718bcfcbd53cfea5151eaf5&oe=5B137D2F';
                                    }
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
                    </div>
                    
                    <div>
                        <h2></h2>
                        {/* affiche la liste de la rechercher user */}
                    </div>
                    
                    <div>
                        <h2></h2>
                        {/* affiche la liste de la rechercher user */}
                    </div>
			</div>);
    }
}
function mapStateToProps(state){
	//console.log('coucou')
	//console.log(state);
	return {
	  user: state.user,
	};
  }

  export default connect(mapStateToProps)(Search);