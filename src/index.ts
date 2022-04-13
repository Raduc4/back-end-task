import dotenv from "dotenv";
const result = dotenv.config({ override: true });
if (result.error) {
  throw result.error;
}
const { DATABASE, HOST, USERNAME, PASSWORD } = process.env;
import express from "express";
import { initSequelizeClient } from "./sequelize";
import { initUsersRouter } from "./routers";
import {
  initErrorRequestHandler,
  initNotFoundRequestHandler,
} from "./middleware";

const PORT = 8080;

async function main(): Promise<void> {
  const app = express();

  // TODO(roman): store these credentials in some external configs
  // so that they don't end up in the git repo
  const sequelizeClient = await initSequelizeClient({
    dialect: "postgres",
    host: HOST,
    port: 5432,
    username: USERNAME,
    password: PASSWORD,
    database: DATABASE,
  });

  app.use(express.json());

  app.use("/api/v1/users", initUsersRouter(sequelizeClient));
  app.use("/", initNotFoundRequestHandler());

  app.use(initErrorRequestHandler());

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.info(`app listening on port: '${PORT}'`);

      resolve();
    });
  });
}

main()
  .then(() => console.info("app started"))
  .catch(console.error);
