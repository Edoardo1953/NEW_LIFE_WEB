# NEW LIFE Sàrl - Luxembourg
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
- Fiches synthétiques détaillées pour chacune des 14 sociétés clientes (*Europa Plus S.A., Pals Advisors Sàrl (liquidée), Ersel Gestion Internationale SA, SICAV Banca Generali, SPF Ariel/Fortau/Micro/Oira/Orte, Macro International SA (en liquidation), Green Enerbras, Glenelg*).
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
