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

  static async addPersonToGroup(groupId: string, personId: string) {
    await MyGroup.findByIdAndUpdate(
      groupId,
      { $push: { people: personId } },
      { new: true }
    );
  }
}

export default GroupRepository;
