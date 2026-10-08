#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur de Manuels et Guides Méthodologiques AML / LBC-FT pour NEW LIFE Sàrl
Génère les versions FR, IT et EN en formats Markdown (.md) et PDF (.pdf) haute qualité.
"""

import os
import fitz  # PyMuPDF

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. CONTENUS EN MARKDOWN
# -----------------------------------------------------------------------------

MANUAL_MD_FR = """# NEW LIFE Sàrl - Luxembourg
## Guide Méthodologique & Manuel d'Utilisation du Module AML / LBC-FT
### Conformité Anti-Blanchiment (AED / Loi 12 Nov 2004), Contrôle des Recettes & Mandats d'Administrateur
**Société :** NEW LIFE Sàrl &bull; **R.C.S. Luxembourg :** B 225.643 &bull; **Matricule National :** 2018 2432 026
**Version :** 2.0 (Exercice 2026) &bull; **Statut :** Document Officiel Interne

---

## 1. Cadre Réglementaire Luxembourgeois (Sociétés Non Soumises à la CSSF)

### 1.1. Autorité de Surveillance Compétente : L'AED
Au Grand-Duché de Luxembourg, la surveillance de la Lutte Contre le Blanchiment et le Financement du Terrorisme (LBC/FT) est répartie entre plusieurs autorités :
- **La CSSF (Commission de Surveillance du Secteur Financier)** : compétente pour le secteur financier régulé (banques, SICAV, fonds d'investissement, sociétés de gestion, PSF).
- **L'AED (Administration de l'Enregistrement, des Domaines et de la TVA)** : autorité de contrôle légale pour les **professionnels et sociétés du secteur non financier**, notamment :
  - Les prestataires de services aux sociétés et fiducies (*Trust and Company Service Providers - TCSP*).
  - Les administrateurs indépendants et gérants de sociétés.
  - Les sociétés de conseil et gestion d'affaires non réglementées par la CSSF.

En tant que société à responsabilité limitée fournissant des prestations d'administration de sociétés, de direction stratégique et de conseil économique, **NEW LIFE Sàrl relève de la compétence de contrôle de l'AED** au titre de l'Article 2-1 (8) de la Loi modifiée du 12 novembre 2004.

### 1.2. Textes Législatifs Fondamentaux
1. **Loi du 12 novembre 2004 (LBC/FT)** relative à la lutte contre le blanchiment et contre le financement du terrorisme (modifiée).
2. **Loi du 13 janvier 2019** instituant le Registre des Bénéficiaires Effectifs (RBE / LBR).
3. **Circulaires AED (notamment Circulaires n° 779 et n° 800)** précisant les lignes directrices et le questionnaire annuel d'évaluation AML.
4. **Code Pénal Luxembourgeois (Articles 506-1 à 506-8)** définissant l'infraction de blanchiment de capitaux.

---

## 2. Obligations Légales de NEW LIFE Sàrl

### 2.1. Obligation de Vigilance Client (Customer Due Diligence - CDD)
Pour toute relation d'affaires et mandat d'administrateur, NEW LIFE Sàrl applique la procédure d'identification :
- **Identification de la personne morale :** Dénomination, forme juridique, siège social, N° RCSL, N° TVA et statuts à jour.
- **Identification des Bénéficiaires Effectifs (UBO / RBE) :** Toute personne physique détenant directement ou indirectement plus de 25% du capital ou des droits de vote, ou exerçant le contrôle effectif.
- **Consultation obligatoire du RBE :** Vérification systématique de l'extrait RBE auprès de Luxembourg Business Registers (LBR).
- **Criblage PEP (Personne Politiquement Exposée) :** Détection des dirigeants ou bénéficiaires exerçant des fonctions publiques éminentes ou de leurs proches (*RCAs*).

### 2.2. Seuils de Vigilance et Gradation du Contrôle
- **Toutes les Recettes (≥ 0 €)** : Traçabilité comptable et bancaire systématique de chaque encaissement.
- **≥ 5.000 € (Seuil Standard)** : Vérification de l'adéquation avec la convention de mandat signée.
- **≥ 10.000 € (Seuil Réglementaire UE/AED)** : Due Diligence complète, validation de l'extrait RBE récent et conservation 5 ans.
- **≥ 25.000 € (Grandes Facturations)** : Examen renforcé de la cohérence économique et de l'origine des fonds.

### 2.3. Conservation Obligatoire des Pièces (5 Ans)
Tous les justificatifs d'identification (pièces d'identité, extraits RCS, déclarations RBE, contrats et factures) sont conservés pendant **au moins 5 ans** à compter de la fin de la relation d'affaires.

### 2.4. Obligation de Déclaration de Soupçon (STR)
Toute opération suspecte ou non justifiée économiquement doit faire l'objet d'une déclaration immédiate sans délai auprès de la **Cellule de Renseignement Financier (CRF)** du Parquet de Luxembourg.

---

## 3. Guide Pratique d'Utilisation du Module dans l'App

Le module **Conformité AML / LBC-FT** (`aml.html`) est articulé autour de 4 onglets spécialisés :

### 3.1. Onglet 1 : Registre des Entrées & Contrôle AML
- **Affichage chronologique inversé :** Les opérations de **2026** et les plus récentes apparaissent en haut du tableau.
- **Filtres multicritères :** Filtrage par année, société débitrice, forme juridique, statut KYC et seuils AML (5k, 10k, 25k).
- **Périmètre strict :** Seules les **109 factures réelles de prestations** sont incluses (les remboursements de frais personnels avancés et écritures de storno sont automatiquement exclus).
- **Bouton Fiche KYC :** Accès direct au dossier de conformité pour chaque opération.

### 3.2. Onglet 2 : Cartographie des Mandats & Clients
- Fiches synthétiques détaillées pour chacune des 14 sociétés clientes (*Europa Plus, Pals Advisors, Ersel International, SICAV Banca Generali, SPF Ariel/Fortau/Micro/Oira/Orte, Green Enerbras, Glenelg*).
- Visualisation du volume total facturé, du mandat exercé, des UBO déclarés et des pièces au dossier.

### 3.3. Onglet 3 : Cadre Légal & Matrice des Risques
- Synthèse des autorités de contrôle (AED, CSSF, CRF) et matrice d'analyse des facteurs de risque.

### 3.4. Fiche Modale Interactive & Persistance
- En cliquant sur **« KYC »**, une fenêtre modale permet de consulter et mettre à jour les coordonnées, UBO, niveau de risque (Faible/Moyen/Élevé), statut PEP et notes d'audit.
- Les modifications sont **automatiquement sauvegardées dans le navigateur (`localStorage`)**.

### 3.5. Exportations Réglementaires
- 📊 **Excel (.xlsx) :** Feuille normée de **25 colonnes de conformité**.
- 📄 **CSV :** Export tabulaire standardisé.
- 🖨️ **Rapport PDF :** Document officiel structuré avec totaux consolidés et en-tête NEW LIFE Sàrl.

---

## 4. Le Simulateur de Due Diligence (Risk-Based Approach)

L'onglet **« 4. Simulateur Due Diligence »** permet d'évaluer le risque de tout nouveau client ou mandat selon 5 critères :

### 4.1. Modèle de Notation (Score 0 à 100)
1. **Forme Juridique :**
   - SICAV / Fonds Régulé CSSF : `+5 pts` (Risque institutionnel faible).
   - Société Commerciale (SA / Sàrl) : `+10 pts` (Risque standard).
   - SPF (Société Patrimoniale) : `+15 pts` (Contrôle UBO approfondi).
   - SCSp (Véhicule d'Investissement) : `+20 pts` (Vérification des associés).
2. **Juridiction du Siège Social :**
   - Luxembourg / Zone Euro : `+5 pts` (Cadre équivalent UE).
   - Suisse / UK / USA : `+10 pts` (Pays tiers équivalent GAFI).
   - Pays Tiers / International : `+35 pts` (Vigilance accrue).
3. **Statut PEP (Personne Politiquement Exposée) :**
   - Présence PEP : `+35 pts` &rarr; Déclenchement automatique de la **Vigilance Renforcée (EDD)**.
4. **Structure de l'Actionnariat :**
   - Détention directe : `+0 pt`.
   - Chaîne complexe multi-holdings : `+25 pts`.
   - Fiducie / Trust : `+30 pts`.
5. **Volume Annuel d'Honoraires :**
   - < 25.000 € : `+0 pt` | 25.000 € – 50.000 € : `+10 pts` | ≥ 50.000 € : `+15 pts`.

### 4.2. Classes de Risque & Actions
- 🟢 **Faible (Score < 35) :** Due Diligence standard (Extrait RCS, CNI UBO, convention de mandat).
- 🟡 **Moyen (Score 35 – 59) :** Vigilance active, extrait RBE vérifié, revue périodique tous les 2 ans.
- 🔴 **Élevé (Score ≥ 60 ou PEP) :** Vigilance Renforcée (*Enhanced Due Diligence*), justification de l'origine des fonds, validation de la direction et revue annuelle.
"""

MANUAL_MD_IT = """# NEW LIFE Sàrl - Luxembourg
## Guida Metodologica & Manuale d'Uso del Modulo AML / Antiriciclaggio
### Conformità LBC-FT (Supervisione AED / Legge 12 Nov 2004), Controllo Entrate & Compensi di Amministratore
**Società :** NEW LIFE Sàrl &bull; **R.C.S. Luxembourg :** B 225.643 &bull; **Matricola Nazionale :** 2018 2432 026
**Versione :** 2.0 (Esercizio 2026) &bull; **Stato :** Documento Ufficiale Interno

---

## 1. Quadro Normativo Lussemburghese (Società Non Vigilate dalla CSSF)

### 1.1. Autorità di Vigilanza Competente : L'AED
Nel Granducato di Lussemburgo, la supervisione in materia di Prevenzione del Riciclaggio e del Finanziamento del Terrorismo (AML / LBC-FT) è ripartita tra diverse autorità:
- **La CSSF (Commission de Surveillance du Secteur Financier)**: vigila esclusivamente sul settore finanziario regolamentato (banche, SICAV, fondi d'investimento, SGR, PSF).
- **L'AED (Administration de l'Enregistrement, des Domaines et de la TVA)**: è l'autorità di vigilanza legale per tutti i **professionisti e società del settore non finanziario**, tra cui:
  - I prestatori di servizi alle società e fiduciari (*Trust and Company Service Providers - TCSP*).
  - Gli amministratori indipendenti e membri di consigli di amministrazione.
  - Le società di consulenza direzionale e gestione aziendale non soggette a vigilanza CSSF.

In quanto società a responsabilità limitata che eroga prestazioni di amministrazione societaria, direzione strategica e consulenza economica, **NEW LIFE Sàrl ricade sotto la competenza e vigilanza diretta dell'AED** ai sensi dell'Articolo 2-1 (8) della Legge modificata del 12 novembre 2004.

### 1.2. Fonti Normative di Riferimento
1. **Legge del 12 novembre 2004 (LBC/FT)** relativa alla lotta contro il riciclaggio e il finanziamento del terrorismo (e successive modifiche).
2. **Legge del 13 gennaio 2019** che istituisce il Registro dei Titolari Effettivi (RBE / LBR).
3. **Circolari AED (in particolare Circolari n° 779 e n° 800)** con le linee guida operative e il questionario annuale di autovalutazione AML.
4. **Codice Penale Lussemburghese (Articoli 506-1 a 506-8)** sul reato di riciclaggio di capitali.

---

## 2. Obblighi di Conformità per NEW LIFE Sàrl

### 2.1. Adeguata Verifica della Clientela (Customer Due Diligence - CDD)
Per ogni relazione d'affari o mandato di amministratore, NEW LIFE Sàrl applica la procedura formale:
- **Identificazione dell'ente giuridico:** Ragione sociale, forma societaria, sede legale, N° RCSL, N° Partita IVA e statuto vigente.
- **Identificazione dei Titolari Effettivi (UBO / RBE):** Qualsiasi persona fisica che detenga, direttamente o indirettamente, oltre il 25% del capitale o dei diritti di voto, oppure eserciti il controllo effettivo.
- **Consultazione obbligatoria del Registro RBE:** Verifica sistematica della visura RBE presso il registro ufficiale LBR (*Luxembourg Business Registers*).
- **Screening PEP (Persone Politicamente Esposte):** Rilevazione di dirigenti o beneficiari con cariche pubbliche di rilievo o loro stretti familiari (*RCAs*).

### 2.2. Soglie di Vigilanza e Graduazione del Controllo
- **Tutte le Entrate (≥ 0 €)** : Tracciabilità contabile e bancaria sistematica di ogni incasso.
- **≥ 5.000 € (Soglia Standard)** : Verifica di coerenza con il contratto di mandato stipulato.
- **≥ 10.000 € (Soglia Legale UE/AED)** : Due Diligence completa, visura RBE aggiornata e conservazione documentale per 5 anni.
- **≥ 25.000 € (Grandi Fatturazioni)** : Esame approfondito della giustificazione economica e della provenienza dei fondi.

### 2.3. Conservazione Obbligatoria dei Documenti (5 Anni)
Tutti i documenti di identificazione (carte d'identità, visure RCS, dichiarazioni RBE, contratti e fatture) devono essere conservati per **almeno 5 anni** dalla cessazione della relazione d'affari.

### 2.4. Obbligo di Segnalazione di Operazioni Sospette (STR)
Ogni transazione che appaia anomala, ingiustificata o sospetta deve essere segnalata tempestivamente e senza indugio alla **Cellule de Renseignement Financier (CRF)** della Procura di Lussemburgo.

---

## 3. Guida Operativa all'Uso del Modulo nell'App

Il modulo **Conformità AML / LBC-FT** (`aml.html`) include 4 sezioni specializzate:

### 3.1. Tab 1 : Registro delle Entrate & Controllo AML
- **Ordinamento cronologico decrescente :** Le operazioni del **2026** e le più recenti sono visualizzate in alto.
- **Filtri avanzati :** Filtro per anno, società debitrice, tipologia societaria, stato KYC e soglie di importo (5k, 10k, 25k).
- **Perimetro pulito :** Include esclusivamente le **109 fatture reali di compensi di amministrazione** (i rimborsi spese personali anticipate a Tubia Edoardo e le scritture di storno sono rigorosamente esclusi).
- **Pulsante Fascicolo KYC :** Accesso immediato con un click alla scheda di conformità per ciascuna riga.

### 3.2. Tab 2 : Mappatura Mandati & Clienti
- Schede anagrafiche complete per le 14 società clienti (*Europa Plus, Pals Advisors, Ersel International, SICAV Banca Generali, SPF Ariel/Fortau/Micro/Oira/Orte, Green Enerbras, Glenelg*).
- Dati di visura RCSL, matricola, mandato esercitato, titolari effettivi UBO e checklist documentale.

### 3.3. Tab 3 : Quadro Legale & Matrice dei Rischi
- Sintesi delle autorità di controllo (AED, CSSF, CRF) e matrice di valutazione dei fattori di rischio.

### 3.4. Scheda Modale KYC & Salvataggio Persistente
- Cliccando su **« KYC »**, è possibile consultare e aggiornare dati societari, UBO, livello di rischio (Basso/Medio/Alto), stato PEP e note di audit.
- Ogni modifica viene **salvata in modo permanente nella memoria locale del browser (`localStorage`)**.

### 3.5. Esportazioni di Conformità
- 📊 **Excel (.xlsx) :** Foglio normato con **25 colonne di conformità AML**.
- 📄 **CSV :** Esportazione tabellare standardizzata.
- 🖨️ **Rapporto Ufficiale PDF :** Documento formale pronto per la stampa con riepilogo statistico e intestazione NEW LIFE Sàrl.

---

## 4. Il Simulatore di Due Diligence (Risk-Based Approach)

La sezione **« 4. Simulateur Due Diligence »** consente di calcolare il profilo di rischio per qualsiasi nuovo cliente o mandato su 5 assi:

### 4.1. Modello di Punteggio (Score 0 - 100)
1. **Forma Giuridica :**
   - SICAV / Fondo Regolato CSSF : `+5 pt` (Basso rischio istituzionale).
   - Società Commerciale (SA / Sàrl) : `+10 pt` (Rischio standard).
   - SPF (Società Patrimoniale) : `+15 pt` (Controllo UBO obbligatorio).
   - SCSp (Veicolo di Investimento) : `+20 pt` (Verifica soci accomandanti).
2. **Giurisdizione della Sede Legale :**
   - Lussemburgo / Zona Euro : `+5 pt` (Quadro UE equivalente).
   - Svizzera / UK / USA : `+10 pt` (Paesi terzi equivalenti GAFI).
   - Paesi Terzi Internazionali : `+35 pt` (Vigilanza rafforzata).
3. **Fattore PEP (Persone Politicamente Esposte) :**
   - Presenza di PEP : `+35 pt` &rarr; Attivazione automatica della **Vigilanza Rafforzata (EDD)**.
4. **Complessità dell'Azionariato :**
   - Partecipazione diretta : `+0 pt`.
   - Catena di controllo multi-holding : `+25 pt`.
   - Trust o Strutture Fiduciarie : `+30 pt`.
5. **Volume Annuo dei Compensi :**
   - < 25.000 € : `+0 pt` | 25.000 € – 50.000 € : `+10 pt` | ≥ 50.000 € : `+15 pt`.

### 4.2. Classi di Rischio e Misure Applicabili
- 🟢 **Basso (Score < 35) :** Due Diligence ordinaria (Visura RCS, documento UBO, contratto di mandato).
- 🟡 **Medio (Score 35 – 59) :** Vigilanza attiva, visura RBE verificata, revisione biennale.
- 🔴 **Elevato (Score ≥ 60 o PEP) :** Vigilanza Rafforzata (*Enhanced Due Diligence*), verifica origine fondi, approvazione della direzione e revisione annuale obbligatoria.
"""

MANUAL_MD_EN = """# NEW LIFE Sàrl - Luxembourg
## Methodological Guide & User Manual for the AML / CFT Compliance Module
### Anti-Money Laundering Compliance (AED Oversight / Law of 12 Nov 2004), Inflow Monitoring & Directorship Fees
**Company :** NEW LIFE Sàrl &bull; **R.C.S. Luxembourg :** B 225.643 &bull; **National ID (Matricule) :** 2018 2432 026
**Version :** 2.0 (Fiscal Year 2026) &bull; **Status :** Official Internal Compliance Policy

---

## 1. Luxembourg AML Legal Framework (Entities Not Supervised by CSSF)

### 1.1. Competent Supervisory Authority : The AED
In the Grand Duchy of Luxembourg, oversight for Anti-Money Laundering and Countering the Financing of Terrorism (AML / CFT) is allocated across dedicated regulators:
- **The CSSF (Commission de Surveillance du Secteur Financier)**: exclusively supervises regulated financial institutions (banks, UCITS, investment funds, management companies, PSFs).
- **The AED (Administration de l'Enregistrement, des Domaines et de la TVA)**: is the statutory supervisory authority for **non-financial sector professionals and corporate entities**, including:
  - Trust and Company Service Providers (*TCSP*).
  - Independent corporate directors and board members.
  - Management and business consulting firms not subject to CSSF oversight.

As a private limited liability company (*Sàrl*) providing corporate directorship, strategic management, and business advisory services, **NEW LIFE Sàrl is subject to the direct oversight of the AED** pursuant to Article 2-1 (8) of the amended Law of 12 November 2004.

### 1.2. Key Legislative References
1. **Law of 12 November 2004 (AML/CFT)** on the prevention of money laundering and terrorist financing (as amended).
2. **Law of 13 January 2019** establishing the Register of Beneficial Owners (RBE / LBR).
3. **AED Circulars (notably Circulars No. 779 & No. 800)** outlining compliance guidelines and the annual AML self-assessment questionnaire.
4. **Luxembourg Penal Code (Articles 506-1 to 506-8)** defining money laundering offences.

---

## 2. Compliance Obligations for NEW LIFE Sàrl

### 2.1. Customer Due Diligence (CDD) Obligations
For all client relationships and directorship appointments, NEW LIFE Sàrl enforces strict onboarding checks:
- **Corporate Identification:** Legal name, legal form, registered office, RCSL number, VAT number, and certified articles of association.
- **Beneficial Ownership Identification (UBO / RBE):** Any natural person holding directly or indirectly more than 25% of capital or voting rights, or exercising effective control.
- **Mandatory RBE Consultation:** Systematic verification of the official RBE extract issued by Luxembourg Business Registers (LBR).
- **PEP Screening:** Detection of Politically Exposed Persons holding prominent public positions or their close associates (*RCAs*).

### 2.2. Vigilance Thresholds and Risk Levels
- **All Inflows (≥ €0)**: Full accounting and banking traceability of every receipt.
- **≥ €5,000 (Standard Vigilance)**: Formal verification of alignment with the signed directorship engagement agreement.
- **≥ €10,000 (EU / AED Legal Threshold)**: Comprehensive Customer Due Diligence, valid RBE extract, and 5-year data retention.
- **≥ €25,000 (Major Invoices)**: Enhanced economic justification and source-of-wealth scrutiny.

### 2.3. Mandatory Document Retention (5 Years)
All identification files (ID cards, RCS extracts, RBE declarations, engagement contracts, and invoices) must be retained for **at least 5 years** following the termination of the business relationship.

### 2.4. Suspicious Transaction Reporting (STR)
Any transaction exhibiting anomalous patterns or lacking plausible economic rationale must be reported without delay to the **Financial Intelligence Unit (CRF / FIU Luxembourg)**.

---

## 3. Practical User Guide for the AML Module in the App

The **AML / CFT Compliance** module (`aml.html`) comprises 4 specialized tabs:

### 3.1. Tab 1 : Inflows & AML Register
- **Descending Chronological Order:** Operations from **2026** and the latest invoices appear at the top of the table.
- **Advanced Filters:** Filter by fiscal year, debtor company, legal form, KYC status, and AML thresholds (5k, 10k, 25k).
- **Strict Scope:** Exclusively includes the **109 legitimate corporate fee invoices** (manager expense advances and storno reversals are strictly excluded).
- **KYC File Button:** Instant one-click modal opening for compliance review on any transaction.

### 3.2. Tab 2 : Clients & Mandates Map
- Comprehensive profile cards for all 14 client companies (*Europa Plus, Pals Advisors, Ersel International, Banca Generali SICAVs, SPF Ariel/Fortau/Micro/Oira/Orte, Green Enerbras, Glenelg*).
- Display of RCS number, corporate form, directorship mandate nature, identified UBOs, cumulative billed volume, and document checklist.

### 3.3. Tab 3 : Legal Framework & Risk Matrix
- Summary of competent authorities (AED, CSSF, CRF) and comprehensive risk factor matrix.

### 3.4. Interactive KYC Modal & Local Storage Persistence
- Clicking **"KYC"** enables viewing and editing corporate details, UBOs, risk rating (Low/Medium/High), PEP status, and compliance notes.
- All modifications are **automatically persisted in local browser storage (`localStorage`)**.

### 3.5. Regulatory Exports
- 📊 **Excel (.xlsx):** Standardized **25-column AML compliance spreadsheet**.
- 📄 **CSV:** Standardized tabular export.
- 🖨️ **Official PDF Report:** Formatted audit report with NEW LIFE Sàrl corporate header and consolidated statistics.

---

## 4. Due Diligence Risk Simulator (Risk-Based Approach)

The **"4. Due Diligence Simulator"** tab assesses client risk using a weighted 5-pillar scoring model:

### 4.1. Scoring Model (0 to 100 Points)
1. **Corporate Entity Type:**
   - CSSF Regulated SICAV / Fund: `+5 pts` (Low institutional risk).
   - Commercial Company (SA / Sàrl): `+10 pts` (Standard risk).
   - SPF (Family Wealth Company): `+15 pts` (Strict UBO scrutiny required).
   - SCSp (Special Limited Partnership): `+20 pts` (Limited partner vetting).
2. **Registered Office Jurisdiction:**
   - Luxembourg / Eurozone: `+5 pts` (Equivalent EU framework).
   - Switzerland / UK / USA: `+10 pts` (Equivalent FATF third country).
   - International / Non-EU: `+35 pts` (High vigilance requirement).
3. **PEP Exposure:**
   - PEP Involved: `+35 pts` &rarr; Automatic trigger of **Enhanced Due Diligence (EDD)**.
4. **Ownership Structure:**
   - Direct ownership: `+0 pts`.
   - Multi-tiered holding chain: `+25 pts`.
   - Trust / Fiduciary structure: `+30 pts`.
5. **Annual Fee Volume:**
   - < €25,000: `+0 pts` | €25,000 – €50,000: `+10 pts` | ≥ €50,000: `+15 pts`.

### 4.2. Risk Classes & Recommended Measures
- 🟢 **Low Risk (Score < 35):** Standard Due Diligence (RCS extract, UBO ID, directorship agreement).
- 🟡 **Medium Risk (Score 35 – 59):** Active vigilance, verified RBE extract, biennial review.
- 🔴 **High Risk (Score ≥ 60 or PEP):** Enhanced Due Diligence (*EDD*), documented source of wealth, executive sign-off, and mandatory annual audit.
"""

# -----------------------------------------------------------------------------
# 2. GÉNÉRATION DES FICHIERS PDF AVEC PYMUPDF
# -----------------------------------------------------------------------------

def create_pdf_from_text(title, subtitle, lang_code, sections, output_pdf_path):
    doc = fitz.open()
    
    # Dimensions A4 : 595.3 x 841.9 points
    PAGE_WIDTH = 595.3
    PAGE_HEIGHT = 841.9
    MARGIN_X = 45.0
    MARGIN_TOP = 50.0
    MARGIN_BOTTOM = 50.0
    CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_X
    
    # Couleurs
    COLOR_PRIMARY = fitz.utils.getColor("emerald") # (0.06, 0.73, 0.49)
    COLOR_HEADER_BG = (0.06, 0.73, 0.49) # Emerald
    COLOR_DARK = (0.06, 0.09, 0.16) # #0f172a
    COLOR_MUTED = (0.40, 0.45, 0.55) # #64748b
    COLOR_BORDER = (0.85, 0.88, 0.92)
    COLOR_LIGHT_BG = (0.96, 0.98, 0.99)
    COLOR_ACCENT_BLUE = (0.15, 0.45, 0.85)

    def new_page_with_header(page_num, total_pages=None):
        page = doc.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        
        # En-tête supérieur
        # Bande supérieure décorative
        page.draw_rect(fitz.Rect(MARGIN_X, 25, PAGE_WIDTH - MARGIN_X, 27), color=COLOR_HEADER_BG, fill=COLOR_HEADER_BG)
        page.insert_text(fitz.Point(MARGIN_X, 40), "NEW LIFE Sàrl • Luxembourg (R.C.S. B 225.643)", fontsize=8, color=COLOR_MUTED)
        page.insert_text(fitz.Point(PAGE_WIDTH - MARGIN_X - 170, 40), f"Conformité AML / LBC-FT (AED)", fontsize=8, color=COLOR_HEADER_BG)
        
        # Ligne de séparation
        page.draw_line(fitz.Point(MARGIN_X, 45), fitz.Point(PAGE_WIDTH - MARGIN_X, 45), color=COLOR_BORDER, width=0.5)
        
        # Pied de page
        page.draw_line(fitz.Point(MARGIN_X, PAGE_HEIGHT - 35), fitz.Point(PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 35), color=COLOR_BORDER, width=0.5)
        page.insert_text(fitz.Point(MARGIN_X, PAGE_HEIGHT - 22), "Document de Conformité Interne • Loi modifiée du 12 novembre 2004", fontsize=7.5, color=COLOR_MUTED)
        page.insert_text(fitz.Point(PAGE_WIDTH - MARGIN_X - 55, PAGE_HEIGHT - 22), f"Page {page_num}", fontsize=8, color=COLOR_DARK)
        
        return page

    # Page 1 : Page de titre & Présentation
    p_num = 1
    page = new_page_with_header(p_num)
    
    y = 70.0
    
    # Titre Principal
    # Boîte titre avec fond doux
    page.draw_rect(fitz.Rect(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y + 75), color=COLOR_BORDER, fill=COLOR_LIGHT_BG)
    page.draw_rect(fitz.Rect(MARGIN_X, y, MARGIN_X + 6, y + 75), color=COLOR_HEADER_BG, fill=COLOR_HEADER_BG)
    
    page.insert_text(fitz.Point(MARGIN_X + 18, y + 26), title, fontsize=15, color=COLOR_DARK, fontname="hebo")
    page.insert_text(fitz.Point(MARGIN_X + 18, y + 46), subtitle, fontsize=9.5, color=COLOR_HEADER_BG, fontname="hebo")
    page.insert_text(fitz.Point(MARGIN_X + 18, y + 62), "NEW LIFE Sàrl • R.C.S. Luxembourg B 225.643 • Matricule National : 2018 2432 026", fontsize=8, color=COLOR_MUTED)
    
    y += 95.0
    
    for sec_idx, sec in enumerate(sections):
        # Vérifier si besoin de nouvelle page
        estimated_height = 40 + len(sec.get("items", [])) * 32 + len(sec.get("paras", [])) * 28
        if y + estimated_height > PAGE_HEIGHT - MARGIN_BOTTOM:
            p_num += 1
            page = new_page_with_header(p_num)
            y = 65.0
            
        # Titre Section
        sec_title = sec["title"]
        page.draw_rect(fitz.Rect(MARGIN_X, y, MARGIN_X + 3, y + 14), color=COLOR_HEADER_BG, fill=COLOR_HEADER_BG)
        page.insert_text(fitz.Point(MARGIN_X + 10, y + 12), sec_title, fontsize=11.5, color=COLOR_DARK, fontname="hebo")
        y += 22.0
        
        # Paragraphes
        for para in sec.get("paras", []):
            # Découpage du texte en lignes d'environ 95 caractères
            words = para.split(" ")
            line = ""
            for w in words:
                if len(line) + len(w) + 1 > 92:
                    if y > PAGE_HEIGHT - MARGIN_BOTTOM - 15:
                        p_num += 1
                        page = new_page_with_header(p_num)
                        y = 65.0
                    page.insert_text(fitz.Point(MARGIN_X, y), line, fontsize=8.8, color=COLOR_DARK)
                    y += 13.0
                    line = w
                else:
                    line = f"{line} {w}".strip()
            if line:
                if y > PAGE_HEIGHT - MARGIN_BOTTOM - 15:
                    p_num += 1
                    page = new_page_with_header(p_num)
                    y = 65.0
                page.insert_text(fitz.Point(MARGIN_X, y), line, fontsize=8.8, color=COLOR_DARK)
                y += 16.0
                
        # Items / Bullet points
        for item in sec.get("items", []):
            if y > PAGE_HEIGHT - MARGIN_BOTTOM - 25:
                p_num += 1
                page = new_page_with_header(p_num)
                y = 65.0
                
            item_title = item.get("h", "")
            item_text = item.get("t", "")
            
            # Puce
            page.draw_circle(fitz.Point(MARGIN_X + 5, y - 3), 2.5, color=COLOR_HEADER_BG, fill=COLOR_HEADER_BG)
            
            full_item = f"{item_title}: {item_text}" if item_title else item_text
            words = full_item.split(" ")
            line = ""
            is_first = True
            for w in words:
                if len(line) + len(w) + 1 > 88:
                    x_pos = MARGIN_X + 15
                    page.insert_text(fitz.Point(x_pos, y), line, fontsize=8.5, color=COLOR_DARK)
                    y += 12.0
                    line = w
                else:
                    line = f"{line} {w}".strip()
            if line:
                page.insert_text(fitz.Point(MARGIN_X + 15, y), line, fontsize=8.5, color=COLOR_DARK)
                y += 16.0
                
        # Encadré d'alerte / conseil si présent
        if sec.get("callout"):
            callout = sec["callout"]
            if y > PAGE_HEIGHT - MARGIN_BOTTOM - 45:
                p_num += 1
                page = new_page_with_header(p_num)
                y = 65.0
                
            box_h = 38.0
            page.draw_rect(fitz.Rect(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y + box_h), color=COLOR_BORDER, fill=COLOR_LIGHT_BG)
            page.draw_rect(fitz.Rect(MARGIN_X, y, MARGIN_X + 3, y + box_h), color=COLOR_ACCENT_BLUE, fill=COLOR_ACCENT_BLUE)
            
            page.insert_text(fitz.Point(MARGIN_X + 12, y + 15), callout["title"], fontsize=8.5, color=COLOR_ACCENT_BLUE, fontname="hebo")
            page.insert_text(fitz.Point(MARGIN_X + 12, y + 28), callout["text"][:110], fontsize=8, color=COLOR_DARK)
            y += box_h + 12.0
            
        y += 8.0

    doc.save(output_pdf_path)
    doc.close()
    print(f"[OK] PDF généré : {output_pdf_path}")

# -----------------------------------------------------------------------------
# 3. STRUCTURES DE DONNÉES PAR LANGUE
# -----------------------------------------------------------------------------

SECTIONS_FR = [
    {
        "title": "1. Cadre Légal Luxembourgeois & Supervision de l'AED",
        "paras": [
            "Au Grand-Duché de Luxembourg, la lutte contre le blanchiment de capitaux et le financement du terrorisme (LBC/FT) est régie par la Loi modifiée du 12 novembre 2004.",
            "NEW LIFE Sàrl est une société commerciale fournissant des services d'administration de sociétés, de direction stratégique et de conseil en gestion. À ce titre, NEW LIFE Sàrl n'est pas un établissement bancaire ou financier et ne relève pas de la supervision de la CSSF.",
            "L'autorité de contrôle légalement compétente pour NEW LIFE Sàrl est l'AED (Administration de l'Enregistrement, des Domaines et de la TVA), conformément à l'Article 2-1 (8) de la Loi du 12 novembre 2004 régissant les prestataires de services aux sociétés (TCSP) et administrateurs indépendants."
        ],
        "items": [
            {"h": "Loi du 12 novembre 2004", "t": "Texte fondateur définissant les obligations de vigilance, d'organisation interne et de déclaration."},
            {"h": "Loi du 13 janvier 2019 (RBE)", "t": "Obligation d'enregistrement et de vérification des Bénéficiaires Effectifs auprès du LBR."},
            {"h": "Circulaires AED 779 & 800", "t": "Lignes directrices méthodologiques de l'AED et questionnaire annuel d'évaluation du risque."},
            {"h": "Cellule de Renseignement Financier (CRF)", "t": "Autorité nationale réceptrice des déclarations de soupçon (STR)."}
        ],
        "callout": {
            "title": "Point Clé AED",
            "text": "L'AED effectue des contrôles réguliers sur pièces et sur place des professionnels non soumis à la CSSF."
        }
    },
    {
        "title": "2. Obligations Pratiques de Conformité pour NEW LIFE Sàrl",
        "paras": [
            "NEW LIFE Sàrl applique une approche fondée sur les risques (Risk-Based Approach) articulée autour de 4 obligations majeures :"
        ],
        "items": [
            {"h": "Identification Client (CDD)", "t": "Obtention systématique de l'extrait RCSL récent, des statuts et du numéro de TVA."},
            {"h": "Vérification des UBO / RBE", "t": "Identification de toute personne physique détenant > 25% du capital ou le contrôle effectif."},
            {"h": "Criblage PEP & Sanctions", "t": "Détection des Personnes Politiquement Exposées et application d'une vigilance renforcée si applicable."},
            {"h": "Seuils AML", "t": "Gradation des contrôles : Standard (< 5k€), Vigilance active (5k€-10k€), Due Diligence légale (≥ 10k€), Renforcée (≥ 25k€)."},
            {"h": "Conservation 5 Ans", "t": "Obligation légale de conservation de l'intégralité des dossiers KYC pendant 5 ans après la fin du mandat."}
        ],
        "callout": {
            "title": "Délai Légal de Conservation",
            "text": "Tous les extraits RCS, déclarations RBE, pièces d'identité et factures sont archivés pendant 5 ans minimum."
        }
    },
    {
        "title": "3. Guide d'Utilisation du Module AML dans l'Application",
        "paras": [
            "Le module aml.html a été spécialement conçu pour refléter avec précision les mandats d'administrateur et facturations de NEW LIFE Sàrl :"
        ],
        "items": [
            {"h": "Tri Chronologique Récent", "t": "Les opérations de 2026 et les plus récentes sont présentées en haut du registre."},
            {"h": "Périmètre Épuré", "t": "Le registre filtre strictement les 109 factures réelles de prestations (les remboursements de frais avancés et stornos en sont exclus)."},
            {"h": "Fiche KYC Interactive", "t": "Accès d'un clic au formulaire d'audit avec mémorisation permanente dans le navigateur (localStorage)."},
            {"h": "Cartographie des Mandats", "t": "Fiches détaillées des 14 sociétés clientes (Europa Plus, Pals Advisors, Ersel, SICAV BG, SPF, etc.)."},
            {"h": "Exports Multi-Formats", "t": "Génération instantanée de fichiers Excel (25 colonnes normées), CSV et Rapports Officiels PDF."}
        ]
    },
    {
        "title": "4. Le Simulateur de Due Diligence (Risk-Based Approach)",
        "paras": [
            "L'onglet 'Simulateur Due Diligence' permet d'évaluer le niveau de risque LBC-FT (score de 0 à 100) pour tout nouveau mandat selon 5 axes :"
        ],
        "items": [
            {"h": "Forme Juridique", "t": "SICAV régulée (+5 pts), Société Commerciale SA/Sàrl (+10 pts), SPF Patrimoniale (+15 pts), SCSp (+20 pts)."},
            {"h": "Juridiction du Siège", "t": "Luxembourg / Zone Euro (+5 pts), Suisse / UK / USA (+10 pts), Pays Tiers non-UE (+35 pts)."},
            {"h": "Facteur PEP", "t": "Présence d'une Personne Politiquement Exposée (+35 pts et déclenchement de la Vigilance Renforcée)."},
            {"h": "Complexité Actionnariat", "t": "Détention directe (+0 pt), Chaîne multi-holdings (+25 pts), Trust / Fiducie (+30 pts)."},
            {"h": "Volume d'Honoraires", "t": "< 25.000 € (+0 pt), 25.000 € à 50.000 € (+10 pts), ≥ 50.000 € (+15 pts)."}
        ],
        "callout": {
            "title": "Seuils de Décision",
            "text": "Score < 35 : Risque Faible (CDD Standard) | Score 35-59 : Risque Moyen | Score ≥ 60 ou PEP : Risque Élevé (EDD)."
        }
    }
]

SECTIONS_IT = [
    {
        "title": "1. Quadro Normativo Lussemburghese & Vigilanza AED",
        "paras": [
            "Nel Granducato di Lussemburgo, la prevenzione del riciclaggio di capitali e del finanziamento del terrorismo (AML / LBC-FT) è disciplinata dalla Legge modificata del 12 novembre 2004.",
            "NEW LIFE Sàrl è una società commerciale che eroga prestazioni di amministrazione societaria, direzione strategica e consulenza aziendale. Pertanto, NEW LIFE Sàrl non è un istituto bancario o finanziario e non è soggetta alla vigilanza diretta della CSSF.",
            "L'autorità di vigilanza legalmente competente per NEW LIFE Sàrl è l'AED (Administration de l'Enregistrement, des Domaines et de la TVA), ai sensi dell'Articolo 2-1 (8) della Legge del 12 novembre 2004 che disciplina i prestatori di servizi alle società (TCSP) e gli amministratori indipendenti."
        ],
        "items": [
            {"h": "Legge 12 novembre 2004", "t": "Normativa cardine che definisce gli obblighi di adeguata verifica, organizzazione interna e segnalazione."},
            {"h": "Legge 13 gennaio 2019 (RBE)", "t": "Obbligo di registrazione e verifica dei Titolari Effettivi presso il registro LBR."},
            {"h": "Circolari AED 779 & 800", "t": "Linee guida operative emanate dall'AED e questionario annuale di valutazione del rischio AML."},
            {"h": "Cellule de Renseignement Financier (CRF)", "t": "Unità di Informazione Finanziaria (FIU) lussemburghese per le segnalazioni di operazioni sospette (STR)."}
        ],
        "callout": {
            "title": "Punto Chiave AED",
            "text": "L'AED effettua ispezioni e controlli documentali sui professionisti e società non soggetti alla CSSF."
        }
    },
    {
        "title": "2. Obblighi Operativi di Conformità per NEW LIFE Sàrl",
        "paras": [
            "NEW LIFE Sàrl adotta un approccio basato sul rischio (Risk-Based Approach) strutturato su 4 obblighi fondamentali:"
        ],
        "items": [
            {"h": "Adeguata Verifica (CDD)", "t": "Acquisizione sistematica di visura camerale RCSL recente, statuto vigente e partita IVA."},
            {"h": "Verifica Titolari Effettivi (RBE)", "t": "Identificazione di ogni persona fisica che detenga > 25% del capitale o il controllo effettivo."},
            {"h": "Screening PEP & Sanzioni", "t": "Rilevazione di Persone Politicamente Esposte e applicazione di vigilanza rafforzata ove richiesto."},
            {"h": "Soglie di Importo AML", "t": "Graduazione dei controlli: Standard (< 5k€), Vigilanza attiva (5k€-10k€), Due Diligence legale (≥ 10k€), Rafforzata (≥ 25k€)."},
            {"h": "Conservazione 5 Anni", "t": "Obbligo di conservazione integrale di tutti i fascicoli KYC per almeno 5 anni dalla cessazione del mandato."}
        ],
        "callout": {
            "title": "Termine Legale di Conservazione",
            "text": "Tutte le visure RCS, dichiarazioni RBE, documenti di identità e fatture sono conservati per almeno 5 anni."
        }
    },
    {
        "title": "3. Guida all'Uso del Modulo AML nell'Applicazione",
        "paras": [
            "Il modulo aml.html è stato espressamente strutturato per riflettere le fatturazioni e i mandati societari di NEW LIFE Sàrl:"
        ],
        "items": [
            {"h": "Ordinamento Decrescente", "t": "Le operazioni del 2026 e le più recenti sono visualizzate in alto nel registro."},
            {"h": "Perimetro Depurato", "t": "Include esclusivamente le 109 fatture reali di compensi (esclusi rimborsi spese anticipate e storni)."},
            {"h": "Fascicolo KYC Interattivo", "t": "Accesso immediato con un click alla scheda di audit con salvataggio persistente in localStorage."},
            {"h": "Mappatura dei Mandati", "t": "Schede anagrafiche complete per le 14 società clienti (Europa Plus, Pals Advisors, Ersel, SICAV BG, SPF, ecc.)."},
            {"h": "Esportazioni Multi-Formato", "t": "Generazione immediata di file Excel (25 colonne normate), CSV e Report Ufficiali PDF."}
        ]
    },
    {
        "title": "4. Il Simulatore di Due Diligence (Risk-Based Approach)",
        "paras": [
            "La sezione 'Simulateur Due Diligence' consente di calcolare il punteggio di rischio (score 0-100) per ogni nuovo cliente su 5 parametri:"
        ],
        "items": [
            {"h": "Forma Giuridica", "t": "SICAV regolata (+5 pt), Società Commerciale SA/Sàrl (+10 pt), SPF Patrimoniale (+15 pt), SCSp (+20 pt)."},
            {"h": "Giurisdizione Sede", "t": "Lussemburgo / Zona Euro (+5 pt), Svizzera / UK / USA (+10 pt), Paesi Terzi non-UE (+35 pt)."},
            {"h": "Fattore PEP", "t": "Presenza di Persona Politicamente Esposta (+35 pt e attivazione automatica Vigilanza Rafforzata)."},
            {"h": "Complessità Azionariato", "t": "Controllo diretto (+0 pt), Catena multi-holding (+25 pt), Trust / Fiduciaria (+30 pt)."},
            {"h": "Volume Compensi", "t": "< 25.000 € (+0 pt), 25.000 € - 50.000 € (+10 pt), ≥ 50.000 € (+15 pt)."}
        ],
        "callout": {
            "title": "Soglie di Rischio",
            "text": "Score < 35 : Rischio Basso (CDD Standard) | Score 35-59 : Rischio Medio | Score ≥ 60 o PEP : Rischio Elevato (EDD)."
        }
    }
]

SECTIONS_EN = [
    {
        "title": "1. Luxembourg Legal Framework & AED Oversight",
        "paras": [
            "In the Grand Duchy of Luxembourg, the prevention of money laundering and terrorist financing (AML / CFT) is governed by the amended Law of 12 November 2004.",
            "NEW LIFE Sàrl is a commercial company providing corporate directorship, strategic oversight, and business management services. Consequently, NEW LIFE Sàrl is not a banking or financial institution and is not subject to direct supervision by the CSSF.",
            "The legally designated supervisory authority for NEW LIFE Sàrl is the AED (Administration de l'Enregistrement, des Domaines et de la TVA), pursuant to Article 2-1 (8) of the Law of 12 November 2004 governing trust and company service providers (TCSPs) and independent directors."
        ],
        "items": [
            {"h": "Law of 12 November 2004", "t": "Foundational legislation defining Customer Due Diligence, internal organization, and reporting duties."},
            {"h": "Law of 13 January 2019 (RBE)", "t": "Mandatory registration and verification of Beneficial Owners via the official LBR register."},
            {"h": "AED Circulars 779 & 800", "t": "Operational guidelines issued by the AED and annual AML risk self-assessment questionnaire."},
            {"h": "Financial Intelligence Unit (CRF)", "t": "National authority for receiving and analyzing Suspicious Transaction Reports (STR)."}
        ],
        "callout": {
            "title": "AED Key Notice",
            "text": "The AED conducts periodic document audits and on-site inspections for professionals not supervised by CSSF."
        }
    },
    {
        "title": "2. Practical Compliance Obligations for NEW LIFE Sàrl",
        "paras": [
            "NEW LIFE Sàrl implements a Risk-Based Approach (RBA) structured around 4 core statutory obligations:"
        ],
        "items": [
            {"h": "Customer Due Diligence (CDD)", "t": "Systematic collection of certified RCSL extracts, articles of association, and VAT numbers."},
            {"h": "Beneficial Ownership Verification (RBE)", "t": "Identification of any natural person holding > 25% ownership or effective control."},
            {"h": "PEP & Sanctions Screening", "t": "Detection of Politically Exposed Persons and application of Enhanced Due Diligence (EDD)."},
            {"h": "AML Thresholds", "t": "Layered vigilance: Standard (< €5k), Active vigilance (€5k-€10k), Statutory Due Diligence (≥ €10k), Enhanced (≥ €25k)."},
            {"h": "5-Year Record Retention", "t": "Statutory obligation to retain all KYC files for at least 5 years following mandate termination."}
        ],
        "callout": {
            "title": "Legal Retention Period",
            "text": "All corporate extracts, RBE filings, identification proofs, and invoices must be retained for at least 5 years."
        }
    },
    {
        "title": "3. User Guide for the AML Module in the Application",
        "paras": [
            "The aml.html module is tailored to monitor directorship mandates and fund inflows for NEW LIFE Sàrl:"
        ],
        "items": [
            {"h": "Descending Date Sorting", "t": "Operations for 2026 and the most recent invoices are presented at the top of the register."},
            {"h": "Dedicated Clean Scope", "t": "Exclusively tracks the 109 legitimate corporate fee invoices (manager expense advances and stornos are filtered out)."},
            {"h": "Interactive KYC Modal", "t": "Instant one-click access to audit records with persistent browser storage (localStorage)."},
            {"h": "Mandates Mapping", "t": "Detailed profile cards for all 14 client companies (Europa Plus, Pals Advisors, Ersel, BG SICAVs, SPFs, etc.)."},
            {"h": "Multi-Format Exports", "t": "Immediate generation of 25-column Excel spreadsheets, CSV files, and Official PDF Reports."}
        ]
    },
    {
        "title": "4. Due Diligence Risk Simulator (Risk-Based Approach)",
        "paras": [
            "The 'Simulateur Due Diligence' tab calculates the AML/CFT risk score (0 to 100) for any prospective mandate across 5 key pillars:"
        ],
        "items": [
            {"h": "Legal Form", "t": "Regulated SICAV (+5 pts), Commercial Company SA/Sàrl (+10 pts), Family SPF (+15 pts), SCSp (+20 pts)."},
            {"h": "Jurisdiction", "t": "Luxembourg / Eurozone (+5 pts), Switzerland / UK / USA (+10 pts), Non-EU Third Country (+35 pts)."},
            {"h": "PEP Exposure", "t": "Involvement of a Politically Exposed Person (+35 pts and automatic trigger of Enhanced Due Diligence)."},
            {"h": "Ownership Complexity", "t": "Direct ownership (+0 pts), Multi-tiered holding (+25 pts), Trust / Fiduciary structure (+30 pts)."},
            {"h": "Annual Fee Volume", "t": "< €25,000 (+0 pts), €25,000 to €50,000 (+10 pts), ≥ €50,000 (+15 pts)."}
        ],
        "callout": {
            "title": "Risk Categories",
            "text": "Score < 35: Low Risk (Standard CDD) | Score 35-59: Medium Risk | Score ≥ 60 or PEP: High Risk (EDD)."
        }
    }
]

# -----------------------------------------------------------------------------
# 4. EXECUTION PRINCIPALE
# -----------------------------------------------------------------------------

def main():
    print("="*60)
    print("   NEW LIFE Sàrl - Génération des Manuels AML / LBC-FT")
    print("="*60)

    # 1. Markdown Files
    path_md_fr = os.path.join(DOCS_DIR, "Manuel_Conformite_AML_LBC-FT_NEW_LIFE_FR.md")
    with open(path_md_fr, "w", encoding="utf-8") as f:
        f.write(MANUAL_MD_FR)
    print(f"[OK] MD FR généré : {path_md_fr}")

    path_md_it = os.path.join(DOCS_DIR, "Manuale_Conformita_AML_Antiriciclaggio_NEW_LIFE_IT.md")
    with open(path_md_it, "w", encoding="utf-8") as f:
        f.write(MANUAL_MD_IT)
    print(f"[OK] MD IT généré : {path_md_it}")

    path_md_en = os.path.join(DOCS_DIR, "User_Manual_AML_CFT_Compliance_NEW_LIFE_EN.md")
    with open(path_md_en, "w", encoding="utf-8") as f:
        f.write(MANUAL_MD_EN)
    print(f"[OK] MD EN généré : {path_md_en}")

    # 2. PDF Files
    path_pdf_fr = os.path.join(DOCS_DIR, "Manuel_Conformite_AML_LBC-FT_NEW_LIFE_FR.pdf")
    create_pdf_from_text(
        title="Guide & Manuel de Conformité AML / LBC-FT",
        subtitle="Supervision AED • Obligations TCSP & Administrateurs • Contrôle des Recettes",
        lang_code="FR",
        sections=SECTIONS_FR,
        output_pdf_path=path_pdf_fr
    )

    path_pdf_it = os.path.join(DOCS_DIR, "Manuale_Conformita_AML_Antiriciclaggio_NEW_LIFE_IT.pdf")
    create_pdf_from_text(
        title="Manuale Operativo di Conformità AML / Antiriciclaggio",
        subtitle="Vigilanza AED • Obblighi Amministratori Societari • Controllo Entrate & Mandati",
        lang_code="IT",
        sections=SECTIONS_IT,
        output_pdf_path=path_pdf_it
    )

    path_pdf_en = os.path.join(DOCS_DIR, "User_Manual_AML_CFT_Compliance_NEW_LIFE_EN.pdf")
    create_pdf_from_text(
        title="User Manual & Methodological Guide: AML / CFT Compliance",
        subtitle="AED Oversight • Corporate Directorship Obligations • Revenue & Inflow Verification",
        lang_code="EN",
        sections=SECTIONS_EN,
        output_pdf_path=path_pdf_en
    )

    print("\n[SUCCÈS] Tous les manuels Markdown et PDF ont été générés avec succès !")

if __name__ == "__main__":
    main()
