import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import { createAccount, deleteAccount } from "../controllers/account";

const accountRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createAccount);
  fastify.delete("/:id", deleteAccount);
};

export default accountRoutes;
