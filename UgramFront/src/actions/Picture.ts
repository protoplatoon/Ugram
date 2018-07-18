
import Axios from 'axios';
import { 
    userConstants
} from "../Constants"
import {Api} from '../Api/Api'
import history from '../history'

export function DeletePictureHasErrored(bool) {
    return {
        type: userConstants.DELETEPICTURE_FAILURE,
        hasErrored: bool
    };
}

export function DeletePictureLoading(bool) {
    return {
        type: userConstants.DELETEPICTURE_REQUEST,
        isLoading: bool
    };
}

export function DeletePictureDataSuccess(user, redirect_uri = '/') {
    return {
        type: userConstants.DELETEPICTURE_SUCCESS,
        user,
        redirect_uri
    };
}


export function deletePicture(id, token) {
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
          dispatch(DeletePictureLoading(false))
          if (response.data.user_id == id) {
              //console.log('token match')
              dispatch(DeletePictureDataSuccess(user.token, '/'))
              //history.push('/#/');
              // essaie de rediriger le client (mais c'est pas facile ^^)
              //history.go(0);
          }
      }).catch ((err) => {
        console.error('receiv error ' + err)
        dispatch(DeletePictureHasErrored(true))
      });
    }
  }