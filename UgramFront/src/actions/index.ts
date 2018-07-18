export * from './Items'
export * from './Login'
export * from './Picture'
import {Api} from '../Api/Api'
import Axios from 'axios';
import user from '../reducers/userReducer';
import { browserHistory } from 'react-router'
import { push } from 'react-router-redux'
import history from '../history'
import * as Constant from '../Constants'

export const addCounter = () => ({
  type: Constant.ADD_COUNTER,
  payload: 1
});

export const removeCounter = () => ({
  type: Constant.REMOVE_COUNTER,
  payload: 1
});

export const incrementAsync = () => {
  return dispatch => {
    console.log('debut de l\'attente')
    setTimeout(() => {
      console.log('attente ....')
      // Yay! Can invoke sync or async actions with `dispatch` 
      dispatch(addCounter());
    }, 2000);
  };
};