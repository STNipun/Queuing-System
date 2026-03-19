"use client"

import { Table } from "@tanstack/react-table";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Filter, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";


interface DataTableFilterProps<TData>
{
    table: Table<TData>;
    filterColumn?: string;
    dropdownColumn?: string;
    dropdownOptions?: string[] | undefined;
}

export function DataTableFilter<TData>({
    table,
    filterColumn,
    dropdownColumn,
    dropdownOptions
}: DataTableFilterProps<TData>)
{
    const [search, setSearch] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    const handleSearchChange = (value: string) =>
    {
        setSearch(value);
        if (filterColumn)
        {
            table.getColumn(filterColumn)?.setFilterValue(value || undefined);
        }
    };

    const handleDropdownChange = (value: string | null) =>
    {
        setSelectedFilter(value);
        if (dropdownColumn)
        {
            table.getColumn(dropdownColumn)?.setFilterValue(value || undefined);
        }
    };

    return (
        <div className="flex gap-2 w-auto md:w-150">
            {filterColumn && (
                <div className="flex items-center gap-1">
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-auto bg-gray-100 focus-within:bg-white"
                    />
                    {search && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleSearchChange("")}
                            className="shrink-0"
                            title="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}

            {dropdownColumn && dropdownOptions && dropdownOptions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            {selectedFilter || "Filter"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {dropdownOptions.map((option) => (
                            <DropdownMenuItem
                                key={option}
                                onClick={() => handleDropdownChange(selectedFilter === option ? null : option)}
                            >
                                {option}
                            </DropdownMenuItem>
                        ))}
                        {selectedFilter && (
                            <DropdownMenuItem
                                onClick={() => handleDropdownChange(null)}
                                className="text-red-500"
                            >
                                Clear Filter
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

        </div>
    )
}