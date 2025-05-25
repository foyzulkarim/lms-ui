interface CourseNavTabsProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  tabOptions?: string[];
}

export default function CourseNavTabs({ activeTab, onChangeTab, tabOptions = ["details", "curriculum", "preview"] }: CourseNavTabsProps) {
  const tabLabels: Record<string, string> = {
    details: "Course Details",
    curriculum: "Curriculum",
    preview: "Preview"
  };

  return (
    <div className="flex space-x-1 rounded-lg bg-slate-100 p-1">
      {tabOptions.map(tab => (
        <button
          key={tab}
          className={`flex-1 rounded-md px-3 py-2 text-sm ${
            activeTab === tab
              ? "bg-white shadow"
              : "text-slate-600 hover:text-slate-900"
          }`}
          onClick={() => onChangeTab(tab)}
        >
          {tabLabels[tab]}
        </button>
      ))}
    </div>
  );
} 
