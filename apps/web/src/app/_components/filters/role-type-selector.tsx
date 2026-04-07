import { Chip } from "@cooper/ui/chip";

interface RoleTypeSelectorProps {
  onSelectedTypeChange: (t: "roles" | "companies" | "all") => void;
  selectedType: "roles" | "companies" | "all";
}

// Component for selecting role type: All, Jobs, Companies
export default function RoleTypeSelector({
  onSelectedTypeChange,
  selectedType,
}: RoleTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      <Chip
        label={`All`}
        onClick={() => onSelectedTypeChange("all")}
        selected={selectedType === "all"}
      />
      <Chip
        onClick={() =>
          onSelectedTypeChange(selectedType === "roles" ? "all" : "roles")
        }
        label={`Jobs`}
        selected={selectedType === "roles"}
      />
      <Chip
        onClick={() =>
          onSelectedTypeChange(
            selectedType === "companies" ? "all" : "companies",
          )
        }
        label={`Companies`}
        selected={selectedType === "companies"}
      />
    </div>
  );
}
