import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../../components/ui/avatar";
import { Card, CardContent } from "../../../../../components/ui/card";
import {Pagination} from "../../../../../components/ui/pagination";
import type { RepledgeWithDetails } from "../../../../../hooks/useRepledgeDataDetails";

interface RepledgesSectionProps {
  data?: RepledgeWithDetails[]; // optional, defaults to []
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const RepledgesSection: React.FC<RepledgesSectionProps> = ({
  data = [], // ✅ default empty array
  loading,
  error,
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
}) => {
  const navigate = useNavigate();

  const formatAmount = (amount: number | null) => {
    if (!amount) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleRowClick = (loanId: string) => {
    navigate(`/view-repledge/${loanId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 text-sm">Loading repledge entries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-600 text-center">
          <p className="font-medium">Error loading repledge data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[url(/background-1.png)] bg-cover bg-[50%_50%] flex flex-col min-h-0">
      <div className="flex-1">
        <Card className="w-full bg-transparent border-0">
          <CardContent className="p-0">
            {/* Table header */}
            <div className="bg-[#f7f9fb] border border-solid border-[#f4f7fa] px-2 sm:px-3 py-2">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 text-[6px] sm:text-[7.9px] [font-family:'Inter',Helvetica] font-light text-[#9aa3b6]">
                <div className="col-span-2 sm:col-span-1">Customer</div>
                <div className="hidden sm:block">Bank</div>
                <div className="font-normal text-[#9ea6b7]">Re.no</div>
                <div className="font-light text-[#9ba3b6]">AMOUNT</div>
                <div className="text-right font-light">STATUS</div>
              </div>
            </div>

            <img
              className="w-full h-[2px] sm:h-[3px] object-cover"
              alt="Background"
              src="/background-5.png"
            />

            {/* Table body */}
            <div className="divide-y divide-slate-200 max-h-[calc(100vh-200px)] sm:max-h-none overflow-y-auto">
              {data.length === 0 ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <p className="text-gray-500 text-xs sm:text-sm">
                    No repledge entries found
                  </p>
                </div>
              ) : (
                data.map((item) => (
                  <div
                    key={item.id} // keep repledge id as React key
                    onClick={() => handleRowClick(item.loan_id)} // ✅ loan_id goes to route
                    className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 items-center py-2 sm:py-3 px-2 sm:px-3 cursor-pointer hover:bg-gray-50 transition-colors min-h-[48px] sm:min-h-auto"
                  >
                    {/* Customer info */}
                    <div className="flex items-center gap-2 sm:gap-3 col-span-2 sm:col-span-1">
                      <Avatar className="w-6 h-6 sm:w-[30px] sm:h-[30px] flex-shrink-0">
                        <AvatarImage
                          src={item.customer_photo || undefined}
                          alt={item.customer_name || "Customer"}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-[8px] sm:text-xs">
                          {item.customer_name?.charAt(0).toUpperCase() || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="[font-family:'Inter',Helvetica] font-normal text-[#6b6c86] text-[8px] sm:text-[9.8px] truncate">
                          {item.customer_name || "Unknown"}
                        </div>
                        <div className="[font-family:'Inter',Helvetica] font-light text-[#a1a9bc] text-[7px] sm:text-[8.4px] truncate">
                          {item.customer_mobile || formatDate(item.created_at)}
                        </div>
                        <div className="[font-family:'Inter',Helvetica] font-light text-[#a1a9bc] text-[7px] sm:text-[8.4px] sm:hidden">
                          {item.bank_name || "N/A"}
                        </div>
                        <div className="[font-family:'Inter',Helvetica] font-light text-[#a1a9bc] text-[7px] sm:text-[8.4px] hidden sm:block">
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Bank */}
                    <div className="[font-family:'Inter',Helvetica] font-normal text-[#6b6c86] text-[8px] sm:text-[9.8px] text-center hidden sm:block">
                      {item.bank_name || "N/A"}
                    </div>

                    {/* Re.no */}
                    <div className="[font-family:'Inter',Helvetica] font-light text-[#8a8fa2] text-[8px] sm:text-[9.8px] truncate">
                      {item.re_no || item.loan_no || "N/A"}
                    </div>

                    {/* Amount */}
                    <div className="[font-family:'Inter',Helvetica] font-normal text-[#787e92] text-[8px] sm:text-[9.3px] truncate">
                      {formatAmount(item.amount)}
                    </div>

                    {/* Status */}
                    <div className="flex justify-end">
                      <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] bg-[url(/background-6.png)] bg-cover bg-[50%_50%] flex items-center justify-center">
                        <span className="[font-family:'Inter',Helvetica] font-medium text-[#568b6e] text-[7px] sm:text-[9.6px]">
                          A
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 py-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
