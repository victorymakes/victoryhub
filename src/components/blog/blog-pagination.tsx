"use client";

import { useRouter, useParams } from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface BlogPaginationProps {
    currentPage: number;
    totalPages: number;
    category: string;
}

export default function BlogPagination({
    currentPage,
    totalPages,
    category,
}: BlogPaginationProps) {
    const router = useRouter();
    const params = useParams();

    const handlePageChange = (page: number) => {
        const locale = params.locale;
        router.push(`/${locale}/blog/category/${category}/page/${page}`);
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="space-y-4">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() =>
                                currentPage > 1 &&
                                handlePageChange(currentPage - 1)
                            }
                            className={
                                currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                            }
                        />
                    </PaginationItem>

                    {/* First page */}
                    {currentPage > 3 && (
                        <>
                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => handlePageChange(1)}
                                    className="cursor-pointer"
                                >
                                    1
                                </PaginationLink>
                            </PaginationItem>
                            {currentPage > 4 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                        </>
                    )}

                    {/* Pages around current */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                            page = i + 1;
                        } else if (currentPage <= 3) {
                            page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                        } else {
                            page = currentPage - 2 + i;
                        }

                        if (page < 1 || page > totalPages) return null;
                        if (currentPage > 3 && totalPages > 5 && page === 1)
                            return null;
                        if (
                            currentPage < totalPages - 2 &&
                            totalPages > 5 &&
                            page === totalPages
                        )
                            return null;

                        return (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && totalPages > 5 && (
                        <>
                            {currentPage < totalPages - 3 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => handlePageChange(totalPages)}
                                    className="cursor-pointer"
                                >
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        </>
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                currentPage < totalPages &&
                                handlePageChange(currentPage + 1)
                            }
                            className={
                                currentPage === totalPages
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            {/* Page info */}
            <div className="text-center text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
        </div>
    );
}
