import { Db } from "mongodb";

export const createIndexes = async (db: Db) => {
  const collection = db.collection("users");

  try {
    await collection.createIndex({ email: 1 }, { unique: true });
    console.log("Unique index on email created");
  } catch (error) {
    console.error("Error creating index: ", error);
  }
};
