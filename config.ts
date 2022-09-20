import CustomError from "./Util/custom.error";

const configFile = {
  mongooseConnection: "mongodb://localhost:27017/GroupsAndPeople",
};

export const errors = {
  noPermissionErr: new CustomError(
    "Uh oh.. Seems like you don't have permission to do that. Get lost loser.",
    403
  ),
  noGroupErr: new CustomError("There is no such group with given id", 404),
  noPersonErr: new CustomError("There is no such person with given id", 404),
};
export default configFile;
