import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";

type RegisterBodyData = {
  name: string;
  email: string;
  password: string;
};

type RegisterRequestData = {
  Body: RegisterBodyData;
};

export const register = async (
  request: FastifyRequest<RegisterRequestData>,
  reply: FastifyReply
) => {
  try {
    const db = request.server.mongo.db;
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const { password, ...bodyData } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      ...bodyData,
      password: hashedPassword,
    });

    return reply.status(201).send({
      user: { name: bodyData.name, email: bodyData.email },
      result: result?.insertedId,
    });
  } catch (error) {
    console.error("Error register: ", error);
    return reply.status(500).send({ error: "User create unsuccessful" });
  }
};
