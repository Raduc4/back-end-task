import { RequestHandler } from "express";

import type { SequelizeClient } from "../sequelize";
import type { User } from "../repositories/types";

import { UnauthorizedError } from "../errors";
import { isValidToken, extraDataFromToken } from "../security";
import { UserType } from "../constants";

export function initTokenValidationRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function tokenValidationRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      const { models } = sequelizeClient;

      const authorizationHeaderValue = req.header("authorization");
      console.log(req.header("authorization"));
      if (!authorizationHeaderValue) {
        throw new UnauthorizedError("AUTH_MISSING");
      }

      const [type, token] = authorizationHeaderValue.split(" ");
      if (type?.toLowerCase() !== "bearer") {
        throw new UnauthorizedError("AUTH_WRONG_TYPE");
      }

      if (!token) {
        throw new UnauthorizedError("AUTH_TOKEN_MISSING");
      }

      if (!isValidToken(token)) {
        throw new UnauthorizedError("AUTH_TOKEN_INVALID");
      }

      const { id } = extraDataFromToken(token);
      console.log(id);

      const user = await models.users.findByPk(id);
      if (!user) {
        throw new UnauthorizedError("AUTH_TOKEN_INVALID");
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (req as any).auth = {
        token,
        user,
      } as RequestAuth;

      return next();
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };
}

// NOTE(roman): assuming that `tokenValidationRequestHandler` is placed before
export function initAdminValidationRequestHandler(): RequestHandler {
  return function adminValidationRequestHandler(req, res, next): void {
    // TODO: (Radu): fix this because is's a security lack. Maybe to find the user by ID findByPk in DB and check by type.
    const authorizationHeaderValue = req.header("authorization");

    if (!authorizationHeaderValue) {
      throw new UnauthorizedError("AUTH_MISSING");
    }

    const [_, token] = authorizationHeaderValue.split(" ");

    const { id, type } = extraDataFromToken(token);
    console.log(type, id);
    if (type === UserType.ADMIN) {
      next();
    } else {
      throw new UnauthorizedError("NOT ADMIN");
    }
  };
}

export interface RequestAuth {
  token: string;
  user: User;
}
