import * as React from 'react';
import _ from 'lodash';
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import axios from 'axios'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Component } from 'react';
import { connect } from 'react-redux';
import {Api} from '../Api/Api'

class Home extends React.Component<any, any> {

    align = {
        'marginTop': '100px'
    }

	constructor(props) {
		super(props);
		this.state = {
			timestamp: 'no timestamp yet'
		};
		//openSocket.bind(this)
		//let socket = openSocket('http://localhost:4242');
		
		//console.log(this.props.match.params);
		this.componentDidUpdate = this.componentDidUpdate.bind(this)
	}

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			//this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
	}	
	
	onRouteChanged() {
		//console.log('route change !!!!!!!!!!!')
	}

	render() {
		return (<div style={this.align} className="text-center">

					<div className="cover-container d-flex h-100 p-3 mx-auto flex-column">
						<main role="main" className="inner cover">
							<h1 className="cover-heading">Welcome to Ugram !</h1>
							<p className="lead">UGRAM is a project carried out as part of the GLO-3112 class at Laval University. It's about making a site and an API similar to Instagram.</p>
							<p className="lead">
								<a href="https://github.com/GLO3112-H18/ugram-team-09" target="_blank" className="btn btn-lg btn-secondary">Learn more</a>
							</p>
						</main>
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

  export default connect(mapStateToProps)(Home);