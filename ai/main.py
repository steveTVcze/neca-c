from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from ultralytics import YOLO
import os
import cv2
import sqlite3
import uuid
from datetime import datetime
from typing import List


# --- NASTAVENÍ CEST A SLOŽEK ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "best123.pt")
UPLOAD_DIR = os.path.join(BASE_DIR, "saved_images")
OUTPUT_DIR = os.path.join(BASE_DIR, "my_results")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- INICIALIZACE AI MODELU ---
# Načte se jen jednou při startu serveru (XP optimalizace)
print("Načítám NEXA YOLO model...")
model = YOLO(MODEL_PATH)
print("Model úspěšně načten!")

# --- INICIALIZACE FASTAPI ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Zpřístupníme složku s výsledky (bounding boxy) veřejně, 
# aby si je React mohl případně stáhnout a ukázat
app.mount("/results", StaticFiles(directory=OUTPUT_DIR), name="results")

# --- INICIALIZACE SQLITE DATABÁZE ---
def init_db():
    conn = sqlite3.connect('nexa_database.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            item_id TEXT PRIMARY KEY,
            filename TEXT,
            defects_count INTEGER,
            decision TEXT,
            scan_time TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS partners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            tier TEXT,
            discount TEXT,
            join_date TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- POMOCNÉ FUNKCE ---
def classify_clothing(defect_count):
    if defect_count == 0:
        return "REUSE"
    elif defect_count <= 2:
        return "REPAIR"
    else:
        return "RECYCLE"

# --- PŮVODNÍ B2B ENDPOINTY ---
class Partner(BaseModel):
    name: str
    tier: str
    discount: str

@app.post("/partners")
async def add_partner(partner: Partner):
    conn = sqlite3.connect('nexa_database.db')
    c = conn.cursor()
    c.execute(
        "INSERT INTO partners (name, tier, discount, join_date) VALUES (?, ?, ?, ?)",
        (partner.name, partner.tier, partner.discount, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    print(f"B2B: Nový partner uložen - {partner.name} ({partner.tier})")
    return {"status": "success", "message": "Partner added"}

@app.get("/partners")
async def get_partners():
    conn = sqlite3.connect('nexa_database.db')
    c = conn.cursor()
    c.execute("SELECT name, tier, discount FROM partners ORDER BY tier DESC")
    rows = c.fetchall()
    conn.close()
    
    partners_list = []
    for idx, row in enumerate(rows):
        partners_list.append({
            "id": idx + 1,
            "name": row[0],
            "tier": row[1],
            "badge": "⭐ VIP Partner" if row[1] == "VIP" else "🤝 Alliance Partner",
            "discount": row[2] if row[2] else "Standard pricing",
            "desc": "Premium listing" if row[1] == "VIP" else "Verified partner"
        })
    return partners_list

# --- HLAVNÍ AI ENDPOINT ---
@app.post("/analyze")
async def analyze_image_endpoint(files: List[UploadFile] = File(...)):
    print(f"--- NOVÝ POŽADAVEK NA ANALÝZU ({len(files)} fotek) ---")
    
    item_id = str(uuid.uuid4())
    total_defects = 0
    result_image_urls = []
    
    # 1. Projdeme všechny nahrané fotky (zepředu, zezadu...)
    for idx, file in enumerate(files):
        file_path = os.path.join(UPLOAD_DIR, f"{item_id}_{idx}_{file.filename}")
        
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        # 2. AI Analýza každé fotky přes YOLO
        results = model.predict(source=file_path, conf=0.25, iou=0.5, save=False, verbose=False)
        result = results[0]
        
        defect_count = len(result.boxes)
        total_defects += defect_count # Sčítáme vady ze všech úhlů!
        
        # 3. Vykreslení a uložení obrázku s detekcemi
        plotted_image = result.plot()
        output_filename = f"result_{item_id}_{idx}_{file.filename}"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        cv2.imwrite(output_path, plotted_image)
        
        result_image_urls.append(f"/results/{output_filename}")
        
    # 4. Celkové rozhodnutí na základě VŠECH fotek
    decision = classify_clothing(total_defects)
    
    # 5. Uložení výsledku do databáze (uložíme název první fotky jako referenci)
    conn = sqlite3.connect('nexa_database.db')
    c = conn.cursor()
    c.execute(
        "INSERT INTO scans (item_id, filename, defects_count, decision, scan_time) VALUES (?, ?, ?, ?, ?)",
        (item_id, files[0].filename, total_defects, decision, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    print(f"Uloženo do DB: ID {item_id} | Vady celkem: {total_defects} | Status: {decision}")
    
    # 6. Odeslání výsledků zpět do Reactu (posíláme pole všech fotek!)
    return {
        "status": "success",
        "item_id": item_id,
        "total_defects": total_defects,
        "decision": decision,
        "result_image_urls": result_image_urls # <-- Teď posíláme pole odkazů!
    }