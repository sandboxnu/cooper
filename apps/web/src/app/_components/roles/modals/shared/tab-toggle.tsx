interface TabToggleProps {
  activeTab: "total" | "industry";
  onChange: (tab: "total" | "industry") => void;
}

export function TabToggle({ activeTab, onChange }: TabToggleProps) {
  return (
    <div className="flex items-center gap-[6px]">
      {(["total", "industry"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`flex cursor-pointer items-center justify-center rounded-[8px] border border-black/[0.06] px-[8px] py-[4px] text-[14px] text-[rgba(0,0,0,0.7)] ${
            activeTab === tab ? "bg-cooper-gray-125" : "bg-white"
          }`}
        >
          {tab === "total" ? "Total" : "Industry"}
        </button>
      ))}
    </div>
  );
}
