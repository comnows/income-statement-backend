import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.js";
import {
  createTransaction,
  getAllTransactions,
  getSummary,
} from "../controllers/transaction.js";

const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.get("/", getAllTransactions);
  fastify.get("/summary", getSummary);
  fastify.post("/", createTransaction);
};

export default transactionRoutes;
