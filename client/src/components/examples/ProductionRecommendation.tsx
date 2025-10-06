import { ProductionRecommendation } from "../ProductionRecommendation";

export default function ProductionRecommendationExample() {
  const mockItems = [
    {
      id: "1",
      name: "ครัวซองต์",
      currentStock: 15,
      forecastDemand: 45,
      suggestedProduction: 35,
      ingredientsAvailable: true,
      shelfLifeHours: 8,
    },
    {
      id: "2",
      name: "เดนิช",
      currentStock: 8,
      forecastDemand: 30,
      suggestedProduction: 25,
      ingredientsAvailable: true,
      shelfLifeHours: 12,
    },
    {
      id: "3",
      name: "บัตเตอร์เค้ก",
      currentStock: 20,
      forecastDemand: 28,
      suggestedProduction: 10,
      ingredientsAvailable: false,
      shelfLifeHours: 24,
    },
  ];

  const handleStartProduction = (plan: any[]) => {
    console.log("Starting production:", plan);
  };

  return (
    <div className="p-6 bg-background">
      <ProductionRecommendation items={mockItems} onStartProduction={handleStartProduction} />
    </div>
  );
}
