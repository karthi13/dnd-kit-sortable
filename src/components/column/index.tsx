import React from "react";
import { Column as ColumnType, ColumnRow as ColRowType } from "@/data";
import ColumnRow from "@components/columnRow";

type Props = {
  column: ColumnType;
};

const Column: React.FC<Props> = ({ column }) => {
  return (
    <div className="column">
      {column.columnRows.map((colRow: ColRowType) => (
        <ColumnRow colRow={colRow} key={colRow.id} />
      ))}
    </div>
  );
};

export default Column;
