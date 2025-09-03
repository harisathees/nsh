import { UsersIcon } from "lucide-react";
import React from "react";
import { Badge } from "../../../../../components/ui/badge";
import { SearchBar } from "../../../../../components/ui/SearchBar";

interface SearchAndPaginationSectionProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  totalCount: number
}

export const SearchAndPaginationSection: React.FC<SearchAndPaginationSectionProps> = ({
  searchTerm,
  onSearchChange,
  totalCount
}) => {
  return (
    <div className="relative w-full">
      <img
        className="absolute w-full h-[3px] top-[53px] left-0 object-cover hidden sm:block"
        alt="Background"
        src="/background-7.png"
      />

      <div className="flex items-center gap-2 sm:gap-4 pt-4 sm:pt-[17px] px-3 sm:px-3 mb-4">
        <UsersIcon className="w-[18px] h-3.5 text-[#474d62]" />

        <h2 className="[font-family:'Inter',Helvetica] font-bold text-[#474d62] text-sm sm:text-[16.2px] tracking-[0] leading-[normal] whitespace-nowrap">
          Repledges
        </h2>

        <Badge
          variant="secondary"
          className="bg-slate-200 rounded-[9.25px] px-2 sm:px-[9px] py-0.5 h-5 sm:h-[21px] flex items-center"
        >
          <span className="[font-family:'Inter',Helvetica] font-light text-[#858c9d] text-[8px] sm:text-[9.5px] tracking-[0] leading-[normal]">
            {totalCount} Repledges
          </span>
        </Badge>
      </div>
      
      <div className="px-3 mb-4">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search by name, phone, or loan no..."
        />
      </div>
    </div>
  );
};
