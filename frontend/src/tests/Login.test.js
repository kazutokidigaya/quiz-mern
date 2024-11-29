import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "../Login";
import { useAuth } from "../../context/AuthContext";

// Mock the AuthContext
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Login Component", () => {
  let mockLogin;

  beforeEach(() => {
    mockLogin = jest.fn();
    useAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  it("renders login form correctly", () => {
    render(
      <MemoryRouter>
        <ToastContainer />
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
    expect(
      screen.getByText(/don't have an account\? sign up/i)
    ).toBeInTheDocument();
  });

  it("calls login on form submission", async () => {
    render(
      <MemoryRouter>
        <ToastContainer />
        <Login />
      </MemoryRouter>
    );

    // Input email and password
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    // Click the login button
    fireEvent.click(screen.getByText(/log in/i));

    expect(mockLogin).toHaveBeenCalled(); // Ensure login function was called
  });

  it("shows an error message if login fails", async () => {
    useAuth.mockReturnValue({
      login: jest.fn(() => {
        throw new Error("Login failed");
      }),
    });

    render(
      <MemoryRouter>
        <ToastContainer />
        <Login />
      </MemoryRouter>
    );

    // Input email and password
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpassword" },
    });

    // Click the login button
    fireEvent.click(screen.getByText(/log in/i));

    // Expect error toast to appear
    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });
});
