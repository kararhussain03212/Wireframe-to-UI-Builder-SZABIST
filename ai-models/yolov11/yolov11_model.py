import sys
from ultralytics import YOLO
import os
import json
import cv2
import numpy as np
import easyocr
import traceback
from autocorrect import Speller
from paddleocr import PaddleOCR

# Initialize OCR engines
spell_checker = Speller('en')
reader = easyocr.Reader(['en'], gpu=False)  # Keeping EasyOCR as backup
# Initialize PaddleOCR (set use_gpu=True if you have GPU support)
paddle_ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False, show_log=False)



# Initialize once at the module level
spell_checker = Speller('en')
# Initialize the EasyOCR reader (do this once at module level for better performance)
reader = easyocr.Reader(['en'], gpu=False)  # Set gpu=True if you have CUDA

# Dictionary of common OCR errors specific to your domain
COMMON_CORRECTIONS = {
    "lovem": "lorem",
    "ipsum": "ipsum",
    "mnuf": "must",
    "explein": "explain",
    "hoto": "how to",
    "pieject": "project",
    "sexvices": "services",
    "lineden": "linkedin",
    "gilhub": "github",
    "pteject": "project",
    "bou": "about",
    "0ust": "just",
    "prplain": "explain",
    "how)": "how",
    "0t(": "to",
    "bu+": "but",
    "stn": "site",
    "tex": "text"
}

# Set debug mode
DEBUG = True

def nms(boxes, confidences, labels, iou_threshold=0.3, conf_threshold=0.25):
    """
    Non-maximum suppression to filter overlapping boxes
    
    Args:
        boxes: List of bounding boxes in format [x, y, w, h]
        confidences: List of confidence scores
        labels: List of class labels
        iou_threshold: IoU threshold for filtering
        conf_threshold: Confidence threshold
        
    Returns:
        List of indices to keep
    """
    # Filter out low confidence detections
    filtered_indices = [i for i, conf in enumerate(confidences) if conf >= conf_threshold]
    
    if not filtered_indices:
        return []
        
    # Get filtered boxes, confidences, and labels
    filtered_boxes = [boxes[i] for i in filtered_indices]
    filtered_confidences = [confidences[i] for i in filtered_indices]
    filtered_labels = [labels[i] for i in filtered_indices]
    
    # Convert to numpy arrays for easier processing
    boxes_np = np.array(filtered_boxes)
    confidences_np = np.array(filtered_confidences)
    labels_np = np.array(filtered_labels)
    
    # Sort by confidence
    indices = np.argsort(-confidences_np)
    
    keep_indices = []
    
    while len(indices) > 0:
        # Pick the box with highest confidence
        current_idx = indices[0]
        keep_indices.append(current_idx)
        
        if len(indices) == 1:
            break
            
        # Remove the current box
        indices = indices[1:]
        
        # Get the remaining boxes
        current_box = boxes_np[current_idx]
        remaining_boxes = boxes_np[indices]
        current_label = labels_np[current_idx]
        remaining_labels = labels_np[indices]
        
        # Convert from xywh to xyxy for IoU calculation
        current_box_xyxy = xywh_to_xyxy(current_box)
        remaining_boxes_xyxy = np.array([xywh_to_xyxy(box) for box in remaining_boxes])
        
        # Calculate IoU with remaining boxes
        ious = calculate_iou(current_box_xyxy, remaining_boxes_xyxy)
        
        # Remove boxes with the same label as current box and IoU > threshold
        same_class_mask = (remaining_labels == current_label)
        iou_mask = (ious > iou_threshold)
        remove_mask = same_class_mask & iou_mask
        
        indices = indices[~remove_mask]
    
    # Map back to original indices
    return [filtered_indices[i] for i in keep_indices]

def xywh_to_xyxy(box):
    """Convert box from [x, y, w, h] to [x1, y1, x2, y2] format"""
    x, y, w, h = box
    return [x - w/2, y - h/2, x + w/2, y + h/2]
    
def calculate_iou(box, boxes):
    """Calculate IoU between a box and multiple boxes"""
    # box: [x1, y1, x2, y2]
    # boxes: [[x1, y1, x2, y2], ...]
    
    # Calculate intersection area
    x1 = np.maximum(box[0], boxes[:, 0])
    y1 = np.maximum(box[1], boxes[:, 1])
    x2 = np.minimum(box[2], boxes[:, 2])
    y2 = np.minimum(box[3], boxes[:, 3])
    
    # Calculate width and height of intersection
    w = np.maximum(0, x2 - x1)
    h = np.maximum(0, y2 - y1)
    
    # Calculate intersection area
    intersection = w * h
    
    # Calculate box areas
    box_area = (box[2] - box[0]) * (box[3] - box[1])
    boxes_area = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
    
    # Calculate union area
    union = box_area + boxes_area - intersection
    
    # Calculate IoU
    iou = intersection / union
    
    return iou


def correct_extracted_text(text, element_type="text"):
    """Corrects OCR extracted text using custom dictionary + autocorrect"""
    if not text:
        return text
    
    # Apply context-specific corrections based on element type
    if element_type.lower() == 'button':
        # Common buttons
        if text.lower() in ['snd', 'sbmt', 'ok', 'cncl', 'cnfrm']:
            text = {'snd': 'Send', 'sbmt': 'Submit', 'ok': 'OK', 
                    'cncl': 'Cancel', 'cnfrm': 'Confirm'}.get(text.lower(), text)
    
    elif element_type.lower() == 'heading':
        # Try to make headings look proper
        words = text.split()
        text = ' '.join([w.capitalize() if len(w) > 1 else w for w in words])
        
    # Apply custom dictionary corrections
    words = text.split()
    for i, word in enumerate(words):
        word_lower = word.lower()
        if word_lower in COMMON_CORRECTIONS:
            # Preserve capitalization when replacing
            if word[0].isupper() and len(word) > 1:
                replacement = COMMON_CORRECTIONS[word_lower]
                words[i] = replacement[0].upper() + replacement[1:]
            else:
                words[i] = COMMON_CORRECTIONS[word_lower]
    
    corrected_text = " ".join(words)
    
    # Apply spell checker only for longer words (3+ chars)
    try:
        words = corrected_text.split()
        for i, word in enumerate(words):
            if len(word) > 2 and word.isalpha():  # Only correct alphabetic words
                words[i] = spell_checker(word)
        corrected_text = " ".join(words)
    except Exception as e:
        print(f"Spell checker error: {e}")
    
    return corrected_text

def extract_text_with_paddle(image):
    """Extract text using PaddleOCR"""
    try:
        # PaddleOCR expects a file path or an image array
        result = paddle_ocr.ocr(image, cls=True)
        
        # Process results
        if result and result[0]:  # Check if results exist
            texts = []
            for line in result[0]:
                if len(line) >= 2:  # Each line should have bbox and [text, confidence]
                    text_info = line[1]
                    if isinstance(text_info, tuple) and len(text_info) >= 1:
                        text = text_info[0]
                        texts.append(text)
            
            return " ".join(texts) if texts else ""
        return ""
    except Exception as e:
        print(f"PaddleOCR error: {e}")
        return ""

def extract_text_from_region(image, box, element_type, idx=0, output_folder=None):
    """Extract text from a region based on element type using OCR."""
    # Convert xywh format to xyxy for cropping
    x, y, w, h = box
    x1, y1 = int(x - w/2), int(y - h/2)
    x2, y2 = int(x + w/2), int(y + h/2)
    
    # Ensure coordinates are within image boundaries
    h_img, w_img = image.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w_img, x2), min(h_img, y2)
    
    # Crop the region
    region = image[y1:y2, x1:x2]
    
    if region.size == 0:
        return [] if element_type.lower() == 'nav' else ""
    
    # Add padding around the region for better OCR
    padding = 5
    padded_region = cv2.copyMakeBorder(
        region, 
        padding, padding, padding, padding, 
        cv2.BORDER_CONSTANT, 
        value=(255, 255, 255)  # White padding
    )
    
    # Save debug region if enabled
    if DEBUG and output_folder:
        debug_folder = os.path.join(output_folder, 'debug_regions')
        os.makedirs(debug_folder, exist_ok=True)
        cv2.imwrite(os.path.join(debug_folder, f"{element_type}_{idx}.jpg"), padded_region)
    
    # For nav elements, handle differently to extract menu items
    if element_type.lower() == 'nav':
        nav_items = []
        
        try:
            # Try PaddleOCR first for Nav elements
            result = paddle_ocr.ocr(padded_region, cls=True)
            
            if result and result[0]:  # Check if results exist
                for line in result[0]:
                    if len(line) >= 2:  # Each line should have bbox and [text, confidence]
                        text_info = line[1]
                        if isinstance(text_info, tuple) and len(text_info) >= 1:
                            text = text_info[0]
                            if text and len(text) > 1:  # Skip very short text
                                nav_items.append(text)
            
            # If PaddleOCR didn't find anything, fall back to EasyOCR
            if not nav_items:
                results = reader.readtext(padded_region)
                
                # If we found text items, add them to nav_items
                if results:
                    for detection in results:
                        text = detection[1]  # EasyOCR returns [bbox, text, confidence]
                        if text and len(text) > 1:  # Skip very short text
                            nav_items.append(text)
            
            # If we still don't have nav items, try alternative techniques
            if not nav_items:
                # Try with paragraph mode from EasyOCR
                gray = cv2.cvtColor(padded_region, cv2.COLOR_BGR2GRAY)
                results = reader.readtext(gray, paragraph=True)
                if results:
                    full_text = ' '.join([r[1] for r in results])
                    
                    # Split by spaces if no clear divisions
                    items = full_text.split()
                    # Keep only items with reasonable length
                    nav_items = [item for item in items if len(item) > 2]
            
            # Default menu items if nothing was detected
            if not nav_items:
                nav_items = ["Home", "About", "Contact"]
                
            return nav_items
            
        except Exception as e:
            print(f"Error in Nav text detection: {e}")
            # Return default nav items in case of error
            return ["Home", "About", "Contact"]
    else:
        # For non-nav elements, just get the text content
        try:
            # Try PaddleOCR first
            paddle_text = extract_text_with_paddle(padded_region)
            
            # If PaddleOCR found text, use it
            if paddle_text:
                return paddle_text
                
            # Otherwise, fall back to EasyOCR with preprocessing
            if element_type.lower() in ['button', 'heading']:
                # Enhance contrast for buttons and headings
                gray = cv2.cvtColor(padded_region, cv2.COLOR_BGR2GRAY)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                enhanced = clahe.apply(gray)
                results = reader.readtext(enhanced)
            else:
                # Use standard preprocessing for other elements
                results = reader.readtext(padded_region)
            
            # Combine all detected text
            if results:
                if element_type.lower() in ['heading', 'button']:
                    # For headings and buttons, take just the first or highest confidence result
                    best_result = max(results, key=lambda x: x[2])  # Sort by confidence
                    return best_result[1]
                else:
                    # For other elements, combine all text
                    detected_text = ' '.join([r[1] for r in results])
                    return detected_text
            else:
                # If no text detected, return default text based on element type
                if element_type.lower() == 'button':
                    return "Button"
                elif element_type.lower() == 'heading':
                    return "Heading"
                elif element_type.lower() == 'text':
                    return "Text content"
                else:
                    return ""
                    
        except Exception as e:
            print(f"Error in text detection for {element_type}: {e}")
            return ""

def detect_objects(image_path):
    weights_path = os.path.join(os.path.dirname(__file__), 'weights', 'model1.pt')
    model = YOLO(weights_path)
    results = model(image_path)
    
    # Load the original image for text extraction
    original_image = cv2.imread(image_path)
    
    uploads_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(uploads_folder, exist_ok=True)

    # Define text-containing element types (case-insensitive)
    TEXT_CONTAINING_ELEMENTS = ['text', 'input', 'button', 'heading', 'nav', 'footer', 
                               'checkbox', 'radio button', 'html']

    all_detections = []

    for idx, result in enumerate(results):
        boxes = result.boxes.xywh.tolist()
        label_indices = result.boxes.cls.tolist()
        confidences = result.boxes.conf.tolist()
        labels = [result.names[int(i)] for i in label_indices]
        
        print(f"Detected element types: {set(labels)}")

        keep_indices = nms(boxes, confidences, labels)
        print(f"After NMS: {len(keep_indices)} elements kept out of {len(boxes)}")

        filtered_detections = []
        for i, idx_to_keep in enumerate(keep_indices):
            # Process text extraction for elements that typically contain text
            element_type = labels[idx_to_keep]
            box = boxes[idx_to_keep]
            
            print(f"Processing element: {element_type}")
            
            # Save debug region for ALL elements regardless of type
            if DEBUG and uploads_folder:
                x, y, w, h = box
                x1, y1 = int(x - w/2), int(y - h/2)
                x2, y2 = int(x + w/2), int(y + h/2)
                h_img, w_img = original_image.shape[:2]
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w_img, x2), min(h_img, y2)
                region = original_image[y1:y2, x1:x2]
                
                if region.size > 0:
                    debug_folder = os.path.join(uploads_folder, 'all_regions')
                    os.makedirs(debug_folder, exist_ok=True)
                    cv2.imwrite(os.path.join(debug_folder, f"{i}_{element_type}.jpg"), region)
            
            detection = {
                "label": element_type.lower(),  # Convert to lowercase for consistency
                "box": box,
                "confidence": confidences[idx_to_keep]
            }
            
            # Extract text only for text-containing elements (case insensitive check)
            if element_type.lower() in TEXT_CONTAINING_ELEMENTS:
                print(f"  - Extracting text for {element_type}")
                extracted_text = extract_text_from_region(
                    original_image, box, element_type, i, uploads_folder
                )
                
                # Find this part in detect_objects function
                if isinstance(extracted_text, str):
                    extracted_text = correct_extracted_text(extracted_text, element_type)
                elif isinstance(extracted_text, list):
                    extracted_text = [correct_extracted_text(item, "nav") for item in extracted_text]

                print(f"  - Extracted text: {extracted_text}")
                
                # Handle the different return types (list for Nav, string for others)
                if element_type.lower() == 'nav' and isinstance(extracted_text, list):
                    detection["menuItems"] = extracted_text
                elif extracted_text:
                    detection["text"] = extracted_text
            
            filtered_detections.append(detection)

        all_detections.extend(filtered_detections)

        # Save a visualization of the detections
        img_with_boxes = result.plot()
        output_image_path = os.path.join(uploads_folder, f"detected_{idx + 1}.jpg")
        cv2.imwrite(output_image_path, img_with_boxes)

    # Return both the detections and the path to the saved image with boxes
    return all_detections, output_image_path

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python yolov11_model.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    
    # Capture any print statements or errors to prevent them from corrupting JSON output
    import io
    from contextlib import redirect_stdout
    
    debug_output = io.StringIO()
    
    try:
        with redirect_stdout(debug_output):
            detected_objects, saved_image_path = detect_objects(image_path)
        
        # Helper function to make numpy arrays JSON serializable
        def json_serialize(obj):
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            if isinstance(obj, np.integer):
                return int(obj)
            if isinstance(obj, np.floating):
                return float(obj)
            raise TypeError(f"Type {type(obj)} not serializable")
            
        # Create proper JSON output
        output = {
            "detections": detected_objects,
            "saved_image": saved_image_path
        }
        
        # Print only the JSON, nothing else
        print(json.dumps(output, indent=4, default=json_serialize))
        
    except Exception as e:
        # If there's an error, return that as JSON too
        error_output = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_output, indent=4))