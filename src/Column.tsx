import React from "react";
import { Column as ColumnType, ColumnRow as ColRowType } from "./data";
import ColumnRow from "./ColumnRow";

type Props = {
  column: ColumnType;
};

const Column: React.FC<Props> = ({ column }) => {
  return (
    <div key={column.id} className="column">
      {column.columnRows.map((colRow: ColRowType) => (
        <ColumnRow colRow={colRow} />
      ))}
    </div>
  );
};

export default Column;
