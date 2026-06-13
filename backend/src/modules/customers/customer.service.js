import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

export async function createCustomer(data, userId) {
  return prisma.customer.create({
    data: { ...data, createdBy: userId },
  });
}

export async function updateCustomer(id, data) {
  // Explicit existence check for a clear 404 message.
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Customer not found");
  }
  return prisma.customer.update({ where: { id }, data });
}

export async function listCustomers({ page, limit, search, area, sortBy, sortOrder }) {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }
  if (area) {
    where.area = { equals: area, mode: "insensitive" };
  }

  const skip = (page - 1) * limit;

  const [total, customers] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { _count: { select: { memberships: true } } },
    }),
  ]);

  return {
    data: customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function searchByPhone(phone) {
  // Capped result set — a phone lookup, not a bulk export endpoint.
  return prisma.customer.findMany({
    where: { phone: { contains: phone } },
    orderBy: { name: "asc" },
    take: 25,
  });
}

export async function getCustomerById(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { memberships: true } } },
  });
  if (!customer) {
    throw ApiError.notFound("Customer not found");
  }
  return customer;
}
