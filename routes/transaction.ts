import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import {
  createTransaction,
  getAllTransactions,
} from "../controllers/transaction";

const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.get("/", getAllTransactions);
  fastify.post("/", createTransaction);
};

export default transactionRoutes;
