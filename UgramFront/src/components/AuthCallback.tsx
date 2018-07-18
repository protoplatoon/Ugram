import * as React from 'react';
import _ from 'lodash';
import {Api} from '../Api/Api'
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import axios from 'axios'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Component } from 'react';
import { connect } from 'react-redux';
import {loginFacebook} from '../actions'

class AuthCallback extends React.Component<any, any> {

    styleTitle = {
        textAlign: 'center',
		'padding': '200px'
	}

	constructor(props) {
		super(props);
		this.state = {
        }
        //console.log("coucou bienvenu sur le callback")
        //console.log(this.props)
		//console.log(this.props.match.params);
        this.componentDidUpdate = this.componentDidUpdate.bind(this)
        this.componentWillMount = this.componentWillMount.bind(this);
	}

	getUrlParameter(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(this.props.location.search);
		//console.log(this.props.location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};
	

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			//this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
    }	

    componentWillMount() {
        //console.log('component mounted ')
        //console.log('id : ' + this.getUrlParameter('id') + ' token : ' + this.getUrlParameter('token'))
        let tmp = {access_token: '', id: '', value: ''};
        tmp.access_token = this.getUrlParameter('token');
        tmp.value = this.getUrlParameter('token');
        tmp.id = this.getUrlParameter('id');
        this.props.actions(this.getUrlParameter('id'), tmp);
        if (this.props.user != null && this.props.user.authenticated == false)
            this.redirect()
        //this.redirect();
    }

    redirect() {
    
        // fail le warning suite a la redirection apres le login 
        // mais au moins ca marche ...
    // if (this.state.isMounted) {
            //console.log('redirect **** !!!!')
            this.props.history.push('/');
        //}   
    }
	
	onRouteChanged() {
		//console.log('route change !!!!!!!!!!!')
    }


	render() {
        
        if (this.props.user && this.props.user.authenticated == true) {
            return <div>You are Authenticated</div>  
        }

		return (<div>
				
				<h1 style={this.styleTitle}>
					Welcome to callback ! =)
				</h1>
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

  const mapDispatchToProps = (dispatch) => {
    return {
        actions: (id, token) => dispatch(loginFacebook(id, token))
    };
};

  export default connect(mapStateToProps, mapDispatchToProps)(AuthCallback);