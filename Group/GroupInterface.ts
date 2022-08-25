import Joi from "joi";
import mongoose from "mongoose";

const group = new mongoose.Schema({
  name: String,
  people: { type: [String], ref: "people" },
  parentGroup: { type: String, ref: "groups" },
});

group.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    delete ret._id;
  },
});

type Group = {
  name: string;
  people?: [string];
  parentGroup?: string;
};

const groupRequirements = Joi.object().keys({
  id: Joi.string().pattern(/^[0-9a-f]{24}$/),
  name: Joi.string().required().max(10),
  people: Joi.array().items(Joi.string()),
  parentGroup: Joi.string(),
});

const nameLength = Joi.object().keys({
    name: Joi.string().required().max(10),
  });

const idPattern = Joi.object().keys({
  id: Joi.string()
    .pattern(/^[0-9a-f]{24}$/)
    .required(),
});

const MyGroup = mongoose.model("group", group);

export { MyGroup, groupRequirements, Group, idPattern, nameLength };
