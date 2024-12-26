import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import { createCategory, deleteCategory } from "../controllers/category";

const categoryRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createCategory);
  fastify.delete("/:id", deleteCategory);
};

export default categoryRoutes;
