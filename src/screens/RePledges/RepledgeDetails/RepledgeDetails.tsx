import React, { useState } from "react";
import { useRepledgeData } from "../../../hooks/useRepledgeDataDetails";
import { Pagination } from "../../../components/ui/pagination";
import { RepledgesSection } from "./sections/RepledgesSection/RepledgesSection";
import { SearchAndPaginationSection } from "./sections/SearchAndPaginationSection/SearchAndPaginationSection";

export const RepledgeDetails = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data, loading, error, totalCount } = useRepledgeData(searchTerm, currentPage, itemsPerPage)
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="bg-transparent flex flex-col items-center w-full min-h-screen px-2 sm:px-4 lg:px-6">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl flex flex-col">
        <div className="relative w-full bg-[url(/background.png)] bg-cover bg-[50%_50%] min-h-screen sm:min-h-[763px] flex flex-col rounded-none sm:rounded-lg overflow-hidden">
          <SearchAndPaginationSection 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            totalCount={totalCount}
          />
          <div className="flex-1">
            <RepledgesSection 
              data={data}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
          {totalPages > 1 && (
            <div className="mt-auto bg-white">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
