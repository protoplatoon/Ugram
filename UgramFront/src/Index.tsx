import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Home from './components/Home'
import Layout from './components/Layout'
import Profile from './components/Profile'
import {PicturesList} from './components/PicturesList';
import UsersList from './components/UsersList';
import 'popper.js/dist/popper.min.js';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { Route, browserHistory } from 'react-router-dom';
import BrowserHistory from 'react-router'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from './components/App'
import ugramApp from './reducers'
import LoginPage from './components/LoginView'
import RegisterPage from './components/RegisterPage'
import { applyMiddleware} from 'redux'; 
import thunk from 'redux-thunk';
import createHistory from 'history/createHashHistory'
//import history from './history'
//import { BrowserRouter  as Router} from 'react-router-dom'
import { HashRouter as Router} from 'react-router-dom'
import AuthCallback from './components/AuthCallback'
import { loadState, saveState } from './localStorage'
import Search from './components/Search'
import Notifications from './components/Notifications'
import Messages from './components/Messages'
//import express from 'express';

//import 'react-notifications/src/notifications.scss';


import * as ReactGA from 'react-ga';
ReactGA.initialize('UA-117591642-1');
ReactGA.pageview('/');

const persistantState = loadState();
const app = document.getElementById('app');
let store = createStore(ugramApp, persistantState, applyMiddleware(thunk))
//title="Ugram" info="WEB"
//var compression = require('compression')
// ...
//app.use(compression())

store.subscribe(()=> {
    saveState(store.getState())
})

require('../scss/app.scss');
ReactDOM.render(
    <Provider store={store}>
        <Router hisotry = {history}>
            <div>
            {/* Correspond a la navBar et a ce qu'il y a en commun sur toute les pages */}
                <Layout title="Ugram"></Layout>
                <Route exact path="/" component={Home} />
                <Route path="/users/:page?" component={UsersList} />
                <Route path="/pictures/:page?" component={PicturesList}/>
                <Route path="/profile/:userId" component={Profile}/>
                <Route path="/login" component={LoginPage}/>
                <Route path="/register" component={RegisterPage}/>
                <Route path="/search" component={Search}/>
                <Route path="/messages" component={Messages}/>
                <Route path="/notifications" component={Notifications}/>
                <Route path="/auth/callback" component={AuthCallback}/>
            </div> 
        </Router>
    </Provider>, app);