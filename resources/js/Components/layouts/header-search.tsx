import Input from "@/Components/inputs/input";
import { router } from "@inertiajs/react";
import { SearchIcon } from "@/Components/icons";
import { useEffect, useState } from "react";

type HeaderSearchProps = {
    placeholder?: string;
};

const SEARCH_DELAY_MS = 300;

function currentSearch() {
    return new URLSearchParams(window.location.search).get("search") ?? "";
}

function search(term: string) {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    for (const key of Object.keys(params)) {
        if (key === "page" || key.endsWith("_page")) delete params[key];
    }
    if (term) params.search = term;
    else delete params.search;
    router.get(window.location.pathname, params, { preserveState: true, preserveScroll: true, replace: true });
}

export default function HeaderSearch({ placeholder = "Search" }: HeaderSearchProps) {
    const [value, setValue] = useState(currentSearch);

    useEffect(() => {
        const term = value.trim();
        if (term === currentSearch()) return;
        const timer = window.setTimeout(() => search(term), SEARCH_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [value]);

    return (
        <div className="hidden w-68 md:block">
            <Input
                type="search"
                aria-label={placeholder}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                startIcon={<SearchIcon />}
            />
        </div>
    );
}
