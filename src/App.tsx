import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import React from "react";
import { useImmer } from "use-immer";
import { generateContent, Container, Row as RowType } from "@/data";
import Row from "@/components/row";
import "@/App.css";

type Props = {};

const generatedData: Container = generateContent("container-1", 3);

const App: React.FC<Props> = () => {
  const [containerData, setContainerData] = useImmer<Container>(generatedData);

  const onDragStart = (event: DragStartEvent) => {
    console.log({ ...event });
  };
  const onDragOver = (event: DragOverEvent) => {
    console.log({ ...event });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    console.log({ active, over });

    if (
      over?.data?.current &&
      active?.data?.current &&
      over?.data?.current?.accepts.includes(active?.data?.current?.type)
    ) {
      const sourceColIndex = active.data.current.parent.colIndex;
      const sourceRowIndex = active.data.current.parent.rowIndex;
      const targetColIndex = over.data.current.colIndex;
      const targetRowIndex = over.data.current.rowIndex;

      setContainerData((draft) => {
        const sourceColumn = draft.rows[sourceRowIndex].columns[sourceColIndex];
        const targetColumn = draft.rows[targetRowIndex].columns[targetColIndex];

        // Find the index of the columnRow in the source column
        const colRowIndex = sourceColumn.columnRows.findIndex(
          (cr) => cr.id === active.id
        );
        if (colRowIndex === -1) return;

        // Remove the columnRow from the source column
        const [movingColumnRow] = sourceColumn.columnRows.splice(
          colRowIndex,
          1
        );

        // Update the parentColumnId and move it to the target column
        movingColumnRow.parent.colIndex = targetColIndex;
        movingColumnRow.parent.rowIndex = targetRowIndex;
        movingColumnRow.colRowIndex = targetColumn.columnRows.length;
        movingColumnRow.content = `Row - ${targetRowIndex} / Col - ${targetColIndex} / ColRow - ${movingColumnRow.colRowIndex}`;
        targetColumn.columnRows.push(movingColumnRow);
      });
    }
  };

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="container">
        {containerData.rows.map((row: RowType) => (
          <Row row={row} key={row.id} />
        ))}
      </div>
    </DndContext>
  );
};

export default App;
