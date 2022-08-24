import { MyPerson, Person } from "./PersonInterface";

class PersonRepository {
  static async getPerson(id: string) {
    return await MyPerson.findOne({ _id: id });
  }
}

export default PersonRepository;
