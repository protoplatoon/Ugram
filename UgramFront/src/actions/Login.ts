import { 
    userConstants
} from "../Constants"
import history from '../history'
import Axios from 'axios';
import {Api} from '../Api/Api'
import { browserHistory } from 'react-router'
var qs = require('qs');

export function LoginHasErrored(bool) {
    return {
        type: userConstants.LOGIN_FAILURE,
        hasErrored: bool
    };
}

export function LoginIsLoading(bool) {
    return {
        type: userConstants.LOGIN_REQUEST,
        isLoading: bool
    };
}

export function LoginFetchDataSuccess(user, redirect_uri = '/') {
    return {
        type: userConstants.LOGIN_SUCCESS,
        user,
        redirect_uri
    };
}

export function RegisterHasErrored(bool) {
    return {
        type: userConstants.REGISTER_FAILURE,
        hasErrored: bool
    };
}

export function RegisterIsLoading(bool) {
    return {
        type: userConstants.REGISTER_REQUEST,
        isLoading: bool
    };
}

export function RegisterSuccess(redirect_uri = '/login') {
    return {
        type: userConstants.REGISTER_SUCCESS,
        redirect_uri
    };
}

export const logout = () => ({
    type: userConstants.LOGOUT
  });
  
  export const logoutSuccess = () => ({
    type: userConstants.LOGOUT_SUCCESS
  });
  
  export function loginFacebook(id, token) {
    return (dispatch) => {
      let user = {
        isWaiting: false,
        authenticated: true,
          email: "",
        id: id,
        token: token
      }
      let api = new Api
      let url = api.baseUrl + '/userinfo';
      //console.log('i try with this token : ' + token)
      //console.log(token)
      //post axios avec header pour les requete authentifier
      Axios.get(url,{
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token.access_token
        }
      }).then(response => {
          //console.log('reponse du server token info')
          dispatch(LoginIsLoading(false))
          if (response.data.user_id == id) {
              //console.log('token match')
              dispatch(LoginFetchDataSuccess(user.token, '/'))
              //history.push('/');
              // essaie de rediriger le client (mais c'est pas facile ^^)
              //history.go(0);
          }
      }).catch ((err) => {
        console.error('receiv error ' + err)
        dispatch(LoginHasErrored(true))
      });
    }
  }
  
  
  export function loginRequest(username, password) {
    let api = new Api;
    let url = api.baseUrl + '/oauth/token';
    let clientId = api.clientId;
    let clientSecret = api.clientSecret;
    //console.log('try to log ' + password)
    //console.log('test')
    try {
    return (dispatch) => {
      dispatch(LoginIsLoading(true));
      
      Axios.post(url, {
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password,
      }, {
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              }
            }).then((response) => {
            
            //console.log(response)
            if (response.status != 200) {
              throw Error(response.statusText);
            }
            
            dispatch(LoginIsLoading(false));
  
            return response;
          })
          .then((response) => response.data)
          .then((token) => {
            let tmp = token;
            //tmp.token = token.access_token;
            //console.log('logiinnnnnnn ookkkkkkk ' + token)
            //console.log(this)
            //console.log(token)
            dispatch(LoginFetchDataSuccess(tmp, '/'))
            //dispatch(push('/'));
            history.push('#/');
            history.go(0);
            //console.log('history path ' + history.location.pathname)
            //history.go(1);
            //history.go('/');
            //console.log(history);
            if (browserHistory != null && browserHistory != undefined) {
              //console.log('try to redirect after login')  
              browserHistory.push('/')
  
            }
              
          })
          .catch((err) => {
           // console.log(err)
            console.error('error : ' + err)
            dispatch(LoginHasErrored(true))
          });
      };
    }catch(err) {
      console.error(err)
    }
  }
  
  export function registerRequest(username, password) {
    let api = new Api;
    let url = api.baseUrl + '/register';
    //console.log('try to register ' + username)
    try {
    return (dispatch) => {
      dispatch(RegisterIsLoading(true));
      Axios.post(url,qs.stringify({
        username: username,
        password: password
      }), {
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
              }
            }).then((response) => {
           // console.log('res register : ')
           // console.log(response)
            if (response.status != 200) {
              throw Error(response.statusText);
            }
            
            dispatch(RegisterIsLoading(false));
  
            return response;
          })
          .then((response) => response.data)
          .then((htmlLoginOrRegister) => {
            //console.log('le html chiant : ')
            let tmp = htmlLoginOrRegister;
            
            //encodeURIComponent(tmp);
            //console.log(tmp)
            var el = document.createElement( 'html' );
            let parser=new DOMParser();
            let htmlDoc =parser.parseFromString(tmp, "text/html");
            el.innerHTML = tmp;
            //console.log(htmlDoc.getElementById('password_repeat')); 

            // if data == page login de l'api c'est que c'est ok =)
            // si on est sur register c'est que user exist deja 
            // TODO trouver un meilleur test celui la marche pas
            if (htmlDoc.getElementById('password_repeat') == null) {
                //tmp.token = token.access_token;
                //console.log('register ookkkkkkk')
                //console.log(this)
                dispatch(RegisterSuccess('/login'))
                //dispatch(push('/'));
                dispatch(RegisterHasErrored(false))
                //history.push('/#/login');
                //history.go(0);
                //console.log('history path ' + history.location.pathname)
                history.push('#/login');
                history.go(0);
                //console.log(history);
                if (browserHistory != null && browserHistory != undefined) {
                  //('try to redirect after login')  
                  browserHistory.push('/')
                }
            } else {
                console.error('register fail')
                dispatch(RegisterHasErrored(true))
            }
            
              
          })
          .catch((err) => {
           // console.log(err)
            console.error('error Register')
            dispatch(RegisterHasErrored(true))
          });
      };
    }catch(err) {
      console.error(err)
    }
  }
  
  export function manualLogout() {
    return dispatch => {
      dispatch(logoutSuccess())
    };
  }