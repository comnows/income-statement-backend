import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.js";
import {
  createAccount,
  deleteAccount,
  getAllAccounts,
} from "../controllers/account.js";

const accountRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", authMiddleware);

  fastify.post("/", createAccount);
  fastify.get("/", getAllAccounts);
  fastify.delete("/:id", deleteAccount);
};

export default accountRoutes;
