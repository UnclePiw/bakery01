import { DateTimePicker } from "../DateTimePicker";

export default function DateTimePickerExample() {
  const currentDate = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const handleConfirm = (date: string, time: string) => {
    console.log("Confirmed date and time:", { date, time });
  };

  const handleCancel = () => {
    console.log("Cancelled");
  };

  return (
    <div className="p-6 bg-background">
      <DateTimePicker
        currentDate={currentDate}
        currentTime={currentTime}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
