import payload from 'payload'

export const ensureCountersIndex = async (): Promise<void> => {
  const counters = payload?.db?.connection?.collection('counters')
  // It will be null during a Docker build
  if (counters != null) {
    await counters.createIndex({ name: 1 }, { unique: true })
  }
}

export const incrementCounter = async (name: string): Promise<number> => {
  const counters = payload.db.connection.collection('counters')

  const doc = await counters.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: 'after' }
  )

  return doc?.value?.value
}

export const setCounter = async (name: string, value: number) => {
  const counters = payload.db.connection.collection('counters')
  await counters.findOneAndUpdate({ name }, { $set: { value } }, { upsert: true })
}

export const clearCounter = async (name: string) => {
  const counters = payload.db.connection.collection('counters')
  await counters.deleteOne({ name })
}

export const clearCounters = async (regex: RegExp) => {
  const counters = payload.db.connection.collection('counters')
  await counters.deleteMany({
    name: { $regex: regex },
  })
}
