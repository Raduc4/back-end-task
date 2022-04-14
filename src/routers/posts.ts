import { Router, RequestHandler } from 'express';
import { Op, UpdateOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import type { SequelizeClient } from '../sequelize';
import type { Post } from '../repositories/types';

import {
	initTokenValidationRequestHandler,
	initAdminValidationRequestHandler,
	RequestAuth,
} from '../middleware/security';

export function initPostsRouter(sequelizeClient: SequelizeClient): Router {
	const router = Router({ mergeParams: true });

	const tokenValidation = initTokenValidationRequestHandler(sequelizeClient);
	const adminValidation = initAdminValidationRequestHandler();

	router
		.route('/create')
		.post(tokenValidation, initCreatePostRequestHandler(sequelizeClient));

	// GET all private posts
	router
		.route('/')
		.get(tokenValidation, initFindPostsRequestHandler(sequelizeClient));
	router
		.route('/:id')
		.put(tokenValidation, initUpdatePostsRequestHandler(sequelizeClient))
		.delete(
			tokenValidation,
			initDeletePostsByUserRequestHandler(sequelizeClient)
		);
	router
		.route('/deleteAdmin/:id')
		.delete(
			tokenValidation,
			adminValidation,
			initDeletePostsRequestHandler(sequelizeClient)
		);

	router
		.route('/visibility/:id')
		.put(tokenValidation, initUpdateVisibilityRequestHandler(sequelizeClient));

	// GET all public posts
	router
		.route('/getall')
		.get(
			tokenValidation,
			initFindAllPublicPostsRequestHandler(sequelizeClient)
		);
	return router;
}

function initUpdatePostsRequestHandler(
	sequelizeClient: SequelizeClient
): RequestHandler {
	return async function updatePostsRequestHandler(req, res, next) {
		const { title, content } = req.body as { title?: string; content?: string };
		const { models } = sequelizeClient;
		const { user } = (req as any).auth as RequestAuth;

		const objToUpdate =
			title && content ? { title, content } : title ? { title } : { content };

		try {
			const posts = await models.posts.update(objToUpdate, {
				where: { authorId: user.id, id: req.params.id },
			});
			res.json(posts);
		} catch (error) {
			next(error);
		}
	};
}

function initUpdateVisibilityRequestHandler(
	sequelizeClient: SequelizeClient
): RequestHandler {
	return async function updatePostsRequestHandler(req, res, next) {
		const { isHidden } = req.body as UpdateVisibilityData;
		const { models } = sequelizeClient;
		const { user } = (req as any).auth as RequestAuth;

		try {
			const posts = await models.posts.update(
				{ isHidden },
				{ where: { authorId: user.id, id: req.params.id } }
			);
			res.json(posts);
		} catch (error) {
			next(error);
		}
	};
}

function initFindPostsRequestHandler(
	sequelizeClient: SequelizeClient
): RequestHandler {
	return async function findPostsRequestHandler(req, res, next) {
		const { models } = sequelizeClient;
		const {
			user: { id },
		} = (req as any).auth as RequestAuth;

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

function initDeletePostsRequestHandler(
	sequelizeClient: SequelizeClient
): RequestHandler {
	return async function deletePostsRequestHandler(req, res, next) {
		const { models } = sequelizeClient;
		const { user } = (req as any).auth as RequestAuth;
		console.log(user.id);
		console.log(req.params.id);

		try {
			const post = await models.posts.destroy({
				where: { id: req.params.id },
			});
			res.json(post);
		} catch (error) {
			next(error);
		}
	};
}

function initDeletePostsByUserRequestHandler(
	sequelizeClient: SequelizeClient
): RequestHandler {
	return async function deletePostsRequestHandler(req, res, next) {
		const { models } = sequelizeClient;
		const {
			user: { id },
		} = (req as any).auth as RequestAuth;

		try {
			const post = await models.posts.destroy({
				where: { id: req.params.id, authorId: id },
			});
			res.json(post);
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
			const {
				user: { id },
			} = (req as any).auth as RequestAuth;

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

	await models.posts.create({
		id: uuidv4(),
		title,
		content,
		isHidden,
		authorId,
	});
}

type CreatePostData = Pick<Post, 'title' | 'content'> & {
	authorId: number;
	isHidden: boolean;
};

type UpdateVisibilityData = { isHidden: boolean };
