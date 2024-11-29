import { jest } from "@jest/globals";
import supertest from "supertest";
import { app } from "../server.js";
import User from "../models/User.js";

jest.setTimeout(10000); // Set global timeout to 10 seconds

describe("Authentication API Tests", () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  test("should sign up a user", async () => {
    // Send OTP
    const otpResponse = await supertest(app).post("/api/auth/send-code").send({
      email: "testuser@example.com",
    });
    expect(otpResponse.status).toBe(200);

    // Sign up user
    const signupResponse = await supertest(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
      otp: "123456",
    });

    console.log("Sign-up Response:", signupResponse.body);
    expect(signupResponse.status).toBe(200);
    expect(signupResponse.body).toHaveProperty("token");

    const user = await User.findOne({ email: "testuser@example.com" });
    expect(user).not.toBeNull();
  });

  test("should log in a user", async () => {
    const response = await supertest(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });

    console.log("Login Response:", response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
