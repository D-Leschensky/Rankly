import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const App = () => {
  // Our rectangles with an id and a background color.
  const initialRectangles = [
    { id: 1, color: '#e74c3c' },
    { id: 2, color: '#3498db' },
    { id: 3, color: '#2ecc71' },
    { id: 4, color: '#9b59b6' },
    { id: 5, color: '#f1c40f' },
  ];

  const [rectangles, setRectangles] = useState(initialRectangles);
  // draggingInfo holds data about the currently dragged rectangle.
  const [draggingInfo, setDraggingInfo] = useState(null);
  // dropTargetIndex is the index of the rectangle currently hovered as a drop target.
  const [dropTargetIndex, setDropTargetIndex] = useState(null);

  // refs for each rectangle so we can measure them
  const rectRefs = useRef([]);

  // When mouse is pressed on a rectangle, start the drag.
  const handleMouseDown = (e, index) => {
    const rectElem = rectRefs.current[index];
    if (!rectElem) return;
    const rect = rectElem.getBoundingClientRect();
    // Calculate offset from the top‐left corner of the rectangle to the mouse.
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Set dragging info (store the index, offset, and starting position)
    setDraggingInfo({
      index,
      offsetX,
      offsetY,
      // initial position of the dragged element (so we can position the floating copy)
      x: rect.left,
      y: rect.top,
    });
  };

  // When dragging, update the floating element’s position and detect drop target.
  useEffect(() => {
    if (!draggingInfo) return;

    const handleMouseMove = (e) => {
      // Update floating element position.
      setDraggingInfo((prev) => ({
        ...prev,
        x: e.clientX - prev.offsetX,
        y: e.clientY - prev.offsetY,
      }));

      // Determine if the mouse is over one of the other rectangles.
      let foundTarget = null;
      rectRefs.current.forEach((elem, idx) => {
        if (!elem) return;
        // Skip the rectangle we’re dragging.
        if (idx === draggingInfo.index) return;
        const { left, top, width, height } = elem.getBoundingClientRect();
        if (
          e.clientX >= left &&
          e.clientX <= left + width &&
          e.clientY >= top &&
          e.clientY <= top + height
        ) {
          foundTarget = idx;
        }
      });
      setDropTargetIndex(foundTarget);
    };

    const handleMouseUp = (e) => {
      // On mouse up, if a valid drop target was found, swap the two rectangles.
      if (dropTargetIndex !== null && dropTargetIndex !== draggingInfo.index) {
        setRectangles((prev) => {
          const newRects = [...prev];
          const temp = newRects[draggingInfo.index];
          newRects[draggingInfo.index] = newRects[dropTargetIndex];
          newRects[dropTargetIndex] = temp;
          return newRects;
        });
      }
      // Clear dragging state.
      setDraggingInfo(null);
      setDropTargetIndex(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Clean up listeners on unmount or when drag ends.
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingInfo, dropTargetIndex]);

  return (
    <div className="container">
      {rectangles.map((rect, index) => {
        // If this rectangle is being dragged, hide it in the list.
        const isDragging = draggingInfo && index === draggingInfo.index;
        // If this rectangle is currently the drop target, add a special class.
        const isDropTarget = dropTargetIndex === index;
        return (
          <div
            key={rect.id}
            ref={(el) => (rectRefs.current[index] = el)}
            className={`rectangle ${isDropTarget ? 'drop-target' : ''}`}
            onMouseDown={(e) => handleMouseDown(e, index)}
            style={{
              backgroundColor: rect.color,
              opacity: isDragging ? 0 : 1, // hide original while dragging
            }}
          >
            {rect.id}
          </div>
        );
      })}
      {/* Render a floating copy if dragging */}
      {draggingInfo && (
        <div
          className="rectangle floating"
          style={{
            backgroundColor: rectangles[draggingInfo.index].color,
            left: draggingInfo.x,
            top: draggingInfo.y,
          }}
        >
          {rectangles[draggingInfo.index].id}
        </div>
      )}
    </div>
  );
};

export default App;
