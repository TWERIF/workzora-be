import type { Verification } from "@/features/kyc/model/types";
import { useKycList } from "@/features/kyc/model/useKyc";
import KycList from "@/features/kyc/ui/KycList";
import KycPage from "@/features/kyc/ui/KycPage";
import { useState } from "react";


export default function AdminKyc() {
    const [page, setPage] = useState(1);

    const [selectedVerification, setSelectedVerification] =
        useState<Verification | null>(null);

    const { data, isLoading } = useKycList(page, 10);

    if (isLoading) {
        return (
            <div className="p-6">
                Завантаження...
            </div>
        );
    }

    return (
        <div className="px-4 md:px-[5%] lg:px-[10%] py-4 md:py-[1%] h-[calc(100vh-100px)] grid grid-cols-[380px_1fr] border rounded-lg overflow-hidden">
            <KycList
                verifications={data?.items ?? []}
                selectedId={selectedVerification?.id}
                onSelect={setSelectedVerification}
                page={page}
                total={data?.total ?? 0}
                limit={10}
                onPageChange={setPage}
            />

            <KycPage
                verificationId={
                    selectedVerification?.id
                }
            />
        </div>
    );
}