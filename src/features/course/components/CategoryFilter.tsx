import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onChange: (categoryId: number | null) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategoryId, 
  onChange 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        key="all"
        variant={selectedCategoryId === null ? "default" : "outline"}
        className={selectedCategoryId === null ? "category-pill-active" : "category-pill-inactive"}
        onClick={() => onChange(null)}
      >
        All Courses
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? "default" : "outline"}
          className={selectedCategoryId === category.id ? "category-pill-active" : "category-pill-inactive"}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
