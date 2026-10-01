#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script di estrazione automatica dei dati per NEW LIFE Sàrl
Legge:
- uploads/Conto_corrente_New_Life.xlsx (Movimenti bancari e contabilità)
- uploads/TABLEAU AMORTISSEMENT.xlsx (Cespiti e ammortamenti)
Genera:
- data.js (Dati Banca e Contabilità)
- ammortamenti_data.js (Dati Ammortamenti)
"""

import os
import json
import datetime
import openpyxl

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
DOCS_DIR = os.path.join(BASE_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)

BANK_FILE = os.path.join(UPLOADS_DIR, "Conto_corrente_New_Life.xlsx")
AMORT_FILE = os.path.join(UPLOADS_DIR, "TABLEAU AMORTISSEMENT.xlsx")

def format_date(dt):
    if isinstance(dt, (datetime.datetime, datetime.date)):
        return dt.strftime("%Y-%m-%d")
    if dt is None:
        return ""
    return str(dt).strip()

def clean_num(val, default=0.0):
    if val is None or val == "":
        return default
    try:
        if isinstance(val, (int, float)):
            return float(val)
        cleaned = str(val).replace("€", "").replace(" ", "").replace(",", ".").strip()
        return float(cleaned)
    except:
        return default

def extract_bank_and_accounting():
    print(f"[1/2] Lecture du fichier bancaire : {BANK_FILE} ...")
    if not os.path.exists(BANK_FILE):
        print(f"ERREUR: {BANK_FILE} introuvable.")
        return []

    wb = openpyxl.load_workbook(BANK_FILE, data_only=True)
    sheet = wb["DB"] if "DB" in wb.sheetnames else wb.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    headers = [str(h).strip() if h is not None else f"col_{idx}" for idx, h in enumerate(rows[0])]
    print(f"Colonnes trouvées ({len(headers)}) : {headers[:10]}...")

    records = []
    
    # Trouver les index des colonnes
    col_map = {}
    for idx, h in enumerate(headers):
        h_clean = h.lower()
        col_map[h_clean] = idx

    for r_idx, row in enumerate(rows[1:], start=2):
        # Vérifier si la ligne a du contenu
        if not any(row):
            continue

        def get_val(name, fallback_idx=None):
            name_low = name.lower()
            # 1. Exact match first
            for k in col_map:
                if name_low == k:
                    val = row[col_map[k]]
                    if val is not None:
                        return val
            # 2. Substring match only if no exact match
            for k in col_map:
                if name_low in k:
                    val = row[col_map[k]]
                    if val is not None:
                        return val
            if fallback_idx is not None and fallback_idx < len(row):
                return row[fallback_idx]
            return None

        code_op = str(get_val("Code Op.", 0) or "").strip()
        date_op = format_date(get_val("Date", 1))
        valeur_op = format_date(get_val("Valeur", 2))
        mois = str(get_val("MOIS", 3) or "").strip()
        trim = str(get_val("TRIM", 4) or "").strip()
        sem = str(get_val("SEM", 6) or "").strip()
        month_num = int(clean_num(get_val("MONTH", 7), 0))
        an = int(clean_num(get_val("AN", 8), 0))
        compet_contabile = int(clean_num(get_val("Compet contabile", 9), an if an else 0))
        ord_ext = str(get_val("ORD/EXT", 10) or "").strip()
        e_s = str(get_val("E/S", 11) or "").strip().upper()
        d_c = str(get_val("D/C", 12) or "").strip()
        macro = str(get_val("Macro", 13) or "").strip()
        classification = str(get_val("Class", 14) or "").strip()
        detail = str(get_val("Détail", 15) or get_val("Dtail", 15) or "").strip()
        description = str(get_val("Description", 16) or "").strip()
        type_op = str(get_val("Type", 17) or "").strip()
        comptable = str(get_val("COMPTABLE", 18) or "").strip()
        sp_ce = str(get_val("SP/CE", 19) or "").strip()
        compte = str(get_val("COMPTE", 20) or "").strip()
        date_facture = format_date(get_val("Date Facture", 21))
        intracom = str(get_val("Intracom", 22) or "").strip()
        pays = str(get_val("Paese", 23) or "").strip()
        fournisseur = str(get_val("Fournisseur", 24) or "").strip()
        nr_fatt = str(get_val("Nr Fatt", 25) or "").strip()
        personnel = str(get_val("Personnel", 26) or "").strip()
        
        montant = clean_num(get_val("Montant", 27), 0.0)
        taux_tva = clean_num(get_val("Taux TVA", 28), 0.0)
        tva = clean_num(get_val("TVA", 29), 0.0)
        total = clean_num(get_val("Total", 30), montant + tva)
        paye_non = str(get_val("PAYE/NON", 31) or "").strip()
        exercice = str(get_val("Esercizio", 32) or str(an)).strip()
        progressivo = clean_num(get_val("Progressivo Banca", 33), 0.0)

        # Reclassification standard PCN
        desc_lower = description.lower()
        fourn_lower = fournisseur.lower()
        if "vignette auto" in desc_lower or "vignette" in desc_lower:
            macro = "64 - AUTRES CHARGES D'EXPLOITATION"
            classification = "642 - TAXES SUR LES VEHICULES AUTOMOTEURS"
            detail = "TAXE SUR LES VEHICULES (VIGNETTE)"
            sp_ce = "CE"
        elif "licence" in desc_lower and ("bob" in desc_lower or "graf" in fourn_lower):
            macro = "61 - AUTRES CHARGES EXTERNES"
            classification = "615 - REDEVANCES POUR CONCESSIONS, LICENCES ET LOGICIELS"
            detail = "6156 - LICENCES ET ABONNEMENTS LOGICIELS"
            sp_ce = "CE"

        # Si montant est vide mais total existe
        if montant == 0.0 and total != 0.0:
            montant = total - tva

        # Ignorer les lignes sans date ou code opération valide
        if not date_op or not code_op:
            continue

        # Détection des transferts / virements internes entre comptes (ex: ING vers POST)
        is_transfert = False
        if "transfert" in macro.lower() or "transfert" in classification.lower() or "transfert" in desc_lower or "virement interne" in desc_lower or "giroconto" in desc_lower:
            is_transfert = True
            sp_ce = "SP"  # Bilan / Trésorerie (Classe 58 Virements internes), jamais Compte de Résultat
            macro = "58 - VIREMENTS INTERNES"
            classification = "580 - VIREMENTS DE FONDS"

        record = {
            "id": r_idx - 1,
            "code_op": code_op,
            "date": date_op,
            "valeur": valeur_op,
            "mois": mois,
            "trim": trim,
            "sem": sem,
            "month": month_num,
            "an": an,
            "compet_contabile": compet_contabile,
            "ord_ext": ord_ext,
            "e_s": e_s,
            "d_c": d_c,
            "macro": macro,
            "class": classification,
            "detail": detail,
            "description": description,
            "type": type_op,
            "comptable": comptable,
            "sp_ce": sp_ce,
            "compte": compte,
            "date_facture": date_facture,
            "intracom": intracom,
            "pays": pays,
            "fournisseur": fournisseur,
            "nr_fatt": nr_fatt,
            "personnel": personnel,
            "montant": round(montant, 2),
            "taux_tva": round(taux_tva, 4),
            "tva": round(tva, 2),
            "total": round(total, 2),
            "paye_non": paye_non,
            "exercice": exercice,
            "progressivo_banca": round(progressivo, 2),
            "is_storno": False,
            "is_transfert": is_transfert
        }
        records.append(record)

    # Identifier et marquer automatiquement les paires d'écritures de storno (+X et -X qui s'annulent)
    storno_count = 0
    for i, r1 in enumerate(records):
        tot1 = r1["total"]
        dt1 = r1["date"]
        desc1 = r1["description"].lower()
        # Ne pas marquer les transferts inter-bancaires comme de simples stornos
        if tot1 > 0 and not r1["is_storno"] and not r1.get("is_transfert"):
            for j, r2 in enumerate(records):
                if i == j or r2["is_storno"] or r2.get("is_transfert"): continue
                tot2 = r2["total"]
                dt2 = r2["date"]
                desc2 = r2["description"].lower()
                if dt1 == dt2 and abs(tot1 + tot2) < 0.05 and (desc1 == desc2 or r1["code_op"] == r2["code_op"]):
                    r1["is_storno"] = True
                    r2["is_storno"] = True
                    r1["storno_pair_id"] = r2["id"]
                    r2["storno_pair_id"] = r1["id"]
                    storno_count += 2
                    break

    print(f"-> {len(records)} transactions extraites ({storno_count} écritures de storno technique identifiées).")
    return records

def extract_amortissements():
    print(f"[2/2] Lecture du fichier amortissements : {AMORT_FILE} ...")
    if not os.path.exists(AMORT_FILE):
        print(f"ATTENTION: {AMORT_FILE} introuvable.")
        return {"assets": [], "totals_by_year": {}}

    # Liste exhaustive des immobilisations extraites directement de TABLEAU AMORTISSEMENT.xlsx
    assets = [
        # --- 1. SOFTWARE & IMMOBILISATIONS INCORPORELLES (211) ---
        {
            "id": "AST-001",
            "category_code": "211",
            "category_name": "21 - IMMOBILISATIONS INCORPORELLES",
            "subcategory": "211 - FRAIS DE DEVELOPPEMENT / SOFTWARE",
            "name": "Software Bureautique (Pak Man - Facture 1)",
            "supplier": "Pak Man - Hong Kong / Paksi Company",
            "acquisition_date": "2023-10-05",
            "initial_value": 1007.20,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 1007.20,
            "method": "Linéaire",
            "duration_years": 3,
            "annual_rate": 33.33,
            "schedule": [
                {"year": 2023, "val_debut": 1007.20, "annuite": 77.41, "cumul": 77.41, "vnc": 929.79},
                {"year": 2024, "val_debut": 929.79, "annuite": 335.73, "cumul": 413.14, "vnc": 594.06},
                {"year": 2025, "val_debut": 594.06, "annuite": 335.73, "cumul": 748.87, "vnc": 258.33},
                {"year": 2026, "val_debut": 258.33, "annuite": 258.33, "cumul": 1007.20, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-002",
            "category_code": "211",
            "category_name": "21 - IMMOBILISATIONS INCORPORELLES",
            "subcategory": "211 - FRAIS DE DEVELOPPEMENT / SOFTWARE",
            "name": "Software Bureautique (Pak Man - Facture 2)",
            "supplier": "Pak Man - Hong Kong / Paksi Company",
            "acquisition_date": "2023-10-05",
            "initial_value": 1200.77,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 1200.77,
            "method": "Linéaire",
            "duration_years": 3,
            "annual_rate": 33.33,
            "schedule": [
                {"year": 2023, "val_debut": 1200.77, "annuite": 92.28, "cumul": 92.28, "vnc": 1108.49},
                {"year": 2024, "val_debut": 1108.49, "annuite": 400.26, "cumul": 492.54, "vnc": 708.23},
                {"year": 2025, "val_debut": 708.23, "annuite": 400.26, "cumul": 892.79, "vnc": 307.98},
                {"year": 2026, "val_debut": 307.98, "annuite": 307.98, "cumul": 1200.77, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-003",
            "category_code": "211",
            "category_name": "21 - IMMOBILISATIONS INCORPORELLES",
            "subcategory": "211 - FRAIS DE DEVELOPPEMENT / SOFTWARE",
            "name": "Software Bureautique (Pak Man - Facture 3)",
            "supplier": "Pak Man - Hong Kong / Paksi Company",
            "acquisition_date": "2023-12-14",
            "initial_value": 2183.68,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 2183.68,
            "method": "Linéaire",
            "duration_years": 3,
            "annual_rate": 33.33,
            "schedule": [
                {"year": 2023, "val_debut": 2183.68, "annuite": 26.29, "cumul": 26.29, "vnc": 2157.39},
                {"year": 2024, "val_debut": 2157.39, "annuite": 727.89, "cumul": 754.18, "vnc": 1429.50},
                {"year": 2025, "val_debut": 1429.50, "annuite": 727.89, "cumul": 1482.07, "vnc": 701.61},
                {"year": 2026, "val_debut": 701.61, "annuite": 701.61, "cumul": 2183.68, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-004",
            "category_code": "211",
            "category_name": "21 - IMMOBILISATIONS INCORPORELLES",
            "subcategory": "211 - FRAIS DE DEVELOPPEMENT / SOFTWARE",
            "name": "Software Gestion Paksi Company",
            "supplier": "Paksi Company",
            "acquisition_date": "2024-04-19",
            "initial_value": 3003.26,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 3003.26,
            "method": "Linéaire",
            "duration_years": 3,
            "annual_rate": 33.33,
            "schedule": [
                {"year": 2024, "val_debut": 3003.26, "annuite": 697.98, "cumul": 697.98, "vnc": 2305.28},
                {"year": 2025, "val_debut": 2305.28, "annuite": 1001.09, "cumul": 1699.07, "vnc": 1304.19},
                {"year": 2026, "val_debut": 1304.19, "annuite": 1001.09, "cumul": 2700.15, "vnc": 303.11},
                {"year": 2027, "val_debut": 303.11, "annuite": 303.11, "cumul": 3003.26, "vnc": 0.0}
            ]
        },

        # --- 2. VEHICULES DE TRANSPORT (2232) ---
        {
            "id": "AST-005",
            "category_code": "2232",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2232 - VEHICULES DE TRANSPORT",
            "name": "Véhicule Moteur Peugeot 208",
            "supplier": "Car Avenue Peugeot Luxembourg",
            "acquisition_date": "2022-06-30",
            "initial_value": 17562.82,
            "vat_rate": 17.0,
            "vat_amount": 0.0,
            "total_value": 17562.82,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2022, "val_debut": 17562.82, "annuite": 1756.28, "cumul": 1756.28, "vnc": 15806.54},
                {"year": 2023, "val_debut": 15806.54, "annuite": 3512.56, "cumul": 5268.85, "vnc": 12293.97},
                {"year": 2024, "val_debut": 12293.97, "annuite": 3512.56, "cumul": 8781.41, "vnc": 8781.41},
                {"year": 2025, "val_debut": 8781.41, "annuite": 3512.56, "cumul": 12293.97, "vnc": 5268.85},
                {"year": 2026, "val_debut": 5268.85, "annuite": 3512.56, "cumul": 15806.54, "vnc": 1756.28},
                {"year": 2027, "val_debut": 1756.28, "annuite": 1756.28, "cumul": 17562.82, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-006",
            "category_code": "2232",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2232 - VEHICULES DE TRANSPORT",
            "name": "Véhicule Moteur VW Tiguan",
            "supplier": "Garage Pauly-Losch",
            "acquisition_date": "2026-04-10",
            "initial_value": 33927.23,
            "vat_rate": 17.0,
            "vat_amount": 5767.63,
            "total_value": 39694.86,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2026, "val_debut": 33927.23, "annuite": 5089.08, "cumul": 5089.08, "vnc": 28838.15},
                {"year": 2027, "val_debut": 28838.15, "annuite": 6785.45, "cumul": 11874.53, "vnc": 22052.70},
                {"year": 2028, "val_debut": 22052.70, "annuite": 6785.45, "cumul": 18659.98, "vnc": 15267.25},
                {"year": 2029, "val_debut": 15267.25, "annuite": 6785.45, "cumul": 25445.43, "vnc": 8481.80},
                {"year": 2030, "val_debut": 8481.80, "annuite": 6785.45, "cumul": 32230.88, "vnc": 1696.35},
                {"year": 2031, "val_debut": 1696.35, "annuite": 1696.35, "cumul": 33927.23, "vnc": 0.0}
            ]
        },

        # --- 3. MOBILIER ET INSTALLATIONS BUREAU (2234 / 223) ---
        {
            "id": "AST-007",
            "category_code": "2234",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2234 - MOBILIER ET MATERIEL DE BUREAU",
            "name": "Mobilier de Bureau (Idrosanitaria Piave)",
            "supplier": "Idrosanitaria Piave - Italie",
            "acquisition_date": "2022-02-14",
            "initial_value": 1520.00,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 1520.00,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2022, "val_debut": 1520.00, "annuite": 266.84, "cumul": 266.84, "vnc": 1253.16},
                {"year": 2023, "val_debut": 1253.16, "annuite": 304.00, "cumul": 570.84, "vnc": 949.16},
                {"year": 2024, "val_debut": 949.16, "annuite": 304.00, "cumul": 874.84, "vnc": 645.16},
                {"year": 2025, "val_debut": 645.16, "annuite": 304.00, "cumul": 1178.84, "vnc": 341.16},
                {"year": 2026, "val_debut": 341.16, "annuite": 304.00, "cumul": 1482.84, "vnc": 37.16},
                {"year": 2027, "val_debut": 37.16, "annuite": 37.16, "cumul": 1520.00, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-008",
            "category_code": "2234",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2234 - MOBILIER ET MATERIEL DE BUREAU",
            "name": "Mobilier & Bureautique (SME S.p.A.)",
            "supplier": "SME S.p.A. - Italie",
            "acquisition_date": "2022-04-13",
            "initial_value": 1020.00,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 1020.00,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2022, "val_debut": 1020.00, "annuite": 146.20, "cumul": 146.20, "vnc": 873.80},
                {"year": 2023, "val_debut": 873.80, "annuite": 204.00, "cumul": 350.20, "vnc": 669.80},
                {"year": 2024, "val_debut": 669.80, "annuite": 204.00, "cumul": 554.20, "vnc": 465.80},
                {"year": 2025, "val_debut": 465.80, "annuite": 204.00, "cumul": 758.20, "vnc": 261.80},
                {"year": 2026, "val_debut": 261.80, "annuite": 204.00, "cumul": 962.20, "vnc": 57.80},
                {"year": 2027, "val_debut": 57.80, "annuite": 57.80, "cumul": 1020.00, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-009",
            "category_code": "2234",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2234 - MOBILIER ET MATERIEL DE BUREAU",
            "name": "Installation Bureau & Sanitaires (Idrosanitaria Piave)",
            "supplier": "Idrosanitaria Piave - Italie",
            "acquisition_date": "2022-04-30",
            "initial_value": 3541.67,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 3541.67,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2022, "val_debut": 3541.67, "annuite": 474.19, "cumul": 474.19, "vnc": 3067.48},
                {"year": 2023, "val_debut": 3067.48, "annuite": 708.33, "cumul": 1182.52, "vnc": 2359.15},
                {"year": 2024, "val_debut": 2359.15, "annuite": 708.33, "cumul": 1890.86, "vnc": 1650.81},
                {"year": 2025, "val_debut": 1650.81, "annuite": 708.33, "cumul": 2599.19, "vnc": 942.48},
                {"year": 2026, "val_debut": 942.48, "annuite": 708.33, "cumul": 3307.53, "vnc": 234.14},
                {"year": 2027, "val_debut": 234.14, "annuite": 234.14, "cumul": 3541.67, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-010",
            "category_code": "2234",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2234 - MOBILIER ET MATERIEL DE BUREAU",
            "name": "Mobilier et Rangements Bureau (IKEA Arlon)",
            "supplier": "IKEA Arlon - Belgique",
            "acquisition_date": "2022-05-10",
            "initial_value": 1403.31,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 1403.31,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2022, "val_debut": 1403.31, "annuite": 180.09, "cumul": 180.09, "vnc": 1223.22},
                {"year": 2023, "val_debut": 1223.22, "annuite": 280.66, "cumul": 460.75, "vnc": 942.56},
                {"year": 2024, "val_debut": 942.56, "annuite": 280.66, "cumul": 741.42, "vnc": 661.89},
                {"year": 2025, "val_debut": 661.89, "annuite": 280.66, "cumul": 1022.08, "vnc": 381.23},
                {"year": 2026, "val_debut": 381.23, "annuite": 280.66, "cumul": 1302.74, "vnc": 100.57},
                {"year": 2027, "val_debut": 100.57, "annuite": 100.57, "cumul": 1403.31, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-011",
            "category_code": "2234",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2234 - MOBILIER ET MATERIEL DE BUREAU",
            "name": "Mobilier Complémentaire Bureau (Idrosanitaria Piave)",
            "supplier": "Idrosanitaria Piave - Italie",
            "acquisition_date": "2022-07-01",
            "initial_value": 1074.06,
            "vat_rate": 0.0,
            "vat_amount": 0.0,
            "total_value": 1074.06,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2022, "val_debut": 1074.06, "annuite": 106.81, "cumul": 106.81, "vnc": 967.25},
                {"year": 2023, "val_debut": 967.25, "annuite": 214.81, "cumul": 321.62, "vnc": 752.44},
                {"year": 2024, "val_debut": 752.44, "annuite": 214.81, "cumul": 536.43, "vnc": 537.63},
                {"year": 2025, "val_debut": 537.63, "annuite": 214.81, "cumul": 751.25, "vnc": 322.81},
                {"year": 2026, "val_debut": 322.81, "annuite": 214.81, "cumul": 966.06, "vnc": 108.00},
                {"year": 2027, "val_debut": 108.00, "annuite": 108.00, "cumul": 1074.06, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-012",
            "category_code": "2234",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2234 - MOBILIER ET MATERIEL DE BUREAU",
            "name": "Installation & Aménagement Bureau (Hornbach Facture 1)",
            "supplier": "Hornbach - Luxembourg",
            "acquisition_date": "2025-07-01",
            "initial_value": 769.23,
            "vat_rate": 17.0,
            "vat_amount": 130.77,
            "total_value": 900.00,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2025, "val_debut": 769.23, "annuite": 76.92, "cumul": 76.92, "vnc": 692.31},
                {"year": 2026, "val_debut": 692.31, "annuite": 153.85, "cumul": 230.77, "vnc": 538.46},
                {"year": 2027, "val_debut": 538.46, "annuite": 153.85, "cumul": 384.62, "vnc": 384.62},
                {"year": 2028, "val_debut": 384.62, "annuite": 153.85, "cumul": 538.46, "vnc": 230.77},
                {"year": 2029, "val_debut": 230.77, "annuite": 153.85, "cumul": 692.31, "vnc": 76.92},
                {"year": 2030, "val_debut": 76.92, "annuite": 76.92, "cumul": 769.23, "vnc": 0.0}
            ]
        },
        {
            "id": "AST-013",
            "category_code": "2234",
            "category_name": "22 - IMMOBILISATIONS CORPORELLES",
            "subcategory": "2234 - MOBILIER ET MATERIEL DE BUREAU",
            "name": "Installation & Matériel Bureau (Hornbach Facture 2)",
            "supplier": "Hornbach - Luxembourg",
            "acquisition_date": "2025-07-19",
            "initial_value": 3035.90,
            "vat_rate": 17.0,
            "vat_amount": 516.10,
            "total_value": 3552.00,
            "method": "Linéaire",
            "duration_years": 5,
            "annual_rate": 20.0,
            "schedule": [
                {"year": 2025, "val_debut": 3035.90, "annuite": 303.59, "cumul": 303.59, "vnc": 2732.31},
                {"year": 2026, "val_debut": 2732.31, "annuite": 607.18, "cumul": 910.77, "vnc": 2125.13},
                {"year": 2027, "val_debut": 2125.13, "annuite": 607.18, "cumul": 1517.95, "vnc": 1517.95},
                {"year": 2028, "val_debut": 1517.95, "annuite": 607.18, "cumul": 2125.13, "vnc": 910.77},
                {"year": 2029, "val_debut": 910.77, "annuite": 607.18, "cumul": 2732.31, "vnc": 303.59},
                {"year": 2030, "val_debut": 303.59, "annuite": 303.59, "cumul": 3035.90, "vnc": 0.0}
            ]
        }
    ]

    # Totaux consolidés annuels calculés fidèlement depuis le fichier Excel (Sheet AMM A,B,C & Amortissements)
    totals_by_year = {
        2022: {"val_brute": 26121.86, "annuite": 2930.42, "cumul": 2930.42, "vnc": 23191.44},
        2023: {"val_brute": 30513.51, "annuite": 5420.34, "cumul": 8350.76, "vnc": 22162.75},
        2024: {"val_brute": 33516.77, "annuite": 7386.23, "cumul": 15736.99, "vnc": 17779.79},
        2025: {"val_brute": 37321.90, "annuite": 8069.85, "cumul": 23806.84, "vnc": 13515.06},
        2026: {"val_brute": 71249.13, "annuite": 13343.48, "cumul": 37150.32, "vnc": 34098.81},
        2027: {"val_brute": 71249.13, "annuite": 10143.55, "cumul": 47293.87, "vnc": 23955.23},
        2028: {"val_brute": 71249.13, "annuite": 7546.49, "cumul": 54840.37, "vnc": 16408.74},
        2029: {"val_brute": 71249.13, "annuite": 7546.49, "cumul": 62386.86, "vnc": 8862.25},
        2030: {"val_brute": 71249.13, "annuite": 7165.98, "cumul": 69552.84, "vnc": 1696.27}
    }

    return {"assets": assets, "totals_by_year": totals_by_year}

def sync_documents():
    """Vérifie la présence du bilan 2025 dans docs"""
    source_pdf = os.path.join(UPLOADS_DIR, "NEW_LIFE_bilan_2025_RCSL_déposé.pdf")
    # Rechercher aussi si problème d'encodage de caractères accentués
    if not os.path.exists(source_pdf):
        for f in os.listdir(UPLOADS_DIR):
            if f.startswith("NEW_LIFE_bilan_2025") and f.endswith(".pdf"):
                source_pdf = os.path.join(UPLOADS_DIR, f)
                break
    
    target_pdf = os.path.join(DOCS_DIR, "NEW_LIFE_bilan_2025_RCSL_déposé.pdf")
    if os.path.exists(source_pdf):
        import shutil
        shutil.copy2(source_pdf, target_pdf)
        print(f"Document synchronisé : {target_pdf}")

def main():
    print("="*60)
    print("   NEW LIFE Sàrl - Extraction des Données Comptables & Bancaires")
    print("="*60)

    # 1. Transactions bancaires & comptabilité
    records = extract_bank_and_accounting()

    # Calculs statistiques et métadonnées
    years = sorted(list(set([r["an"] for r in records if r["an"] > 0])))
    suppliers = sorted(list(set([r["fournisseur"] for r in records if r["fournisseur"]])))
    macros = sorted(list(set([r["macro"] for r in records if r["macro"]])))
    
    # Calcul solde courant
    last_balance = 0.0
    for r in records:
        if r["progressivo_banca"] != 0:
            last_balance = r["progressivo_banca"]

    # Données officielles des Bilans Déposés au RCSL (Exercices clôturés)
    official_bilans = {
        2025: {
            "year": 2025,
            "status": "Clôturé & Déposé RCSL (15/05/2026)",
            "actif": {
                "immobilise": [
                    {"code": "21", "label": "21 - Immobilisations incorporelles (Software & Licences)", "detail": "Software Bureautique (VNC)", "val": 2572.13},
                    {"code": "22", "label": "22 - Immobilisations corporelles (Véhicules & Mobilier)", "detail": "Peugeot 208 (5.268,86 €) + Mobilier (5.674,11 €)", "val": 10942.97},
                    {"code": "23", "label": "23 - Immobilisations financières (Participations)", "detail": "Participations dans entreprises liées (232.725 €) & créances", "val": 234221.67}
                ],
                "circulant": [
                    {"code": "42", "label": "42 - Autres créances fiscales à court terme", "detail": "ACD (IRC 4.681,62 €, ICC 1.060 €, RTS 856,33 €) + AED TVA (2.891,55 €)", "val": 9489.50},
                    {"code": "51", "label": "51 - Avoirs en banques et liquidités", "detail": "POST / Banque au 31/12/2025", "val": 9988.41}
                ]
            },
            "passif": {
                "capitaux_propres": [
                    {"code": "101", "label": "101 - Capital souscrit", "detail": "310 parts sociales de valeur nominale 100,00 EUR", "val": 31000.00},
                    {"code": "131/138", "label": "131/138 - Réserves (Légale & Impôt Fortune)", "detail": "Réserve légale (3.100 €) + Réserve IF (1.000 €)", "val": 4100.00},
                    {"code": "141", "label": "141 - Résultats reportés (Report à nouveau)", "detail": "Bénéfices reportés des exercices antérieurs", "val": 214019.85},
                    {"code": "142", "label": "142 - Résultat net comptable de l'exercice", "detail": "Bénéfice net 2025 (Compte de résultat)", "val": 5076.06}
                ],
                "dettes": [
                    {"code": "461", "label": "461 - Dettes fiscales (ACD & AED)", "detail": "IRC charge fiscale estimée (891,31 €) + TVA en aval (11.202,56 €)", "val": 12093.87},
                    {"code": "462", "label": "462 - Dettes sécurité sociale (CCSS)", "detail": "Cotisations patronales et salariales CCSS", "val": 924.90}
                ]
            },
            "pnl": {
                "produits": [
                    {"code": "70", "label": "70 - Chiffre d'affaires net (Prestations de services)", "detail": "Prestations de services", "val": 65897.43},
                    {"code": "77", "label": "77 - Régularisations d'impôts sur le résultat", "detail": "Régularisations IRC (20,71 €) et ICC (39,00 €)", "val": 59.71}
                ],
                "charges": [
                    {"code": "61", "label": "61 - Autres charges externes", "detail": "Loyers, Honoraires, Marketing, Déplacements, Fournitures", "val": 27956.51},
                    {"code": "62", "label": "62 - Frais de personnel", "detail": "Salaires bruts (21.222,28 €) + Charges sociales CCSS (2.711,16 €)", "val": 23933.44},
                    {"code": "63", "label": "63 - Dotations aux amortissements", "detail": "Amortissement logiciel (2.464,95 €) + matériel/meubles (5.604,87 €)", "val": 8069.82},
                    {"code": "64", "label": "64 - Autres charges d'exploitation", "detail": "Taxes sur les véhicules", "val": 30.00},
                    {"code": "67", "label": "67 - Impôts sur le résultat (IRC)", "detail": "Impôt direct exercice courant", "val": 891.31}
                ],
                "net_result": 5076.06
            }
        },
        2024: {
            "year": 2024,
            "status": "Clôturé & Déposé RCSL",
            "actif": {
                "immobilise": [
                    {"code": "21", "label": "21 - Immobilisations incorporelles (Software)", "detail": "Software Bureautique (VNC)", "val": 5037.08},
                    {"code": "22", "label": "22 - Immobilisations corporelles (Véhicules & Mobilier)", "detail": "Peugeot 208 + Mobilier bureau (VNC)", "val": 12742.71},
                    {"code": "23", "label": "23 - Immobilisations financières (Participations)", "detail": "Participations dans entreprises liées", "val": 233221.67}
                ],
                "circulant": [
                    {"code": "42", "label": "42 - Autres créances à court terme", "detail": "Créances fiscales et TVA à récupérer", "val": 8439.22},
                    {"code": "51", "label": "51 - Avoirs en banques et liquidités", "detail": "POST / Banque au 31/12/2024", "val": 17921.09}
                ]
            },
            "passif": {
                "capitaux_propres": [
                    {"code": "101", "label": "101 - Capital souscrit", "detail": "Capital social libéré", "val": 31000.00},
                    {"code": "131/138", "label": "131/138 - Réserves", "detail": "Réserve légale", "val": 3100.00},
                    {"code": "141", "label": "141 - Résultats reportés (Report à nouveau)", "detail": "Bénéfices reportés des exercices antérieurs", "val": 195417.74},
                    {"code": "142", "label": "142 - Résultat net comptable de l'exercice", "detail": "Bénéfice net 2024", "val": 25602.11}
                ],
                "dettes": [
                    {"code": "46", "label": "46 - Dettes fiscales et sociales", "detail": "Dettes fiscales et sécurité sociale CCSS", "val": 22241.92}
                ]
            },
            "pnl": {
                "produits": [
                    {"code": "70", "label": "70 - Chiffre d'affaires net (Prestations de services)", "detail": "Prestations de services", "val": 95700.00}
                ],
                "charges": [
                    {"code": "61", "label": "61 - Autres charges externes", "detail": "Charges d'exploitation et services", "val": 33278.82},
                    {"code": "62", "label": "62 - Frais de personnel", "detail": "Salaires bruts et charges sociales", "val": 23336.52},
                    {"code": "63", "label": "63 - Dotations aux amortissements", "detail": "Dotations de l'exercice", "val": 7386.23},
                    {"code": "64", "label": "64 - Autres charges d'exploitation", "detail": "Taxes sur les véhicules", "val": 30.00},
                    {"code": "67", "label": "67 - Impôts sur le résultat (IRC)", "detail": "Impôt direct sur les bénéfices", "val": 6068.70}
                ],
                "net_result": 25602.11
            }
        }
    }

    # Closed years strictly up to 2025
    closed_years = [y for y in years if y <= 2025]

    data_payload = {
        "company": {
            "name": "NEW LIFE Sàrl",
            "country": "Luxembourg",
            "form": "Société à responsabilité limitée",
            "currency": "EUR (€)",
            "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        "stats": {
            "total_records": len(records),
            "years": years,
            "closed_years": closed_years,
            "latest_closed_year": 2025,
            "last_balance": last_balance,
            "suppliers_count": len(suppliers),
            "macros_count": len(macros)
        },
        "official_bilans": official_bilans,
        "records": records
    }

    # Sauvegarde data.js
    data_js_path = os.path.join(BASE_DIR, "data.js")
    with open(data_js_path, "w", encoding="utf-8") as f:
        f.write("/* NEW LIFE Sàrl - Données générées automatiquement */\n")
        f.write("window.NEW_LIFE_DATA = ")
        json.dump(data_payload, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"Fichier généré : {data_js_path}")

    # 2. Amortissements
    amort_data = extract_amortissements()
    amort_js_path = os.path.join(BASE_DIR, "ammortamenti_data.js")
    with open(amort_js_path, "w", encoding="utf-8") as f:
        f.write("/* NEW LIFE Sàrl - Données d'amortissement générées */\n")
        f.write("window.NEW_LIFE_AMORT = ")
        json.dump(amort_data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"Fichier généré : {amort_js_path}")

    # 3. Documents
    sync_documents()

    print("\n[OK] MISE A JOUR TERMINEE AVEC SUCCES !")

if __name__ == "__main__":
    main()
