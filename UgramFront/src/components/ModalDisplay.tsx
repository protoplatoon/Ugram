import * as React from 'react';
import axios, { AxiosPromise } from 'axios';
import {Api} from '../Api/Api'
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

var FontAwesome = require('react-fontawesome');

class ModalDisplay extends React.Component<any, any> {
    
    api:Api = new Api();

    constructor(props) {
        super(props);
        this.state ={
          picture: null,
          DisplayMode: false
        }
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleEndModalUpload() {
        if (this.state.uploadMode)
        {
            this.setState({
                uploadMode: false
            });
            this.props.action();
            this.forceUpdate();
        } else {
            // this.setState({
            //     uploadMode: true
            // });
            this.props.action();
            this.forceUpdate();
        }
    }

    closeModal() {
        if (this.state.uploadMode)
        {
            this.setState({
                uploadMode: false
            });
            //this.props.action();
            this.forceUpdate();
        } else {
            this.setState({
                uploadMode: true
            });
            //this.props.action();
            this.forceUpdate();
        }
    }

    handleKeyPress = (event) => {
//        console.log('test')

        if (this.state.uploadMode)
        {
            this.setState({
                uploadMode: false
            });
            //this.props.action();
            this.forceUpdate();
        } else {
            this.setState({
                uploadMode: true
            });
            //this.props.action();
            this.forceUpdate();
        }
    }

    handleOpen() {
        //console.log('display picture : ');
		//console.log(this.props.picture)
    }

    render() {
        return (
            <div className="uploader">
            <button onClick={(e)=>this.handleKeyPress(e)} 
            className="btn btn-primary" id="openUpload"><i className="fas fa-upload"></i></button>
                {this.state.picture &&
                    <div>{this.state.picture}</div>
                }
            </div>)
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    };
}
  
export default connect(mapStateToProps)(ModalDisplay);