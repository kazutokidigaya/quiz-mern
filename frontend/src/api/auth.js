import axios from "axios";

const API = axios.create({
  baseURL: "https://quiz-mern-dr93.vercel.app/api/auth",
});

export default API;
