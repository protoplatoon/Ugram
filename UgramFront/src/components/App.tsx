import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Home from './Home'
import Layout from './Layout'
import Profile from './Profile'
import {PicturesList} from './PicturesList';
import UsersList from './UsersList';
import LoginView from './LoginView'
import 'popper.js/dist/popper.min.js';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { HashRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import LoginPage from './LoginView'
import RegisterPage from './RegisterPage'
import AuthCallback from './AuthCallback'

class App extends React.Component<any, any> {
    constructor(props) {
        super(props);
        //console.log('start app')
    }

    ModalStyle = {
        display: 'none'
    };
    
    whiteColor = {
        color: 'white'
    };

    render() {
        return (
            <HashRouter>
                <div>
                {/* Correspond a la navBar et a ce qu'il y a en commun sur toute les pages */}
                    <Layout title="Ugram"></Layout>
                    <Route exact path="/" component={Home} />
                    <Route path="/users/:page?" component={UsersList} />
                    <Route path="/pictures/:page?" component={PicturesList}/>
                    <Route path="/profile/:userId" component={Profile}/>
                    <Route path="/login" component={LoginPage}/>
                    <Route path="/register" component={RegisterPage}/>
                    <Route path="/auth/callback" component={AuthCallback}/>
                </div> 
            </HashRouter>
        )
    }
}
function mapStateToProps(state){
	//console.log('coucou')
	//console.log(state);
	return {
	  user: state.user,
	};
  }

  export default connect(mapStateToProps)(App);