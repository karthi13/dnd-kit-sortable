import React from "react";
import { Column as ColumnType, Row as RowType } from "@/data";
import Column from "@components/column";
import { useSortable } from "@dnd-kit/sortable";
import SortableItem from "../dnd/sortableItem";

type Props = {
  row: RowType;
  dragging?: boolean;
};

const Row: React.FC<Props> = ({ row, dragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    data: {
      type: "row",
      id: row.id,
      accepts: ["row"],
    },
  });

  const rowStyles = {
    display: "flex",
    gap: "10px",
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "yellow",
    opacity: "0",
  };

  const rowDraggingStyles = {
    display: "flex",
    gap: "10px",
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "lightyellow",
  };

  return (
    <SortableItem
      ref={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      transform={transform}
      transition={transition}
    >
      <div style={isDragging ? rowStyles : rowDraggingStyles}>
        {row.columns.map((column: ColumnType) => (
          <Column column={column} key={column.id} />
        ))}
      </div>
    </SortableItem>
  );
};

export default Row;
