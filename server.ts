import Fastify from "fastify";

const fastify = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

const start = async () => {
  try {
    await fastify.listen({ port: port });
    console.log("Server listening at http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
