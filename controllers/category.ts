import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

type CategoryData = {
  name: string;
};

type CreateCategoryRequestData = {
  Body: CategoryData;
};

export const createCategory = async (
  request: FastifyRequest<CreateCategoryRequestData>,
  reply: FastifyReply
) => {
  const { userId } = request.user;
  const { name } = request.body;
  const db = request.server.mongo.db;

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const categoryData = { name, createdBy: new ObjectId(userId) };
    const result = await db
      .collection("categories")
      .findOneAndUpdate(
        categoryData,
        { $setOnInsert: categoryData },
        { upsert: true, returnDocument: "after" }
      );
    return reply.status(201).send({ category: result });
  } catch (error) {
    return reply.status(500).send({ error: "Category added unsuccessful" });
  }
};
