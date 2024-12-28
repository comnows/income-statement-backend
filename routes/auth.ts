import { FastifyInstance } from "fastify";
import { login, register } from "../controllers/auth.js";

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/register", register);
  fastify.post("/login", login);
};

export default authRoutes;
