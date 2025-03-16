import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import React from "react";
import { useImmer } from "use-immer";
import { generateContent, Container, Row as RowType } from "@/data";
import Row from "@/components/row";
import "@/App.css";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type Props = {};

const generatedData: Container = generateContent("container-1", 3);

const App: React.FC<Props> = () => {
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const [containerData, setContainerData] = useImmer<Container>(generatedData);

  const onDragStart = (event: DragStartEvent) => {
    console.log({ ...event });
  };
  const onDragOver = (event: DragOverEvent) => {
    // console.log({ ...event });
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
      const targetColIndex = over.data.current.parent.colIndex;
      const targetRowIndex = over.data.current.parent.rowIndex;

      setContainerData((draft) => {
        const sourceColumn = draft.rows[sourceRowIndex].columns[sourceColIndex];
        const targetColumn = draft.rows[targetRowIndex].columns[targetColIndex];

        // Find the index of the columnRow in the source column
        const colRowIndex = sourceColumn.columnRows.findIndex(
          (cr) => cr.id === active.id
        );
        if (colRowIndex === -1) return;

        // if the colRow belongs to the same column
        if (sourceColIndex === targetColIndex) {
          const items =
            draft.rows[targetRowIndex].columns[targetColIndex].columnRows;
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          if (oldIndex === -1 || newIndex === -1) return;
          draft.rows[targetRowIndex].columns[targetColIndex].columnRows =
            arrayMove(items, oldIndex, newIndex);
        } else {
          // if the colRow dragged from a different column
          const activeIndex = sourceColumn.columnRows.findIndex(
            (item) => item.id === active.id
          );
          const overIndex = targetColumn.columnRows.findIndex(
            (item) => item.id === over.id
          );

          if (activeIndex === -1 || overIndex === -1) return;

          // Remove the columnRow from the source column
          const [movingColumnRow] = sourceColumn.columnRows.splice(
            colRowIndex,
            1
          );

          if (!movingColumnRow) return;

          // Update the parentColumnId and move it to the target column
          movingColumnRow.parent = {
            colIndex: targetColIndex,
            rowIndex: targetRowIndex,
          };
          movingColumnRow.colRowIndex = active.data.current?.sortable.index;

          targetColumn.columnRows.splice(overIndex, 0, movingColumnRow);
        }
      });
    }
  };

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <div className="container">
        <SortableContext
          items={containerData.rows}
          strategy={verticalListSortingStrategy}
        >
          {containerData.rows.map((row: RowType) => (
            <Row row={row} key={row.id} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default App;
