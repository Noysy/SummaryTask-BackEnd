import CustomError from "../Util/customError";
import PersonRepository from "./PersonRepository";

class PersonManager {
  static async getPerson(id: string) {
    const person = await PersonRepository.getPerson(id);
    
    if (person === null) {
      throw new CustomError("There is no such person with given id", 404);
    }
    return person;
  }
}

export default PersonManager;
