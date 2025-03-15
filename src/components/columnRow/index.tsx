import React from "react";
import { ColumnRow as ColRowType } from "@/data";
import { useDraggable } from "@dnd-kit/core";
import Draggable from "@components/dnd/draggable";

type Props = {
  colRow: ColRowType;
};

const ColumnRow: React.FC<Props> = ({ colRow }) => {
  const { listeners, setNodeRef, attributes, transform } = useDraggable({
    id: colRow.id + "-" + Math.random(),
    data: {
      type: "colRow",
      id: colRow.id + "-" + Math.random(),
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
    <Draggable
      ref={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      styles={{ ...columnRowStyle }}
      transform={transform}
    >
      {colRow.content}
    </Draggable>
  );
};

export default ColumnRow;
