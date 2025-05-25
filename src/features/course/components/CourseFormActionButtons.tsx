import { Button } from "@/components/ui/button";

interface CourseFormActionButtonsProps {
  activeTab: string;
  isEditMode: boolean;
  onNext: () => void;
  onSubmit: () => void;
}

export default function CourseFormActionButtons({
  activeTab,
  isEditMode,
  onNext,
  onSubmit
}: CourseFormActionButtonsProps) {
  return (
    <div className="flex justify-end">
      <div className="space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onNext}
        >
          {activeTab === "preview" ? (isEditMode ? "Save Changes" : "Submit Course") : "Next Step"}
        </Button>
        {activeTab === "preview" && (
          <Button type="button" onClick={onSubmit}>
            {isEditMode ? "Update Course" : "Save Course"}
          </Button>
        )}
      </div>
    </div>
  );
} 
