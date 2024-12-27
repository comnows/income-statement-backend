import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

type TransactionQuerystring = {
  page?: string;
  offset?: string;
};

type TransactionFilterQuery = {
  month?: string;
  year?: string;
  account?: string;
  category?: string;
};

type TransactionFilter = Pick<TransactionFilterQuery, "category"> & {
  month?: number;
  year?: number;
  account?: ObjectId;
  createdBy: ObjectId;
};

type GetAllTransactionRequestData = {
  Querystring: TransactionQuerystring & TransactionFilterQuery;
  Body: TransactionFilterQuery;
};

type TransactionBodyData = {
  note?: string;
  type: string;
  amount: number;
  category: string;
  account: string;
  date: Date;
  month: number;
  year: number;
};

type CreateTransactionRequestData = {
  Body: TransactionBodyData;
};

export const getAllTransactions = async (
  request: FastifyRequest<GetAllTransactionRequestData>,
  reply: FastifyReply
) => {
  const { userId } = request.user;
  const page = Number(request.query.page) || 1;
  const offset = Number(request.query.offset) || 10;
  const { month, year, account, category } = request.query;
  const db = request.server.mongo.db;
  const transactionFilter: TransactionFilter = {
    createdBy: new ObjectId(userId),
  };

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    if (month) {
      transactionFilter.month = Number(month);
    }

    if (year) {
      transactionFilter.year = Number(year);
    }

    if (account) {
      transactionFilter.account = new ObjectId(account);
    }

    if (category) {
      transactionFilter.category = category;
    }

    const result = await db
      .collection("transactions")
      .find(transactionFilter)
      .skip((page - 1) * offset)
      .limit(offset)
      .toArray();

    return reply
      .status(200)
      .send({ transactions: result, message: "Transactions fetched" });
  } catch (error) {
    console.log(error);

    return reply.status(500).send({ error: "Transaction fetch unsuccessful" });
  }
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
    return reply.status(500).send({ error: "Transaction added unsuccessful" });
  }
};
