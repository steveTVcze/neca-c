from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
import random
import time
import sqlite3
import uuid
from datetime import datetime
from pydantic import BaseModel

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

# --- INICIALIZACE SQLITE DATABÁZE ---
def init_db():
    conn = sqlite3.connect('nexa_database.db')
    c = conn.cursor()
    # Tabulka pro scany
    c.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            item_id TEXT PRIMARY KEY,
            filename TEXT,
            defects_count INTEGER,
            decision TEXT,
            scan_time TEXT
        )
    ''')
    # NOVÁ: Tabulka pro partnery
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
    # Vytáhneme partnery z DB, nejdřív VIP, pak Alliance
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

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    print(f"--- NOVÝ POŽADAVEK ---")
    
    # 1. Vygenerování unikátního ID pro tento kus oblečení
    item_id = str(uuid.uuid4())
    
    file_path = os.path.join(UPLOAD_DIR, f"{item_id}_{file.filename}")
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    time.sleep(1.5) # Simulace AI
    pocet_vad = random.choice([0, 1, 4])
    
    # Rozhodnutí pro uložení do DB
    decision = "REUSE" if pocet_vad == 0 else "REPAIR" if pocet_vad <= 2 else "RECYCLE"
    
    # 2. Uložení záznamu do SQLite databáze
    conn = sqlite3.connect('nexa_database.db')
    c = conn.cursor()
    c.execute(
        "INSERT INTO scans (item_id, filename, defects_count, decision, scan_time) VALUES (?, ?, ?, ?, ?)",
        (item_id, file.filename, pocet_vad, decision, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    print(f"Uloženo do DB: ID {item_id} | Vady: {pocet_vad} | Status: {decision}")
    
    # 3. Odeslání ID zpět do Reactu, ať z něj může udělat QR kód
    return {
        "status": "success",
        "item_id": item_id,
        "total_defects": pocet_vad
    }