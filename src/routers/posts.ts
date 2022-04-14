import { Router, RequestHandler } from "express";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import type { SequelizeClient } from "../sequelize";
import type { Post, User } from "../repositories/types";

import { BadRequestError, UnauthorizedError } from "../errors";
import { hashPassword, generateToken, extraDataFromToken } from "../security";
import {
  initTokenValidationRequestHandler,
  initAdminValidationRequestHandler,
  RequestAuth,
} from "../middleware/security";
import { UserType } from "../constants";

export function initPostsRouter(sequelizeClient: SequelizeClient): Router {
  const router = Router({ mergeParams: true });

  const tokenValidation = initTokenValidationRequestHandler(sequelizeClient);
  const adminValidation = initAdminValidationRequestHandler();

  router
    .route("/create")
    .post(tokenValidation, initCreatePostRequestHandler(sequelizeClient));

  // GET all private posts
  router
    .route("/")
    .get(tokenValidation, initFindPostsRequestHandler(sequelizeClient));

  // GET all public posts
  router
    .route("/getall")
    .get(
      tokenValidation,
      initFindAllPublicPostsRequestHandler(sequelizeClient)
    );
  return router;
}

// initFindAllPublicPostsRequestHandler(sequelizeClient);

function initFindPostsRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function findPostsRequestHandler(req, res, next) {
    const { models } = sequelizeClient;
    const authorizationHeaderValue = req.header("authorization");
    if (!authorizationHeaderValue) {
      throw new UnauthorizedError("AUTH_MISSING");
    }
    const [type, token] = authorizationHeaderValue.split(" ");
    const { id } = extraDataFromToken(token);

    try {
      const posts = await models.posts.findAll({ where: { authorId: id } });
      res.json(posts);
    } catch (error) {
      next(error);
    }
  };
}

function initFindAllPublicPostsRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function findAllPublicPostsRequestHandler(req, res, next) {
    const { models } = sequelizeClient;
    try {
      const posts = await models.posts.findAll({ where: { isHidden: false } });
      res.json(posts);
    } catch (error) {
      next(error);
    }
  };
}

function initCreatePostRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function createPostRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      // NOTE(roman): missing validation and cleaning
      const { title, content, isHidden } = req.body as CreatePostData;
      const authorizationHeaderValue = req.header("authorization");
      if (!authorizationHeaderValue) {
        throw new UnauthorizedError("AUTH_MISSING");
      }
      const [type, token] = authorizationHeaderValue.split(" ");
      const { id } = extraDataFromToken(token);

      await createPost(
        { title, content, authorId: id, isHidden },
        sequelizeClient
      );

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

async function createPost(
  data: CreatePostData,
  sequelizeClient: SequelizeClient
): Promise<void> {
  const { title, content, authorId, isHidden } = data;

  const { models } = sequelizeClient;

  // const similarPost = (await models.users.findOne({
  //   attributes: ["id", "name", "email"],
  //   where: {
  //     [Op.or]: [{ title }, { content }],
  //   },
  //   raw: true,
  // })) as Pick<Post, "title" | "content"> | null;
  // if (similarPost) {
  //   if (similarPost.title === title) {
  //     throw new BadRequestError("TITLE_ALREADY_USED");
  //   }
  // }

  await models.posts.create({
    id: uuidv4(),
    title,
    content,
    isHidden,
    authorId,
  });
}

type CreatePostData = Pick<Post, "title" | "content"> & {
  authorId: number;
  isHidden: boolean;
};
