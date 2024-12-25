import { FastifyInstance } from "fastify";
import { register } from "../controllers/auth";

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/register", register);
};

export default authRoutes;
