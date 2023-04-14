import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import * as userController from './controllers/users';
import authMiddleware from './middlewares/auth';
import cors from 'cors';
import * as boardController from './controllers/boards';
import { SocketEvents } from './types/socketEvents.enum';
import jwt from 'jsonwebtoken';
import { secret } from './config';
import User from './models/user';
import { Socket } from './types/socket.interface';
import * as columnsController from './controllers/columns'
import * as tasksController from './controllers/tasks';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('toJSON', {
    virtuals: true,
    transform: (_, converted) => {
        delete converted._id;
    }
});

app.get('/', (req, res) => {
    res.send('Api is Up And Running');
});

app.post('/api/users', userController.register);
app.post('/api/users/login', userController.login);
app.get('/api/users', authMiddleware, userController.currentUser);

app.get('/api/boards', authMiddleware, boardController.getBoards);
app.get('/api/boards/:boardId', authMiddleware, boardController.getBoard);
app.get('/api/boards/:boardId/columns', authMiddleware, columnsController.getColumns);
app.get('/api/boards/:boardId/tasks', authMiddleware, tasksController.getTasks);
app.post('/api/boards', authMiddleware, boardController.createBoard);

io.use(async (socket: Socket, next) => {
    try {
        const token = socket.handshake.auth.token as string ?? '';
        const data = jwt.verify(token.split(' ')[1], secret) as {
            id: string,
            email: string
        };
        const user = await User.findById(data.id);
        if (!user) return next(new Error('Authentication error'));
        socket.user = user;
        next();
    } catch(err) {
        next(new Error('Authentication error'))
    }
}).on('connection', (socket) => {
    socket.on(SocketEvents.boardsJoin, (data) => {
        boardController.joinBoard(io, socket, data);
    })
    socket.on(SocketEvents.boardsLeave, (data) => {
        boardController.leaveBoard(io, socket, data);
    })
    socket.on(SocketEvents.columnsCreate, (data) => {
        columnsController.createColumn(io, socket, data);
    })
    socket.on(SocketEvents.tasksCreate, (data) => {
        tasksController.createTask(io, socket, data);
    })
    socket.on(SocketEvents.tasksUpdate, (data) => {
        tasksController.updateTask(io, socket, data);
    })
    socket.on(SocketEvents.tasksDelete, (data) => {
        tasksController.deleteTask(io, socket, data);
    })
    socket.on(SocketEvents.boardsUpdate, (data) => {
        boardController.updateBoard(io, socket, data);
    })
    socket.on(SocketEvents.boardsDelete, (data) => {
        boardController.deleteBoard(io, socket, data);
    })
    socket.on(SocketEvents.columnsDelete, (data) => {
        columnsController.deleteColumn(io, socket, data);
    })
    socket.on(SocketEvents.columnsUpdate, (data) => {
        columnsController.updateColumn(io, socket, data)
    })
    // console.log('connected');
})

mongoose.connect('mongodb://localhost:27017/trello')
    .then(() => {
        console.log('connected to mongodb');
        httpServer.listen(4001, () => {
            console.log('Api is listening on port 4001');
        })
    })


