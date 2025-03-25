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
import { useDropContext } from "./contexts/DropContext";
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
  const [sidebarFieldsRegenKey, setSidebarFieldsRegenKey] = useState(
    Date.now()
  );
  const [activeRow, setActiveRow] = useState<RowType | undefined>(undefined);
  const [activeEntity, setActiveEntity] = useState<ColRowType | undefined>(
    undefined
  );
  const [activeColRow, setActiveColRow] = useState<ColRowType | undefined>(
    undefined
  );
  const spacerInsertedRef = useRef<boolean | null>(null);
  const currentDragEntityRef = useRef<ColRowType | null>(null);

  const { setDropTarget } = useDropContext();

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const [containerData, setContainerData] = useImmer<Container>(generatedData);

  const cleanUp = () => {
    currentDragEntityRef.current = null;
    spacerInsertedRef.current = false;
  };

  const onDragStart = (event: DragStartEvent) => {
    console.log({ ...event });
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
        console.log("starting the from the sidebar entity", activeData);
        setActiveEntity((prev) => ({
          id: event.active.id as string,
          content: activeData.content,
        }));
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

      // We aren't creating a new element so go ahead and just insert the spacer
      // since this field already belongs to the canvas.
      // const { field, index } = activeData;

      // currentDragFieldRef.current = field;
      // updateData((draft) => {
      //   draft.fields.splice(index, 1, createSpacer({ id: active.id }));
      // });
    }
  };

  const onDragEnd = ({ over }: DragOverEvent) => {
    console.log({ over });
  };

  const onDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;

    console.log("over top =>", event);

    if (activeType === "row" && overType === "row" && active.id !== over?.id) {
      setContainerData((draft) => {
        const oldIndex = draft.rows.findIndex((item) => item.id === active.id);
        const newIndex = draft.rows.findIndex((item) => item.id === over?.id);
        draft.rows = arrayMove(draft.rows, oldIndex, newIndex);
      });
      return;
    }

    if (
      activeType === "entity" &&
      overType === "colRow" &&
      over?.data?.current &&
      active?.data?.current
    ) {
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
          // setContainerData((draft) => {
          //   draft.fields = draft.fields.filter((f) => f.type !== "spacer");
          // });
          // console.log("inside the else if block");
          // spacerInsertedRef.current = false;
        } else {
          console.log("inside the else block ", colRowIndex);
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
      return;
    }

    if (
      activeType === "colRow" &&
      overType === "colRow" &&
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
        <div className="pot" key={sidebarFieldsRegenKey}>
          {itemsToDrag}
        </div>
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
