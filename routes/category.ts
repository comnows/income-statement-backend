import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.js";
import { createCategory, deleteCategory } from "../controllers/category.js";

const categoryRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createCategory);
  fastify.delete("/:id", deleteCategory);
};

export default categoryRoutes;
