import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import domtoimage from "dom-to-image-more";
import { useNavigate } from "react-router-dom";
// Define themes in a separate object for easier management
const themes = {
  light: {
    name: "Light",
    background: "bg-white",
    text: "text-black",
    border: "border-gray-300",
    canvas: "bg-white",
    canvasBorder: "border-gray-300",
    input: "bg-white text-black",
    button: "bg-green-500",
    nav: "bg-gray-800 text-white",
    footer: "bg-gray-800 text-white",
    heading: "text-gray-900",
    text: "text-gray-700",
    sidebar: "bg-gray-100",
  },
  dark: {
    name: "Dark",
    background: "bg-gray-900",
    text: "text-white",
    border: "border-gray-700",
    canvas: "bg-gray-800",
    canvasBorder: "border-gray-700",
    input: "bg-gray-700 text-white",
    button: "bg-blue-600",
    nav: "bg-gray-900 text-white",
    footer: "bg-gray-900 text-white",
    heading: "text-white",
    text: "text-gray-300",
    sidebar: "bg-gray-800",
  },
  blue: {
    name: "Blue",
    background: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-200",
    canvas: "bg-white",
    canvasBorder: "border-blue-300",
    input: "bg-blue-50 text-blue-900",
    button: "bg-blue-500",
    nav: "bg-blue-800 text-white",
    footer: "bg-blue-800 text-white",
    heading: "text-blue-800",
    text: "text-blue-700",
    sidebar: "bg-blue-100",
  },
  green: {
    name: "Green",
    background: "bg-green-50",
    text: "text-green-900",
    border: "border-green-200",
    canvas: "bg-white",
    canvasBorder: "border-green-300",
    input: "bg-green-50 text-green-900",
    button: "bg-green-600",
    nav: "bg-green-800 text-white",
    footer: "bg-green-800 text-white",
    heading: "text-green-800",
    text: "text-green-700",
    sidebar: "bg-green-100",
  },
  contrast: {
    name: "High Contrast",
    background: "bg-black",
    text: "text-white",
    border: "border-yellow-400",
    canvas: "bg-black",
    canvasBorder: "border-yellow-400",
    input: "bg-black text-white border-yellow-400",
    button: "bg-yellow-500 text-black",
    nav: "bg-yellow-500 text-black",
    footer: "bg-yellow-500 text-black",
    heading: "text-yellow-400",
    text: "text-white",
    sidebar: "bg-gray-900",
  },
};

const Preview = ({ detections }) => {
  // Original detections array remains the same
  const navigate = useNavigate();
  
  const Canvas = ({
    components,
    onComponentChange,
    onComponentSelect,
    selectedComponentId,
    currentTheme,
    canvasRef,
  }) => {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({
      width: 640,
      height: 640,
    });

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

    const handleDragStop = (componentId, d) => {
      const component = components.find((c) => c.id === componentId);
      if (!component) return;

      const newBox = [...component.box];
      newBox[0] = (d.x / containerSize.width) * 640;
      newBox[1] = (d.y / containerSize.height) * 640;

      const updatedComponent = { ...component, box: newBox };
      onComponentChange(componentId, updatedComponent);
    };

    const handleResizeStop = (componentId, ref, position) => {
      const component = components.find((c) => c.id === componentId);
      if (!component) return;

      const newBox = [...component.box];
      newBox[0] = (position.x / containerSize.width) * 640;
      newBox[1] = (position.y / containerSize.height) * 640;
      newBox[2] = (ref.offsetWidth / containerSize.width) * 640;
      newBox[3] = (ref.offsetHeight / containerSize.height) * 640;

      const updatedComponent = { ...component, box: newBox };
      onComponentChange(componentId, updatedComponent);
    };

    const theme = themes[currentTheme];

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (canvasRef) canvasRef.current = node;
        }}
        className={`relative w-full aspect-square border mx-auto shadow-xl overflow-hidden rounded-2xl transition-colors duration-300 ${theme.canvas} border-${theme.canvasBorder} ${theme.text}`}
        onClick={(e) => {
          // Only clear selection if clicking directly on the canvas (not on a component)
          if (e.target === e.currentTarget) {
            onComponentSelect(null);
            console.log("Canvas clicked, clearing selection");
          }
        }}
      >
        {components.map((component) => {
          const [x, y, width, height] = component.box || [0, 0, 120, 60];
          const xScaled = (x / 640) * containerSize.width;
          const yScaled = (y / 640) * containerSize.height;
          const widthScaled = (width / 640) * containerSize.width;
          const heightScaled = (height / 640) * containerSize.height;

          const isSelected = component.id === selectedComponentId;

          return (
            // Update your Rnd component to ensure it captures click events
            <Rnd
              key={component.id}
              position={{ x: xScaled, y: yScaled }}
              size={{ width: widthScaled, height: heightScaled }}
              onDragStop={(e, d) => handleDragStop(component.id, d)}
              onResizeStop={(e, direction, ref, delta, position) =>
                handleResizeStop(component.id, ref, position)
              }
              bounds="parent"
              className={`absolute transition-colors duration-300
              ${
                isSelected
                  ? "outline-4 outline-blue-500 shadow-lg z-20"
                  : "outline-none"
              }
              rounded-lg
            `}
              style={{
                boxSizing: "border-box",
                pointerEvents: "auto",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onComponentSelect(component.id);
                console.log("Component selected:", component.id);
              }}
              tabIndex={0}
              role="region"
              aria-label={`${component.label} component, draggable and resizable`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onComponentSelect(component.id);
                }
              }}
            >
              <div className="w-full h-full" style={{ pointerEvents: "none" }}>
                {renderComponent(component, currentTheme)}
              </div>
            </Rnd>
          );
        })}
      </div>
    );
  };

  const renderComponent = (item, currentTheme) => {
    const theme = themes[currentTheme];
    const text = item.text || "";
    switch (item.label) {
      case "image":
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
              alt="image"
              className="w-full h-full object-cover rounded-lg"
              style={{ pointerEvents: "none" }}
            />
            <p className="text-sm text-center">image</p>
          </div>
        );
      case "icon":
        return (
          <div
            className=" w-full h-full relative"
            style={{ pointerEvents: "none" }}
          >
            <img
              src={
                item.imgUrl ||
                "https://www.iconpacks.net/icons/1/free-star-icon-984-thumb.png"
              }
              alt="image"
              className="w-full h-full object-cover rounded-lg"
              style={{ pointerEvents: "none" }}
            />
          </div>
        );
      case "button":
        return (
          <button
            className={`${
              item.bgColor || theme.button
            } hover:opacity-75 text-white rounded-lg p-2 w-full h-full shadow-md`}
            aria-label={text || "Submit"} // Add aria-label
            role="button"
            tabIndex={0} // Ensure keyboard focus
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") e.preventDefault();
            }} // Handle keyboard activation
          >
            {text || "Submit"}
          </button>
        );

      case "input":
        return (
          <input
            className={`border rounded-lg p-2 w-full h-full ${theme.input}`}
            placeholder="Enter text..."
            value={text}
            readOnly
            aria-label={`${item.label || "Text"} input field`}
            tabIndex={0}
          />
        );

      case "heading":
        // Use proper heading level for screen readers
        return (
          <h2
            className={`text-2xl font-bold w-full h-full ${theme.heading}`}
            tabIndex={0}
          >
            {text || "Heading Text"}
          </h2>
        );
      case "text":
        return (
          <p className={`text-base w-full h-full ${theme.text}`}>
            {text || "Sample text goes here."}
          </p>
        );
      case "radio button":
        return (
          <div className="flex items-center gap-2 w-full h-full min-w-[100px]">
            <input type="checkbox" className="w-4 h-4" />
            <span>{text || "Check me"}</span>
          </div>
        );
      case "nav":
        return (
          <nav
            className={`rounded-md p-3 flex justify-around w-full h-full ${theme.nav}`}
            aria-label="Main navigation"
            role="navigation"
          >
            {(Array.isArray(item.menuItems) && item.menuItems.length > 0
              ? item.menuItems
              : ["Home", "About", "Contact"]
            ).map((navItem, i) => (
              <a key={i} href="#" className="" tabIndex={0} role="menuitem">
                {navItem}
              </a>
            ))}
          </nav>
        );
      case "footer":
        return (
          <footer
            className={`p-3 rounded-md text-center w-full h-full ${theme.footer}`}
          >
            {text || "Footer Content"}
          </footer>
        );
      default:
        // Return a debug display for unknown component types
        return (
          <div className="border border-red-500 p-2 w-full h-full flex items-center justify-center">
            <p className="text-sm">{item.label || "Unknown component"}</p>
          </div>
        );
    }
  };

  // Transform detections array to have unique IDs
  const initialComponents = detections.map((detection, index) => ({
    ...detection,
    id: `detection-${index}`,
  }));

  const [components, setComponents] = useState(initialComponents);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    console.log("Selection changed to:", selectedComponentId);
  }, [selectedComponentId]);
  // Handle updates to a component
  const handleComponentChange = (id, updatedComponent) => {
    setComponents((prev) =>
      prev.map((component) =>
        component.id === id ? updatedComponent : component
      )
    );
  };

  // Set up click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only clear selection if the click is outside the canvas
      if (canvasRef.current && !canvasRef.current.contains(e.target)) {
        setSelectedComponentId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get theme from localStorage or use default
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("wireframeTheme") || "light"
  );

  // Update localStorage when theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", currentTheme === "dark");
    localStorage.setItem("wireframeTheme", currentTheme);
  }, [currentTheme]);

  // Add canvas size state
  const [canvasSize, setCanvasSize] = useState("medium");

  // Get appropriate max-width based on size
  const getCanvasMaxWidth = () => {
    switch (canvasSize) {
      case "small":
        return "max-w-[600px]";
      case "medium":
        return "max-w-[800px]";
      case "large":
        return "max-w-[1000px]";
      default:
        return "max-w-[800px]";
    }
  };

  // Generate React code from components
  const generateReactCode = () => {
    const theme = themes[currentTheme];

    let imports = `import React from 'react';\n\n`;

    let componentCode = `const WireframeTemplate = () => {\n`;
    componentCode += `  return (\n`;
    componentCode += `    <div className="relative w-full max-w-4xl mx-auto aspect-square ${theme.canvas} ${theme.text} border ${theme.canvasBorder} rounded-2xl shadow-xl overflow-hidden">\n`;

    // Sort components by y position for more logical rendering
    const sortedComponents = [...components].sort(
      (a, b) => a.box[1] - b.box[1]
    );

    sortedComponents.forEach((component) => {
      const [x, y, width, height] = component.box;
      const positionStyle = `position: 'absolute', left: '${(
        (x / 640) *
        100
      ).toFixed(2)}%', top: '${((y / 640) * 100).toFixed(2)}%', width: '${(
        (width / 640) *
        100
      ).toFixed(2)}%', height: '${((height / 640) * 100).toFixed(2)}%'`;

      switch (component.label) {
        case "input":
          componentCode += `      <input className="${theme.input} border rounded-lg p-2 w-full h-full" style={{${positionStyle}}} placeholder="Enter text..." />\n`;
          break;
        case "button":
          componentCode += `      <button className="${
            component.bgColor || theme.button
          } text-white rounded-lg p-2 w-full h-full shadow-md hover:opacity-90" style={{${positionStyle}}}>${
            component.text || "Submit"
          }</button>\n`;
          break;
        case "heading":
          componentCode += `      <h2 className="${
            theme.heading
          } text-2xl font-bold" style={{${positionStyle}}}>${
            component.text || "Heading Text"
          }</h2>\n`;
          break;
        case "text":
          componentCode += `      <p className="${
            theme.text
          } text-base" style={{${positionStyle}}}>${
            component.text || "Sample text goes here."
          }</p>\n`;
          break;
        case "checkbox":
          componentCode += `      <div className="flex items-center gap-2" style={{${positionStyle}}}>\n`;
          componentCode += `        <input type="checkbox" className="w-4 h-4" />\n`;
          componentCode += `        <span>${
            component.text || "Check me"
          }</span>\n`;
          componentCode += `      </div>\n`;
          break;
        case "nav":
          const menuItems = component.menuItems || ["Home", "About", "Contact"];
          componentCode += `      <nav className="${theme.nav} rounded-md p-3 flex justify-around" style={{${positionStyle}}}>\n`;
          menuItems.forEach((item) => {
            componentCode += `        <a href="#" className="hover:underline">${item}</a>\n`;
          });
          componentCode += `      </nav>\n`;
          break;
        case "footer":
          componentCode += `      <footer className="${
            theme.footer
          } p-3 rounded-md text-center" style={{${positionStyle}}}>${
            component.text || "Footer Content"
          }</footer>\n`;
          break;
        case "image":
          componentCode += `      <div className="border-2 border-dashed rounded-lg p-2 overflow-hidden" style={{${positionStyle}}}>\n`;
          componentCode += `        <img src="https://archive.org/download/placeholder-image/placeholder-image.jpg" alt="image" className="w-full h-full object-cover rounded-lg" />\n`;
          componentCode += `      </div>\n`;
          break;
      }
    });

    componentCode += `    </div>\n`;
    componentCode += `  );\n`;
    componentCode += `};\n\n`;
    componentCode += `export default WireframeTemplate;`;

    return imports + componentCode;
  };

  // Handle export as React code
  const handleExportReactCode = () => {
    const code = generateReactCode();
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "WireframeTemplate.jsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (canvasRef.current) {
      try {
        // Show loading indicator
        const loadingIndicator = document.createElement("div");
        loadingIndicator.innerHTML = "Generating PDF... Please wait.";
        loadingIndicator.style.position = "fixed";
        loadingIndicator.style.top = "50%";
        loadingIndicator.style.left = "50%";
        loadingIndicator.style.transform = "translate(-50%, -50%)";
        loadingIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        loadingIndicator.style.color = "white";
        loadingIndicator.style.padding = "20px";
        loadingIndicator.style.borderRadius = "5px";
        loadingIndicator.style.zIndex = "9999";
        document.body.appendChild(loadingIndicator);

        // Clone the canvas to avoid modifying the original
        const originalCanvas = canvasRef.current;
        const clonedCanvas = originalCanvas.cloneNode(true);
        const originalWidth = originalCanvas.offsetWidth;
        const originalHeight = originalCanvas.offsetHeight;

        // Clone the canvas...

        // Set the clone to match the original dimensions exactly
        clonedCanvas.style.width = `${originalWidth}px`;
        clonedCanvas.style.height = `${originalHeight}px`;
        // Hide the clone while we manipulate it
        clonedCanvas.style.position = "absolute";
        clonedCanvas.style.left = "-9999px";
        clonedCanvas.style.top = "-9999px";
        document.body.appendChild(clonedCanvas);

        const iconDataUri =
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'><path d='M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z' fill='gray'/></svg>";

        const images = clonedCanvas.querySelectorAll("img");
        images.forEach((img) => {
          // Only replace icon images (by URL or fallback)
          if (
            img.src.includes("iconpacks.net") ||
            img.src.includes("free-star-icon-984-thumb.png")
          ) {
            img.src = iconDataUri;
          }
          img.crossOrigin = "anonymous";
        });

        // Remove borders/shadows for export
        const elementsWithBorders = clonedCanvas.querySelectorAll("*");
        elementsWithBorders.forEach((element) => {
          element.style.border = "none";
          element.style.outline = "none";
          element.style.boxShadow = "none";
          if (
            element.className &&
            typeof element.className === "string" &&
            (element.className.includes("border") ||
              element.className.includes("outline") ||
              element.className.includes("shadow"))
          ) {
            element.className = element.className
              .replace(/\bborder\S*\b/g, "")
              .replace(/\boutline\S*\b/g, "")
              .replace(/\bshadow\S*\b/g, "");
          }
        });

        // Use dom-to-image-more on the modified clone
        const dataUrl = await domtoimage.toPng(clonedCanvas, {
          quality: 1.0,
          width: originalWidth,
          height: originalHeight,
          scale: 2,
          bgcolor:
            themes[currentTheme].canvas === "bg-white" ? "#FFFFFF" : "#1F2937",
        });
        // Create a new PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (originalHeight * pdfWidth) / originalWidth;
        // Create an Image from the data URL
        const img = new Image();
        img.src = dataUrl;

        // Wait for the image to load
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      

        // Save the PDF
        pdf.save("wireframe.pdf");

        loadingIndicator.innerHTML = "PDF generated successfully!";
        loadingIndicator.style.backgroundColor = "rgba(0, 128, 0, 0.85)";
        setTimeout(() => {
          if (clonedCanvas && clonedCanvas.parentNode) {
            document.body.removeChild(clonedCanvas);
          }
          if (loadingIndicator && loadingIndicator.parentNode) {
            document.body.removeChild(loadingIndicator);
          }
        }, 1200);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert(`Error generating PDF: ${error.message || "Unknown error"}`);
      }
    }
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen transition-colors duration-300 `}>
        <div
          className={`flex flex-col sm:flex-row justify-between p-4 border-b ${themes[currentTheme].border}`}
        >
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Template Preview</h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="size-select" className="mr-2">
                Size:
              </label>
              <select
                id="size-select"
                value={canvasSize}
                onChange={(e) => setCanvasSize(e.target.value)}
                className={`px-3 py-1 rounded-md bg-white text-black border border-black`}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="theme-select" className="mr-2">
                Theme:
              </label>
              <select
                id="theme-select"
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className={`px-3 py-1 rounded-md bg-white text-black border border-black`}
              >
                {Object.keys(themes).map((themeKey) => (
                  <option key={themeKey} value={themeKey}>
                    {themes[themeKey].name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4">
          {/* Canvas with dynamic sizing */}
          <div className={`mx-auto w-full ${getCanvasMaxWidth()}`}>
            <p className="text-center mb-4">
              Click and drag components to move them. Resize by dragging the
              edges.
            </p>
            <Canvas
              components={components}
              onComponentChange={handleComponentChange}
              onComponentSelect={setSelectedComponentId}
              selectedComponentId={selectedComponentId}
              currentTheme={currentTheme}
              canvasRef={canvasRef}
            />

            {/* Download buttons */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleExportReactCode}
                className={`px-4 py-2 rounded-md bg-gray-900 text-white hover:opacity-90 transition-opacity flex items-center space-x-2`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Download React+Tailwind</span>
              </button>
              <button
                onClick={handleExportPDF}
                className={`px-4 py-2 rounded-md bg-gray-900 text-white hover:opacity-90 transition-opacity flex items-center space-x-2`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Download PDF</span>
              </button>
              <button
                onClick={() =>
                  navigate("/test", {
                    state: { detections: detections },
                  })
                }
                disabled={!detections.length}
                className="px-4 py-2 rounded-md bg-gray-900 text-white hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                Open in UI Builder
              </button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Preview;
