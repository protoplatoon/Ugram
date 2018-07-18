import { combineReducers } from 'redux'
import {user} from './userReducer'
import counterReducer from './counterReducer';
import {items, itemsHasErrored, itemsIsLoading} from './itemsReducer'
import { routerReducer } from 'react-router-redux'

const ugramApp:any = combineReducers({
    user,
    counterReducer,
    items,
    itemsHasErrored,
    itemsIsLoading,
    routerReducer,
})

export default ugramApp