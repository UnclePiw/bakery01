import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  location?: string;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranchId: string;
  onSelect: (branchId: string) => void;
}

export function BranchSelector({ branches, selectedBranchId, onSelect }: BranchSelectorProps) {
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-5 w-5 text-muted-foreground" />
      <Select value={selectedBranchId} onValueChange={onSelect}>
        <SelectTrigger className="w-[200px]" data-testid="select-branch">
          <SelectValue placeholder="เลือกสาขา">
            {selectedBranch?.name || "เลือกสาขา"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              <div>
                <div className="font-medium">{branch.name}</div>
                {branch.location && (
                  <div className="text-xs text-muted-foreground">{branch.location}</div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
