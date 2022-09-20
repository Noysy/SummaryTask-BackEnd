import Joi from "joi";
import mongoose from "mongoose";
import CustomError from "../Util/custom.error";

const person = new mongoose.Schema({
  name: { type: String, required: true },
  favoriteColor: { type: String, required: true },
  favoriteAnimal: { type: String, required: true },
  favoriteFood: { type: String, required: true },
  role: { type: String, required: true },
  files: [{ name: String, url: String }],
});

person.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    delete ret._id;
  },
});

interface IPerson {
  name: string;
  favoriteColor: string;
  favoriteAnimal: string;
  favoriteFood: string;
  role: string;
  group?: string;
  files?: FileDetails[];
}

interface DBPerson extends IPerson {
  id: string;
}

interface FileDetails {
  name: string;
  url: string;
}

const idPattern = Joi.object().keys({
  id: Joi.string()
    .pattern(/^[0-9a-f]{24}$/)
    .required(),
});

const validateId = (id: { id: string }) => {
  const validation = idPattern.validate(id);
  if (validation.error) throw new CustomError(validation.error.message, 400);
};

const personRequirements = Joi.object().keys({
  name: Joi.string().required().max(10),
  favoriteColor: Joi.string().required().max(15),
  favoriteAnimal: Joi.string().required().max(15),
  favoriteFood: Joi.string().required().max(15),
  role: Joi.string().required().max(15),
  group: Joi.string()
    .pattern(/^[0-9a-f]{24}$/)
    .allow(null, ""),
  files: Joi.array().items(Joi.string()),
});

const updatePersonDetails = Joi.object().keys({
  name: Joi.string().max(10),
  favoriteColor: Joi.string().max(15),
  favoriteAnimal: Joi.string().max(15),
  favoriteFood: Joi.string().max(15),
  role: Joi.string().max(15),
});

const Person = mongoose.model("person", person);

export {
  DBPerson,
  IPerson,
  validateId,
  person,
  Person,
  personRequirements,
  updatePersonDetails,
};
