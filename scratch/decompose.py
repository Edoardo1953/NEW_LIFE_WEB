import json
import re

with open('data.js', 'r', encoding='utf-8') as f:
    data = json.loads(re.search(r'window\.NEW_LIFE_DATA\s*=\s*(\{.*\});?\s*$', f.read(), re.DOTALL).group(1))

with open('ammortamenti_data.js', 'r', encoding='utf-8') as f:
    amort = json.loads(re.search(r'window\.NEW_LIFE_AMORT\s*=\s*(\{.*\});?\s*$', f.read(), re.DOTALL).group(1))

recs_2026 = [r for r in data['records'] if r.get('an') == 2026 and not r.get('is_transfert') and not r.get('is_storno')]

# Bank change in 2026
bank_start = 9988.41
bank_end = 12026.53
delta_bank = bank_end - bank_start # 2038.12

# VNC change in 2026
vnc_start = 13515.06
vnc_end = 34098.81
delta_vnc = vnc_end - vnc_start # 20583.75

# In contabilita_app.js:
# Total Actif = 289836.51 (267214.68 + delta_bank + delta_vnc)
# Total Passif = 298543.59 (267214.68 + netRes)
# where netRes = 31328.91
# diff = Total Passif - Total Actif = netRes - delta_bank - delta_vnc = 8707.08

print(f"delta_bank: {delta_bank:.2f}")
print(f"delta_vnc: {delta_vnc:.2f}")
print(f"delta_actif: {delta_bank + delta_vnc:.2f}")

# netRes from PnL:
totProd = 90085.44
# totChg includes dotations 13343.48 and cash expenses HT
totChg = 58756.53
dotation = 13343.48
charges_hors_amort = totChg - dotation # 45413.05
netRes = totProd - totChg # 31328.91
print(f"netRes: {netRes:.2f}")
print(f"diff in app: {netRes - (delta_bank + delta_vnc):.2f}")

# Now let's decompose delta_bank:
# Cash in = totProd + TVA_collected + any other entries
# Cash out = charges_hors_amort + TVA_expenses + Car_HT + Car_TVA + Dividends + Partic_SEF + TVA_due_paid + other taxes
# Let's verify every single record's cash impact:

tot_cash = sum(float(r.get('total', 0)) for r in recs_2026 if r.get('progressivo_banca') != 0)
print(f"Sum of total (cash movement): {tot_cash:.2f}")

# Let's categorize every 2026 cash movement:
cat_cash = {}
for r in recs_2026:
    if r.get('progressivo_banca') == 0:
        continue
    macro = r.get('macro') or 'OTHER'
    t = float(r.get('total', 0))
    cat_cash[macro] = cat_cash.get(macro, 0) + t

print("\n--- Cash movement by category ---")
for k, v in sorted(cat_cash.items(), key=lambda x: x[1]):
    print(f"  {k}: {v:10.2f}")

# Let's inspect:
# 1. Car acquisition (22): -39694.86 (-33927.23 HT + -5767.63 TVA)
# 2. SEF participation (23): -4000.00
# 3. Dividends (Acomptes sur dividendes): -5100.00
# 4. TVA due 2025 paid (461): -8320.00
# 5. Salary taxes (461): +769.15 (Wait! 68.30 + 419.65 + 281.20 = 769.15!)
# 6. PnL HT net cash: totProd (90085.44) - charges_hors_amort (45413.05) = 44672.39
# 7. Operating TVA: TVA sales (15314.56) + TVA charges (-1603.17) = +13711.39
