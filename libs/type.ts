import { S3Client } from "@aws-sdk/client-s3";
import "@fastify/jwt";

type UserPayload = {
  userId: string;
  name: string;
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: UserPayload;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    s3: S3Client;
  }
}

export type ParamsId = {
  id: string;
};
