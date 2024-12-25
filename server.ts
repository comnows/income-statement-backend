import "dotenv/config";
import Fastify from "fastify";
import fastifyCookie, { type FastifyCookieOptions } from "@fastify/cookie";
import fastifyMongo from "@fastify/mongodb";
import fastifyJwt from "@fastify/jwt";
import authRoutes from "./routes/auth";
import { createIndexes } from "./database/users";

const fastify = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
} as FastifyCookieOptions);

fastify.register(fastifyMongo, {
  forceClose: true,
  url: process.env.MONGO_URI,
  database: process.env.DB_NAME,
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "jwtsecret",
});

fastify.ready(async () => {
  try {
    await createIndexes(fastify.mongo.db!);
  } catch (error) {
    console.error("Failed to create index:", error);
  }
});

fastify.register(authRoutes, { prefix: "/api/v1/auth" });

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
