import { MyGroup } from "./GroupInterface";

class GroupRepository {
  static getGroup(id: string) {
    return MyGroup.findOne({ _id: id });
  }

  static isPersonInGroup(id: string, personId: string) {
    return MyGroup.findOne({ people: personId, _id: id });
  }
  
  static async doesGroupHaveParent(id: string) {
    return await MyGroup.findOne({ _id: id, parentGroup: { $exists: true } });
  }
}

export default GroupRepository;
