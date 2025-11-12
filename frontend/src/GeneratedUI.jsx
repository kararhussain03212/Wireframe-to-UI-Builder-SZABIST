import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./Sidebar";
// Original detections array remains the same
const detectionsBefore = [
  { label: "container", box: [349.8568, 364.9137, 430.5548, 341.1436] },
  { label: "frame", box: [269.125, 289.3726, 149.8322, 105.5684] },
  { label: "nav", box: [375.2753, 145.1547, 410.6466, 94.498] },
  {
    label: "text",
    box: [257.9746, 410.739, 120.0349, 103.2256],
    text: "Sample text goes here.",
  },
  {
    label: "footer",
    box: [340.4605, 611.9276, 436.8461, 56.1448],
    text: "Footer Content",
  },
  { label: "input", box: [433.6977, 296.61, 116.0164, 33.6417], text: "" },
  {
    label: "button",
    box: [432.8581, 340.8489, 114.8221, 42.6701],
    text: "Submit",
  },
  {
    label: "heading",
    box: [437.3519, 398.9505, 130.7645, 34.3878],
    text: "Heading Text",
  },
  {
    label: "checkbox",
    box: [213.4906, 482.2218, 39.2895, 22.6929],
    text: "Check me",
  },
];
  const detections = detectionsBefore?.map(
    (detection) => {
      const [x, y, width, height] = detection.box;
      return {
        ...detection,
        box: [x - width / 2, y - height / 2, width, height],
      };
    }
  );

const EditSidebar = ({ selectedComponent, onUpdateComponent, sidebarRef }) => {
  if (!selectedComponent)
    return (
      <div className="p-4" ref={sidebarRef}>
        Select a component to edit
      </div>
    );

  const handleTextChange = (e) => {
    onUpdateComponent({ ...selectedComponent, text: e.target.value });
  };

  const handleSizeChange = (e, dimension) => {
    const value = parseInt(e.target.value, 10) || 0;
    const newBox = [...selectedComponent.box];
    newBox[dimension] = value;
    onUpdateComponent({
      ...selectedComponent,
      box: newBox,
    });
  };

  const handleColorChange = (e) => {
    onUpdateComponent({ ...selectedComponent, color: e.target.value });
  };

  const handleBgColorChange = (e) => {
    onUpdateComponent({ ...selectedComponent, bgColor: e.target.value });
  };

  const handleLinkChange = (e) => {
    onUpdateComponent({ ...selectedComponent, link: e.target.value });
  };

  // Common properties for all components
  return (
    <div
      className="w-64 bg-gray-100 p-4 rounded-sm shadow-xl overflow-y-auto h-[640px] text-black"
      ref={sidebarRef}
    >
      <h2 className="text-lg font-semibold mb-4 text-center">
        Edit {selectedComponent.label}
      </h2>

      {/* Position and size controls (for all components) */}
      <div className="mb-4">
        <label className="block text-sm font-medium">X Position</label>
        <input
          type="number"
          value={selectedComponent.box[0]}
          onChange={(e) => handleSizeChange(e, 0)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Y Position</label>
        <input
          type="number"
          value={selectedComponent.box[1]}
          onChange={(e) => handleSizeChange(e, 1)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Width</label>
        <input
          type="number"
          value={selectedComponent.box[2]}
          onChange={(e) => handleSizeChange(e, 2)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Height</label>
        <input
          type="number"
          value={selectedComponent.box[3]}
          onChange={(e) => handleSizeChange(e, 3)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Component-specific properties */}
      {/* Text-based components */}
      {["text", "heading", "button", "input", "footer"].includes(
        selectedComponent.label
      ) && (
        <div className="mb-4">
          <label className="block text-sm font-medium">Text Content</label>
          <input
            type="text"
            value={selectedComponent.text || ""}
            onChange={handleTextChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      )}

      {/* Button specific properties */}
      {selectedComponent.label === "button" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium">Button Color</label>
            <select
              value={selectedComponent.bgColor || "bg-green-500"}
              onChange={handleBgColorChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="bg-green-500">Green</option>
              <option value="bg-blue-500">Blue</option>
              <option value="bg-red-500">Red</option>
              <option value="bg-yellow-500">Yellow</option>
              <option value="bg-purple-500">Purple</option>
            </select>
          </div>
        </>
      )}

      {/* Nav specific properties */}
      {selectedComponent.label === "nav" && (
        <div className="mb-4">
          <label className="block text-sm font-medium">Menu Items</label>
          <textarea
            value={
              selectedComponent.menuItems
                ? selectedComponent.menuItems.join("\n")
                : "Home\nAbout\nContact"
            }
            onChange={(e) =>
              onUpdateComponent({
                ...selectedComponent,
                menuItems: e.target.value.split("\n"),
              })
            }
            className="w-full p-2 border rounded-lg"
            rows={4}
          />
        </div>
      )}

      {/* Checkbox specific properties */}
      {selectedComponent.label === "checkbox" && (
        <div className="mb-4">
          <label className="block text-sm font-medium">Checkbox Label</label>
          <input
            type="text"
            value={selectedComponent.text || "Check me"}
            onChange={handleTextChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      )}

      {/* Frame specific properties */}
      {selectedComponent.label === "frame" && (
        <div className="mb-4">
          <label className="block text-sm font-medium">Image URL</label>
          <input
            type="text"
            value={
              selectedComponent.imgUrl ||
              "https://archive.org/download/placeholder-image/placeholder-image.jpg"
            }
            onChange={(e) =>
              onUpdateComponent({
                ...selectedComponent,
                imgUrl: e.target.value,
              })
            }
            className="w-full p-2 border rounded-lg"
          />
        </div>
      )}
    </div>
  );
};


const Canvas = ({
  components,
  onComponentChange,
  onComponentSelect,
  onDropComponent,
  selectedComponentId,
}) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({
    width: 640,
    height: 640,
  });

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

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle component position or size changes from dragging/resizing on canvas
  const handleDragStop = (componentId, d) => {
    // Find the component
    const component = components.find((c) => c.id === componentId);
    if (!component) return;

    // Update position
    const newBox = [...component.box];
    newBox[0] = (d.x / containerSize.width) * 640;
    newBox[1] = (d.y / containerSize.height) * 640;

    const updatedComponent = { ...component, box: newBox };
    onComponentChange(componentId, updatedComponent);
  };

  const handleResizeStop = (componentId, ref, position) => {
    // Find the component
    const component = components.find((c) => c.id === componentId);
    if (!component) return;

    // Update size and position
    const newBox = [...component.box];
    newBox[0] = (position.x / containerSize.width) * 640;
    newBox[1] = (position.y / containerSize.height) * 640;
    newBox[2] = (ref.offsetWidth / containerSize.width) * 640;
    newBox[3] = (ref.offsetHeight / containerSize.height) * 640;

    const updatedComponent = { ...component, box: newBox };
    onComponentChange(componentId, updatedComponent);
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        containerRef.current = node;
      }}
      className={`relative w-full max-w-[800px] aspect-square border mx-auto bg-white shadow-xl overflow-hidden rounded-2xl text-black ${
        isOver ? "border-blue-400 border-4" : ""
      }`}
    >
      {components.map((component) => {
        const [x, y, width, height] = component.box || [0, 0, 120, 60];
        const xScaled = (x / 640) * containerSize.width;
        const yScaled = (y / 640) * containerSize.height;
        const widthScaled = (width / 640) * containerSize.width;
        const heightScaled = (height / 640) * containerSize.height;

        const isSelected = component.id === selectedComponentId;

        return (
          <Rnd
            key={component.id}
            position={{ x: xScaled, y: yScaled }}
            size={{ width: widthScaled, height: heightScaled }}
            onDragStop={(e, d) => handleDragStop(component.id, d)}
            onResizeStop={(e, direction, ref, delta, position) =>
              handleResizeStop(component.id, ref, position)
            }
            bounds="parent"
            className={`absolute ${
              isSelected ? "border-4 border-blue-500" : ""
            }`}
            onClick={() => onComponentSelect(component.id)}
          >
            {/* Render the specific component based on its type */}
            {renderComponent(component)}
          </Rnd>
        );
      })}
    </div>
  );
};

// Utility function to render different component types
const renderComponent = (item) => {
  const text = item.text || "";

  switch (item.label) {
    case "frame":
      return (
        <div
          className="border-2 border-dashed rounded-lg p-2 w-full h-full relative"
          style={{ pointerEvents: "none" }}
        >
          <img
            src={
              item.imgUrl ||
              "https://archive.org/download/placeholder-image/placeholder-image.jpg"
            }
            alt="frame"
            className="w-full h-full object-cover rounded-lg"
            style={{ pointerEvents: "none" }}
          />
          <p className="text-sm text-center">Frame</p>
        </div>
      );
    case "input":
      return (
        <input
          className="border rounded-lg p-2 w-full h-full"
          placeholder="Enter text..."
          value={text}
          readOnly
        />
      );
    case "button":
      return (
        <button
          className={`${
            item.bgColor || "bg-green-500"
          } hover:bg-green-600 text-white rounded-lg p-2 w-full h-full shadow-md`}
        >
          {text || "Submit"}
        </button>
      );
    case "heading":
      return (
        <h2 className="text-2xl font-bold text-gray-900 w-full h-full">
          {text || "Heading Text"}
        </h2>
      );
    case "text":
      return (
        <p className="text-base text-gray-700 w-full h-full">
          {text || "Sample text goes here."}
        </p>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2 w-full h-full min-w-[100px]">
          <input type="checkbox" className="w-4 h-4" />
          <span>{text || "Check me"}</span>
        </div>
      );
    case "nav":
      return (
        <nav className="bg-gray-800 rounded-md p-3 flex justify-around text-white w-full h-full">
          {(item.menuItems || ["Home", "About", "Contact"]).map(
            (navItem, i) => (
              <a key={i} href="#" className="hover:underline">
                {navItem}
              </a>
            )
          )}
        </nav>
      );
    case "footer":
      return (
        <footer className="bg-gray-800 text-white p-3 rounded-md text-center w-full h-full">
          {text || "Footer Content"}
        </footer>
      );
    default:
      return null;
  }
};

const GeneratedUI = () => {
  // Transform detections array to have unique IDs
  const initialComponents = detections.map((detection, index) => ({
    ...detection,
    id: `detection-${index}`,
  }));

  const [components, setComponents] = useState(initialComponents);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [nextComponentId, setNextComponentId] = useState(
    initialComponents.length
  );

  // Create refs for the sidebars
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);

  // Find the currently selected component
  const selectedComponent = components.find(
    (c) => c.id === selectedComponentId
  );

  // Handle when a component is dropped onto the canvas
  const handleDropComponent = (label, x, y) => {
    const newId = `added-${nextComponentId}`;

    const newComponent = {
      id: newId,
      label,
      box: [x, y, 120, 60],
      text: "",
      // Add default properties based on component type
      ...(label === "button" && { bgColor: "bg-green-500" }),
      ...(label === "nav" && { menuItems: ["Home", "About", "Contact"] }),
    };

    setComponents((prev) => [...prev, newComponent]);
    setSelectedComponentId(newId);
    setNextComponentId((prevId) => prevId + 1);
  };

  // Handle updates to a component
  const handleComponentChange = (id, updatedComponent) => {
    setComponents((prev) =>
      prev.map((component) =>
        component.id === id ? updatedComponent : component
      )
    );
  };

  // Update a component from the edit sidebar
  const handleUpdateComponent = (updatedComponent) => {
    if (!selectedComponentId) return;

    setComponents((prev) =>
      prev.map((component) =>
        component.id === selectedComponentId ? updatedComponent : component
      )
    );
  };

  // Set up click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only clear selection if the click is outside canvas AND both sidebars
      const isOutsideCanvas =
        document.querySelector(".mx-auto") &&
        !document.querySelector(".mx-auto").contains(e.target);
      const isOutsideLeftSidebar =
        !leftSidebarRef.current || !leftSidebarRef.current.contains(e.target);
      const isOutsideRightSidebar =
        !rightSidebarRef.current || !rightSidebarRef.current.contains(e.target);

      if (isOutsideCanvas && isOutsideLeftSidebar && isOutsideRightSidebar) {
        setSelectedComponentId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-row space-x-4 justify-center p-4 w-[1400px] ml-40">
        <Sidebar sidebarRef={leftSidebarRef} />
        <Canvas
          components={components}
          onComponentChange={handleComponentChange}
          onComponentSelect={setSelectedComponentId}
          onDropComponent={handleDropComponent}
          selectedComponentId={selectedComponentId}
        />
        <EditSidebar
          selectedComponent={selectedComponent}
          onUpdateComponent={handleUpdateComponent}
          sidebarRef={rightSidebarRef}
        />
      </div>
    </DndProvider>
  );
};

export default GeneratedUI;
