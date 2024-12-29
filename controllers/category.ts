import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";
import { ParamsId } from "../libs/type.js";

type CategoryData = {
  name: string;
};

type CreateCategoryRequestData = {
  Body: CategoryData;
};

type DeleteCategoryRequestData = {
  Params: ParamsId;
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

export const getAllCategories = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { userId } = request.user;
  const db = request.server.mongo.db;

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const result = await db
      .collection("categories")
      .find({
        createdBy: new ObjectId(userId),
      })
      .toArray();

    return reply.status(200).send({ categories: result });
  } catch (error) {
    return reply.status(500).send({ error: "Category fetch unsuccessful" });
  }
};

export const deleteCategory = async (
  request: FastifyRequest<DeleteCategoryRequestData>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const { userId } = request.user;
  const db = request.server.mongo.db;

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const result = await db.collection("categories").findOneAndDelete({
      _id: new ObjectId(id),
      createdBy: new ObjectId(userId),
    });

    return reply.status(200).send({ category: result });
  } catch (error) {
    return reply.status(500).send({ error: "Category deleted unsuccessful" });
  }
};
