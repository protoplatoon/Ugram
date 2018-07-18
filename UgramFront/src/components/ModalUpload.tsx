import * as React from 'react';
import axios, { AxiosPromise } from 'axios';
import {Api} from '../Api/Api'
import { alert, badge, breadcrumb, buttonGroup, buttons, card, carousel, close, code, customForms, custom, dropdown, forms, grid, images, inputGroup, jumbotron, listGroup, media, modal, nav, navbar, normalize, pagination, popover, print, progress, reboot, responsiveEmbed, tables, tooltip, transitions, type, utilities } from 'bootstrap'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
var FontAwesome = require('react-fontawesome');

class ModalUpload extends React.Component<any, any> {
    
    api:Api = new Api();

    

    constructor(props) {
        super(props);
        this.state ={
          file: null,
          comment: '',
          tags: '',
          mentions: '',
          uploadLoaded: false,
          uploadMode: true,
          error: ''
        }
    }

    fileUpload(file) :AxiosPromise {
        // post l'image
        let token = this.props.user.token;
        return this.api.fileUpload(file, this.state.comment,
            this.state.tags, this.state.mentions, this.props.user.id, token);
    }

    onSubmit(e) {
        e.preventDefault() // Stop form submit
        var res = this.fileUpload(this.state.file); // retourne une AxiosPromise
        this.setState({
            comment: '',
            tags: '',
            mentions: '',
            file: '',
            uploadLoading: true
        }, () => {
            this.forceUpdate();
            if (res != null)
            {
                res.then((response)=>{ // attend que la promesse soit terminée
                    // log la reponse de l'upload
                   // console.log('api response : ')
                    //console.log(response.data);
                   // this.props.handler(response.data);
                   // appel une methode du composant parent
                   if (this.state.uploadMode) {
                        this.setState({
                            uploadLoading: false,
                            uploadMode : false,
                            error: ''
                        }, () => this.props.action())
                        //console.log('action refresh parent in uploadMode!!!')
                   } else {
                       //
                       this.props.action();
                       //console.log('action refresh parent !!!')
                   }
                   
                   
                   //this.forceUpdate();
                }).catch(err => {
                    //console.log("!!!!!! error upload : ")
                    //console.error(err);
                    this.setState({
                        comment: '',
                        tags: '',
                        mentions: '',
                        file: '',
                        uploadLoading: false,
                        uploadMode : false,
                        error: 'file too big'
                    })
                })
            }
        });
      }
    
    onChange(e) {
        // 
        this.setState({file: e.target.files[0]})
    }

    handleDescriptionChange(e) {
        this.setState({ comment: e.target.value });
    }

    handleTagsChange(e) {
        this.setState({ tags: e.target.value });
    }

    handleMentionsChange(e) {
        this.setState({ mentions: e.target.value });
    }

    closeModal(e) {
        //console.log("close modal !!")
        this.setState({
            uploadMode : false
        }, () => {
            //console.log("close modal !!")
            this.props.close();
        })
        
    }

    render() {
        return (
            <div className="uploader modal" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Upload File here</h5>
                        <button type="button" className="close" data-dismiss="modal" onClick={(e)=>this.closeModal(e)} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={(e)=>this.onSubmit(e)}>
                            <input type="text" className="defaultPadding"  value={this.state.comment} 
                                onChange={ this.handleDescriptionChange.bind(this) } 
                                placeholder="Write a description..." />
                            <input type="text" className="defaultPadding" value={this.state.tags} 
                                onChange={ this.handleTagsChange.bind(this) } 
                                placeholder="Write some #tags ..." />
                            <input type="text" className="defaultPadding" value={this.state.mentions} 
                                onChange={ this.handleMentionsChange.bind(this) } 
                                placeholder="Write some @mentions ..." />
                            <input type="file" className="defaultPadding" onChange={(e)=>this.onChange(e)} />
                            {this.state.file != '' && this.state.file != null &&
                                <button className="btn btn-primary btn-lg" type="submit">Upload</button>
                            }
                            {this.state.uploadLoading &&
                                <div><i className="fas fa-spinner fa-spin"></i></div>
                            }
                            {this.state.error != '' && 
                                <p> Error : {this.state.error} </p>
                            }
                            {/* <button onClick = {this.props.action}>refrech</button> */}
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={(e)=>this.closeModal(e)} data-dismiss="modal">Close</button>
                    </div>
                    </div>
                </div>
            </div>)
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    };
}
  
export default connect(mapStateToProps)(ModalUpload);