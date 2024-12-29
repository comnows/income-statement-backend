import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
} from "../controllers/category.js";

const categoryRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createCategory);
  fastify.get("/", getAllCategories);
  fastify.delete("/:id", deleteCategory);
};

export default categoryRoutes;
