import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import "./App.css";
import React from "react";
import { generateContent, Container, Row as RowType } from "./data";
import Row from "./Row";

type Props = {};

const App: React.FC<Props> = () => {
  const onDragStart = (event: DragStartEvent) => {};
  const onDragOver = (event: DragOverEvent) => {};
  const onDragEnd = (event: DragEndEvent) => {};

  const containerData: Container = generateContent("container-1", 3); // Example with 3 rows

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="container">
        {containerData.rows.map((row: RowType) => (
          <Row row={row} />
        ))}
      </div>
    </DndContext>
  );
};

export default App;
