import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();

    const user = await request.server.mongo.db?.collection("users").findOne({
      _id: new ObjectId(request.user.userId),
    });

    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }
  } catch (errpr) {
    return reply.status(403).send({ error: "Invalid token" });
  }
}
