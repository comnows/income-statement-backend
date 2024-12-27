import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

type TransactionBodyData = {
  title: string;
  type: string;
  amount: string;
  category: string;
  account: string;
  date: Date;
  month: number;
  year: number;
};

type CreateTransactionRequestData = {
  Body: TransactionBodyData;
};

export const createTransaction = async (
  request: FastifyRequest<CreateTransactionRequestData>,
  reply: FastifyReply
) => {
  const { userId } = request.user;
  const { account, date, ...data } = request.body;
  const db = request.server.mongo.db;

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const transactionData = {
      ...data,
      date: new Date(date),
      account: new ObjectId(account),
      createdBy: new ObjectId(userId),
    };

    const result = await db
      .collection("transactions")
      .insertOne(transactionData);

    return reply
      .status(201)
      .send({ transaction: result, message: "Inserted new transaction" });
  } catch (error) {
    return reply.status(500).send({ error: "Account added unsuccessful" });
  }
};
