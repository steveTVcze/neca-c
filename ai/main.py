from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
import random
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "saved_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    print(f"--- NOVÝ POŽADAVEK ---")
    print(f"Přijat soubor: {file.filename}")
    
    # Uložení fotky na disk (stejné jako předtím)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    print(f"Soubor úspěšně uložen do: {file_path}")
    
    time.sleep(1.5)
    pocet_vad = random.choice([0, 1, 4])
    
    print(f"MOCK AI vygenerovalo počet vad: {pocet_vad}")
    print(f"--- HOTOVO ---")
    
    return {
        "status": "success",
        "filename": file.filename,
        "total_defects": pocet_vad,
        "details": [{"label": "simulated_defect", "confidence": 0.99}] * pocet_vad
    }