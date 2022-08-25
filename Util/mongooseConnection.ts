import mongoose from "mongoose";
import configFile from "../config";

const mongooseConnection = () => {    
  if (mongoose.connection.readyState === 1) return;
  return mongoose.connect(configFile.mongooseConnection);
};

export default mongooseConnection;
