import { Response, NextFunction } from "express";
import { Server } from "socket.io";
import { getErrorMessage } from "../helper";
import ColumnModel from '../models/column';
import { ExpressRequest } from "../types/express-request.interface";
import { Socket } from "../types/socket.interface";
import { SocketEvents } from "../types/socketEvents.enum";

export const getColumns = async (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const columns = await ColumnModel.find({ boardId: req.params['boardId'] });
    res.send(columns);
  } catch (err) {
    next(err);
  }
};

export const createColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string, title: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEvents.columnsCreateFailure, 'User is not authorized');
      return;
    }

    const newColumn = new ColumnModel({
      title: data.title,
      boardId: data.boardId,
      userId: socket.user.id
    });

    const savedColumn = await newColumn.save()
    io.to(data.boardId).emit(SocketEvents.columnsCreateSuccess, savedColumn);
  } catch(err) {
    socket.emit(SocketEvents.columnsCreateFailure, getErrorMessage(err));
  }
}

export const deleteColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string, columnId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEvents.columnsCreateFailure, 'User is not authorized');
      return;
    }

    await ColumnModel.findByIdAndDelete(data.columnId);
    io.to(data.boardId).emit(SocketEvents.columnsDeleteSuccess, data.columnId);
  } catch(err) {  
    socket.emit(SocketEvents.columnsDeleteFailure, getErrorMessage(err));
  }
}

export const updateColumn = async (
  io: Server,
  socket: Socket, 
  data: { boardId: string, columnId: string, fields: { title: string }}
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEvents.columnsCreateFailure, 'User is not authorized');
      return;
    }

    const updatedColumn = await ColumnModel.findByIdAndUpdate(data.columnId, data.fields, { new: true });
    io.to(data.boardId).emit(SocketEvents.columnsUpdateSuccess, updatedColumn);
  } catch(err) {
    socket.emit(SocketEvents.columnsUpdateFailure, getErrorMessage(err));
  }
}