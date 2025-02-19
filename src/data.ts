export type ColumnRow = {
  id: string;
  content: string;
};

export type Column = {
  id: string;
  columnRows: ColumnRow[];
};

export type Row = {
  id: string;
  columns: Column[];
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
    rows: Array.from({ length: numRows }, (_, rowIndex) => ({
      id: `row-${rowIndex + 1}`,
      columns: Array.from({ length: 3 }, (_, colIndex) => ({
        id: `col-${rowIndex + 1}-${colIndex + 1}`,
        columnRows: Array.from({ length: 2 }, (_, colRowIndex) => ({
          id: `col-row-${rowIndex + 1}-${colIndex + 1}-${colRowIndex + 1}`,
          content: `Column Row ${colRowIndex + 1}`,
        })),
      })),
    })),
  };
}
