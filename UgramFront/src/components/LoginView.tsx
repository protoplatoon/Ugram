import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loginRequest } from '../actions';
import AddCounter from './AddCounter'
import RemoveCounter from './RemoveCounter'
import Counter from './Counter'
import {Api} from '../Api/Api'
import {Route, Redirect} from 'react-router'
import * as ReactGA from 'react-ga';

const ButtonToNavigate = ({ title, history }) => (
    <button
      type="button"
      onClick={() => history.push('http://localhost:3000/auth/facebook')}
    >
      {title}
    </button>
  );
  
  const SomeComponent = () => (
    <Route path="/login" render={(props) => <ButtonToNavigate {...props} title="Navigate elsewhere" />} />
  )    
  

class LoginView extends React.Component<any, any> {

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

    stylelogin = {
        'width': '100%',
        'maxWidth': '200px',
        'padding': '15px',
        'margin': '0 auto'
    }

    redirectFacebook(window): any {
        if (this.state.isMounted == true) {
            //console.log(window)
            this.props.history.createHref("https://www.example.com");
            //console.log('redirect Facebook !!!!')
            //console.log(this.props)
            //this.props.location.href = 'http://localhost:3000/auth/facebook'
            //this.props.history.push('http://localhost:3000/auth/facebook')
        }
    }

    constructor(props:any) {
        super(props);
        //console.log('login ctr');
        // reset login status
        //this.props.dispatch(userActions.logout());
        //console.log(this.props)
        this.state = {
            username: this.props.user.email,
            password: '',
            submitted: false,
            isMounted: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        //this.redirect = this.redirect.bind(this, true);
        //console.log(this.props.location)
        ReactGA.initialize('UA-117591642-1');
        ReactGA.pageview(this.props.location.pathname + this.props.location.search);
        
    }
    
    whiteColor = {
        color: 'white'
    }


    handleChange(e) {
        const { name, value } = e.target;
        //console.log('handle change')

        this.setState({ [name]: value });
    }

    handleSubmit(e) {
        // annule le submit
        e.preventDefault();
       // console.log('handle submit')
        this.setState({ submitted: true });
        const { username, password } = this.state;
        if (username && password) {
            this.props.login(username, password);
        }
    }


	componentDidUpdate(prevProps) {
        //console.log('did update')
        //console.log(this.props)
        //console.log(prevProps)
        
		if (this.props.location != prevProps.location) {
			//this.currentPage = this.props.match.params.page;
			this.onRouteChanged();
		}
	}	
	
	onRouteChanged() {
		//console.log('login route change !!!!!!!!!!!')
	}

    componentWillMount() {
        if (this.props.user.redirect_uri != '') {
            //console.log('redirect')
            //this.props.history.push('/')
        }
       //console.log(this.props.user)
        
        this.setState({ isMounted: true});
        if (this.props.user != null && this.props.user.authenticated == true)
            this.redirect()
        //this.redirect();
    }

    redirect() {
       
        // fail le warning suite a la redirection apres le login 
        // mais au moins ca marche ...
       // if (this.state.isMounted) {
            //console.log('redirect **** !!!!')
            this.props.history.push('/');
        //}   
    }

    render() {
        const { loggingIn } = this.props;
        const { username, password, submitted } = this.state;

        if (this.props.user && this.props.user.authenticated == true) {
            return <div>You are Authenticated  {username}</div>  
        }

        return (
            <div style={this.styleTitle}>
                <div style={this.stylelogin} className="container text-center">
                    <div className="row">
                        <div>
                            <h1 className="h3 mb-3 font-weight-normal">Please login</h1>
                            <div className="form-group btn btn-primary btn-block">
                                <a className="mylink" href={this.api.facebookAuth}>Login with Facebook</a>
                            </div>
                            <div className="form-group btn btn-danger btn-block">
                                <a className="mylink" href={this.api.googleAuth}>Login with Google</a>
                            </div>
                            <a style={this.styleMarginButton} className="btn">OR</a>
                            <form className="form-signin" name="form" onSubmit={this.handleSubmit}>
                                <div className={'form-group' + (submitted && !username ? ' has-error' : '')}>
                                    <label className="sr-only" htmlFor="username">Username</label>
                                    <input type="text" className="form-control" name="username" placeholder="Username" value={username} onChange={this.handleChange} />
                                    {submitted && !username &&
                                        <div className="help-block">Username is required</div>
                                    }
                                </div>
                                <div className={'form-group' + (submitted && !password ? ' has-error' : '')}>
                                    <label className="sr-only" htmlFor="password">Password</label>
                                    <input type="password" className="form-control" name="password" placeholder="Password" value={password} onChange={this.handleChange} />
                                    {submitted && !password &&
                                        <div className="help-block">Password is required</div>
                                    }
                                    {submitted && password && this.props.user && this.props.user.hasError &&
                                        <div className="help-block">user or password is invalid</div>
                                    }
                                </div>
                                <div className="form-group">
                                    <button style={this.styleMargin} className="btn btn-success btn-block" type="submit"><i className="fas fa-sign-in-alt"></i> Login</button>
                                    <div>Don't have an account? <Link to="/register" className="btn-link">Register</Link></div>
                                </div>
                            </form>
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
        user: state.user
    };
}

// function mapDispatchToProps(dispatch) {
//     return { actions: bindActionCreators(loginRequest, dispatch) }
//   }

  const mapDispatchToProps = (dispatch) => {
    return {
        login: (username, password) => dispatch(loginRequest(username, password))
    };
};
  
export default connect(mapStateToProps, mapDispatchToProps)(LoginView);