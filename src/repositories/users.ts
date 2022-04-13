import { HasMany, Model } from "sequelize";

import type { SequelizeModels } from "../sequelize";
import type { Post } from "./types";

import { UserType } from "../constants";

export class User extends Model {
  static associations: {
    posts: HasMany<User, Post>;
  };

  id!: number;
  type!: UserType;
  name!: string;
  email!: string;
  passwordHash!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static associate(models: SequelizeModels): void {
    // this.hasMany(models.posts, { foreignKey: "id", as: "posts" });
  }
}

export type UsersModel = typeof User;
