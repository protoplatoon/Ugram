import { Router, Request, Response } from 'express';
import {User} from '../models/User'
import {Picture} from '../models/Picture'
import {Tag} from '../models/Tag'
import {Mention} from '../models/Mention'
import {SequelizeRepository} from '../repository/SequelizeRepository'
import {Utils} from '../utils/utils'
import {PictureApi} from '../models/PictureApi'
import { userInfo } from 'os';
import {UserApi} from '../models/UserApi'
import * as login from 'connect-ensure-login';
import * as passport from 'passport'
//import {Logger} from '../utils/logger';

const Sequelize = require('sequelize');

const router: Router = Router();

const repository: SequelizeRepository = new SequelizeRepository();

//------------------ Public Route ---------------
// sert a rien pour l'instant
// return default search page
router.get('/', (req: Request, res: Response) => {

    res.status(200).send("Welcome to search interface");
});

export const SearchController: Router = router;
