import { Table } from "@tanstack/react-table";
import
    {
        ChevronLeft,
        ChevronRight,
        ChevronsLeft,
        ChevronsRight,
    } from "lucide-react";
import
    {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
    } from "../ui/select";
import { Button } from "../ui/button";

interface DataTablePaginationProps<TData>
{
    table: Table<TData>;
    totalRows?: number;
    isServerSide?: boolean;
}

export function DataTablePagination<TData>({
    table,
    totalRows,
    isServerSide = false,
}: DataTablePaginationProps<TData>)
{
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageSize = table.getState().pagination.pageSize;
    const totalPages = table.getPageCount();

    const getDisplayValues = () =>
    {
        if (isServerSide && totalRows !== undefined)
        {
            // Server-side: calculate exact row range from pagination state
            const startRow = (currentPage - 1) * pageSize + 1;
            const endRow = Math.min(currentPage * pageSize, totalRows);
            // Guard against empty result set
            const showingStr =
                totalRows === 0 ? "0" : `${startRow}–${endRow} of ${totalRows.toLocaleString()}`;
            return {
                showing: showingStr,
                selectedInfo: `${table.getFilteredSelectedRowModel().rows.length} row(s) selected`,
            };
        } else
        {
            // Client-side: all rows are loaded; show visible range
            const filteredRows = table.getFilteredRowModel().rows.length;
            const startRow =
                filteredRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
            const endRow = Math.min(currentPage * pageSize, filteredRows);
            return {
                showing:
                    filteredRows === 0
                        ? "0"
                        : `${startRow}–${endRow} of ${filteredRows.toLocaleString()}`,
                selectedInfo: `${table.getFilteredSelectedRowModel().rows.length} of ${filteredRows} row(s) selected`,
            };
        }
    };

    const { showing, selectedInfo } = getDisplayValues();

    // Safe last-page index — guard against totalPages being 0 or -1
    const lastPageIndex =
        totalPages > 0 ? totalPages - 1 : 0;
    const canGoLast =
        table.getCanNextPage() && totalPages > 0 && totalPages !== -1;

    return (
        <div className="flex items-center justify-between px-2">
            {/* ── Left: row info ── */}
            <div className="text-muted-foreground flex-1 text-sm">
                <div className="flex flex-col gap-1">
                    <span>Showing {showing} rows</span>
                    <span className="text-xs">{selectedInfo}</span>
                </div>
            </div>

            {/* ── Right: controls ── */}
            <div className="flex items-center space-x-6 lg:space-x-8">
                {/* Rows per page */}
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 25, 30, 40, 50, 100].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Page counter */}
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages <= 0 ? "…" : totalPages}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        title="Go to first page"
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        title="Go to previous page"
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        title="Go to next page"
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(lastPageIndex)}
                        disabled={!canGoLast}
                        title="Go to last page"
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}