import * as React from 'react';
import axios, { AxiosPromise } from 'axios';
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ModalUpload from './ModalUpload'
import {Api} from '../Api/Api'
var FontAwesome = require('react-fontawesome');

class UploadPanel extends React.Component<any, any> {

    MarginButton = {
        'marginRight': '0px',
        'marginLeft': '0px'
    }

    api:Api = new Api();

    constructor(props) {
        super(props);
        this.state ={
          file: null,
          comment: '',
          tags: '',
          mentions: '',
          uploadLoaded: false,
          uploadMode: false
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

    render() {
        return (<div className="col-sm-6">
                    <button style={this.MarginButton} onClick={(e)=>this.handleKeyPress(e)}
                    className="btn btn-primary btn-block" id="openUpload"><i className="fas fa-upload"></i> Upload a picture</button>
                        {this.state.uploadMode &&
                            <ModalUpload action={this.handleEndModalUpload.bind(this)} close={this.closeModal.bind(this)}/>
                        }
                </div>)
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    };
}
  
export default connect(mapStateToProps)(UploadPanel);