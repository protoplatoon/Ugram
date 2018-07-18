import { 
    userConstants
} from "../Constants"

export function DeletePictureHasErrored(state = false, action) {
    switch (action.type) {
        case userConstants.DELETEPICTURE_FAILURE:
           return action.hasErrored;

        default:
            return state;
    }
}

export function DeletePictureIsLoading(state = false, action) {
    switch (action.type) {
        case userConstants.DELETEPICTURE_REQUEST:
            //console.log('items is loading')
            return action.isLoading;

        default:
            return state;
    }
}

export function items(state = [], action) {
    switch (action.type) {
        case userConstants.DELETEPICTURE_SUCCESS:
            //console.log('on a tout recu cousin ')
            return action.items;
        default:
            return state;
    }
}