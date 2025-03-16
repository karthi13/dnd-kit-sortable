import React from "react";
import { Column as ColumnType, Row as RowType } from "@/data";
import Column from "@components/column";
import { useSortable } from "@dnd-kit/sortable";
import SortableItem from "../dnd/sortableItem";

type Props = {
  row: RowType;
};

const Row: React.FC<Props> = ({ row }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: row.id,
      data: {
        type: "row",
        id: row.id,
        accepts: ["row"],
      },
    });

  return (
    <SortableItem
      ref={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      transform={transform}
      transition={transition}
    >
      <div className="row">
        {row.columns.map((column: ColumnType) => (
          <Column column={column} key={column.id} />
        ))}
      </div>
    </SortableItem>
  );
};

export default Row;
