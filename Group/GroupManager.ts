import CustomError from "../Util/customError";
import GroupRepository from "./GroupRepository";

class GroupManager {
  static async getGroup(id: string) {
    const group = await GroupRepository.getGroup(id);

    if (group === null)
      throw new CustomError("There is no such group with given id", 404);

    return group;
  }
}

export default GroupManager;
