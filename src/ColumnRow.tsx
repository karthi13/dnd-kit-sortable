import React from "react";
import { ColumnRow as ColRowType } from "./data";
import "./App.css";

type Props = {
  colRow: ColRowType;
};

const ColumnRow: React.FC<Props> = ({ colRow }) => {
  return (
    <div key={colRow.id} className="column-row">
      {colRow.content}
    </div>
  );
};

export default ColumnRow;
