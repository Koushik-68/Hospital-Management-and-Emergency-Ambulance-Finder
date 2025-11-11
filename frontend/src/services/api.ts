import axios from "axios";

const API_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
});

export const getPatients = () => api.get("/patients");
export const addPatient = (data: any) => api.post("/patients", data);
