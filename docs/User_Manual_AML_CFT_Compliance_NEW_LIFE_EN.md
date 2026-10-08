# NEW LIFE Sàrl - Luxembourg
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
