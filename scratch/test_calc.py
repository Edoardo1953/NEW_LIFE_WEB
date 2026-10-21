import json
import re

with open('data.js', 'r', encoding='utf-8') as f:
    m = re.search(r'window\.NEW_LIFE_DATA\s*=\s*(\{.*\});?\s*$', f.read(), re.DOTALL)
    data = json.loads(m.group(1))

with open('ammortamenti_data.js', 'r', encoding='utf-8') as f:
    m = re.search(r'window\.NEW_LIFE_AMORT\s*=\s*(\{.*\});?\s*$', f.read(), re.DOTALL)
    amort = json.loads(m.group(1))

records = data.get('records', [])
recs_2026 = [r for r in records if r.get('an') == 2026]

# In contabilita_app.js:
vncTotal = amort['totals_by_year']['2026']['vnc'] # 34098.81
dotationAnnuiteBilan = amort['totals_by_year']['2026']['annuite'] # 13343.48

bankRecs = [r for r in records if (r.get('an') or r.get('compet_contabile')) <= 2026 and (r.get('an') or r.get('compet_contabile')) > 0 and r.get('progressivo_banca') != 0]
bankClosing = bankRecs[-1]['progressivo_banca'] if bankRecs else 18366.89

print('bankClosing:', bankClosing)

participationsVal = 234221.67
vncCorp = (vncTotal - 2572.13) if vncTotal > 2572.13 else vncTotal * 0.8
vncIncorp = vncTotal - vncCorp
creancesVal = 9489.50
dettesVal = 13018.77

# Actif items:
actif_items = [
    ('21 Incorp', vncIncorp),
    ('22 Corp', vncCorp),
    ('23 Partic', participationsVal),
    ('42 Creances', creancesVal),
    ('51 Banque', bankClosing)
]

totalActif = sum(v for _, v in actif_items)
print('totalActif:', totalActif)
for k, v in actif_items:
    print(f'  Actif {k}: {v:.2f}')

capitalVal = 31000.00
reservesVal = 4100.00
reportANouveau = 219095.91

# PnL dynamic
pnlMap = {}
totProd = 0
totChg = 0
for r in recs_2026:
    if r.get('is_transfert') or r.get('is_storno'):
        continue
    macro = r.get('macro', '')
    isProd = macro.startswith('7') or (not macro and r.get('sp_ce') == 'CE' and r.get('e_s') == 'ENTREES')
    isChg = macro.startswith('6') or (not macro and r.get('sp_ce') == 'CE' and r.get('e_s') == 'SORTIES')
    rawMontant = float(r.get('montant') if r.get('montant') is not None else r.get('total', 0))
    if isProd:
        val = rawMontant
        k = macro or "70 - MONTANT NET DU CHIFFRE D AFFAIRES"
        pnlMap[k] = pnlMap.get(k, 0) + val
        totProd += val
    elif isChg:
        val = -rawMontant
        k = macro or "61 - AUTRES CHARGES EXTERNES"
        pnlMap[k] = pnlMap.get(k, 0) + val
        totChg += val

# Amortization 63
dotationAnnuite = amort['totals_by_year']['2026']['annuite']
has63Already = any('63' in k for k in pnlMap.keys())
if dotationAnnuite > 0 and not has63Already:
    pnlMap['63 - DOTATIONS AUX AMORTISSEMENTS'] = dotationAnnuite
    totChg += dotationAnnuite

print('totProd:', totProd)
print('totChg:', totChg)
for k, v in pnlMap.items():
    print(f'  PnL {k}: {v:.2f}')

netRes = totProd - totChg
print('netRes (P&L 2026):', netRes)

passif_items = [
    ('101 Capital', capitalVal),
    ('131 Reserves', reservesVal),
    ('141 Report a nouveau', reportANouveau),
    ('142 Resultat net prov', netRes),
    ('46 Dettes', dettesVal)
]

totalPassif = sum(v for _, v in passif_items)
print('totalPassif:', totalPassif)
for k, v in passif_items:
    print(f'  Passif {k}: {v:.2f}')

diff = totalPassif - totalActif
print(f'DIFFERENZA: {diff:.2f}')
