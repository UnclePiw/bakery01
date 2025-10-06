import { ForecastChart } from "../ForecastChart";

export default function ForecastChartExample() {
  const mockData = [
    { hour: "08:00", predicted: 45, actual: 42 },
    { hour: "09:00", predicted: 65, actual: 68 },
    { hour: "10:00", predicted: 85, actual: 82 },
    { hour: "11:00", predicted: 95, actual: 90 },
    { hour: "12:00", predicted: 120, actual: 115 },
    { hour: "13:00", predicted: 100, actual: 105 },
    { hour: "14:00", predicted: 75 },
    { hour: "15:00", predicted: 60 },
    { hour: "16:00", predicted: 80 },
    { hour: "17:00", predicted: 95 },
    { hour: "18:00", predicted: 70 },
  ];

  return (
    <div className="p-6 bg-background">
      <ForecastChart data={mockData} currentHour="14:00" />
    </div>
  );
}
