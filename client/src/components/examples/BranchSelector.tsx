import { BranchSelector } from "../BranchSelector";
import { useState } from "react";

export default function BranchSelectorExample() {
  const [selectedBranch, setSelectedBranch] = useState("1");

  const mockBranches = [
    { id: "1", name: "สาขาสยาม", location: "สยามพารากอน" },
    { id: "2", name: "สาขาอโศก", location: "เทอมินอล 21" },
    { id: "3", name: "สาขาสีลม", location: "ซิลม คอมเพล็กซ์" },
    { id: "4", name: "สาขาเซ็นทรัล", location: "เซ็นทรัลเวิลด์" },
  ];

  return (
    <div className="p-6 bg-background">
      <BranchSelector
        branches={mockBranches}
        selectedBranchId={selectedBranch}
        onSelect={(id) => {
          setSelectedBranch(id);
          console.log("Selected branch:", id);
        }}
      />
    </div>
  );
}
