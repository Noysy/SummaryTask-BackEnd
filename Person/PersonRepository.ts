import { MyPerson } from "./PersonInterface";

class PersonRepository {
  static getPerson(id: string) {
    return MyPerson.findOne({ _id: id });
  }
}

export default PersonRepository;
