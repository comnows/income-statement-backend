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

type DeleteAccountParams = {
  id: string;
};

type DeleteAccountRequestData = {
  Params: DeleteAccountParams;
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

    const accountData = { ...data, createdBy: new ObjectId(userId) };
    const result = await db
      .collection("accounts")
      .findOneAndUpdate(
        accountData,
        { $setOnInsert: accountData },
        { upsert: true, returnDocument: "after" }
      );

    return reply.status(201).send({ account: result });
  } catch (error) {
    return reply.status(500).send({ error: "Account added unsuccessful" });
  }
};

export const deleteAccount = async (
  request: FastifyRequest<DeleteAccountRequestData>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const { userId } = request.user;
  const db = request.server.mongo.db;

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const result = await db.collection("accounts").findOneAndDelete({
      _id: new ObjectId(id),
      createdBy: new ObjectId(userId),
    });

    return reply.status(200).send({ account: result });
  } catch (error) {
    return reply.status(500).send({ error: "Account deleted unsuccessful" });
  }
};
