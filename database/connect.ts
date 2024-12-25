import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyMongo from "@fastify/mongodb";

export const connectDB = async (fastify: FastifyInstance) => {
  try {
    await fastify.register(fastifyMongo, {
      forceClose: true,
      url: process.env.MONGO_URI,
      database: process.env.DB_NAME,
    });

    console.log("Connected to database");
  } catch (error) {
    console.error("Failed to connect to database: ", error);
    throw error;
  }
};
