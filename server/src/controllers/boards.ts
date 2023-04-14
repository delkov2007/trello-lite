import { Response, NextFunction } from "express";
import { Server } from "socket.io";
import { getErrorMessage } from "../helper";
import BoardModel from "../models/board";
import { ExpressRequest } from "../types/express-request.interface";
import { Socket } from "../types/socket.interface";
import { SocketEvents } from "../types/socketEvents.enum";

export const getBoards = async (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const boards = await BoardModel.find({ userId: req.user.id });
    res.send(boards);
  } catch (err) {
    next(err);
  }
};

export const getBoard = async (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const boardId = req.params["boardId"];
    const missingBoardError = { missingBoardId: "Missing board id" };
    if (!boardId) return res.sendStatus(422).json(missingBoardError);

    const board = await BoardModel.findById(boardId);
    res.send(board);
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const newBoard = new BoardModel({
      title: req.body.title,
      userId: req.user.id,
    });
    const savedBoard = await newBoard.save();
    res.send(savedBoard);
  } catch (err) {
    next(err);
  }
};

export const joinBoard = (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  console.log("server socket io join", data.boardId);
  socket.join(data.boardId);
};

export const leaveBoard = (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  console.log("server socket io leave", data.boardId);
  socket.leave(data.boardId);
};

export const updateBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; fields: { title: string } }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEvents.boardsUpdateFailure, "User is not authorized");
      return;
    }

    const updatedBoard = await BoardModel.findByIdAndUpdate(
      data.boardId,
      data.fields,
      { new: true }
    );
    io.to(data.boardId).emit(SocketEvents.boardsUpdateSuccess, updatedBoard);
  } catch (err) {
    socket.emit(SocketEvents.boardsUpdateFailure, getErrorMessage(err));
  }
};

export const deleteBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEvents.boardsDeleteFailure, "User is not authorized");
      return;
    }

    await BoardModel.findByIdAndDelete(data.boardId);
    io.to(data.boardId).emit(SocketEvents.boardsDeleteSuccess);
  } catch (err) {
    socket.emit(SocketEvents.boardsDeleteFailure, getErrorMessage(err));
  }
};
