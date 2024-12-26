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

export type ParamsId = {
  id: string;
};
