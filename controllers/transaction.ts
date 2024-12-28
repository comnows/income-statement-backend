import { v4 as uuid } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Filter } from "bad-words";
import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

type PaginationQuerystring = {
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
  Querystring: PaginationQuerystring & TransactionFilterQuery;
  Body: TransactionFilterQuery;
};

type SummaryFilterQuery = {
  startMonth?: string;
  endMonth?: string;
  startYear?: string;
  endYear?: string;
  account?: string;
  category?: string;
} & PaginationQuerystring;

type GetSummaryRequestData = {
  Querystring: SummaryFilterQuery;
};

type StartYearMonthFilter = {
  year?: number;
  month?: { $gte: number };
};
type EndYearMonthFilter = {
  year?: number;
  month?: { $lte: number };
};
type YearMonthFilter = StartYearMonthFilter | EndYearMonthFilter;

type SummaryFilter = Pick<SummaryFilterQuery, "category"> & {
  account?: ObjectId;
  $or?: YearMonthFilter[];
} & StartYearMonthFilter;

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
  const allowOffsets = [10, 20, 50, 100];
  const { userId } = request.user;
  const page = Number(request.query.page) || 1;
  let offset = Number(request.query.offset) || 10;
  const { month, year, account, category } = request.query;
  const db = request.server.mongo.db;
  const transactionFilter: TransactionFilter = {
    createdBy: new ObjectId(userId),
  };
  offset = allowOffsets.includes(offset) ? offset : 10;

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

export const getSummary = async (
  request: FastifyRequest<GetSummaryRequestData>,
  reply: FastifyReply
) => {
  const allowOffsets = [10, 20, 50, 100];
  const { userId } = request.user;
  const { startMonth, endMonth, startYear, endYear, account, category } =
    request.query;
  const page = Number(request.query.page) || 1;
  let offset = Number(request.query.offset) || 10;
  const db = request.server.mongo.db;
  const summaryFilter: SummaryFilter = {};
  const start: StartYearMonthFilter = {};
  const end: EndYearMonthFilter = {};
  offset = allowOffsets.includes(offset) ? offset : 10;

  try {
    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    if (startMonth && startYear) {
      start.year = Number(startYear);
      start.month = { $gte: Number(startMonth) };
    }

    if (endMonth && endYear) {
      end.year = Number(endYear);
      end.month = { $lte: Number(endMonth) };
    }

    if (startMonth && startYear && endMonth && endYear) {
      summaryFilter["$or"] = [start, end];
    } else if (startMonth && startYear && (!endMonth || !endYear)) {
      summaryFilter.year = start.year;
      summaryFilter.month = start.month;
    }

    if (account) {
      summaryFilter.account = new ObjectId(account);
    }

    if (category) {
      summaryFilter.category = category;
    }

    const result = await db
      .collection("transactions")
      .aggregate([
        {
          $match: { createdBy: new ObjectId(userId), ...summaryFilter },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } },
            },
            totalIncome: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
            },
            totalExpense: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
            },
          },
        },
        {
          $addFields: {
            total: {
              $subtract: ["$totalIncome", "$totalExpense"],
            },
          },
        },
        {
          $sort: { _id: -1 },
        },
        { $skip: (page - 1) * offset },
        { $limit: offset },
        {
          $project: {
            _id: 0,
            month: "$_id",
            totalIncome: { $round: ["$totalIncome", 2] },
            totalExpense: { $round: ["$totalExpense", 2] },
            total: { $round: ["$total", 2] },
          },
        },
      ])
      .toArray();

    return reply.status(200).send({ summary: result });
  } catch (error) {
    return reply.status(500).send({ error: "Summary fetch unsuccessful" });
  }
};

export const createTransaction = async (
  request: FastifyRequest<CreateTransactionRequestData>,
  reply: FastifyReply
) => {
  const { userId } = request.user;
  const file = await request.file();
  const fields = file?.fields as unknown as {
    [key in keyof TransactionBodyData]: { value: TransactionBodyData[key] };
  };

  let params;
  let command;
  let imageName;
  const db = request.server.mongo.db;
  const filter = new Filter();

  try {
    if (file) {
      imageName = `${uuid()}-${file.filename}`;
      const buffer = await file.toBuffer();
      params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageName,
        Body: buffer,
        ContentType: file.mimetype,
      };

      command = new PutObjectCommand(params);

      await request.server.s3.send(command);
    }

    if (!db) {
      return reply.status(500).send({ error: "Database not available" });
    }

    const transactionData = {
      type: fields.type.value,
      amount: Number(fields.amount.value),
      category: fields.category.value,
      note: filter.clean(fields.note?.value || ""),
      date: new Date(fields.date.value),
      month: Number(fields.month.value),
      year: Number(fields.year.value),
      account: new ObjectId(fields.account.value),
      imageName: imageName,
      createdBy: new ObjectId(userId),
    };

    const result = await db
      .collection("transactions")
      .insertOne(transactionData);

    return reply
      .status(201)
      .send({ transaction: result, message: "Inserted new transaction" });
  } catch (error) {
    console.log(error);

    return reply.status(500).send({ error: "Transaction added unsuccessful" });
  }
};
