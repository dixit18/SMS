"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../lib/mongodb"
import { ObjectId } from "mongodb"

export type Product = {
  _id?: string | ObjectId
  name: string
  sku: string
  description: string
  price: number
  quantity: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  unit: string
  category: string
  createdAt: Date
  updatedAt: Date
}

export async function getProducts() {
  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("products")
  const products = await collection.find({}).toArray()
  return products.map((product) => ({
    ...product,
    _id: product._id.toString(),
  }))
}

export async function addProduct(data: Omit<Product, "_id" | "createdAt" | "updatedAt">) {
  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("products")

  const now = new Date()
  const product = {
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  await collection.insertOne(product)
  revalidatePath("/products")
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("products")

  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
  )
  revalidatePath("/products")
}

export async function deleteProduct(id: string) {
  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("products")

  await collection.deleteOne({ _id: new ObjectId(id) })
  revalidatePath("/products")
}

export async function updateStock(id: string, quantity: number) {
  const client = await clientPromise
  const collection = client.db("stockmanagement").collection("products")

  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $inc: { quantity },
      $set: { updatedAt: new Date() },
    },
  )
  revalidatePath("/products")
}

