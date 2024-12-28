import { DeleteObjectsCommand, DeleteObjectsRequest } from "@aws-sdk/client-s3";
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

  const accountObjectId = new ObjectId(id);
  const userObjectId = new ObjectId(userId);

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const transactions = await db
      .collection("transactions")
      .find({
        account: accountObjectId,
        createdBy: userObjectId,
      })
      .toArray();

    const params: DeleteObjectsRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: [],
      },
    };

    for (const transaction of transactions) {
      if (!transaction.imageName) continue;

      const object = {
        Key: transaction.imageName,
      };
      params.Delete?.Objects?.push(object);
    }

    const command = new DeleteObjectsCommand(params);
    await request.server.s3.send(command);

    const transactionsDeleted = await db.collection("transactions").deleteMany({
      account: accountObjectId,
      createdBy: userObjectId,
    });

    const result = await db.collection("accounts").findOneAndDelete({
      _id: accountObjectId,
      createdBy: userObjectId,
    });

    return reply
      .status(200)
      .send({ account: result, transactions: transactionsDeleted });
  } catch (error) {
    return reply.status(500).send({ error: "Account deleted unsuccessful" });
  }
};
