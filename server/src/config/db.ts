import mongoose from "mongoose";

export const connectDb = async (mongoUri: string) => {
  await mongoose.connect(mongoUri);
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
};
