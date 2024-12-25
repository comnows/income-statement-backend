import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import { MongoError, WithId } from "mongodb";

type RegisterBodyData = {
  name: string;
} & LoginBodyData;

type RegisterRequestData = {
  Body: RegisterBodyData;
};

type LoginBodyData = {
  email: string;
  password: string;
};

type LoginRequestData = {
  Body: LoginBodyData;
};

export const register = async (
  request: FastifyRequest<RegisterRequestData>,
  reply: FastifyReply
) => {
  try {
    const db = request.server.mongo.db;
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const { password, ...bodyData } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      ...bodyData,
      password: hashedPassword,
    });

    return reply.status(201).send({
      user: { name: bodyData.name, email: bodyData.email },
      result: result?.insertedId,
    });
  } catch (error) {
    if ((error as MongoError).code === 11000) {
      return reply.status(400).send({ error: "Email already exists" });
    }

    console.error("Error register: ", error);
    return reply.status(500).send({ error: "User create unsuccessful" });
  }
};

export const login = async (
  request: FastifyRequest<LoginRequestData>,
  reply: FastifyReply
) => {
  const { email, password } = request.body;
  const fastify = request.server;
  const db = fastify.mongo.db;

  if (!email || !password) {
    return reply
      .status(400)
      .send({ error: "Please provide email and password" });
  }

  try {
    const user = await db
      ?.collection<RegisterBodyData>("users")
      .findOne({ email });
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = fastify.jwt.sign(
      { userId: user._id, name: user.name },
      { expiresIn: "1d" }
    );

    reply.setCookie("token", token, { maxAge: 24 * 60 * 60, httpOnly: true });

    return reply.status(200).send({ user: { name: user.name }, token });
  } catch (error) {
    console.error("Error login: ", error);
    return reply.status(500).send({ error: "User login unsuccessful" });
  }
};
