import * as Constants from '../Constants';

const counterReducer = (state = 0, action) => {
  let newState;
  switch (action.type) {
    case Constants.ADD_COUNTER: {
      //console.log('add counter in reducer')
      return newState = state + action.payload;
    }
    case Constants.REMOVE_COUNTER:
      return newState = state - action.payload;
    default:
      return state
  }
}

export default counterReducer;