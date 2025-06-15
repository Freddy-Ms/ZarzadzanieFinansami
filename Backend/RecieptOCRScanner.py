import cv2
import easyocr
from collections import defaultdict
import re
import numpy as np

def receipOCR(img):

    #image read and processing
    file_bytes = img.read()
    np_arr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Nie udało się wczytać obrazu.")


    processedImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    processedImage = cv2.medianBlur(processedImage, 3)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    processedImage = clahe.apply(processedImage)


    # EasyOCR
    reader = easyocr.Reader(['pl'], gpu=False)
    results = reader.readtext(processedImage)

    #sorting OCR resulst from up to down from left to right with bbox
    lines = defaultdict(list)
    y_threshold = 10

    for bbox, text, conf in results:
        y_center = int((bbox[0][1] + bbox[2][1]) / 2)

        found = False
        for key in lines:
            if abs(key - y_center) <= y_threshold:
                lines[key].append((bbox, text, conf))
                found = True
                break
        if not found:
            lines[y_center].append((bbox, text, conf))


    sorted_lines_grouped = []
    for y in sorted(lines.keys()):
        sorted_entries = sorted(
            lines[y],
            key=lambda item: ((item[0][0][0] + item[0][2][0]) / 2)  # x_center
        )
        sorted_lines_grouped.append(sorted_entries)

    #Finding product list in receipt
    collecting = False
    extracted_lines = []
    breakstrings = ["SUMA PTU", "SUMA", "SP.0P.A:", "SP.OP", "RAZEM", "PTU"]

    for line_group in sorted_lines_grouped:
        joined_line = " ".join([text for _, text, _ in line_group])
        upper_line = joined_line.upper()

        if any(break_str in upper_line for break_str in breakstrings):
            break

        if collecting:
            extracted_lines.append(joined_line)

        if "PARAGON" in upper_line or "FISKALNY" in upper_line:
            collecting = True

    #mapping to product: price
    product_map = {}
    name_buffer = []

    exclude_keywords = ["RAZEM", "SUMA", "SP.OP", "PTU", "GOTÓWKA", "KARTA", "RESZTA"]


    def is_price(text):
        try:
            float(text.replace(",", ".").replace("O", "0").replace("o","0").replace("a","").replace("A", "").replace("C", "").replace("D", ""))
            return True
        except ValueError:
            return False


    for line in extracted_lines:
        line_upper = line.strip().upper()
        # Pomijamy podsumowania
        if any(line_upper.startswith(word) for word in exclude_keywords):
            continue

        words = line.strip().split()
        if not words:
            continue

        last_word = words[-1]
        cleaned_last = re.sub(r"[^\d,\.\*]", "", last_word)

        if is_price(cleaned_last):
            price = float(cleaned_last.replace(",", "."))
            name_part = " ".join(name_buffer + words[:-1]).upper()
            product_map[name_part] = price
            name_buffer = []
        else:
            name_buffer.append(line.strip())

    return product_map
