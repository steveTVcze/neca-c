from ultralytics import YOLO
import os

model_path = 'runs/detect/train-2/weights/best.pt'

if not os.path.exists('test3.jpg'):
    print("CHYBA: Soubor test.jpg ve složce neexistuje!")
else:
    model = YOLO(model_path)
    results = model.predict('test3.jpg', save=True)
    print("HOTOVO! Koukni do složky runs/detect/predict")