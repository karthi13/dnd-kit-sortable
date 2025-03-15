import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import React from "react";
import { generateContent, Container, Row as RowType } from "@/data";
import Row from "@/components/row";
import "./App.css";

type Props = {};

const App: React.FC<Props> = () => {
  const onDragStart = (event: DragStartEvent) => {
    console.log({ ...event });
  };
  const onDragOver = (event: DragOverEvent) => {
    console.log({ ...event });
  };
  const onDragEnd = (event: DragEndEvent) => {
    console.log({ ...event });
  };

  const containerData: Container = generateContent("container-1", 3); // Example with 3 rows

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
