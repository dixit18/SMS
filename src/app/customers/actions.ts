"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../lib/mongodb"
import { ObjectId } from "mongodb"
import { getSession } from "../lib/auth"

export type Customer = {
  _id?: string | ObjectId
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  organizationId: string | ObjectId
  createdAt: Date
  updatedAt: Date
}

export async function getCustomers() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("customers")

  const customers = await collection.find({ organizationId: new ObjectId(session.organizationId) }).toArray()

  return customers.map((customer) => ({
    ...customer,
    _id: customer._id.toString(),
    organizationId: customer.organizationId.toString(),
  }))
}

export async function addCustomer(data: Omit<Customer, "_id" | "organizationId" | "createdAt" | "updatedAt">) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("customers")

  const now = new Date()
  const customer = {
    ...data,
    organizationId: new ObjectId(session.organizationId),
    createdAt: now,
    updatedAt: now,
  }

  await collection.insertOne(customer)
  revalidatePath("/customers")
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("customers")

  await collection.updateOne(
    {
      _id: new ObjectId(id),
      organizationId: new ObjectId(session.organizationId),
    },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
  )
  revalidatePath("/customers")
}

export async function deleteCustomer(id: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("customers")

  await collection.deleteOne({
    _id: new ObjectId(id),
    organizationId: new ObjectId(session.organizationId),
  })
  revalidatePath("/customers")
}

