import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

type AccountBodyData = {
  account: string;
  bank: string;
  branch: string;
};

type AccountRequestData = {
  Body: AccountBodyData;
};

export const createAccount = async (
  request: FastifyRequest<AccountRequestData>,
  reply: FastifyReply
) => {
  const { userId } = request.user;
  const data = request.body;
  const db = request.server.mongo.db;

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const result = await db.collection("accounts").insertOne({
      ...data,
      createdBy: new ObjectId(userId),
    });

    return reply.status(201).send({ account: result });
  } catch (error) {
    return reply.status(500).send({ error: "Account added unsuccessful" });
  }
};
