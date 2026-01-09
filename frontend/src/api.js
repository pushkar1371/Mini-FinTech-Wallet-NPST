import axios from "axios";

export const API_BASE = "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

export async function getConfig() {
  const { data } = await api.get("/config");
  return data;
}

export async function getUsers() {
  const { data } = await api.get("/users");
  return data;
}

export async function getTransactions(params = {}) {
  const { data } = await api.get("/transactions", { params });
  return data;
}

export async function createTransaction(payload) {
  const { data } = await api.post("/transactions", payload);
  return data;
}

export async function patchTransaction(id, payload) {
  const { data } = await api.patch(`/transactions/${id}`, payload);
  return data;
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${id}`);
}
