import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Calendar } from "lucide-react";
import { useState } from "react";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface IngredientEntry {
  ingredientId: string;
  quantity: number;
  expiryDate?: string;
  batchNumber?: string;
}

interface IngredientEntryFormProps {
  ingredients: Ingredient[];
  onSubmit: (entries: IngredientEntry[], type: "yesterday" | "today") => void;
}

export function IngredientEntryForm({ ingredients, onSubmit }: IngredientEntryFormProps) {
  const [yesterdayEntries, setYesterdayEntries] = useState<IngredientEntry[]>([]);
  const [todayEntries, setTodayEntries] = useState<IngredientEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<"yesterday" | "today">("yesterday");

  const addEntry = (type: "yesterday" | "today") => {
    const newEntry: IngredientEntry = {
      ingredientId: "",
      quantity: 0,
      expiryDate: "",
      batchNumber: "",
    };
    if (type === "yesterday") {
      setYesterdayEntries([...yesterdayEntries, newEntry]);
    } else {
      setTodayEntries([...todayEntries, newEntry]);
    }
  };

  const updateEntry = (
    type: "yesterday" | "today",
    index: number,
    field: keyof IngredientEntry,
    value: string | number
  ) => {
    const entries = type === "yesterday" ? yesterdayEntries : todayEntries;
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    type === "yesterday" ? setYesterdayEntries(updated) : setTodayEntries(updated);
  };

  const removeEntry = (type: "yesterday" | "today", index: number) => {
    const entries = type === "yesterday" ? yesterdayEntries : todayEntries;
    const filtered = entries.filter((_, i) => i !== index);
    type === "yesterday" ? setYesterdayEntries(filtered) : setTodayEntries(filtered);
  };

  const handleSubmit = () => {
    const entries = selectedTab === "yesterday" ? yesterdayEntries : todayEntries;
    onSubmit(entries, selectedTab);
  };

  const renderEntryFields = (type: "yesterday" | "today") => {
    const entries = type === "yesterday" ? yesterdayEntries : todayEntries;

    return (
      <div className="space-y-4">
        {entries.map((entry, index) => {
          const selectedIngredient = ingredients.find((i) => i.id === entry.ingredientId);
          return (
            <div key={index} className="p-4 border rounded-md space-y-3" data-testid={`ingredient-entry-${index}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>วัตถุดิบ</Label>
                  <Select
                    value={entry.ingredientId}
                    onValueChange={(value) => updateEntry(type, index, "ingredientId", value)}
                  >
                    <SelectTrigger data-testid={`select-ingredient-${index}`}>
                      <SelectValue placeholder="เลือกวัตถุดิบ" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>จำนวน {selectedIngredient && `(${selectedIngredient.unit})`}</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateEntry(type, index, "quantity", Math.max(0, entry.quantity - 1))}
                      data-testid={`button-decrease-${index}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={entry.quantity}
                      onChange={(e) => updateEntry(type, index, "quantity", parseFloat(e.target.value) || 0)}
                      className="text-center font-mono"
                      data-testid={`input-quantity-${index}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateEntry(type, index, "quantity", entry.quantity + 1)}
                      data-testid={`button-increase-${index}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>วันหมดอายุ</Label>
                  <Input
                    type="date"
                    value={entry.expiryDate || ""}
                    onChange={(e) => updateEntry(type, index, "expiryDate", e.target.value)}
                    data-testid={`input-expiry-${index}`}
                  />
                </div>
                <div>
                  <Label>เลขแบตช์ (ถ้ามี)</Label>
                  <Input
                    value={entry.batchNumber}
                    onChange={(e) => updateEntry(type, index, "batchNumber", e.target.value)}
                    placeholder="เช่น BATCH-001"
                    data-testid={`input-batch-${index}`}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEntry(type, index)}
                className="w-full"
                data-testid={`button-remove-${index}`}
              >
                ลบรายการ
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          onClick={() => addEntry(type)}
          className="w-full"
          data-testid={`button-add-entry-${type}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มวัตถุดิบ
        </Button>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">บันทึกวัตถุดิบ</h3>
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "yesterday" | "today")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="yesterday" data-testid="tab-yesterday">
            วัตถุดิบคงเหลือจากเมื่อวาน
          </TabsTrigger>
          <TabsTrigger value="today" data-testid="tab-today">
            วัตถุดิบที่รับวันนี้
          </TabsTrigger>
        </TabsList>
        <TabsContent value="yesterday" className="mt-4">
          {renderEntryFields("yesterday")}
        </TabsContent>
        <TabsContent value="today" className="mt-4">
          {renderEntryFields("today")}
        </TabsContent>
      </Tabs>
      <div className="mt-6 pt-6 border-t">
        <Button onClick={handleSubmit} className="w-full" data-testid="button-submit-entry">
          บันทึกข้อมูล
        </Button>
      </div>
    </Card>
  );
}
