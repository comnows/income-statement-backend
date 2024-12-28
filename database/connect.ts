import { FastifyInstance } from "fastify";
import fastifyMongo from "@fastify/mongodb";
import fastifyPlugin from "fastify-plugin";

const connectDB = async (fastify: FastifyInstance) => {
  fastify.register(fastifyMongo, {
    forceClose: true,
    url: process.env.MONGO_URI,
    database: process.env.DB_NAME,
  });

  console.log("Connected to database");
};

export default fastifyPlugin(connectDB);
