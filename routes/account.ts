import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import { createAccount } from "../controllers/account";

const accountRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createAccount);
};

export default accountRoutes;
