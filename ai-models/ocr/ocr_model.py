import cv2
import pytesseract
from autocorrect import Speller
from matplotlib import pyplot as plt

spell = Speller(lang='en')

def preprocess_image(path):
    img = cv2.imread(path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Resize for better OCR
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)

    # Gaussian blur + adaptive thresholding
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY_INV, 15, 9
    )
    return img, thresh

def extract_text_with_boxes(image, thresh):
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    results = []

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)

        # Ignore small noise
        if w < 40 or h < 15:
            continue

        roi = image[y:y+h, x:x+w]
        roi_gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        text = pytesseract.image_to_string(roi_gray, config='--psm 6')
        corrected = spell(text.strip())

        results.append(((x, y, w, h), corrected))
        cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 1)

    return image, results

def main(image_path):
    original, thresh = preprocess_image(image_path)
    boxed_image, texts = extract_text_with_boxes(original, thresh)

    for box, text in sorted(texts, key=lambda x: (x[0][1], x[0][0])):
        print(f"{text}")

    # Show image with boxes
    plt.imshow(cv2.cvtColor(boxed_image, cv2.COLOR_BGR2RGB))
    plt.title("Detected Text Regions")
    plt.axis('off')
    plt.show()


