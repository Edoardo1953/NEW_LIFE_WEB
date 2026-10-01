/**
 * NEW LIFE Sàrl - Système Multilingue (FR base, IT, EN)
 */

const translations = {
    'fr': {
        // Navigation & Général
        'app_title': 'NEW LIFE Sàrl',
        'app_subtitle': 'Gestion Comptable & Financière',
        'nav_dashboard': 'Vue d’ensemble',
        'nav_banca': 'Compte Courant',
        'nav_contabilita': 'Comptabilité PCN',
        'nav_ammortamenti': 'Amortissements',
        'nav_partecipazioni': 'Participations',
        'nav_documenti': 'Documents Société',
        'nav_strumenti': 'Outils & Passwords',
        'nav_section_modules': 'MODULES',
        'nav_section_tools': 'GESTION',
        'nav_refresh_data': 'Actualiser les données',
        'last_update': 'Dernière mise à jour :',
        'currency_symbol': '€',

        // Dashboard / Vue d'ensemble
        'dash_title': 'Tableau de Bord Financier',
        'dash_welcome': 'Synthèse générale des flux et de la situation comptable de NEW LIFE Sàrl.',
        'kpi_bank_balance': 'Solde Bancaire Actuel',
        'kpi_total_inflow': 'Total Entrées (Période)',
        'kpi_total_outflow': 'Total Sorties (Période)',
        'kpi_net_result': 'Résultat d’Exploitation Net',
        'kpi_assets_vnc': 'Valeur Nette Cespiti (VNC)',
        'kpi_docs_count': 'Documents Archivés',
        'chart_cashflow_title': 'Évolution du Solde & Flux Mensuels',
        'chart_expense_distrib': 'Répartition des Charges (Classe PCN)',
        'recent_transactions': 'Dernières Opérations Bancaires',
        'view_all_transactions': 'Voir toutes les opérations',
        'quick_actions': 'Accès Rapide',
        'btn_new_doc': 'Nouveau Document',
        'btn_add_asset': 'Simuler Amortissement',
        'btn_export_bilan': 'Exporter Bilan',

        // Compte Courant / Banque
        'banca_title': 'Grand Livre de Trésorerie & Compte Courant',
        'banca_desc': 'Suivi chronologique et analytique des mouvements bancaires.',
        'filter_year': 'Année',
        'filter_month': 'Mois',
        'filter_all_years': 'Toutes les années',
        'filter_all_months': 'Tous les mois',
        'filter_type': 'Type de flux',
        'filter_all_types': 'Tous les types',
        'filter_entrees': 'Entrées uniquement',
        'filter_sorties': 'Sorties uniquement',
        'filter_hide_storni': 'Masquer les stornos techniques',
        'btn_restore_deleted': 'Restaurer les opérations supprimées',
        'confirm_delete_op': 'Êtes-vous sûr de vouloir supprimer cette opération bancaire ?',
        'filter_search_placeholder': 'Rechercher fournisseur, libellé, n° facture...',
        'btn_export_excel': 'Exporter Excel',
        'btn_export_pdf': 'Exporter PDF',
        'btn_reset_filters': 'Réinitialiser',
        'filter_compte': 'Compte bancaire',
        'filter_all_comptes': 'Tous les comptes',
        'compte_post': 'Compte POST (Actif)',
        'compte_banque': 'Compte ING / BANQUE (Clôturé)',
        'compte_caisse': 'Caisse espèces',
        'th_compte': 'Compte',
        'stat_total_in': 'Total Entrées',
        'stat_total_out': 'Total Sorties',
        'stat_net_flow': 'Flux Net',
        'stat_final_balance': 'Solde Reconstitué',
        
        // Tableaux
        'th_code_op': 'Code Op.',
        'th_date': 'Date',
        'th_valeur': 'Valeur',
        'th_e_s': 'Sens',
        'th_description': 'Description / Libellé',
        'th_fournisseur': 'Fournisseur / Tiers',
        'th_macro': 'Macro Catégorie',
        'th_class': 'Classe PCN',
        'th_montant': 'Montant HT',
        'th_tva': 'TVA',
        'th_total': 'Total TTC',
        'th_solde': 'Solde Progressif',
        'th_actions': 'Actions',

        // Comptabilité
        'contab_title': 'Comptabilité Générale & Bilan PCN',
        'contab_desc': 'Plan Comptable Normalisé luxembourgeois, Bilan, Compte de Résultat, Journal et Mastrini.',
        'tab_pnl': 'Pertes et Profits (P&L)',
        'tab_bilan': 'Bilan (Actif / Passif)',
        'tab_journal': 'Journal des Écritures',
        'tab_mastrini': 'Grand Livre (Mastrini)',
        'tab_ledger': 'Balance des Comptes PCN',
        'bilan_actif_title': 'ACTIF DU BILAN',
        'bilan_passif_title': 'PASSIF DU BILAN',
        'pnl_charges_title': 'CHARGES D’EXPLOITATION & FINANCIÈRES',
        'pnl_produits_title': 'PRODUITS D’EXPLOITATION & FINANCIERS',
        'total_actif': 'TOTAL ACTIF :',
        'total_passif': 'TOTAL PASSIF :',
        'total_charges': 'TOTAL CHARGES :',
        'total_produits': 'TOTAL PRODUITS :',
        'net_accounting_result': 'RÉSULTAT NET COMPTABLE :',
        'bilan_status_balanced': '✓ BILAN ÉQUILIBRÉ (Actif = Passif)',
        'bilan_status_in_progress': '📊 EXERCICE EN COURS (PROVISOIRE)',
        'bilan_badge_in_progress': 'EN COURS / PROVISOIRE',
        'bilan_status_diff': 'Différence Actif / Passif :',
        'bilan_status_filing': 'Statut Dépôt RCSL :',
        'bilan_closed_note': 'Exercices comptables clôturés (jusqu’à fin 2025). Déposés au RCSL.',
        'bilan_in_progress_note': 'Exercice 2026 en cours : situation comptable au fil de l’eau (non encore clôturée/déposée). P&L et résultat affichés en temps réel.',
        'opt_year_2026': '2026 (en cours)',
        'filter_method': 'Méthode comptable',
        'opt_method_caisse': 'Flux de Caisse / Trésorerie (Per Cassa)',
        'opt_method_competence': 'Compétence Comptable (PCN)',
        'col_conto_pcn': 'N° Compte',
        'col_titolo_conto': 'Intitulé du Compte',
        'col_tipo_conto': 'Section',
        'col_saldo_prec': 'Solde Antérieur',
        'col_entrate_costi': 'Entrées / Débit',
        'col_uscite_ricavi': 'Sorties / Crédit',
        'col_nuovo_saldo': 'Nouveau Solde',
        'group_conti_bilancio': '⚖ 1. COMPTES DE BILAN (STATO PATRIMONIALE - ACTIF / PASSIF)',
        'group_conti_pnl': '📊 2. COMPTES DE RÉSULTAT (PERDITE E PROFITTI - P&L)',
        'btn_espandi_tutti': 'Tout Développer',
        'btn_comprimi_tutti': 'Tout Réduire',
        'filter_cerca_mastrini': 'Rechercher compte par code ou nom...',
        'filter_cerca_journal': 'Rechercher tiers, description, n° facture...',
        'filter_tutti_conti': 'Tous les comptes PCN',
        'filter_tutte_sezioni': 'Toutes les sections',
        'btn_reset_filtri': 'Réinitialiser Filtres',
        'class_1': 'Classe 1 : Capitaux propres & Provisions',
        'class_2': 'Classe 2 : Actifs immobilisés',
        'class_3': 'Classe 3 : Stocks',
        'class_4': 'Classe 4 : Créances et Dettes',
        'class_5': 'Classe 5 : Valeurs disponibles & Banque',
        'class_6': 'Classe 6 : Charges de l’exercice',
        'class_7': 'Classe 7 : Produits de l’exercice',

        // Amortissements
        'amort_title': 'Registre & Tableaux d’Amortissement',
        'amort_desc': 'Gestion du parc d’immobilisations corporelles et incorporelles.',
        'tab_asset_list': 'Fiches Immobilisations',
        'tab_amort_totals': 'Tableau Consolidé',
        'tab_amort_simulator': 'Simulateur / Nouveau Bien',
        'amort_consolidated_title': 'Échéancier Consolidé des Amortissements',
        'col_acquisitions': 'Acquisitions (+)',
        'col_cessions': 'Cessions / Ventes (-)',
        'col_val_brute_totale': 'Valeur Brute Totale (€)',
        'asset_software': 'Software Bureautique (Paksi / Pak Man)',
        'asset_vehicle': 'Véhicule Peugeot (Car Avenue)',
        'asset_furniture': 'Installation Bureau & Meubles (Piave)',
        'th_asset_name': 'Désignation du Bien',
        'th_category': 'Catégorie PCN',
        'th_acq_date': 'Date Acq.',
        'th_val_brute': 'Valeur Initiale',
        'th_duration': 'Durée (Ans)',
        'th_rate': 'Taux %',
        'th_annuite': 'Dotation Annuelle',
        'th_cumul': 'Amort. Cumulés',
        'th_vnc': 'Valeur Nette (VNC)',
        'btn_calc_amort': 'Calculer l’échéancier',
        'form_asset_name': 'Nom de l’immobilisation',
        'form_category': 'Poste d’actif (ex: 211, 223)',
        'form_acq_val': 'Valeur d’achat hors TVA (€)',
        'form_acq_date': 'Date de mise en service',
        'form_years': 'Durée d’amortissement (années)',
        'form_method': 'Méthode d’amortissement',
        'opt_linear': 'Linéaire (Standard)',
        'opt_degressive': 'Dégressif',

        // Documents
        'docs_title': 'Documents d’Entreprise & Registres',
        'docs_desc': 'Archive centrale des actes, statuts, bilans RCSL et déclarations fiscales.',
        'doc_drag_hint': 'Glisser-déposer pour réorganiser',
        'btn_upload_doc': 'Téléverser un document',
        'btn_restore_default_docs': 'Restaurer Documents',
        'doc_category_all': 'Toutes les catégories',
        'doc_cat_bilan': 'Bilans & Comptes Déposés',
        'doc_cat_juridique': 'Actes & Statuts Juridiques',
        'doc_cat_registres': 'Registres RCS / RBE',
        'doc_cat_fiscal': 'Fiscalité & Déclarations',
        'doc_cat_contrats': 'Contrats & Factures Clés',
        'doc_action_view': 'Visualiser',
        'doc_action_download': 'Télécharger',
        'doc_action_rename': 'Modifier nom / métadonnées',
        'doc_action_delete': 'Supprimer',
        'modal_view_title': 'Aperçu du Document PDF',
        'modal_edit_title': 'Modifier les informations du document',
        'modal_upload_title': 'Ajouter un nouveau document',
        'lbl_doc_title': 'Titre du document',
        'lbl_doc_category': 'Catégorie',
        'lbl_doc_date': 'Date de référence / Dépôt',
        'lbl_doc_file': 'Fichier (PDF, Docx, Image)',
        'btn_save': 'Enregistrer',
        'btn_cancel': 'Annuler',
        'confirm_delete_doc': 'Êtes-vous sûr de vouloir supprimer ce document ?',

        // Participations (Classe PCN 23)
        'part_title': 'Portefeuille des Participations & Filiales',
        'part_desc': 'Suivi des immobilisations financières (Classe PCN 23), archivage des actes de cession, statuts, visures et bilans.',
        'kpi_part_total_vnc': 'Valeur Nette au Bilan (PCN 23)',
        'kpi_part_active_count': 'Participations Détenues',
        'kpi_part_total_invested': 'Total Investi Historique',
        'kpi_part_total_divested': 'Cessions & Plus-values Réalisées',
        'kpi_part_docs_count': 'Documents Juridiques Rattachés',
        'kpi_part_creances': 'Créances & Avances (Compte 234)',
        'tab_part_cards': 'Vue Portefeuille & Fiches',
        'tab_part_table': 'Tableau Comptable PCN 23',
        'tab_part_docs': 'Archive Documents & Actes',
        'tab_part_history': 'Journal des Mouvements PCN 23',
        'filter_part_all': 'Toutes les participations',
        'filter_part_status_all': 'Tous les statuts',
        'filter_part_status_active': 'Actives uniquement',
        'filter_part_status_partial': 'Cessions partielles',
        'btn_new_participation': 'Nouvelle Participation',
        'btn_attach_doc': 'Rattacher un Document',
        'th_part_entity': 'Société / Entité',
        'th_part_country': 'Pays / Juridiction',
        'th_part_pcn': 'Code PCN',
        'th_part_status': 'Statut',
        'th_part_date_entry': 'Date Entrée',
        'th_part_initial_val': 'Valeur Initiale',
        'th_part_divested_val': 'Cessions / Retraits',
        'th_part_vnc': 'Valeur Nette (VNC)',
        'th_part_pct': 'Quote-part (%)',
        'th_part_docs': 'Docs Liés',
        'th_part_actions': 'Actions',
        'part_card_vnc_label': 'Valeur Bilan',
        'part_card_invested_label': 'Investissement Initial',
        'part_card_divested_label': 'Cessions / Retraits',
        'part_card_pct_label': 'Détention',
        'part_card_sector_label': 'Secteur',
        'part_card_rcs_label': 'Immatriculation / RCS',
        'part_card_headquarters_label': 'Siège',
        'part_card_rep_label': 'Gérance / Représentation',
        'part_card_docs_vault': 'Documents & Actes Rattachés',
        'part_btn_view_pdf': 'Aperçu',
        'part_btn_download': 'Télécharger',
        'part_btn_add_doc': 'Ajouter Document',
        'part_btn_edit': 'Modifier',
        'part_btn_delete': 'Supprimer',
        'part_doc_cat_acte': 'Acte d\'acquisition / Cession',
        'part_doc_cat_statuts': 'Statuts & Modifications',
        'part_doc_cat_visura': 'Visura Camerale / Extrait RCS',
        'part_doc_cat_bilan': 'Bilan & Comptes Filiale',
        'part_doc_cat_pacte': 'Pacte d\'associés & Contrats',
        'part_doc_cat_financement': 'Compte Courant & Prêt Associé',
        'part_doc_cat_quittance': 'Preuve de Paiement / Quittance',
        'modal_add_part_title': 'Ajouter une Nouvelle Participation',
        'modal_edit_part_title': 'Modifier les Détails de la Participation',
        'modal_add_doc_title': 'Rattacher un Document à une Participation',
        'lbl_part_name': 'Nom de la Société / Entité',
        'lbl_part_country': 'Pays / Juridiction',
        'lbl_part_pcn': 'Compte PCN (ex: 233, 2330, 234)',
        'lbl_part_sector': 'Secteur d\'activité',
        'lbl_part_rcs': 'Numéro RCS / P.IVA / Registre',
        'lbl_part_headquarters': 'Siège Social',
        'lbl_part_rep': 'Gérant / Mandataire',
        'lbl_part_date': 'Date d\'Acquisition / Entrée',
        'lbl_part_initial_val': 'Montant Investi Initial (€)',
        'lbl_part_divested_val': 'Montant Cédé / Remboursé (€)',
        'lbl_part_vnc': 'Valeur Nette Actuelle au Bilan (€)',
        'lbl_part_pct': 'Pourcentage de Détention (%)',
        'lbl_part_status': 'Statut (Actif, Cédé...)',
        'lbl_part_notes': 'Notes & Remarques',
        'lbl_doc_part_select': 'Participation rattachée',
        'chart_part_distrib_title': 'Répartition de la Valeur Nette par Entité',
        'chart_part_geo_title': 'Exposition Géographique des Participations',
        'confirm_delete_part': 'Êtes-vous sûr de vouloir supprimer cette participation ?',
        'empty_part_msg': 'Aucune participation trouvée pour cette recherche.',
        'empty_docs_msg': 'Aucun document rattaché trouvé.',

        // Outils & Mots de Passe / Gestion Utilisateurs
        'tools_title': 'Outils, Gestion Utilisateurs & Mots de Passe',
        'tools_desc': 'Coffre-fort d\'identifiants d\'entreprise, gestion des accès utilisateurs, générateur de clés et utilitaires financiers.',
        'tab_vault': 'Coffre-fort Mots de Passe',
        'tab_users': 'Gestion Utilisateurs & Rôles',
        'tab_generator': 'Générateur Sécurisé',
        'tab_calc': 'Utilitaires & TVA Lux',
        'kpi_total_vault': 'Comptes & Accès Enregistrés',
        'kpi_active_users': 'Utilisateurs Actifs',
        'kpi_strong_pwd': 'Mots de Passe Sécurisés',
        'kpi_last_backup': 'Statut Sauvegarde',
        'btn_new_credential': 'Nouvel Identifiant',
        'btn_new_user': 'Nouvel Utilisateur',
        'btn_export_vault': 'Exporter Sauvegarde (JSON)',
        'btn_import_vault': 'Importer Sauvegarde',
        'btn_quick_gen': 'Générer Mot de Passe',
        'vault_filter_all': 'Toutes les catégories',
        'vault_cat_banking': 'Banques & Portails Financiers',
        'vault_cat_gov': 'Administration & Fiscalité (RCSL, TVA, ACD)',
        'vault_cat_corp': 'Entreprise & Domaines',
        'vault_cat_email': 'Messagerie & Cloud',
        'vault_cat_supplier': 'Fournisseurs & Utilitaires',
        'vault_cat_other': 'Autres Accès',
        'lbl_service_name': 'Nom du Service / Portale',
        'lbl_vault_category': 'Catégorie',
        'lbl_vault_url': 'Lien URL du site',
        'lbl_vault_username': 'Identifiant / Email / Code utilisateur',
        'lbl_vault_password': 'Mot de Passe',
        'lbl_vault_pin': 'Code PIN / 2FA / Info Complémentaire',
        'lbl_vault_notes': 'Notes & Instructions',
        'lbl_user_fullname': 'Nom & Prénom',
        'lbl_user_email': 'Adresse Email',
        'lbl_user_role': 'Rôle / Fonction',
        'lbl_user_status': 'Statut',
        'lbl_user_modules': 'Modules Autorisés',
        'role_admin': 'Administrateur / Gérant',
        'role_accountant': 'Comptable / Fiduciaire',
        'role_viewer': 'Consultation Seule',
        'role_collab': 'Collaborateur',
        'status_active': 'Actif',
        'status_inactive': 'Inactif',
        'modal_new_credential_title': 'Ajouter un Identifiant au Coffre-fort',
        'modal_edit_credential_title': 'Modifier l\'Identifiant',
        'modal_new_user_title': 'Ajouter un Utilisateur',
        'modal_edit_user_title': 'Modifier l\'Utilisateur',
        'modal_import_title': 'Importer une Sauvegarde de Coffre-fort',
        'toast_copied': 'Copié dans le presse-papier !',
        'toast_saved': 'Enregistré avec succès !',
        'toast_deleted': 'Supprimé avec succès !',
        'toast_data_refreshed': 'Données et synchronisation actualisées avec succès !',
        'confirm_delete_credential': 'Êtes-vous sûr de vouloir supprimer cet identifiant ?',
        'confirm_delete_user': 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
        'gen_length': 'Longueur du mot de passe :',
        'gen_uppercase': 'Majuscules (A-Z)',
        'gen_lowercase': 'Minuscules (a-z)',
        'gen_numbers': 'Chiffres (0-9)',
        'gen_symbols': 'Symboles (!@#$%^&*)',
        'gen_btn_generate': 'Générer un nouveau mot de passe',
        'gen_btn_copy': 'Copier le mot de passe',
        'gen_strength_weak': 'Faible',
        'gen_strength_medium': 'Moyen',
        'gen_strength_strong': 'Très Robuste',
        'calc_tva_title': 'Calculateur TVA Luxembourg',
        'calc_tva_ht': 'Montant Hors TVA (€)',
        'calc_tva_rate': 'Taux de TVA appliqué',
        'calc_tva_ttc': 'Montant Total TTC (€)',
        'calc_tva_val': 'Valeur de la TVA (€)',
        'calc_tva_standard': 'Standard 17% (Services, biens généraux)',
        'calc_tva_inter': 'Intermédiaire 14% (Garde, certains vins)',
        'calc_tva_reduced': 'Réduit 8% (Chauffage, électricité)',
        'calc_tva_super': 'Super-réduit 3% (Alimentation, livres)',
        'calc_tva_reverse': 'Autoliquidation / Inversion TVA (0% intracommunautaire)',
        'calc_vies_title': 'Vérificateur Format TVA Intracommunautaire',
        'calc_vies_input': 'Numéro TVA (ex: LU12345678, IT01234567890)',
        'calc_vies_btn': 'Valider le Format',
        'search_credentials_placeholder': 'Rechercher un service, identifiant, url...',
        'search_users_placeholder': 'Rechercher un utilisateur, email, rôle...'
    },
    'it': {
        // Navigation & Generale
        'app_title': 'NEW LIFE Sàrl',
        'app_subtitle': 'Gestione Contabile & Finanziaria',
        'nav_dashboard': 'Panoramica',
        'nav_banca': 'Conto Corrente',
        'nav_contabilita': 'Contabilità PCN',
        'nav_ammortamenti': 'Ammortamenti',
        'nav_partecipazioni': 'Partecipazioni',
        'nav_documenti': 'Documenti Società',
        'nav_strumenti': 'Strumenti & Password',
        'nav_section_modules': 'MODULI',
        'nav_section_tools': 'GESTIONE',
        'nav_refresh_data': 'Aggiorna Dati',
        'last_update': 'Ultimo aggiornamento:',
        'currency_symbol': '€',

        // Dashboard / Panoramica
        'dash_title': 'Cruscotto Finanziario',
        'dash_welcome': 'Sintesi generale dei flussi e della situazione contabile di NEW LIFE Sàrl.',
        'kpi_bank_balance': 'Saldo Bancario Attuale',
        'kpi_total_inflow': 'Totale Entrate (Periodo)',
        'kpi_total_outflow': 'Totale Uscite (Periodo)',
        'kpi_net_result': 'Risultato Operativo Netto',
        'kpi_assets_vnc': 'Valore Netto Cespiti (VNC)',
        'kpi_docs_count': 'Documenti Archiviati',
        'chart_cashflow_title': 'Evoluzione Saldo & Flussi Mensili',
        'chart_expense_distrib': 'Distribuzione dei Costi (Classe PCN)',
        'recent_transactions': 'Ultime Operazioni Bancarie',
        'view_all_transactions': 'Vedi tutte le operazioni',
        'quick_actions': 'Azioni Rapide',
        'btn_new_doc': 'Nuovo Documento',
        'btn_add_asset': 'Simula Ammortamento',
        'btn_export_bilan': 'Esporta Bilancio',

        // Compte Courant / Banca
        'banca_title': 'Libro Mastro di Tesoreria & Conto Corrente',
        'banca_desc': 'Monitoraggio cronologico e analitico dei movimenti bancari.',
        'filter_year': 'Anno',
        'filter_month': 'Mese',
        'filter_all_years': 'Tutti gli anni',
        'filter_all_months': 'Tutti i mesi',
        'filter_type': 'Tipo di flusso',
        'filter_all_types': 'Tutti i tipi',
        'filter_entrees': 'Solo Entrate',
        'filter_sorties': 'Solo Uscite',
        'filter_hide_storni': 'Nascondi storni tecnici',
        'btn_restore_deleted': 'Ripristina operazioni eliminate',
        'confirm_delete_op': 'Sei sicuro di voler eliminare questa operazione bancaria ?',
        'filter_search_placeholder': 'Cerca fornitore, descrizione, n° fattura...',
        'btn_export_excel': 'Esporta Excel',
        'btn_export_pdf': 'Esporta PDF',
        'btn_reset_filters': 'Reimposta',
        'filter_compte': 'Conto bancario',
        'filter_all_comptes': 'Tutti i conti',
        'compte_post': 'Conto POST (Attivo)',
        'compte_banque': 'Conto ING / BANQUE (Chiuso)',
        'compte_caisse': 'Cassa contanti',
        'th_compte': 'Conto',
        'stat_total_in': 'Totale Entrate',
        'stat_total_out': 'Totale Uscite',
        'stat_net_flow': 'Flusso Netto',
        'stat_final_balance': 'Saldo Ricostituito',
        
        // Tabelle
        'th_code_op': 'Cod. Op.',
        'th_date': 'Data',
        'th_valeur': 'Valuta',
        'th_e_s': 'Direzione',
        'th_description': 'Descrizione / Causale',
        'th_fournisseur': 'Fornitore / Terzi',
        'th_macro': 'Macro Categoria',
        'th_class': 'Classe PCN',
        'th_montant': 'Importo Imponibile',
        'th_tva': 'IVA / TVA',
        'th_total': 'Totale Lordo',
        'th_solde': 'Saldo Progressivo',
        'th_actions': 'Azioni',

        // Contabilità
        'contab_title': 'Contabilità Generale & Bilancio PCN',
        'contab_desc': 'Piano Contabile Normalizzato lussemburghese, Stato Patrimoniale, Conto Economico, Giornale Movimenti e Mastrini.',
        'tab_pnl': 'Perdite e Profitti (P&L)',
        'tab_bilan': 'Stato Patrimoniale (Bilan)',
        'tab_journal': 'Giornale Movimenti',
        'tab_mastrini': 'Mastrini',
        'tab_ledger': 'Bilancio di Verifica PCN',
        'bilan_actif_title': 'ATTIVO DELLO STATO PATRIMONIALE',
        'bilan_passif_title': 'PASSIVO DELLO STATO PATRIMONIALE',
        'pnl_charges_title': 'COSTI D’ESERCIZIO & ONERI FINANZIARI',
        'pnl_produits_title': 'RICAVI D’ESERCIZIO & PROVENTI FINANZIARI',
        'total_actif': 'TOTALE ATTIVO:',
        'total_passif': 'TOTALE PASSIVO:',
        'total_charges': 'TOTALE COSTI:',
        'total_produits': 'TOTALE RICAVI:',
        'net_accounting_result': 'RISULTATO D’ESERCIZIO NETTO:',
        'bilan_status_balanced': '✓ BILANCIO PAREGGIATO (Attivo = Passivo)',
        'bilan_status_in_progress': '📊 ESERCIZIO IN CORSO (PROVVISORIO)',
        'bilan_badge_in_progress': 'IN CORSO / PROVVISORIO',
        'bilan_status_diff': 'Differenza Attivo / Passivo :',
        'bilan_status_filing': 'Stato Deposito RCSL :',
        'bilan_closed_note': 'Esercizi contabili chiusi (fino al 31/12/2025). Depositati al RCSL.',
        'bilan_in_progress_note': 'Esercizio 2026 in corso: situazione contabile al momento (non ancora chiusa/depositata). P&L e risultato visualizzati in tempo reale.',
        'opt_year_2026': '2026 (in corso)',
        'filter_method': 'Metodo di Calcolo',
        'opt_method_caisse': 'Per Cassa (Incassi/Pagamenti effettivi)',
        'opt_method_competence': 'Per Competenza (Esercizio PCN)',
        'col_conto_pcn': 'Nr Conto',
        'col_titolo_conto': 'Titolo del Conto',
        'col_tipo_conto': 'Sezione',
        'col_saldo_prec': 'Saldo Precedente',
        'col_entrate_costi': 'Entrate / Costi',
        'col_uscite_ricavi': 'Uscite / Ricavi',
        'col_nuovo_saldo': 'Nuovo Saldo',
        'group_conti_bilancio': '⚖ 1. CONTI DI BILANCIO (STATO PATRIMONIALE - ACTIF / PASSIF)',
        'group_conti_pnl': '📊 2. CONTI ECONOMICI (PERDITE E PROFITTI - P&L)',
        'btn_espandi_tutti': 'Espandi Tutti',
        'btn_comprimi_tutti': 'Comprimi Tutti',
        'filter_cerca_mastrini': 'Cerca conto per codice o nome...',
        'filter_cerca_journal': 'Cerca fornitore, descrizione, n° fattura...',
        'filter_tutti_conti': 'Tutti i conti PCN',
        'filter_tutte_sezioni': 'Tutte le sezioni',
        'btn_reset_filtri': 'Reset Filtri',
        'class_1': 'Classe 1: Capitale proprio & Fondi',
        'class_2': 'Classe 2: Immobilizzazioni / Cespiti',
        'class_3': 'Classe 3: Rimanenze',
        'class_4': 'Classe 4: Crediti e Debiti',
        'class_5': 'Classe 5: Disponibilità liquide & Banche',
        'class_6': 'Classe 6: Costi d’esercizio',
        'class_7': 'Classe 7: Ricavi d’esercizio',

        // Ammortamenti
        'amort_title': 'Registro & Piani di Ammortamento',
        'amort_desc': 'Gestione cespiti e immobilizzazioni materiali e immateriali.',
        'tab_asset_list': 'Schede Cespiti',
        'tab_amort_totals': 'Quadro Consolidato',
        'tab_amort_simulator': 'Simulatore / Nuovo Bene',
        'amort_consolidated_title': 'Quadro Consolidato degli Ammortamenti',
        'col_acquisitions': 'Acquisti (+)',
        'col_cessions': 'Vendite / Cessioni (-)',
        'col_val_brute_totale': 'Valore Storico / Saldo (€)',
        'asset_software': 'Software Gestionale (Paksi / Pak Man)',
        'asset_vehicle': 'Veicolo Peugeot (Car Avenue)',
        'asset_furniture': 'Arredamento Ufficio (Piave)',
        'th_asset_name': 'Denominazione Bene',
        'th_category': 'Categoria PCN',
        'th_acq_date': 'Data Acq.',
        'th_val_brute': 'Valore Storico',
        'th_duration': 'Durata (Anni)',
        'th_rate': 'Aliquota %',
        'th_annuite': 'Quota Annuale',
        'th_cumul': 'Fondo Amm.to',
        'th_vnc': 'Valore Residuo (VNC)',
        'btn_calc_amort': 'Calcola Piano',
        'form_asset_name': 'Nome del bene',
        'form_category': 'Voce di bilancio (es: 211, 223)',
        'form_acq_val': 'Valore d’acquisto netto (€)',
        'form_acq_date': 'Data di entrata in funzione',
        'form_years': 'Durata di ammortamento (anni)',
        'form_method': 'Metodo di ammortamento',
        'opt_linear': 'Lineare (Standard)',
        'opt_degressive': 'Decrescente',

        // Documenti
        'docs_title': 'Documenti Societari & Registri',
        'docs_desc': 'Archivio centrale di atti, statuti, bilanci depositati RCSL e dichiarazioni.',
        'doc_drag_hint': 'Trascina e rilascia per riordinare',
        'btn_upload_doc': 'Carica Documento',
        'btn_restore_default_docs': 'Ripristina Predefiniti',
        'doc_category_all': 'Tutte le categorie',
        'doc_cat_bilan': 'Bilanci & Rendiconti Depositati',
        'doc_cat_juridique': 'Atti & Statuti Societari',
        'doc_cat_registres': 'Certificati RCS / RBE',
        'doc_cat_fiscal': 'Fisco & Dichiarazioni',
        'doc_cat_contrats': 'Contratti & Fatture Chiave',
        'doc_action_view': 'Visualizza',
        'doc_action_download': 'Scarica',
        'doc_action_rename': 'Modifica nome / dati',
        'doc_action_delete': 'Elimina',
        'modal_view_title': 'Anteprima Documento PDF',
        'modal_edit_title': 'Modifica informazioni documento',
        'modal_upload_title': 'Aggiungi nuovo documento',
        'lbl_doc_title': 'Titolo documento',
        'lbl_doc_category': 'Categoria',
        'lbl_doc_date': 'Data di riferimento / Deposito',
        'lbl_doc_file': 'File (PDF, Docx, Immagine)',
        'btn_save': 'Salva',
        'btn_cancel': 'Annulla',
        'confirm_delete_doc': 'Sei sicuro di voler eliminare questo documento ?',

        // Partecipazioni (Classe PCN 23)
        'part_title': 'Portafoglio Partecipazioni & Società Collegate',
        'part_desc': 'Gestione delle immobilizzazioni finanziarie (Classe PCN 23), archivio atti notarili, statuti, visure e bilanci collegati.',
        'kpi_part_total_vnc': 'Valore Netto a Bilancio (PCN 23)',
        'kpi_part_active_count': 'Partecipazioni Detenute',
        'kpi_part_total_invested': 'Totale Investito Storico',
        'kpi_part_total_divested': 'Cessioni & Plusvalenze Realizzate',
        'kpi_part_docs_count': 'Documenti Giuridici Collegati',
        'kpi_part_creances': 'Crediti & Finanziamenti (Conto 234)',
        'tab_part_cards': 'Vista Portafoglio & Schede',
        'tab_part_table': 'Tabella Contabile PCN 23',
        'tab_part_docs': 'Archivio Atti & Documenti',
        'tab_part_history': 'Giornale dei Movimenti PCN 23',
        'filter_part_all': 'Tutte le partecipazioni',
        'filter_part_status_all': 'Tutti gli stati',
        'filter_part_status_active': 'Solo attive',
        'filter_part_status_partial': 'Cessioni parziali',
        'btn_new_participation': 'Nuova Partecipazione',
        'btn_attach_doc': 'Collega Documento',
        'th_part_entity': 'Società / Entità',
        'th_part_country': 'Paese / Giurisdizione',
        'th_part_pcn': 'Codice PCN',
        'th_part_status': 'Stato',
        'th_part_date_entry': 'Data Ingresso',
        'th_part_initial_val': 'Valore Iniziale',
        'th_part_divested_val': 'Cessioni / Rimborsi',
        'th_part_vnc': 'Valore Netto (VNC)',
        'th_part_pct': 'Quota (%)',
        'th_part_docs': 'Doc Collegati',
        'th_part_actions': 'Azioni',
        'part_card_vnc_label': 'Valore Bilancio',
        'part_card_invested_label': 'Investimento Iniziale',
        'part_card_divested_label': 'Cessioni / Rimborsi',
        'part_card_pct_label': 'Quota Detenuta',
        'part_card_sector_label': 'Settore',
        'part_card_rcs_label': 'Iscrizione / P.IVA / RCS',
        'part_card_headquarters_label': 'Sede Legale',
        'part_card_rep_label': 'Amministratore / Legale Rappr.',
        'part_card_docs_vault': 'Atti & Documenti Collegati',
        'part_btn_view_pdf': 'Anteprima',
        'part_btn_download': 'Scarica',
        'part_btn_add_doc': 'Aggiungi Doc',
        'part_btn_edit': 'Modifica',
        'part_btn_delete': 'Elimina',
        'part_doc_cat_acte': 'Atto di Acquisizione / Cessione',
        'part_doc_cat_statuts': 'Statuto & Modifiche Statutarie',
        'part_doc_cat_visura': 'Visura Camerale / Certificato RCS',
        'part_doc_cat_bilan': 'Bilancio & P&L Società Partecipata',
        'part_doc_cat_pacte': 'Patti Parasociali & Contratti',
        'part_doc_cat_financement': 'Finanziamento Soci & Conto Corrente',
        'part_doc_cat_quittance': 'Quietanza di Pagamento / Bonifico',
        'modal_add_part_title': 'Aggiungi Nuova Partecipazione',
        'modal_edit_part_title': 'Modifica Dettagli Partecipazione',
        'modal_add_doc_title': 'Collega Documento a Partecipazione',
        'lbl_part_name': 'Nome Società / Entità',
        'lbl_part_country': 'Paese / Giurisdizione',
        'lbl_part_pcn': 'Conto PCN (es: 233, 2330, 234)',
        'lbl_part_sector': 'Settore d\'attività',
        'lbl_part_rcs': 'Numero Registro / P.IVA / C.F.',
        'lbl_part_headquarters': 'Sede Legale',
        'lbl_part_rep': 'Amministratore / Rappresentante',
        'lbl_part_date': 'Data di Acquisizione / Ingresso',
        'lbl_part_initial_val': 'Importo Iniziale Investito (€)',
        'lbl_part_divested_val': 'Importo Ceduto / Rimborsato (€)',
        'lbl_part_vnc': 'Valore Netto Attuale a Bilancio (€)',
        'lbl_part_pct': 'Percentuale di Partecipazione (%)',
        'lbl_part_status': 'Stato (Attiva, Ceduta...)',
        'lbl_part_notes': 'Note & Note informative',
        'lbl_doc_part_select': 'Partecipazione collegata',
        'chart_part_distrib_title': 'Distribuzione del Valore Netto per Entità',
        'chart_part_geo_title': 'Esposizione Geografica Partecipazioni',
        'confirm_delete_part': 'Sei sicuro di voler eliminare questa partecipazione ?',
        'empty_part_msg': 'Nessuna partecipazione trovata per questi criteri.',
        'empty_docs_msg': 'Nessun documento collegato trovato.',

        // Strumenti & Gestione Password / Utenti
        'tools_title': 'Strumenti, Gestione Utenti & Password',
        'tools_desc': 'Cassaforte credenziali aziendali, gestione accessi utenti, generatore di chiavi sicure e utility finanziarie.',
        'tab_vault': 'Cassaforte Password',
        'tab_users': 'Gestione Utenti & Ruoli',
        'tab_generator': 'Generatore Sicuro',
        'tab_calc': 'Utility & Calcolatore IVA Lux',
        'kpi_total_vault': 'Credenziali & Account Salvati',
        'kpi_active_users': 'Utenti Attivi',
        'kpi_strong_pwd': 'Password Sicure',
        'kpi_last_backup': 'Stato Backup',
        'btn_new_credential': 'Nuova Credenziale',
        'btn_new_user': 'Nuovo Utente',
        'btn_export_vault': 'Esporta Backup (JSON)',
        'btn_import_vault': 'Importa Backup',
        'btn_quick_gen': 'Genera Password',
        'vault_filter_all': 'Tutte le categorie',
        'vault_cat_banking': 'Banche & Portali Finanziari',
        'vault_cat_gov': 'Amministrazione & Fisco (RCSL, TVA, ACD)',
        'vault_cat_corp': 'Azienda & Domini',
        'vault_cat_email': 'Email & Cloud',
        'vault_cat_supplier': 'Fornitori & Utenze',
        'vault_cat_other': 'Altri Accessi',
        'lbl_service_name': 'Nome del Servizio / Portale',
        'lbl_vault_category': 'Categoria',
        'lbl_vault_url': 'Indirizzo Web (URL)',
        'lbl_vault_username': 'Username / Email / Codice Utente',
        'lbl_vault_password': 'Password',
        'lbl_vault_pin': 'Codice PIN / 2FA / Info Aggiuntiva',
        'lbl_vault_notes': 'Note & Istruzioni di Accesso',
        'lbl_user_fullname': 'Nome & Cognome',
        'lbl_user_email': 'Indirizzo Email',
        'lbl_user_role': 'Ruolo / Funzione',
        'lbl_user_status': 'Stato',
        'lbl_user_modules': 'Moduli Autorizzati',
        'role_admin': 'Amministratore / Gérant',
        'role_accountant': 'Commercialista / Fiduciaria',
        'role_viewer': 'Sola Lettura / Visura',
        'role_collab': 'Collaboratore',
        'status_active': 'Attivo',
        'status_inactive': 'Inattivo',
        'modal_new_credential_title': 'Aggiungi Credenziale alla Cassaforte',
        'modal_edit_credential_title': 'Modifica Credenziale',
        'modal_new_user_title': 'Aggiungi Nuovo Utente',
        'modal_edit_user_title': 'Modifica Utente',
        'modal_import_title': 'Importa Backup Cassaforte',
        'toast_copied': 'Copiato negli appunti !',
        'toast_saved': 'Salvato con successo !',
        'toast_deleted': 'Eliminato con successo !',
        'toast_data_refreshed': 'Dati e sincronizzazione aggiornati con successo!',
        'confirm_delete_credential': 'Sei sicuro di voler eliminare questa credenziale ?',
        'confirm_delete_user': 'Sei sicuro di voler eliminare questo utente ?',
        'gen_length': 'Lunghezza password :',
        'gen_uppercase': 'Lettere Maiuscole (A-Z)',
        'gen_lowercase': 'Lettere Minuscole (a-z)',
        'gen_numbers': 'Numeri (0-9)',
        'gen_symbols': 'Simboli Speciali (!@#$%^&*)',
        'gen_btn_generate': 'Genera nuova password',
        'gen_btn_copy': 'Copia Password',
        'gen_strength_weak': 'Debole',
        'gen_strength_medium': 'Media',
        'gen_strength_strong': 'Molto Robusta',
        'calc_tva_title': 'Calcolatore IVA / TVA Lussemburgo',
        'calc_tva_ht': 'Importo Imponibile Netto (€)',
        'calc_tva_rate': 'Aliquota IVA applicata',
        'calc_tva_ttc': 'Importo Totale Lordo (€)',
        'calc_tva_val': 'Valore IVA (€)',
        'calc_tva_standard': 'Ordinaria 17% (Servizi, beni generali)',
        'calc_tva_inter': 'Intermedia 14% (Custodia, alcuni vini)',
        'calc_tva_reduced': 'Ridotta 8% (Riscaldamento, elettricità)',
        'calc_tva_super': 'Super-ridotta 3% (Alimentari, libri)',
        'calc_tva_reverse': 'Reverse Charge / Inversione Contabile (0% intra-UE)',
        'calc_vies_title': 'Verificatore Formato Partita IVA Intra-UE',
        'calc_vies_input': 'Partita IVA (es: LU12345678, IT01234567890)',
        'calc_vies_btn': 'Verifica Formato',
        'search_credentials_placeholder': 'Cerca servizio, username, url...',
        'search_users_placeholder': 'Cerca utente, email, ruolo...'
    },
    'en': {
        // Navigation & General
        'app_title': 'NEW LIFE Sàrl',
        'app_subtitle': 'Accounting & Financial Management',
        'nav_dashboard': 'Overview',
        'nav_banca': 'Bank Account',
        'nav_contabilita': 'PCN Accounting',
        'nav_ammortamenti': 'Amortizations',
        'nav_partecipazioni': 'Holdings & Shares',
        'nav_documenti': 'Corporate Documents',
        'nav_strumenti': 'Tools & Passwords',
        'nav_section_modules': 'MODULES',
        'nav_section_tools': 'MANAGEMENT',
        'nav_refresh_data': 'Refresh Data',
        'last_update': 'Last updated:',
        'currency_symbol': '€',

        // Dashboard / Overview
        'dash_title': 'Financial Dashboard',
        'dash_welcome': 'General summary of financial flows and accounting status for NEW LIFE Sàrl.',
        'kpi_bank_balance': 'Current Bank Balance',
        'kpi_total_inflow': 'Total Inflows (Period)',
        'kpi_total_outflow': 'Total Outflows (Period)',
        'kpi_net_result': 'Net Operating Result',
        'kpi_assets_vnc': 'Net Fixed Assets (NBV)',
        'kpi_docs_count': 'Archived Documents',
        'chart_cashflow_title': 'Cashflow Evolution & Monthly Flows',
        'chart_expense_distrib': 'Expenses Breakdown (PCN Class)',
        'recent_transactions': 'Recent Bank Transactions',
        'view_all_transactions': 'View all transactions',
        'quick_actions': 'Quick Actions',
        'btn_new_doc': 'New Document',
        'btn_add_asset': 'Simulate Depreciation',
        'btn_export_bilan': 'Export Balance Sheet',

        // Compte Courant / Bank
        'banca_title': 'Treasury Ledger & Bank Account',
        'banca_desc': 'Chronological and analytical tracking of bank movements.',
        'filter_year': 'Year',
        'filter_month': 'Month',
        'filter_all_years': 'All years',
        'filter_all_months': 'All months',
        'filter_type': 'Flow type',
        'filter_all_types': 'All types',
        'filter_entrees': 'Inflows only',
        'filter_sorties': 'Outflows only',
        'filter_hide_storni': 'Hide technical storno offsets',
        'btn_restore_deleted': 'Restore deleted transactions',
        'confirm_delete_op': 'Are you sure you want to delete this bank transaction?',
        'filter_search_placeholder': 'Search supplier, description, invoice no...',
        'btn_export_excel': 'Export Excel',
        'btn_export_pdf': 'Export PDF',
        'btn_reset_filters': 'Reset',
        'filter_compte': 'Bank Account',
        'filter_all_comptes': 'All accounts',
        'compte_post': 'POST Account (Active)',
        'compte_banque': 'ING / BANQUE Account (Closed)',
        'compte_caisse': 'Petty Cash',
        'th_compte': 'Account',
        'stat_total_in': 'Total Inflows',
        'stat_total_out': 'Total Outflows',
        'stat_net_flow': 'Net Cash Flow',
        'stat_final_balance': 'Reconstituted Balance',
        
        // Tables
        'th_code_op': 'Op. Code',
        'th_date': 'Date',
        'th_valeur': 'Value Date',
        'th_e_s': 'Type',
        'th_description': 'Description',
        'th_fournisseur': 'Supplier / Third Party',
        'th_macro': 'Macro Category',
        'th_class': 'PCN Class',
        'th_montant': 'Net Amount',
        'th_tva': 'VAT',
        'th_total': 'Gross Total',
        'th_solde': 'Running Balance',
        'th_actions': 'Actions',

        // Accounting
        'contab_title': 'General Accounting & PCN Balance Sheet',
        'contab_desc': 'Luxembourg Standard Chart of Accounts (PCN), Balance Sheet, P&L, General Journal and Ledgers.',
        'tab_pnl': 'Profit & Loss (P&L)',
        'tab_bilan': 'Balance Sheet (Bilan)',
        'tab_journal': 'General Journal',
        'tab_mastrini': 'Ledgers (T-Accounts)',
        'tab_ledger': 'Trial Balance (PCN)',
        'bilan_actif_title': 'BALANCE SHEET ASSETS',
        'bilan_passif_title': 'BALANCE SHEET LIABILITIES & EQUITY',
        'pnl_charges_title': 'OPERATING & FINANCIAL EXPENSES',
        'pnl_produits_title': 'OPERATING & FINANCIAL INCOME',
        'total_actif': 'TOTAL ASSETS:',
        'total_passif': 'TOTAL LIABILITIES & EQUITY:',
        'total_charges': 'TOTAL EXPENSES:',
        'total_produits': 'TOTAL INCOME:',
        'net_accounting_result': 'NET ACCOUNTING RESULT:',
        'bilan_status_balanced': '✓ BALANCED BALANCE SHEET (Assets = Liabilities)',
        'bilan_status_in_progress': '📊 EXERCISE IN PROGRESS (PROVISIONAL)',
        'bilan_badge_in_progress': 'IN PROGRESS / PROVISIONAL',
        'bilan_status_diff': 'Assets / Liabilities Difference:',
        'bilan_status_filing': 'RCSL Filing Status:',
        'bilan_closed_note': 'Closed financial years only (up to end of 2025). Deposited at RCSL.',
        'bilan_in_progress_note': 'Exercise 2026 in progress: live accounting situation (not yet closed/filed). Real-time P&L and result.',
        'opt_year_2026': '2026 (in progress)',
        'filter_method': 'Accounting Method',
        'opt_method_caisse': 'Cash Flow / Cash basis (Per Cassa)',
        'opt_method_competence': 'Accrual basis (PCN Competence)',
        'col_conto_pcn': 'Account No.',
        'col_titolo_conto': 'Account Title',
        'col_tipo_conto': 'Section',
        'col_saldo_prec': 'Opening Balance',
        'col_entrate_costi': 'Inflows / Debit',
        'col_uscite_ricavi': 'Outflows / Credit',
        'col_nuovo_saldo': 'Closing Balance',
        'group_conti_bilancio': '⚖ 1. BALANCE SHEET ACCOUNTS (STATO PATRIMONIALE - ACTIF / PASSIF)',
        'group_conti_pnl': '📊 2. INCOME STATEMENT ACCOUNTS (PERDITE E PROFITTI - P&L)',
        'btn_espandi_tutti': 'Expand All',
        'btn_comprimi_tutti': 'Collapse All',
        'filter_cerca_mastrini': 'Search account by code or name...',
        'filter_cerca_journal': 'Search partner, description, invoice no...',
        'filter_tutti_conti': 'All PCN Accounts',
        'filter_tutte_sezioni': 'All Sections',
        'btn_reset_filtri': 'Reset Filters',
        'class_1': 'Class 1: Equity & Provisions',
        'class_2': 'Class 2: Fixed Assets',
        'class_3': 'Class 3: Inventories',
        'class_4': 'Class 4: Receivables & Payables',
        'class_5': 'Class 5: Cash & Bank',
        'class_6': 'Class 6: Expenses',
        'class_7': 'Class 7: Revenues',

        // Amortizations
        'amort_title': 'Asset Register & Depreciation Schedules',
        'amort_desc': 'Management of tangible and intangible fixed assets.',
        'tab_asset_list': 'Asset Cards',
        'tab_amort_totals': 'Consolidated Schedule',
        'tab_amort_simulator': 'Simulator / New Asset',
        'amort_consolidated_title': 'Consolidated Depreciation Schedule',
        'col_acquisitions': 'Acquisitions (+)',
        'col_cessions': 'Disposals / Sales (-)',
        'col_val_brute_totale': 'Gross Value / Balance (€)',
        'asset_software': 'Office Software (Paksi / Pak Man)',
        'asset_vehicle': 'Peugeot Vehicle (Car Avenue)',
        'asset_furniture': 'Office Fit-out & Furniture (Piave)',
        'th_asset_name': 'Asset Designation',
        'th_category': 'PCN Category',
        'th_acq_date': 'Acq. Date',
        'th_val_brute': 'Initial Value',
        'th_duration': 'Life (Years)',
        'th_rate': 'Rate %',
        'th_annuite': 'Annual Depreciation',
        'th_cumul': 'Accumulated Depr.',
        'th_vnc': 'Net Book Value (NBV)',
        'btn_calc_amort': 'Calculate Schedule',
        'form_asset_name': 'Asset Name',
        'form_category': 'Balance Sheet Account (e.g., 211, 223)',
        'form_acq_val': 'Acquisition Value excl. VAT (€)',
        'form_acq_date': 'In-service Date',
        'form_years': 'Depreciation Period (years)',
        'form_method': 'Depreciation Method',
        'opt_linear': 'Straight-Line (Standard)',
        'opt_degressive': 'Declining-Balance',

        // Documents
        'docs_title': 'Corporate Documents & Registries',
        'docs_desc': 'Central repository for deeds, articles of incorporation, filed RCSL balance sheets.',
        'doc_drag_hint': 'Drag & drop to reorder',
        'btn_upload_doc': 'Upload Document',
        'btn_restore_default_docs': 'Restore Documents',
        'doc_category_all': 'All Categories',
        'doc_cat_bilan': 'Filed Balance Sheets & Reports',
        'doc_cat_juridique': 'Legal Acts & Articles of Assoc.',
        'doc_cat_registres': 'RCS / RBE Certificates',
        'doc_cat_fiscal': 'Tax & Filings',
        'doc_cat_contrats': 'Key Contracts & Invoices',
        'doc_action_view': 'View',
        'doc_action_download': 'Download',
        'doc_action_rename': 'Edit name / metadata',
        'doc_action_delete': 'Delete',
        'modal_view_title': 'PDF Document Preview',
        'modal_edit_title': 'Edit Document Metadata',
        'modal_upload_title': 'Add New Document',
        'lbl_doc_title': 'Document Title',
        'lbl_doc_category': 'Category',
        'lbl_doc_date': 'Reference Date / Filing',
        'lbl_doc_file': 'File (PDF, Docx, Image)',
        'btn_save': 'Save',
        'btn_cancel': 'Cancel',
        'confirm_delete_doc': 'Are you sure you want to delete this document ?',

        // Holdings & Participations (PCN Class 23)
        'part_title': 'Holdings Portfolio & Subsidiaries',
        'part_desc': 'Management of financial fixed assets (PCN Class 23), deeds of purchase, bylaws, company certificates and balance sheets.',
        'kpi_part_total_vnc': 'Net Book Value (PCN 23)',
        'kpi_part_active_count': 'Active Holdings',
        'kpi_part_total_invested': 'Total Historical Invested',
        'kpi_part_total_divested': 'Divestments & Realized Gains',
        'kpi_part_docs_count': 'Linked Corporate Documents',
        'kpi_part_creances': 'Receivables & Advances (Account 234)',
        'tab_part_cards': 'Holdings Cards View',
        'tab_part_table': 'Accounting PCN Table',
        'tab_part_docs': 'Deeds & Documents Archive',
        'tab_part_history': 'PCN Class 23 Transactions Ledger',
        'filter_part_all': 'All holdings',
        'filter_part_status_all': 'All statuses',
        'filter_part_status_active': 'Active only',
        'filter_part_status_partial': 'Partial divestments',
        'btn_new_participation': 'New Holding',
        'btn_attach_doc': 'Attach Document',
        'th_part_entity': 'Company / Entity',
        'th_part_country': 'Country / Jurisdiction',
        'th_part_pcn': 'PCN Code',
        'th_part_status': 'Status',
        'th_part_date_entry': 'Entry Date',
        'th_part_initial_val': 'Initial Cost',
        'th_part_divested_val': 'Divestments / Repayments',
        'th_part_vnc': 'Net Book Value (NBV)',
        'th_part_pct': 'Ownership (%)',
        'th_part_docs': 'Linked Docs',
        'th_part_actions': 'Actions',
        'part_card_vnc_label': 'Book Value',
        'part_card_invested_label': 'Initial Investment',
        'part_card_divested_label': 'Divestments / Withdrawals',
        'part_card_pct_label': 'Ownership Share',
        'part_card_sector_label': 'Industry / Sector',
        'part_card_rcs_label': 'Registration / Tax ID',
        'part_card_headquarters_label': 'Registered Office',
        'part_card_rep_label': 'Director / Legal Rep.',
        'part_card_docs_vault': 'Attached Deeds & Documents',
        'part_btn_view_pdf': 'Preview',
        'part_btn_download': 'Download',
        'part_btn_add_doc': 'Add Doc',
        'part_btn_edit': 'Edit',
        'part_btn_delete': 'Delete',
        'part_doc_cat_acte': 'Deed of Purchase / Sale',
        'part_doc_cat_statuts': 'Articles of Association & Bylaws',
        'part_doc_cat_visura': 'Chamber of Commerce / RCS Extract',
        'part_doc_cat_bilan': 'Subsidiary Balance Sheet & P&L',
        'part_doc_cat_pacte': 'Shareholders\' Agreement & Contracts',
        'part_doc_cat_financement': 'Shareholder Loan & Current Account',
        'part_doc_cat_quittance': 'Proof of Payment / Bank Receipt',
        'modal_add_part_title': 'Add New Holding',
        'modal_edit_part_title': 'Edit Holding Details',
        'modal_add_doc_title': 'Attach Document to Holding',
        'lbl_part_name': 'Company / Entity Name',
        'lbl_part_country': 'Country / Jurisdiction',
        'lbl_part_pcn': 'PCN Account (e.g. 233, 2330, 234)',
        'lbl_part_sector': 'Business Sector',
        'lbl_part_rcs': 'Registration No. / VAT ID',
        'lbl_part_headquarters': 'Registered Office',
        'lbl_part_rep': 'Director / Representative',
        'lbl_part_date': 'Acquisition / Entry Date',
        'lbl_part_initial_val': 'Initial Invested Amount (€)',
        'lbl_part_divested_val': 'Divested / Repaid Amount (€)',
        'lbl_part_vnc': 'Current Net Book Value (€)',
        'lbl_part_pct': 'Ownership Percentage (%)',
        'lbl_part_status': 'Status (Active, Sold...)',
        'lbl_part_notes': 'Notes & Overview',
        'lbl_doc_part_select': 'Linked Holding',
        'chart_part_distrib_title': 'Net Value Allocation by Entity',
        'chart_part_geo_title': 'Geographic Exposure of Holdings',
        'confirm_delete_part': 'Are you sure you want to delete this holding ?',
        'empty_part_msg': 'No holdings found for this selection.',
        'empty_docs_msg': 'No linked documents found.',

        // Tools & Password / User Management
        'tools_title': 'Tools, User Management & Passwords',
        'tools_desc': 'Corporate credential vault, user access management, secure password generator, and financial utilities.',
        'tab_vault': 'Password Vault',
        'tab_users': 'Users & Role Access',
        'tab_generator': 'Secure Generator',
        'tab_calc': 'Utilities & Lux VAT',
        'kpi_total_vault': 'Saved Accounts & Credentials',
        'kpi_active_users': 'Active Users',
        'kpi_strong_pwd': 'Strong Passwords',
        'kpi_last_backup': 'Backup Status',
        'btn_new_credential': 'New Credential',
        'btn_new_user': 'New User',
        'btn_export_vault': 'Export Backup (JSON)',
        'btn_import_vault': 'Import Backup',
        'btn_quick_gen': 'Generate Password',
        'vault_filter_all': 'All categories',
        'vault_cat_banking': 'Banking & Financial Portals',
        'vault_cat_gov': 'Government & Tax (RCSL, VAT, ACD)',
        'vault_cat_corp': 'Company & Domains',
        'vault_cat_email': 'Email & Cloud',
        'vault_cat_supplier': 'Suppliers & Utilities',
        'vault_cat_other': 'Other Access',
        'lbl_service_name': 'Service / Portal Name',
        'lbl_vault_category': 'Category',
        'lbl_vault_url': 'Website URL',
        'lbl_vault_username': 'Username / Email / Login ID',
        'lbl_vault_password': 'Password',
        'lbl_vault_pin': 'PIN / 2FA / Extra Security Info',
        'lbl_vault_notes': 'Notes & Access Instructions',
        'lbl_user_fullname': 'Full Name',
        'lbl_user_email': 'Email Address',
        'lbl_user_role': 'Role / Title',
        'lbl_user_status': 'Status',
        'lbl_user_modules': 'Authorized Modules',
        'role_admin': 'Administrator / Manager',
        'role_accountant': 'Accountant / Fiduciary',
        'role_viewer': 'Read Only Viewer',
        'role_collab': 'Staff / Collaborator',
        'status_active': 'Active',
        'status_inactive': 'Inactive',
        'modal_new_credential_title': 'Add Credential to Vault',
        'modal_edit_credential_title': 'Edit Credential',
        'modal_new_user_title': 'Add New User',
        'modal_edit_user_title': 'Edit User',
        'modal_import_title': 'Import Vault Backup',
        'toast_copied': 'Copied to clipboard!',
        'toast_saved': 'Saved successfully!',
        'toast_deleted': 'Deleted successfully!',
        'toast_data_refreshed': 'Data and synchronization refreshed successfully!',
        'confirm_delete_credential': 'Are you sure you want to delete this credential?',
        'confirm_delete_user': 'Are you sure you want to delete this user?',
        'gen_length': 'Password Length:',
        'gen_uppercase': 'Uppercase (A-Z)',
        'gen_lowercase': 'Lowercase (a-z)',
        'gen_numbers': 'Numbers (0-9)',
        'gen_symbols': 'Symbols (!@#$%^&*)',
        'gen_btn_generate': 'Generate New Password',
        'gen_btn_copy': 'Copy Password',
        'gen_strength_weak': 'Weak',
        'gen_strength_medium': 'Medium',
        'gen_strength_strong': 'Very Strong',
        'calc_tva_title': 'Luxembourg VAT Calculator',
        'calc_tva_ht': 'Net Amount excl. VAT (€)',
        'calc_tva_rate': 'Applicable VAT Rate',
        'calc_tva_ttc': 'Total Amount incl. VAT (€)',
        'calc_tva_val': 'VAT Value (€)',
        'calc_tva_standard': 'Standard 17% (Services, general goods)',
        'calc_tva_inter': 'Intermediate 14% (Custody, specific wines)',
        'calc_tva_reduced': 'Reduced 8% (Heating, electricity)',
        'calc_tva_super': 'Super-reduced 3% (Food, books)',
        'calc_tva_reverse': 'Reverse Charge (0% intra-EU)',
        'calc_vies_title': 'Intra-EU VAT Number Format Checker',
        'calc_vies_input': 'VAT Number (e.g. LU12345678, IT01234567890)',
        'calc_vies_btn': 'Validate Format',
        'search_credentials_placeholder': 'Search service, username, url...',
        'search_users_placeholder': 'Search user, email, role...'
    }
};

let currentLang = localStorage.getItem('new_life_lang') || 'fr';

function t(key) {
    if (translations[currentLang] && translations[currentLang][key]) {
        return translations[currentLang][key];
    }
    if (translations['fr'] && translations['fr'][key]) {
        return translations['fr'][key];
    }
    return key;
}

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('new_life_lang', lang);
    applyTranslations();
    updateFlagsUI();
    if (typeof window.onLanguageChange === 'function') {
        window.onLanguageChange(lang);
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[currentLang][key];
            } else {
                el.textContent = translations[currentLang][key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.title = translations[currentLang][key];
        }
    });
}

function updateFlagsUI() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Theme handling
function initTheme() {
    const savedTheme = localStorage.getItem('new_life_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('theme-light');
    localStorage.setItem('new_life_theme', isLight ? 'light' : 'dark');
}

function getAppLastUpdate() {
    return localStorage.getItem('new_life_last_sync') || 
           (window.NEW_LIFE_DATA && window.NEW_LIFE_DATA.company && window.NEW_LIFE_DATA.company.updated_at) || 
           '2026-09-28 07:38:17';
}

function updateSidebarTimestamp() {
    const updatedEl = document.getElementById('sidebar-updated-at');
    if (updatedEl) {
        updatedEl.textContent = getAppLastUpdate();
    }
}

function showGlobalToast(msg, iconClass = 'fa-circle-check') {
    let toast = document.getElementById('toast-notify');
    let text = document.getElementById('toast-text');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notify';
        toast.className = 'toast-toast';
        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span id="toast-text">${msg}</span>`;
        document.body.appendChild(toast);
    } else {
        const iconEl = toast.querySelector('i');
        if (iconEl) {
            iconEl.className = `fa-solid ${iconClass}`;
        }
        if (text) {
            text.innerText = msg;
        } else {
            toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span id="toast-text">${msg}</span>`;
        }
    }

    toast.classList.add('show');
    clearTimeout(window.globalToastTimeout);
    window.globalToastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

function refreshAppGlobalData(btn) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    localStorage.setItem('new_life_last_sync', formatted);
    sessionStorage.setItem('new_life_just_refreshed', 'true');
    
    const updatedEl = document.getElementById('sidebar-updated-at');
    if (updatedEl) {
        updatedEl.textContent = formatted;
        updatedEl.classList.add('updated-flash');
    }
    
    const icon = btn ? btn.querySelector('i') : document.querySelector('.btn-sidebar-action i');
    if (icon) {
        icon.classList.add('fa-spin');
    }
    
    const msg = (translations[currentLang] && translations[currentLang]['toast_data_refreshed']) || 'Dati e sincronizzazione aggiornati con successo!';
    showGlobalToast(msg, 'fa-rotate');
    
    // If running with local python server, trigger Excel re-extraction
    if (window.location.protocol.startsWith('http')) {
        fetch('/api/sync-excel', { method: 'POST' })
            .catch(() => {})
            .finally(() => {
                setTimeout(() => {
                    window.location.reload();
                }, 600);
            });
    } else {
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    applyTranslations();
    updateFlagsUI();
    updateSidebarTimestamp();

    // Check if just refreshed
    if (sessionStorage.getItem('new_life_just_refreshed') === 'true') {
        sessionStorage.removeItem('new_life_just_refreshed');
        const updatedEl = document.getElementById('sidebar-updated-at');
        if (updatedEl) {
            updatedEl.classList.add('updated-flash');
            setTimeout(() => {
                if (updatedEl) updatedEl.classList.remove('updated-flash');
            }, 2500);
        }
        const msg = (translations[currentLang] && translations[currentLang]['toast_data_refreshed']) || 'Dati e sincronizzazione aggiornati con successo!';
        setTimeout(() => {
            showGlobalToast(msg, 'fa-circle-check');
        }, 150);
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.getAttribute('data-lang'));
        });
    });

    const themeToggle = document.getElementById('theme-toggle-btn');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});
