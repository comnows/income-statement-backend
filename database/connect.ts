import { FastifyInstance } from "fastify";
import fastifyMongo from "@fastify/mongodb";
import fastifyPlugin from "fastify-plugin";
import { S3Client } from "@aws-sdk/client-s3";

const connectDB = async (fastify: FastifyInstance) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
    region: process.env.AWS_BUCKET_REGION || "ap-southeast-1",
  });

  fastify.decorate("s3", s3);

  fastify.register(fastifyMongo, {
    forceClose: true,
    url: process.env.MONGO_URI,
    database: process.env.DB_NAME,
  });

  console.log("Connected to database");
};

export default fastifyPlugin(connectDB);
