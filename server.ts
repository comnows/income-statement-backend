import "dotenv/config";
import Fastify from "fastify";
import fastifyCookie, { type FastifyCookieOptions } from "@fastify/cookie";
import connectDB from "./database/connect.js";
import fastifyJwt from "@fastify/jwt";
import authRoutes from "./routes/auth.js";
import { createIndexes } from "./database/users.js";
import accountRoutes from "./routes/account.js";
import categoryRoutes from "./routes/category.js";
import transactionRoutes from "./routes/transaction.js";

const fastify = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
} as FastifyCookieOptions);

fastify.register(connectDB);

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "jwtsecret",
  cookie: {
    cookieName: "token",
    signed: false,
  },
});

fastify.ready(async () => {
  try {
    await createIndexes(fastify.mongo.db!);
  } catch (error) {
    console.error("Failed to create index:", error);
  }
});

fastify.register(authRoutes, { prefix: "/api/v1/auth" });
fastify.register(accountRoutes, { prefix: "/api/v1/accounts" });
fastify.register(categoryRoutes, { prefix: "/api/v1/categories" });
fastify.register(transactionRoutes, { prefix: "/api/v1/transactions" });

const start = async () => {
  try {
    await fastify.listen({ port: port });
    console.log("Server listening at http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
