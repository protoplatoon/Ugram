import * as React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {Modal} from 'react-bootstrap';

export interface IConfirm {
    title: string;
    onConfirm;
    showCancelButton;
    cancelText;
    body;
    confirmText;
    style;
}

class Confirm extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            isOpened: false,
            isMounted: false
        };
        this.onButtonClick = this.onButtonClick.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
    }

    onButtonClick() {
        // Since the modal is inside the button click events will propagate up.
        //if (!this.state.isOpened) {
        //console.log('onButtonClick')   
        this.setState({
            isOpened: true
        });
      //  }
    }

	componentWillMount() {
        //console.log('isMounted')
	}	

    onClose(event) {
        if (event) {
            event.stopPropagation();
        }
        this.setState({
            isOpened: false
        });

        // if (typeof this.props.onClose === 'function') {
        //     this.props.onClose();
        // }
    }

    onConfirm(event) {
        event.stopPropagation();
            this.setState({
                isOpened: false
            });
        this.props.onConfirm();
    }

    render() {
        var cancelButton = this.props.showCancelButton ? (
            <Button bsStyle="default" onClick={this.onClose}>
                {this.props.cancelText}
            </Button>
        ) : null;
        
        var closeButton = (
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={(e)=>this.onClose(e)} aria-label="Close">Close</button>

        );

        var modal = ( 
            <div className="uploader modal" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{this.props.title}</h5>
                        <button type="button" className="close" data-dismiss="modal" onClick={(e)=>this.onClose(e)} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {this.props.body}
                        {this.props.confirmText}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger" onClick={(e)=>this.onConfirm(e)} data-dismiss="modal">Ok</button>
                        {closeButton}
                    </div>
                </div>
            </div>
        </div>
        );
        var content;
        if (this.state.isOpened) {
            //console.log(this.props)
            var btn = React.Children.only(this.props.children);
            content = React.cloneElement(
                modal
            );
        } else {
            //console.log('else')
            var btn = React.Children.only(this.props.children);
            let style = this.props.style;
            //console.log(this.props.style)
            if (this.props.style == undefined) {
               // console.log('reaffect style')
               // console.log(btn.props.style)
                style = btn.props.style
            }
            content = (
                <Button className={btn.props.className} onClick={this.onButtonClick} style={style}>
                    {btn.props.children}
                </Button>
            );
        }
        return content;
    }
}

export { Confirm };
export default Confirm;