import Joi from "joi";
import mongoose from "mongoose";
import { idPattern } from "../util/joi";

const group = new mongoose.Schema(
  {
    name: String,
    people: { type: [mongoose.Schema.Types.ObjectId], ref: "person" },
    parentGroup: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (_doc, ret) {
        delete ret._id;
      },
    },
  }
);

type IGroup = {
  name: string;
  people?: string[];
  parentGroup?: string;
};

const groupRequirements = Joi.object().keys({
  id: idPattern,
  name: Joi.string().required().max(10),
  people: Joi.array().items(idPattern),
  parentGroup: idPattern,
});

const Group = mongoose.model("group", group);

export { Group, groupRequirements, IGroup };
