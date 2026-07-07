
import { api } from "@/shared/http";
import { VerificationStatus } from "./types";

export const createVerification = async (formData: FormData) => {
  const res = await api.post("/kyc", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getAllVerifications = async (
  page: number = 1,
  limit: number = 10,
) => {
  const res = await api.get("/kyc", {
    params: {
      page,
      limit,
    },
  });

  return res.data;
};

export const getVerification = async (id: string) => {
  if (!id) return;

  const res = await api.get(`/kyc/${id}`);
  return res.data;
};

export const updateVerificationStatus = async (
  id: string,
  status: VerificationStatus,
) => {
  const res = await api.patch(`/kyc/${id}/status`, {
    status,
  });

  return res.data;
};