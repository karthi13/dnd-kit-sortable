import React from "react";
import { Column as ColumnType, Row as RowType } from "@/data";
import Column from "@components/column";

type Props = {
  row: RowType;
};

const Row: React.FC<Props> = ({ row }) => {
  return (
    <div key={row.id} className="row">
      {row.columns.map((column: ColumnType) => (
        <Column column={column} key={column.id}/>
      ))}
    </div>
  );
};

export default Row;
