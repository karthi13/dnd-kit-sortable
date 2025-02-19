import React from "react";
import { Column as ColumnType, Row as RowType } from "./data";
import Column from "./Column";
import "./App.css";

type Props = {
  row: RowType;
};

const Row: React.FC<Props> = ({ row }) => {
  return (
    <div key={row.id} className="row">
      {row.columns.map((column: ColumnType) => (
        <Column column={column} />
      ))}
    </div>
  );
};

export default Row;
