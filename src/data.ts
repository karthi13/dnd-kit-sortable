import { ulid } from "ulid";

export type ColumnRow = {
  id: string;
  content: string;
  colRowIndex: number;
  parent: {
    colIndex: number;
    rowIndex: number;
  };
};

export type Column = {
  id: string;
  colIndex: number;
  parentRowIndex: number;
  columnRows: ColumnRow[];
};

export type Row = {
  id: string;
  columns: Column[];
  rowIndex: number;
};

export type Container = {
  id: string;
  rows: Row[];
};

export function generateContent(
  containerId: string,
  numRows: number
): Container {
  return {
    id: containerId,
    rows: Array.from({ length: numRows }, (_, rowIndex) => {
      const rowId = ulid();
      return {
        id: rowId,
        rowIndex,
        columns: Array.from({ length: 3 }, (_, colIndex) => {
          const colId = ulid();
          return {
            id: colId,
            colIndex,
            parentRowIndex: rowIndex,
            columnRows: Array.from({ length: 2 }, (_, colRowIndex) => {
              return {
                id: ulid(),
                colRowIndex,
                parent: {
                  colIndex,
                  rowIndex,
                },
                content: `Row - ${rowIndex} / Col - ${colIndex} / ColRow - ${colRowIndex}`,
              };
            }),
          };
        }),
      };
    }),
  };
}
