import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.js";
import { createAccount, deleteAccount } from "../controllers/account.js";

const accountRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createAccount);
  fastify.delete("/:id", deleteAccount);
};

export default accountRoutes;
