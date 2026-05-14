from ultralytics import YOLO
model = YOLO('yolov8n.pt')

model.train(data='model/data.yaml', epochs=3, imgsz=640)

print("finished")