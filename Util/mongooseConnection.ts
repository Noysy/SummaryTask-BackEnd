import mongoose from "mongoose";
import configFile from "../config";

const mongooseConnection = async () => {    
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(configFile.mongooseConnection);
};

export default mongooseConnection;
