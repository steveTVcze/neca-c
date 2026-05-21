from ultralytics import YOLO

# 1. Načteme tvůj stažený model
model = YOLO("best2.pt")

# 2. Název testovací fotky (musí být ve stejné složce)
testovaci_fotka = "test2.jpg"

print(f"Analyzuji obrázek: {testovaci_fotka}...")

# 3. Spustíme detekci
# conf=0.15 dáváme schválně nízko, ať z toho modelu něco vypadne, 
# i když si zatím není po tom krátkém tréninku úplně jistý.
results = model(testovaci_fotka, conf=0.15)

# 4. Spočítáme nalezené vady
pocet_vad = len(results[0].boxes)
print(f"Hotovo! Model našel {pocet_vad} vad(y).")

# 5. Vizuální výstup
# Tohle ti otevře okno, kde uvidíš tu fotku i s barevnými rámečky kolem vad
results[0].show()

# (Pokud by ti .show() nefungovalo nebo házelo chybu s oknem, 
# zakomentuj ho a použij tohle - uloží to výsledek jako novou fotku)
# results[0].save("vyhodnoceny_sample.jpg")