import React from "react";
import { Column as ColumnType, ColumnRow as ColRowType } from "@/data";
import ColumnRow from "@components/columnRow";
import Droppable from "../dnd/droppable";
import { ulid } from "ulid";

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

  const droppableData = {
    accepts: ["colRow"],
    type: "column",
    colIndex: column.colIndex,
    rowIndex: column.parentRowIndex,
  };
  return (
    <Droppable
      data={droppableData}
      id={ulid()}
      styles={{
        ...colStyle,
      }}
    >
      {column.columnRows.map((colRow: ColRowType) => (
        <ColumnRow colRow={colRow} key={colRow.id} />
      ))}
    </Droppable>
  );
};

export default Column;
