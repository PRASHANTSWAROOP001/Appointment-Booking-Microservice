import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import logger from "../utils/logger";

const prisma = new PrismaClient();

export const searchAllServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      category,
      city,
      state,
      minPrice,
      maxPrice,
      page = "1",
      limit = "10",
      sortBy = "price",
      order = "asc",
    } = req.query;

    const newPageNo = typeof page === "string" ? parseInt(page) : 1;
    const take = typeof limit === "string" ? parseInt(limit) : 10;
    const skip = typeof page === "string" ? (parseInt(page) - 1) * take : 0;

    const filters = {
      ...(title && {
        title: {
          contains: title as string,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(minPrice &&
        maxPrice && {
          price: {
            gte: parseFloat(minPrice as string),
            lte: parseFloat(maxPrice as string),
          },
        }),
      Shop: {
        ...(category && {
          category: {
            equals: category as string,
            mode: Prisma.QueryMode.insensitive,
          },
        }),
        Location: {
          ...(city && {
            city: {
              equals: city as string,
              mode: Prisma.QueryMode.insensitive,
            },
          }),
          ...(state && {
            state: {
              equals: state as string,
              mode: Prisma.QueryMode.insensitive,
            },
          }),
        },
      },
    };

    // Get total count for pagination
    const totalItems = await prisma.service.count({ where: filters });

    // Get paginated results

  const validSortFields = ['price', 'title', 'duration'];

   const sortField = validSortFields.includes(sortBy as string)
  ? sortBy
  : 'price';

    const services = await prisma.service.findMany({
      where: filters,
      orderBy: {
           [sortField as string]: order === "desc" ? "desc" : "asc"
      },
      skip,
      take,
      include: {
        Shop: {
          include: {
            Location: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / take);
    const currentPage = newPageNo;

    res.status(200).json({
      success: true,
      data: services,
      meta: {
        totalItems,
        totalPages,
        currentPage,
        pageSize: take,
      },
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

