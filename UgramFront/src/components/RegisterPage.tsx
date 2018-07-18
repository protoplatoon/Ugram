import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { registerRequest } from '../actions';
import AddCounter from './AddCounter'
import RemoveCounter from './RemoveCounter'
import Counter from './Counter'
import {Api} from '../Api/Api'
import * as ReactGA from 'react-ga';

class RegisterView extends React.Component<any, any> {
    
    api:Api = new Api;

    styleTitle = {
        'padding': '50px'
    }
    styleMargin = {
        'margin': '0px'
    }
    styleMarginButton = {
        'marginBottom': '10px'
    }
    styleregister = {
        'width': '100%',
        'maxWidth': '200px',
        'padding': '15px',
        'margin': '0 auto'
    }
    
    constructor(props:any) {
        //console.log('ctr');
        super(props);
        // reset login status
        //this.props.dispatch(userActions.logout());
        //console.log(this.props)
        this.state = {
            username: '',
            password: '',
            password2: '',
            submitted: false,
            missmatch: true,
            match: true,
            haError: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        
    }

    componentWillMount() {
        if (this.props.user.redirect_uri != '') {
            //console.log('redirect')
            //this.props.history.push('/')
        }
        this.setState({ isMounted: true});

        if (this.props.user && this.props.user.authenticated == true) {
            this.redirect()  
        }
        //this.redirect();
    }

    handleChange(e) {
        const { name, value } = e.target;
       // console.log('handle change'  + value)
        if (name == 'username') {
            if (value.match('^[0-9]+$') != null) {
                // le nom n'est pas valid alors 
                //console.log('username incorect, username need at least one character')
                this.setState({
                    match: false,
                    error: 'username incorect, username need at least one character'
                })
            } else if (value.match('^(fb+)[0-9]+$') != null
                        || value.match('^(google+)[0-9]+$') != null) {
                // le nom n'est pas valid alors 
                //console.log('username incorect with fbXXX or googleXXX')
                this.setState({
                    match: false,
                    error: 'username incorect with fbXXX or googleXXX'
                })
            }else if (value.match('[<>*!?\'\"]+') != null
                        || value.match('^(google+)[0-9]+$') != null) {
                // le nom n'est pas valid alors 
                //console.log('username incorect format, forbidden char : [\'<>*!?\"]')
                this.setState({
                    match: false,
                    error : 'username incorect format, forbidden char : [\'<>*!?\"]'
                })
            }  else {
                this.setState({
                    match: true
                })
            }
        }
        //console.log(name + ':' + value);

        this.setState({ [name]: value });
    }

    handleSubmit(e) {
        // annule le submit
        e.preventDefault();
        //console.log('handle submit')
        this.setState({ submitted: true });
        const { username, password, password2, missmatch } = this.state;
        //console.log(username)
        const dispatch = this.props.actions;
        if (password !== password2) {
            //console.log("hallo les mot de passe son pas les meme frere")
            this.setState({
                missmatch : true,
                hasError : false
            }, () => this.forceUpdate())
            
            //console.log('password non identique !!!!')
        } else if (username) {
            this.setState({
                missmatch : false
            })
            //console.log('🦄🦄🦄🦄🦄🦄🦄' + username + ' ' + password + ' ' + password2 + ' ' + this.state.missmatch)
            if (this.state.match)
                this.props.actions(username, password);
        }
    }

    redirect() {
       
        // fail le warning suite a la redirection apres le login 
        // mais au moins ca marche ...
        if (this.state.isMounted) {
          //  console.log('redirect **** !!!!')
            this.props.history.push('/');
        }   
    }

    render() {
        const { loggingIn } = this.props;
        const { username, password, submitted, password2 , missmatch} = this.state;

        if (this.props.user && this.props.user.authenticated == true) {
            return <div>You are Authenticated  {username}</div>
        }

        return (
            <div style={this.styleTitle}>
                <div style={this.styleregister} className="container text-center">
                    <div className="row">
                        <div>
                            <h1 className="h3 mb-3 font-weight-normal">Please register</h1>

                            <div className="form-group btn btn-primary btn-block">
                            <a className="mylink" href={this.api.facebookAuth}>Register with Facebook</a>
                        </div>
                        <div className="form-group btn btn-danger btn-block">
                            <a className="mylink" href={this.api.googleAuth}>Register with Google</a>
                        </div>
                            <a style={this.styleMarginButton} className="btn">OR</a>

                            <form name="form" onSubmit={this.handleSubmit}>
                            <div className={'form-group' + (submitted && !username ? ' has-error' : '')}>
                                <label className="sr-only" htmlFor="username">Username</label>
                                <input type="text" className="form-control" name="username" placeholder="Username" value={username} onChange={this.handleChange} />
                                {submitted && !username &&
                                    <div className="help-block">Username is required</div>
                                }
                                {submitted && !this.state.match &&
                                    <div className="help-block">{this.state.error}</div>
                                }
                            </div>
                            <div className={'form-group' + (submitted && !password ? ' has-error' : '')}>
                                <label className="sr-only" htmlFor="password">Password</label>
                                <input type="password" className="form-control" name="password" placeholder="Password" value={password} onChange={this.handleChange} />
                                {submitted && !password &&
                                    <div className="help-block">Password is required</div>
                                }
                            </div>
                            <div className={'form-group' + (submitted && !password2 ? ' has-error' : '')}>
                                <label className="sr-only" htmlFor="password">Password</label>
                                <input type="password" className="form-control" name="password2" placeholder="Confirm Password" value={password2} onChange={this.handleChange} />
                                {submitted && !password2 && !(missmatch) &&
                                    <div className="help-block">Password is required</div>
                                }
                                {submitted && (missmatch) &&
                                    <div className="help-block">Passport match failed</div>
                                }
                                {submitted && password && this.props.user && this.props.user.hasError == true && !(missmatch) && this.state.match &&
                                    <div className="help-block">user already exist</div>
                                }
                            </div>
                            <div className="form-group">
                                <button style={this.styleMargin} className="btn btn-primary btn-block" type="submit"><i className="fas fa-user-plus"></i> Register</button>
                                <div>Already have an account? <Link to="/login" className="btn-link">Login</Link></div>
                            </div>
                        </form>
                        {/* Exemple de base avec redux Counter Add et Remove */}
                        {/* <Counter/>
                        <AddCounter/>
                        <RemoveCounter/> */}
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

function mapStateToProps(state) {
    //console.log('state : ');
    //console.log(state)
    //this.props.user = state.user;
    //console.log('return mapStateProps')
    return {
        user: state.user,
    };
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(registerRequest, dispatch) }
  }
  
export default connect(mapStateToProps, mapDispatchToProps)(RegisterView);