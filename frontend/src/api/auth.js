import axios from "axios";

const API = axios.create({
  baseURL: "https://quiz-mern-rs1j.onrender.com/api/auth",
});

export default API;
