import jwt from "jsonwebtoken";
import CustomError from "./custom.error";
import configFile, { errors } from "../config";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import errorHandler from "./error.handling";

export const jwtDecode = (token: string) => {
  try {
    const jwtDecoded = jwt.verify(token, process.env.TOKEN_SECRET);
    return jwtDecoded;
  } catch (err) {
    throw errors.noPermissionErr;
  }
};

export const userPerm = (role: string) => {
  if (role !== "ADMIN" && role !== "USER") {
    throw errors.noPermissionErr;
  }
};

export const adminPerm = (role: string) => {
  if (role !== "ADMIN") {
    throw errors.noPermissionErr;
  }
};

interface HttpTriggerResult {
  status?: number;
  body?: any;
}

export const authWrapper = (
  func: AzureFunction,
  permissionType: Function
): AzureFunction => {
  return async (
    context: Context,
    req: HttpRequest
  ): Promise<HttpTriggerResult> => {
    try {
      const header = req.headers?.authorization;

      if (header && header.split(" ")[1]) {
        const user = jwtDecode(header.split(" ")[1]);
        if (user) {
          permissionType(user.role);
          return func(context, req, user);
        }
      }
      return {
        status: 401,
      };
    } catch (err) {
      errorHandler(context, err);
    }
  };
};
