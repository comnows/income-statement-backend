import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import { createCategory } from "../controllers/category";

const categoryRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createCategory);
};

export default categoryRoutes;
