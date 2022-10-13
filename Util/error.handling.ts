import { Context } from "@azure/functions";
import { CustomError } from "./custom.error";

const errorHandler = (context: Context, err: CustomError) => {
  context.res = {
    status: err.statusCode ?? 500,
    body: err.message,
  };
};


export default errorHandler;
