import { NextFunction, Response } from "express";
import { ExpressRequest } from "../types/express-request.interface";
import TaskModel from '../models/task';
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEvents } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helper";

export const getTasks = async (
    req: ExpressRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const tasks = await TaskModel.find({ boardId: req.params['boardId']});
        res.send(tasks);
    } catch(err) {
        next(err)
    }
}

export const createTask = async (
    io: Server,
    socket: Socket,
    data: { title: string, boardId: string, columnId: string }
) => {
    try {
        if (!socket.user) {
            socket.emit(SocketEvents.tasksCreateFailure, 'User is not authorized');
            return;
        }
    
        const newTask = new TaskModel({
            title: data.title,
            boardId: data.boardId,
            columnId: data.columnId,
            userId: socket.user.id
        })
        const savedTask = await newTask.save()
        io.to(data.boardId).emit(SocketEvents.tasksCreateSuccess, savedTask);
    } catch(err) {
        socket.emit(SocketEvents.tasksCreateFailure, getErrorMessage(err));
    }
}

export const updateTask = async (
    io: Server,
    socket: Socket,
    data: { boardId: string, taskId: string, fields: { title?: string, description?: string, columnId?: string }}
) => {
    try {
        if (!socket.user) {
            socket.emit(SocketEvents.tasksUpdateFailure, 'User is not authorized');
            return;
        }

        const updatedTask = await TaskModel.findByIdAndUpdate(data.taskId, data.fields, { new: true });
        io.to(data.boardId).emit(SocketEvents.tasksUpdateSuccess, updatedTask);
    } catch(err) {
        socket.emit(SocketEvents.tasksUpdateFailure, getErrorMessage(err));
    }
}

export const deleteTask = async (
    io: Server,
    socket: Socket,
    data: { boardId: string, taskId: string }
  ) => {
    try {
      if (!socket.user) {
        socket.emit(SocketEvents.tasksDeleteFailure, 'User is not authorized');
        return;
      }
  
      await TaskModel.findByIdAndDelete(data.taskId);
      io.to(data.boardId).emit(SocketEvents.tasksDeleteSuccess, data.taskId);
    } catch(err) {  
      socket.emit(SocketEvents.tasksDeleteFailure, getErrorMessage(err));
    }
  }