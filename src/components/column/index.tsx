import React from "react";
import { Column as ColumnType, ColumnRow as ColRowType } from "@/data";
import ColumnRow from "@components/columnRow";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  column: ColumnType;
};

const Column: React.FC<Props> = ({ column }) => {
  const { listeners, setNodeRef, transform, transition } = useDroppable({
    id: column.id,
    data: {
      parent: null,
      isContainer: true,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    flex: 1,
  };

  const colStyle = {
    gap: "20px",
    border: "1px solid #999",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "lightgreen",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners}>
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
    </div>
  );
};

export default Column;
