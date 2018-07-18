import * as React from 'react'
import { Component } from 'react';
import { connect } from 'react-redux';
import { addCounter, incrementAsync } from '../actions';
import { bindActionCreators } from 'redux';

class AddCounter extends Component<any, any> {
  constructor(props) {
        super(props);
      }
   render() {
     return (
           <div className="container">
            <form>
              <div className="field is-grouped">
                <div className="control">
                  <button className="button is-primary" 
                    onClick={(e) => {e.preventDefault();this.props.dispatch(incrementAsync())}}>
                      Add
                   </button>
                </div>
              </div>
            </form>
            </div>
     )
   }
}
function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(incrementAsync, dispatch) }
}
export default connect(mapDispatchToProps)(AddCounter);