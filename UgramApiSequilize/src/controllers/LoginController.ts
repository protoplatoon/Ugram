import { Router, Request, Response } from 'express';
import {SequelizeRepository} from '../repository/SequelizeRepository'
import { Utils } from '../utils/utils';
import * as passport from 'passport'
import * as login from 'connect-ensure-login';
const oauth2orize = require('oauth2orize');
import {User} from '../models/User'
//import {Logger} from '../utils/logger';

const router: Router = Router();

const repository: SequelizeRepository = new SequelizeRepository();

// route /auth/login

router.get('/login', (req: any, res: Response) => {
    //const html = renderToString(<Login/>);
    console.log('access login page')
    res.render('login', {
        message: req.flash('loginMessage')
    });
});

// router.post('/login', passport.authenticate('local', { failureRedirect: '/login', session: false }),
// function(req, res) {
//     login.ensureLoggedIn('/login')
// }); 

//post login
module.exports.login = passport.authenticate('local',
    {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login'
    });

router.get('/register', (req: any, res: Response) => {
    res.render('register', {
        message: req.flash('registerMessage')
    });
});

router.post('/register', passport.authenticate('local-register', { failureRedirect: '/register', session: false }),
function(req, res) {
    console.log('new user register');
    // ici il faudrait voir pour une confirmation de l'email peut etre ou un truc comme ca 

    res.redirect('/login');
});

// pas necessaire si on active pas les sessions
router.get('/logout', (req: any, res: Response) => {
    req.logout();
	return res.json({ success: true });
});

router.get('/account',
    login.ensureLoggedIn('/login'),
    (request: any, response) => {
        //console.log('coucou');
        //console.log(request.user);
        request.logout();
        response.redirect('/');
       // response.render('account', { user: request.user })
});

router.get('/userinfo',
    passport.authenticate('bearer', { session: false }),
    (request: any, response) => {
        User.findOne({attributes: {}, where: {id: request.user.id}, raw: true})
        .then((user) => {
            console.log(user)
            response.json({ id: user.unique_id, user_id: user.id, name: user.firstName , scope: request.authInfo.scope });
        }).catch((err) => {
            console.log(err)
        });
        //response.redirect('/');
        
        
       // response.render('account', { user: request.user })
});

export const LoginController: Router = router;