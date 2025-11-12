import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { DndProvider, useDrag, useDrop } from "react-dnd";
const Canvas = ({
  detections,
  addedComponents,
  onDropComponent,
  onTextChange,
}) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({
    width: 640,
    height: 640,
  });
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "component",
    drop: (item, monitor) => {
      const delta = monitor.getClientOffset();
      if (delta && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = delta.x - rect.left;
        const y = delta.y - rect.top;
        onDropComponent(item.label, x, y);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSelectedComponentIndex(null);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTextUpdate = (index, newText, isAdded) => {
    onTextChange(index, newText, isAdded);
  };

  const renderElement = (item, index, isAdded = false) => {
    const [x, y, width, height] = item.box || [item.x, item.y, 120, 60];
    const xScaled = (x / 640) * containerSize.width;
    const yScaled = (y / 640) * containerSize.height;
    const widthScaled = (width / 640) * containerSize.width;
    const heightScaled = (height / 640) * containerSize.height;

    const isSelected =
      selectedComponentIndex === `${isAdded ? "added-" : ""}${index}`;

    return (
      <Rnd
        key={`${isAdded ? "added-" : ""}${index}`}
        default={{
          x: xScaled,
          y: yScaled,
          width: widthScaled,
          height: heightScaled,
        }}
        bounds="parent"
        enableResizing
        dragGrid={[10, 10]}
        resizeGrid={[10, 10]}
        className={`absolute ${isSelected ? "border-4 border-blue-500" : ""}`}
        onClick={() =>
          setSelectedComponentIndex(`${isAdded ? "added-" : ""}${index}`)
        }
      >
        {renderComponent(item, index, isAdded)}
      </Rnd>
    );
  };

  const renderComponent = (item, index, isAdded) => {
    const editableText = (text) => (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleTextUpdate(index, e.target.innerText, isAdded)}
        className="w-full h-full outline-none"
      >
        {text}
      </div>
    );

    switch (item.label) {
      case "frame":
        return (
          <div className="border-2 border-dashed rounded-lg p-2 w-full h-full relative">
            <img
              src="https://archive.org/download/placeholder-image/placeholder-image.jpg"
              alt="frame"
              className="w-full h-full object-cover rounded-lg"
            />
            <p className="text-sm text-center">Frame</p>
          </div>
        );
      case "input":
        return (
          <input
            className="border rounded-lg p-2 w-full h-full"
            placeholder="Enter text..."
            value={item.text || ""}
            onChange={(e) => handleTextUpdate(index, e.target.value, isAdded)}
          />
        );
      case "button":
        return (
          <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-2 w-full h-full shadow-md">
            {editableText(item.text || "Submit")}
          </button>
        );
      case "heading":
        return (
          <h2 className="text-2xl font-bold text-gray-900 w-full h-full">
            {editableText(item.text || "Heading Text")}
          </h2>
        );
      case "text":
        return (
          <p className="text-base text-gray-700 w-full h-full">
            {editableText(item.text || "Sample text goes here.")}
          </p>
        );
      case "checkbox":
        return (
          <div className="flex items-center gap-2 w-full h-full min-w-[100px]">
            <input type="checkbox" className="w-4 h-4" />
            {editableText(item.text || "Check me")}
          </div>
        );
      case "nav":
        return (
          <nav className="bg-gray-800 rounded-md p-3 flex justify-around text-2xl text-white w-[400px]">
            {["Home", "About", "Contact"].map((navItem, i) => (
              <a key={i} href="#" className="hover:underline">
                {editableText(navItem)}
              </a>
            ))}
          </nav>
        );
      case "footer":
        return (
          <footer className="bg-gray-800 text-white p-3 rounded-md text-center w-[400px]">
            {editableText(item.text || "Footer Content")}
          </footer>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        containerRef.current = node;
      }}
      className={`relative w-[640px] aspect-square border mx-auto bg-white shadow-xl overflow-hidden rounded-2xl text-black ${
        isOver ? "border-blue-400 border-4" : ""
      }`}
    >
      {detections.map((item, index) => renderElement(item, index))}
      {addedComponents.map((item, index) => renderElement(item, index, true))}
    </div>
  );
};
export default Canvas;
