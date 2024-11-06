"use server";

import { connectToDatabase } from "../database";
import User from "../database/models/user.model";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

export const createUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    await connectToDatabase();
    const user = await User.create({ email, password });

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.log(error);
  }
};

export const resetPasswordLink = async ({ email }: { email: string }) => {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) throw new Error("user not found");

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.NEXT_PUBLIC_TOKEN_SECRET as string,
      { expiresIn: "10m" }
    );

    // setting up nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailSent = transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Password Reset Link",
      text: `${process.env.WEBSITE_URL}/resetpassword?token=${token}`,
    });

    return emailSent;
  } catch (error) {}
};

export const resetPassword = async ({
  id,
  password,
}: {
  id: string;
  password: string;
}) => {
  try {
    await connectToDatabase();

    const user = await User.findById(id);
    if (await bcryptjs.compare(password, user.password))
      throw new Error("password should not be repeated");

    const hashPassword = await bcryptjs.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(id, {
      password: hashPassword,
    });

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.log(error);
  }
};
