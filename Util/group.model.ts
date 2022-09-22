import mongoose from "mongoose";

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

const Group = mongoose.model("group", group);

export default Group;
