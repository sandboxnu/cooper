"use client";

import { useMemo, useState } from "react";

import Autocomplete from "@cooper/ui/autocomplete";

import { api } from "~/trpc/react";

interface ToolsAutocompleteProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ToolsAutocomplete({ value, onChange }: ToolsAutocompleteProps) {
  const [search, setSearch] = useState("");

  const { data: commonTools = [] } = api.tool.getCommon.useQuery();

  const baseOptions = useMemo(
    () => commonTools.map((t) => ({ value: t.name, label: t.name })),
    [commonTools],
  );

  const displayOptions = useMemo(() => {
    // Always include selected custom values (not in baseOptions) so chips stay visible
    const customSelected = value
      .filter((v) => !baseOptions.some((opt) => opt.value === v))
      .map((v) => ({ value: v, label: v }));

    const base = [...baseOptions, ...customSelected];

    const trimmed = search.trim();
    if (!trimmed) return base;

    const alreadyExists = base.some(
      (opt) => opt.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (alreadyExists) return base;

    return [...base, { value: trimmed, label: trimmed }];
  }, [search, baseOptions, value]);

  return (
    <Autocomplete
      options={displayOptions}
      placeholder="Select"
      value={value}
      onChange={onChange}
      onSearchChange={setSearch}
    />
  );
}
