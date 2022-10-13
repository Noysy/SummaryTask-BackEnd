type IGroup = {
  name: string;
  people?: string[];
  parentGroup?: string;
};

export enum Role {
  User= "USER",
  Admin = "ADMIN"
}

export default IGroup;
