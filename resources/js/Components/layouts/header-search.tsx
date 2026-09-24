import Input from "@/Components/inputs/input";
import { router } from "@inertiajs/react";
import { SearchIcon } from "@/Components/icons";
import { useState, type KeyboardEvent } from "react";

type HeaderSearchProps = {
    placeholder?: string;
};

export default function HeaderSearch({ placeholder = "Search" }: HeaderSearchProps) {
    const [value, setValue] = useState(
        () => new URLSearchParams(window.location.search).get("search") ?? "",
    );

    const submit = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        delete params.page;
        if (value) params.search = value;
        else delete params.search;
        router.get(window.location.pathname, params, { preserveState: true, replace: true });
    };

    return (
        <div className="hidden w-68 md:block">
            <Input
                type="search"
                aria-label={placeholder}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={submit}
                startIcon={<SearchIcon />}
            />
        </div>
    );
}
