import React from "react";
import { Column as ColumnType, ColumnRow as ColRowType } from "@/data";
import ColumnRow from "@components/columnRow";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDropContext } from "@/contexts/DropContext";

type Props = {
  column: ColumnType;
};

const Column: React.FC<Props> = ({ column }) => {
  const colStyle = {
    flex: 1,
    gap: "20px",
    border: "1px solid #999",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "lightgreen",
  };

  return (
    <SortableContext
      items={column.columnRows}
      strategy={verticalListSortingStrategy}
    >
      <div style={{ ...colStyle }}>
        {column.columnRows.map((colRow: ColRowType) => (
          <ColumnRow colRow={colRow} key={colRow.id} />
        ))}
      </div>
    </SortableContext>
  );
};

export default Column;
