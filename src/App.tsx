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
  DragOverlay,
} from "@dnd-kit/core";
import React, { useState, useRef } from "react";
import { useImmer } from "use-immer";
import {
  generateContent,
  Container,
  Row as RowType,
  ColumnRow as ColRowType,
} from "@/data";
import Row from "@/components/row";
import "@/App.css";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import ColumnRow from "./components/columnRow";
import DraggableEntity from "./components/DraggableEntity";

type Props = {};
const generatedData: Container = generateContent("container-1", 3);

const App: React.FC<Props> = () => {
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);
  const [activeRow, setActiveRow] = useState<RowType | undefined>(undefined);
  const [activeColRow, setActiveColRow] = useState<ColRowType | undefined>(
    undefined
  );
  const spacerInsertedRef = useRef<boolean | null>(null);
  const currentDragEntityRef = useRef<ColRowType | null>(null);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const [containerData, setContainerData] = useImmer<Container>(generatedData);

  const handleEntityDragOver = (active, over) => {
    const activeData = active?.data?.current;
    const { rowIndex, colIndex, colRowIndex } = over?.data?.current?.parent;

    if (activeData.fromSideBar) {
      if (!spacerInsertedRef.current) {
        const spacer = {
          id: active.id + "-spacer",
        };

        setContainerData((draft) => {
          const items = draft.rows[rowIndex].columns[colIndex].columnRows;
          if (!items.length) {
            draft.rows[rowIndex].columns[colIndex].columnRows.push({
              ...spacer,
              parent: {
                rowIndex,
                colIndex,
              },
              colRowIndex: 0,
              content: "",
            });
          } else {
            const nextIndex = colRowIndex > -1 ? colRowIndex : items.length;

            draft.rows[rowIndex].columns[colIndex].columnRows.splice(
              nextIndex,
              0,
              {
                ...spacer,
                parent: {
                  rowIndex,
                  colIndex,
                },
                colRowIndex: nextIndex,
                content: "",
              }
            );

            draft.rows[rowIndex].columns[colIndex].columnRows.forEach(
              (colRow, index) => {
                colRow.colRowIndex = index;
              }
            );
          }
          spacerInsertedRef.current = true;
        });
      } else if (!over) {
        // This solves the issue where you could have a spacer handing out in the canvas if you drug
        // a sidebar item on and then off
        // spacerInsertedRef.current = false;
      } else {
        setContainerData((draft) => {
          const spacerIndex = draft.rows[rowIndex].columns[
            colIndex
          ].columnRows.findIndex((f) => f.id.includes("-spacer"));

          const nextIndex =
            colRowIndex > -1
              ? colRowIndex
              : draft.rows[rowIndex].columns[colIndex].columnRows.length;

          if (nextIndex === spacerIndex) {
            return;
          }

          console.log({ nextIndex, spacerIndex });

          draft.rows[rowIndex].columns[colIndex].columnRows = arrayMove(
            draft.rows[rowIndex].columns[colIndex].columnRows,
            spacerIndex,
            colRowIndex
          );

          draft.rows[rowIndex].columns[colIndex].columnRows.forEach(
            (colRow, index) => {
              colRow.colRowIndex = index;
            }
          );
        });
      }
    }
  };

  const handleColRowSorting = (active, over) => {
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
  };

  const cleanUp = () => {
    currentDragEntityRef.current = null;
    spacerInsertedRef.current = false;
  };

  const onDragStart = (event: DragStartEvent) => {
    const activeType = event.active.data.current?.type;
    const activeData = event.active.data.current;

    if (activeType === "row") {
      const activeRowItem = containerData.rows.find(
        (item) => item.id === event.active?.id
      );
      setActiveRow(activeRowItem);
      setActiveColRow(undefined);
      return;
    }

    if (activeType === "colRow" && event.active.data.current?.parent) {
      const { rowIndex, colIndex } = event.active.data.current.parent;
      const activeColRowItem = containerData.rows[rowIndex].columns[
        colIndex
      ].columnRows.find((item) => item.id === event.active?.id);
      setActiveColRow(activeColRowItem);
      setActiveRow(undefined);
      return;
    }

    if (activeType === "entity") {
      if (activeData?.fromSideBar) {
        currentDragEntityRef.current = {
          id: event.active.id as string,
          content: activeData.content,
          parent: {
            rowIndex: undefined,
            colIndex: undefined,
          },
        };
        return;
      }
    }
  };

  const onDragEnd = ({ over }: DragOverEvent) => {
    console.log({ over });
  };

  const onDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    const currentActiveData = active?.data?.current;
    const currentOverData = over?.data?.current;
    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;

    // condition is triggered when we drag the rows
    if (
      currentActiveData?.type === "row" &&
      currentOverData?.type === "row" &&
      active.id !== over?.id
    ) {
      setContainerData((draft) => {
        const oldIndex = draft.rows.findIndex((item) => item.id === active.id);
        const newIndex = draft.rows.findIndex((item) => item.id === over?.id);
        draft.rows = arrayMove(draft.rows, oldIndex, newIndex);
      });
      return;
    }

    // condition is triggered when we drag the entity to drop over a column
    if (
      currentActiveData?.type === "entity" &&
      currentOverData?.type === "colRow" &&
      currentActiveData &&
      currentOverData
    ) {
      handleEntityDragOver(active, over);
      return;
    }

    // condition is triggered when we move colRow inside a column or drag out to another column
    if (
      activeType === "colRow" &&
      overType === "colRow" &&
      currentOverData?.accepts?.includes(currentActiveData?.type)
    ) {
      handleColRowSorting(active, over);
      return;
    }
  };

  const itemsToDrag = Array.from({ length: 2 }, (_, colRowIndex) => {
    return (
      <DraggableEntity
        key={colRowIndex + ``}
        id={colRowIndex + ``}
        content={`Entity draggable - ${colRowIndex}`}
      />
    );
  });

  return (
    <>
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        sensors={sensors}
        collisionDetection={closestCenter}
      >
        <div className="pot">{itemsToDrag}</div>
        <div className="container">
          <SortableContext items={containerData.rows.map((row) => row.id)}>
            {containerData.rows.map((row: RowType) => (
              <Row row={row} key={row.id} />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeRow ? <Row row={activeRow} dragging={true} /> : null}
          {activeColRow ? (
            <ColumnRow colRow={activeColRow} dragging={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default App;
