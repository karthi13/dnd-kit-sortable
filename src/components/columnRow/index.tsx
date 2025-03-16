import React from "react";
import { ColumnRow as ColRowType } from "@/data";
import SortableItem from "../dnd/sortableItem";
import { useSortable } from "@dnd-kit/sortable";

type Props = {
  colRow: ColRowType;
};

const ColumnRow: React.FC<Props> = ({ colRow }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: colRow.id,
      data: {
        type: "colRow",
        id: colRow.id,
        parent: colRow.parent,
        accepts: ["colRow"],
      },
    });

  const columnRowStyle = {
    padding: "5px",
    border: "1px solid #999",
    margin: "5px 0",
    backgroundColor: "lightsalmon",
    color: "black",
  };

  return (
    <SortableItem
      ref={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      styles={{ ...columnRowStyle }}
      transform={transform}
      transition={transition}
    >
      {colRow.content}
    </SortableItem>
  );
};

export default ColumnRow;
