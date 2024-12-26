import { FastifyReply, FastifyRequest } from "fastify";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.cookies.token;
  if (!token) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
    await request.jwtVerify();
  } catch (errpr) {
    return reply.status(403).send({ error: "Invalid token" });
  }
}
