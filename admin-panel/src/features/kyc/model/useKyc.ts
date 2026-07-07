import { useMutation, useQuery } from "@tanstack/react-query";
import {
    getAllVerifications,
    getVerification,
    updateVerificationStatus
} from "./api";
import { VerificationStatus } from "./types";

export const kycKeys = {
    all: (page: number, limit: number) => [
        "kyc-verifications",
        page,
        limit,
    ],
    one: (id: string) => ["kyc-verification", id],
    my: ["my-kyc-verification"],
};

export const useKyc = (id?: string) => {
    const updateStatusMutation = useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string;
            status: VerificationStatus;
        }) => updateVerificationStatus(id, status),
    });

    const { data: verification, isLoading: isLoadingVerification } =
        useQuery({
            queryFn: () => getVerification(id!),
            queryKey: kycKeys.one(id!),
            enabled: !!id,
        });
    return {
        verification,

        isLoadingVerification,

        updateStatusMutation,
    };
};

export const useKycList = (
    page: number = 1,
    limit: number = 10,
) => {
    return useQuery({
        queryFn: () => getAllVerifications(page, limit),
        queryKey: kycKeys.all(page, limit),
    });
};