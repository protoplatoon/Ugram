import { 
    userConstants
} from "../Constants"

export function user(state = {
	isWaiting: false,
	authenticated: false,
    email: "",
	id: -1,
	token:'',
	hasError: false,
	pictureUrl: ''
}, action) {
	switch(action.type) {
		case userConstants.LOGIN_REQUEST:
			//console.log('login request !!!')
			return (<any>Object).assign({}, state, { isWaiting: true })
		case userConstants.LOGIN_SUCCESS:
			//console.log('login success');
			//console.log(action)
			//console.log(action.user)
			return (<any>Object).assign({}, state, { isWaiting: false, hasError: false, authenticated: true, token: action.user.access_token ,  pictureUrl: action.user.pictureUrl, id: action.user.id , redirect_uri: action.redirect_uri})
		case userConstants.LOGIN_FAILURE:
			//console.log('login fail');
			return (<any>Object).assign({}, state, { isWaiting: false, authenticated: false , hasError: true})
		case userConstants.REGISTER_REQUEST:
			//console.log('request register')
			return (<any>Object).assign({}, state, { isWaiting: true , hasError: false})
		case userConstants.REGISTER_SUCCESS:
			return (<any>Object).assign({}, state, { isWaiting: false, authenticated: false , hasError: false})
		case userConstants.REGISTER_FAILURE:
			return (<any>Object).assign({}, state, { isWaiting: false, authenticated: false , hasError: true})
		case userConstants.LOGOUT:
			//console.log('logout');
			return (<any>Object).assign({}, state, { isWaiting: true })
		case userConstants.LOGOUT_SUCCESS:
			//console.log('logout success')
			return (<any>Object).assign({}, state, { isWaiting: false, authenticated: false, token: '' , id: -1 })
		default:
			return state

	}

}

export default user