import { Request } from "express";
import { UserDocument } from "./user.interface";

export interface ExpressRequest extends Request {
    user?: UserDocument
}