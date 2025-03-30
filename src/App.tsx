import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  closestCenter,
} from "@dnd-kit/core";
import { useState, useRef } from "react";
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
import Sidebar from "./components/sidebar/Sidebar";
import SidebarEntity from "./components/sidebar/SidebarEntity";
import { ulid } from "ulid";
import { current } from "immer";

const generatedData: Container = generateContent("container-1", 3);

const App = () => {
  const [activeRow, setActiveRow] = useState<RowType | undefined>(undefined);
  const [activeColRow, setActiveColRow] = useState<ColRowType | undefined>(
    undefined
  );
  const [activeSidebarEntity, setActiveSidebarEntity] = useState<{
    type: string;
    title: string;
  } | null>(null);

  const spacerInsertedRef = useRef<boolean>(false);
  const currentDragEntityRef = useRef<{ id: string; type: string } | null>(
    null
  );

  const [containerData, setContainerData] = useImmer<Container>(generatedData);

  const cleanUp = () => {
    setActiveRow(undefined);
    setActiveColRow(undefined);
    setActiveSidebarEntity(null);
    currentDragEntityRef.current = null;
    spacerInsertedRef.current = false;
  };

  // After insertion or deletion re-arrange the colRow index
  const rearrangeColRowIndex = (
    draft: Container,
    rowIndex: number,
    colIndex: number
  ): void => {
    draft.rows[rowIndex].columns[colIndex].columnRows.forEach(
      (colRow, index) => {
        colRow.colRowIndex = index;
      }
    );
  };

  const removeSpacerInOtherColumn = (draft: Container) => {
    draft.rows.forEach((row) => {
      row.columns.forEach((column) => {
        column.columnRows = column.columnRows.filter(
          (colRow) => !colRow.id.includes("-spacer")
        );
      });
    });
  };

  const addSpacer = (
    draft: Container,
    rowIndex: number,
    colIndex: number,
    colRowIndex: number,
    spacerId: string,
    position: number = 0
  ) => {
    draft.rows[rowIndex].columns[colIndex].columnRows.splice(position, 0, {
      id: spacerId,
      colRowIndex,
      parent: {
        rowIndex,
        colIndex,
      },
      content: "",
    });
  };

  const handleEntityDragOver = (active, over) => {
    const activeData = active?.data?.current;
    const { rowIndex, colIndex, colRowIndex } = over?.data?.current?.parent;

    if (activeData.fromSideBar && !spacerInsertedRef.current) {
      const columnRows =
        containerData.rows[rowIndex].columns[colIndex].columnRows;

      if (!columnRows.length) {
        setContainerData((draft) => {
          addSpacer(
            draft,
            rowIndex,
            colIndex,
            colRowIndex,
            active?.id + "-spacer"
          );
        });
      } else {
        const insertionIndex =
          colRowIndex > -1 ? colRowIndex : columnRows.length;

        setContainerData((draft) => {
          addSpacer(
            draft,
            rowIndex,
            colIndex,
            insertionIndex,
            active?.id + "-spacer",
            insertionIndex
          );
          rearrangeColRowIndex(draft, rowIndex, colIndex);
        });
      }
      spacerInsertedRef.current = true;
    } else if (activeData.fromSideBar) {
      console.log("else block in over event =>");
      setContainerData((draft) => {
        const spacerIndex = draft.rows[rowIndex].columns[
          colIndex
        ].columnRows.findIndex((f) => f.id.includes("-spacer"));

        if (spacerIndex < 0) {
          removeSpacerInOtherColumn(draft);
          addSpacer(draft, rowIndex, colIndex, 0, active?.id + "-spacer");
          current(draft);
          return;
        }

        // if the spacer is negative, then it is placed in another column remove it there and
        // add spacer in this column
        // if (spacerIndex < 0) {
        //   const spacerIndexes:
        //     | {
        //         rowIndex: number;
        //         colIndex: number;
        //         colRowIndex: number;
        //       }[] = [];

        //   draft.rows.forEach((row, rowIndex) => {
        //     row.columns.forEach((column, colIndex) => {
        //       column.columnRows.forEach((colRow, colRowIndex) => {
        //         if (colRow.id.includes("-spacer")) {
        //           spacerIndexes.push({ rowIndex, colIndex, colRowIndex });
        //         }
        //       });
        //     });
        //   });

        //   if (spacerIndexes.length) {
        //     spacerIndexes.forEach((item) => {
        //       draft.rows[item.rowIndex].columns[item.colIndex].columnRows =
        //         draft.rows[item.rowIndex].columns[
        //           item.colIndex
        //         ].columnRows.filter((item) => !item.id.includes("-spacer"));

        //       rearrangeColRowIndex(draft, rowIndex, colIndex);
        //     });
        //   }
        //   spacerInsertedRef.current = false;
        //   return;
        // }

        const nextIndex =
          colRowIndex > -1
            ? colRowIndex
            : draft.rows[rowIndex].columns[colIndex].columnRows.length;

        if (nextIndex === spacerIndex) {
          return;
        }

        // console.log({ nextIndex, spacerIndex });

        draft.rows[rowIndex].columns[colIndex].columnRows = arrayMove(
          draft.rows[rowIndex].columns[colIndex].columnRows,
          spacerIndex,
          colRowIndex
        );

        rearrangeColRowIndex(draft, rowIndex, colIndex);
      });
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

  const onDragStart = (event: DragStartEvent) => {
    console.log("Drag start event =>", { ...event });
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

    if (activeData?.fromSideBar) {
      setActiveSidebarEntity({
        title: activeData.title,
        type: activeData.type,
      });
      currentDragEntityRef.current = {
        id: event.active.id as string,
        type: activeData.type,
      };
      return;
    }
  };

  const onDragEnd = ({ active, over }: DragOverEvent) => {
    const currentOverData = over?.data?.current;
    const currentActiveData = active?.data?.current;

    const hasOverActiveData = currentOverData && currentActiveData;

    if (
      hasOverActiveData &&
      currentActiveData.fromSideBar &&
      currentOverData.type === "colRow"
    ) {
      const { rowIndex, colIndex } = currentOverData.parent;

      setContainerData((draft) => {
        const spacerIndex = draft.rows[rowIndex].columns[
          colIndex
        ].columnRows.findIndex((f) => f.id.includes("-spacer"));
        draft.rows[rowIndex].columns[colIndex].columnRows.splice(
          spacerIndex,
          1,
          {
            id: ulid(),
            content: `Row - ${rowIndex} / Col - ${colIndex} / ColRow - ${spacerIndex}`,
            colRowIndex: spacerIndex,
            parent: {
              rowIndex,
              colIndex,
            },
          }
        );
        draft.rows[rowIndex].columns[colIndex].columnRows.forEach(
          (colRow, index) => {
            colRow.colRowIndex = index;
          }
        );
      });
    } else if (active?.data?.current?.fromSideBar) {
      setContainerData((draft) => {
        draft.rows.forEach((row) => {
          row.columns.forEach((column) => {
            // Remove items with "-spacer" in id
            column.columnRows = column.columnRows.filter(
              (item) => !item.id.includes("-spacer")
            );

            // Reassign colRowIndex values
            column.columnRows.forEach((colRow, index) => {
              colRow.colRowIndex = index;
            });
          });
        });
      });
    }

    cleanUp();
  };

  const onDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    const currentActiveData = active?.data?.current;
    const currentOverData = over?.data?.current;
    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;
    console.log({ currentActiveData, currentOverData });

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
    if (currentActiveData?.fromSideBar) {
      if (currentOverData?.type === "colRow") {
        console.log("over row & column ->", { ...currentOverData.parent });
        handleEntityDragOver(active, over);
      } else if (!currentOverData) {
        // This solves the issue where you could have a spacer handing out in the canvas if you drug
        // a sidebar item on and then off
        setContainerData((draft) => {
          draft.rows.forEach((row) => {
            row.columns.forEach((column) => {
              // Remove items with "-spacer" in id
              column.columnRows = column.columnRows.filter(
                (item) => !item.id.includes("-spacer")
              );

              // Reassign colRowIndex values
              column.columnRows.forEach((colRow, index) => {
                colRow.colRowIndex = index;
              });
            });
          });
        });
        spacerInsertedRef.current = false;
      }
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

  const customCollisionDetectionStratergy: CollisionDetection = (args) => {
    console.log("inside custom colidion detction stratergy", args.active);
    const {
      active,
      collisionRect,
      droppableContainers,
      droppableRects,
      pointerCoordinates,
    } = args;
    // Start by finding any intersecting droppable
    if (active?.data?.current?.fromSideBar) {
      console.log({ ...args });
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);

      console.log("intersections => ", { intersections });

      let overId = getFirstCollision(intersections, "id");

      console.log("overId =>", { overId });

      overId = closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => container.id !== overId
        ),
      })[0]?.id;
      return [{ id: overId }];
    } else {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => container.id
        ),
      });
    }
  };

  return (
    <>
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        collisionDetection={customCollisionDetectionStratergy}
      >
        <Sidebar />
        <div className="container">
          <SortableContext items={containerData.rows.map((row) => row.id)}>
            {containerData.rows.map((row: RowType) => (
              <Row row={row} key={row.id} />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeSidebarEntity ? (
            <SidebarEntity overlay title={activeSidebarEntity.title} />
          ) : null}
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

// =================

// import {
//   DndContext,
//   DragEndEvent,
//   DragOverEvent,
//   DragStartEvent,
//   useSensor,
//   useSensors,
//   DragOverlay,
//   closestCenter,
//   MouseSensor,
//   TouchSensor,
//   KeyboardSensor,
// } from "@dnd-kit/core";
// import React, { useState, useRef } from "react";
// import { useImmer } from "use-immer";
// import {
//   generateContent,
//   Container,
//   Row as RowType,
//   ColumnRow as ColRowType,
// } from "@/data";
// import Row from "@/components/row";
// import { arrayMove, SortableContext } from "@dnd-kit/sortable";
// import ColumnRow from "./components/columnRow";
// import Sidebar from "./components/sidebar/Sidebar";
// import SidebarEntity from "./components/sidebar/SidebarEntity";
// import { ulid } from "ulid";

// const generatedData: Container = generateContent("container-1", 3);

// const App: React.FC = () => {
//   const sensors = useSensors(
//     useSensor(MouseSensor),
//     useSensor(TouchSensor),
//     useSensor(KeyboardSensor)
//   );
//   const [containerData, setContainerData] = useImmer<Container>(generatedData);
//   const [activeItem, setActiveItem] = useState<{
//     type: string;
//     item: any;
//   } | null>(null);
//   const [sidebarKey, setSidebarKey] = useState(Date.now().toString());
//   const spacerInsertedRef = useRef(false);

//   const cleanUp = () => {
//     setActiveItem(null);
//     spacerInsertedRef.current = false;
//   };

//   const removeSpacers = () => {
//     setContainerData((draft) => {
//       draft.rows.forEach((row) => {
//         row.columns.forEach((column) => {
//           column.columnRows = column.columnRows.filter(
//             (item) => !item.id.includes("-spacer")
//           );
//           column.columnRows.forEach(
//             (colRow, index) => (colRow.colRowIndex = index)
//           );
//         });
//       });
//     });
//   };

//   const onDragStart = (event: DragStartEvent) => {
//     const activeType = event.active.data.current?.type;
//     const activeData = event.active.data.current;

//     if (activeType === "row") {
//       setActiveItem({
//         type: "row",
//         item: containerData.rows.find((row) => row.id === event.active.id),
//       });
//     } else if (activeType === "colRow" && activeData?.parent) {
//       const { rowIndex, colIndex } = activeData.parent;
//       setActiveItem({
//         type: "colRow",
//         item: containerData.rows[rowIndex].columns[colIndex].columnRows.find(
//           (colRow) => colRow.id === event.active.id
//         ),
//       });
//     } else if (activeData?.fromSideBar) {
//       setActiveItem({ type: "sidebar", item: activeData });
//     }
//   };

//   const onDragOver = ({ active, over }: DragOverEvent) => {
//     if (!over || !active) return;
//     const activeData = active.data.current;
//     const overData = over.data.current;

//     if (activeData?.fromSideBar) {
//       if (overData?.type === "colRow") {
//         // Handle entity dragging over a column
//       } else if (!overData) {
//         removeSpacers();
//       }
//     } else if (activeData?.type === "colRow" && overData?.type === "colRow") {
//       // Handle sorting inside a column
//     } else if (activeData?.type === "row" && overData?.type === "row") {
//       setContainerData((draft) => {
//         const oldIndex = draft.rows.findIndex((item) => item.id === active.id);
//         const newIndex = draft.rows.findIndex((item) => item.id === over.id);
//         if (oldIndex !== newIndex) {
//           draft.rows = arrayMove(draft.rows, oldIndex, newIndex);
//         }
//       });
//     }
//   };

//   const onDragEnd = ({ active, over }: DragEndEvent) => {
//     if (!over) return;
//     const activeData = active.data.current;
//     const overData = over.data.current;

//     if (activeData?.fromSideBar) {
//       if (overData?.type === "colRow") {
//         const { rowIndex, colIndex } = overData.parent;
//         setContainerData((draft) => {
//           const spacerIndex = draft.rows[rowIndex].columns[
//             colIndex
//           ].columnRows.findIndex((f) => f.id.includes("-spacer"));
//           if (spacerIndex > -1) {
//             draft.rows[rowIndex].columns[colIndex].columnRows.splice(
//               spacerIndex,
//               1,
//               {
//                 id: ulid(),
//                 content: `Row - ${rowIndex} / Col - ${colIndex} / ColRow - ${spacerIndex}`,
//                 colRowIndex: spacerIndex,
//                 parent: { rowIndex, colIndex },
//               }
//             );
//           }
//         });
//       } else {
//         removeSpacers();
//       }
//     }

//     setSidebarKey(Date.now().toString());
//     cleanUp();
//   };

//   return (
//     <DndContext
//       onDragStart={onDragStart}
//       onDragEnd={onDragEnd}
//       onDragOver={onDragOver}
//       sensors={sensors}
//       collisionDetection={closestCenter}
//     >
//       <Sidebar id={sidebarKey} />
//       <div className="container">
//         <SortableContext items={containerData.rows.map((row) => row.id)}>
//           {containerData.rows.map((row) => (
//             <Row row={row} key={row.id} />
//           ))}
//         </SortableContext>
//       </div>
//       <DragOverlay>
//         {activeItem?.type === "sidebar" ? (
//           <SidebarEntity overlay title={activeItem.item.title} />
//         ) : null}
//         {activeItem?.type === "row" ? (
//           <Row row={activeItem.item} dragging />
//         ) : null}
//         {activeItem?.type === "colRow" ? (
//           <ColumnRow colRow={activeItem.item} dragging />
//         ) : null}
//       </DragOverlay>
//     </DndContext>
//   );
// };

// export default App;
