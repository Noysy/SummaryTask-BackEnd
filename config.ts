import CustomError from "./Util/customError";

const configFile = {
  mongooseConnection: "mongodb://localhost:27017/GroupsAndPeople",
  noPermissionErr: new CustomError("Uh oh.. Seems like you don't have permission to do that. Get lost loser.", 403)
};
export default configFile;
