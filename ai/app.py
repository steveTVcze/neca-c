from ultralytics import YOLO
import os

model_path = './ai/best123.pt'
model = YOLO(model_path)
results = model.predict('./ai/test3.jpg', save=True)
print("HOTOVO! Koukni do složky runs/detect/predict")