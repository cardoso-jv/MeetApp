import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import OrganizerController from './app/controllers/OrganizerController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriberController from './app/controllers/SubscriberController';


const upload = multer(multerConfig);
const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);


routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/meetups', MeetupController.store);
routes.get('/meetups', MeetupController.index);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);


routes.get('/organizing', OrganizerController.index);
routes.post('/meetups/:meetup_id/subscription', SubscriberController.store);
routes.get('/subscribers', SubscriberController.index);


routes.post('/files', upload.single('file'), FileController.store);

export default routes;
