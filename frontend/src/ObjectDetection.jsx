import React, { useState } from "react";
import GeneratedUI from "./GeneratedUI";
import Preview from "./Preview";
import WireframeEditor from "./Preview";
import WireframeTemplate from "./WireframeTemplate";

function ObjectDetection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Show image preview
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // In your frontend ObjectDetection.jsx
  const handleDetectObjects = async () => {
    if (!image) return;
    setLoading(true);

    // Create a copy of the image for resizing
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = async () => {
      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;

      // Set target dimensions (max 640x640, preserving aspect ratio)
      let targetWidth, targetHeight;
      if (aspectRatio > 1) {
        targetWidth = Math.min(640, img.width);
        targetHeight = targetWidth / aspectRatio;
      } else {
        targetHeight = Math.min(640, img.height);
        targetWidth = targetHeight * aspectRatio;
      }

      // Set canvas size and draw resized image
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Convert to blob with reasonable quality
      canvas.toBlob(
        async (blob) => {
          const formData = new FormData();
          formData.append("image", blob, "resized-wireframe.jpg");
          formData.append("originalWidth", img.width);
          formData.append("originalHeight", img.height);

          try {
            const response = await fetch(
              "http://localhost:5000/api/detect-objects",
              {
                method: "POST",
                body: formData,
              }
            );

            // Rest of your existing code
            if (!response.ok) {
              const errorDetails = await response.json();
              throw new Error(errorDetails.message || response.statusText);
            }

            const data = await response.json();
            setDetectionResult(data);
            console.log("Detection Result:", data);
          } catch (error) {
            console.error("Error:", error);
          } finally {
            setLoading(false);
          }
        },
        "image/jpeg",
        0.9
      ); // 90% quality JPEG
    };

    img.src = URL.createObjectURL(image);
  };

const transformedDetections = React.useMemo(() => {
  if (!detectionResult?.detections) return [];

  console.log("Raw Detections:", detectionResult.detections); // Log raw detections

  // Define container element types to filter out completely
  const containerTypes = ["container"];

  // First, identify all nav elements and their boxes (we keep nav elements)
  const navElements = detectionResult.detections
    .filter((detection) => detection.label.toLowerCase() === "nav")
    .map((detection) => {
      const [x, y, width, height] = detection.box;
      return {
        label: detection.label.toLowerCase(),
        x1: x - width / 2,
        y1: y - height / 2,
        x2: x + width / 2,
        y2: y + height / 2,
      };
    });

  console.log("Nav Elements:", navElements); // Log nav elements

  // Check if a given element is inside any nav element
  const isInsideNav = (box, elementLabel) => {
    const [x, y, width, height] = box;
    const x1 = x - width / 2;
    const y1 = y - height / 2;
    const x2 = x + width / 2;
    const y2 = y + height / 2;

    return navElements.some((nav) => {
      if (nav.x1 === x1 && nav.y1 === y1 && nav.x2 === x2 && nav.y2 === y2) {
        return false;
      }
      return x1 >= nav.x1 && x2 <= nav.x2 && y1 >= nav.y1 && y2 <= nav.y2;
    });
  };

  // Filter and transform detections
  const filteredDetections = detectionResult.detections
    .filter((detection) => {
      const label = detection.label.toLowerCase();

      // Remove all container-type elements
      if (containerTypes.includes(label)) {
        return false;
      }

      // Filter out text elements inside nav
      if (label === "text" && isInsideNav(detection.box, label)) {
        return false;
      }

      return true;
    })
    .map((detection) => {
      const [x, y, width, height] = detection.box;

      // Add an ID if it doesn't have one
      const id =
        detection.id || `comp-${Math.random().toString(36).substr(2, 9)}`;

      return {
        ...detection,
        id,
        box: [x - width / 2, y - height / 2, width, height],
      };
    });

  console.log("Transformed Detections:", filteredDetections); // Log transformed detections

  return filteredDetections;
}, [detectionResult]);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Left Side: Upload and Controls */}
            <div className="md:w-1/3 border-r border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Upload Wireframe
                </h2>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center">
                    {preview ? (
                      <div className="w-full max-h-48 overflow-hidden mb-3">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-auto object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          Click to upload or drag and drop
                        </p>
                      </div>
                    )}
                    <label
                      htmlFor="file-upload"
                      className={`${
                        preview ? "mt-2" : ""
                      } inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer`}
                    >
                      {preview ? "Change Image" : "Upload Image"}
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <button
                  onClick={handleDetectObjects}
                  disabled={loading || !image}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || !image
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Generate UI"
                  )}
                </button>
              </div>
            </div>

            {/* Right Side: Results and Preview */}
            <div className="md:w-2/3">
              <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  {!detectionResult ? (
                    <div className="h-64 flex items-center justify-center p-4">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          Upload a wireframe image and click "Generate UI" to
                          see the preview here
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Preview
                      key={
                        detectionResult ? `preview-${Date.now()}` : "no-preview"
                      }
                      detections={transformedDetections}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ObjectDetection;
