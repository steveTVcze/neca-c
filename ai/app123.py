from ultralytics import YOLO
import os
import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "best123.pt")
OUTPUT_DIR = os.path.join(BASE_DIR, "my_results")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# načtení modelu jen jednou
model = YOLO(MODEL_PATH)


def classify_clothing(defect_count):
    if defect_count == 0:
        return "REUSE"
    elif defect_count <= 2:
        return "REPAIR"
    else:
        return "RECYCLE"


def analyze_image(image_path):

    results = model.predict(
    source=image_path,
    conf=0.25,
    iou=0.5,
    save=False,
    verbose=False
)

    result = results[0]

    print(result.boxes)

    defect_count = len(result.boxes)

    print(f"Počet detektů: {defect_count}")

    category = classify_clothing(defect_count)

    detections = []

    for box in result.boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])

        detections.append({
            "label": model.names[cls],
            "confidence": round(conf, 2)
        })

    print(detections)

    # vytvoření obrázku s boxy
    plotted_image = result.plot()

    output_filename = f"result_{os.path.basename(image_path)}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    cv2.imwrite(output_path, plotted_image)

    return {
        "classification": category,
        "total_defects": defect_count,
        "details": detections,
        "output_image": output_path
    }


# test lokálně
if __name__ == "__main__":

    test_image = os.path.join(BASE_DIR, "test5.png")

    result = analyze_image(test_image)

    print("Výsledek:")
    print(result)