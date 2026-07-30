import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiErrorMessage } from "@/services/api";

/** Small data-fetching hook: loading / error / data + manual refetch. */
export function useResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: { enabled?: boolean; initialData?: T } = {},
) {
  const { enabled = true, initialData } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run, ...deps]);

  return { data, loading, error, refetch: run, setData };
}

export function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface TableOptions<T> {
  searchKeys: string[];
  pageSize?: number;
}

const readPath = (obj: any, path: string) =>
  path.split(".").reduce((acc: any, key) => (acc == null ? acc : acc[key]), obj);

/** Client-side search + sort + pagination for data tables. */
export function useDataTable<T extends Record<string, any>>(
  rows: T[],
  { searchKeys, pageSize = 10 }: TableOptions<T>,
) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const debouncedQuery = useDebounced(query);

  useEffect(() => setPage(1), [debouncedQuery, size, rows.length]);

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      searchKeys.some((key) => String(readPath(row, key) ?? "").toLowerCase().includes(term)),
    );
  }, [rows, debouncedQuery, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = readPath(a, sortKey);
      const bv = readPath(b, sortKey);
      const an = Number(av);
      const bn = Number(bv);
      let result: number;
      if (Number.isFinite(an) && Number.isFinite(bn) && av !== "" && bv !== "") result = an - bn;
      else result = String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? result : -result;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * size, currentPage * size);

  const toggleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  return {
    query,
    setQuery,
    sortKey,
    sortDir,
    toggleSort,
    page: currentPage,
    setPage,
    size,
    setSize,
    totalPages,
    total: sorted.length,
    rows: pageRows,
  };
}
