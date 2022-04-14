import { NotImplementedError, UnauthorizedError } from "./errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserType } from "./constants";
// TODO(roman): implement these
// external libraries can be used
// you can even ignore them and use your own preferred method

export function hashPassword(password: string): string {
  const pass = bcrypt.hashSync(password, 10);
  return pass;
}

export function generateToken(data: TokenData): string {
  return jwt.sign(data, "secret_that_should_be_in_.env", { expiresIn: "12h" });
}

export function isValidToken(token: string): boolean {
  const tokenIsValid = jwt.verify(token, "secret_that_should_be_in_.env");
  if (tokenIsValid) {
    return true;
  }
  return false;
}

// NOTE(roman): assuming that `isValidToken` will be called before
export function extraDataFromToken(token: string): TokenData {
  if (isValidToken(token)) {
    const decoded = jwt.decode(token);
    return decoded as TokenData;
  }
  throw new UnauthorizedError("Invalid token");
}

export interface TokenData {
  id: number;
  type?: UserType;
}
