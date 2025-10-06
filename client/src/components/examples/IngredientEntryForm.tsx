import { IngredientEntryForm } from "../IngredientEntryForm";

export default function IngredientEntryFormExample() {
  const mockIngredients = [
    { id: "1", name: "แป้งขนมปัง", unit: "กก." },
    { id: "2", name: "นมสด", unit: "ลิตร" },
    { id: "3", name: "เนยสด", unit: "กก." },
    { id: "4", name: "ไข่ไก่", unit: "ฟอง" },
    { id: "5", name: "น้ำตาล", unit: "กก." },
    { id: "6", name: "เกลือ", unit: "กรัม" },
  ];

  const handleSubmit = (entries: any[], type: "yesterday" | "today") => {
    console.log(`Submitting ${type} entries:`, entries);
  };

  return (
    <div className="p-6 bg-background">
      <IngredientEntryForm ingredients={mockIngredients} onSubmit={handleSubmit} />
    </div>
  );
}
