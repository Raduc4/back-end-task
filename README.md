# Back-End Task

**Create a [node.js](https://nodejs.org) [web service](https://en.wikipedia.org/wiki/Web_service) for a blogging app with a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transferj) api that works with [JSON](https://www.json.org) data using [express](https://expressjs.com/) as a framework and [postgresql](https://www.postgresql.org/) as a database.**

Blogging can involve many things so, to keep this simple, the main focus is on **users** and **posts** created by **users**. The structures for these entities are irrelevant as long as they're usable and aren't hard to understand, in other words, you can define **users** and **posts** however you want but make sure that it won't be too hard to understand how each of their properties contribute to form a blogging app that respects the requirements enumerated below. The same goes for endpoints.

### Requirements:

1. RESTfull web service working with JSON data in node.js using express and postgresql
1. two types of **users**: **bloggers** and **admins**✅
1. authentication with name/email and password, with sign-up and sign-in for **bloggers**, but only sign-in for **admins**✅
1. **bloggers** can create **posts**✅
1. **bloggers** can update and remove their **posts**✅
1. **bloggers** can publish and hide their **posts**✅
1. **bloggers** can see their **posts** whether they're public or hidden✅
1. **bloggers** can see **posts** of other **bloggers** as long as they're public✅
1. **admins** can do everything **bloggers** can do✅
1. **admins** can remove any public **post**✅

There is an incomplete implementation in this repo in order to skip through setup and to test your skill of working with an existing codebase, but there are no restrictions to what can be changed, so you can rewrite the whole thing from scratch. If you choose to start with this then fork this repo so that it will easier to see all the changes. There are also a couple of TODOs which you'll have to do and there may or may not be bugs, so good luck.

I would recommend the eslint extension for vscode (dbaeumer.vscode-eslint) since this project is already configured for it.

If you think that something is missing, feel free to contact us.

### Bonus points for usage of:

1. [typescript](https://www.typescriptlang.org/)✅
1. [sequelize](https://sequelize.org/)✅
1. [jwt](https://jwt.io/)✅
1. [docker](https://www.docker.com/)✅
1. [docker-compose](https://docs.docker.com/compose/)✅
1. [mocha](https://mochajs.org/) or any other testing library
1. [eslint](https://eslint.org/) ([typescript-eslint](https://github.com/typescript-eslint/typescript-eslint))✅
