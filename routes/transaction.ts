import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import { createTransaction } from "../controllers/transaction";

const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createTransaction);
};

export default transactionRoutes;
