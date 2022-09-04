import Joi from "joi";
import mongoose from "mongoose";
import CustomError from "../Util/customError";

const person = new mongoose.Schema({
  name: { type: String, required: true },
  favoriteColor: { type: String, required: true },
  favoriteAnimal: { type: String, required: true },
  favoriteFood: { type: String, required: true },
});

person.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      delete ret._id;
  },
});

const MyPerson = mongoose.model("person", person);

interface Person {
  name: string;
  favoriteColor: string;
  favoriteAnimal: string;
  favoriteFood: string;
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
});

const updatePersonDetails = Joi.object().keys({
  name: Joi.string().max(10),
  favoriteColor: Joi.string().max(15),
  favoriteAnimal: Joi.string().max(15),
  favoriteFood: Joi.string().max(15),
});

export {
  Person,
  validateId,
  person,
  MyPerson,
  personRequirements,
  updatePersonDetails,
};
