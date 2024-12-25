import "dotenv/config";
import Fastify from "fastify";
import fastifyMongo from "@fastify/mongodb";

const fastify = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

fastify.register(fastifyMongo, {
  forceClose: true,
  url: process.env.MONGO_URI,
  database: process.env.DB_NAME,
});

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
