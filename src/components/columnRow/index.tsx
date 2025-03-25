import React from "react";
import { ColumnRow as ColRowType } from "@/data";
import SortableItem from "../dnd/sortableItem";
import { useSortable } from "@dnd-kit/sortable";

type Props = {
  colRow: ColRowType;
  dragging?: boolean;
};

const ColumnRow: React.FC<Props> = ({ colRow, dragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: colRow.id,
    data: {
      type: "colRow",
      id: colRow.id,
      parent: { ...colRow.parent, colRowIndex: colRow.colRowIndex },
      accepts: ["colRow"],
    },
  });

  const columnRowStyle = {
    padding: "5px",
    border: "1px solid #999",
    margin: "5px 0",
    backgroundColor: "lightblue",
    color: "black",
    opacity: "0",
  };

  const draggingStyle = {
    padding: "5px",
    border: "1px solid #999",
    margin: "5px 0",
    backgroundColor: dragging ? "lightsalmon" : "purple",
    color: dragging ? "green" : "voilet",
  };

  const spacer = colRow.id.includes("-spacer");

  return spacer ? (
    <div className="spacer"></div>
  ) : (
    <SortableItem
      ref={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      styles={isDragging ? columnRowStyle : draggingStyle}
      transform={transform}
      transition={transition}
    >
      {colRow.content}
    </SortableItem>
  );
};

export default ColumnRow;
