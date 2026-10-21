import json
import re

# Let's verify:
# Diff = NetResult_2026 - (Delta_Bank + Delta_VNC)
# Let's see:
# Delta_Bank = 2038.12
# Delta_VNC = 20583.75
# NetResult_2026 = 31328.91
# Diff = 31328.91 - (2038.12 + 20583.75) = 8707.04 (due to rounding cents 8707.08)

# Now what happened to cash vs PnL in 2026?
# In 2026, cash inflows and outflows were:
# 1) Operating P&L cash (HT):
#    Sales HT: +90085.44
#    Charges HT (hors amort): -45413.05
#    P&L cash generated = +44672.39
#    (Note: NetResult = 44672.39 - 13343.48 amort = 31328.91)
#
# 2) TVA movements (cash moved via bank, but not in PnL, belongs to Actif 42 / Passif 46):
#    TVA collected on sales: +15314.56
#    TVA on operational expenses: -1603.17
#    TVA on Tiguan investment: -5767.63
#    Net TVA from 2026 operations: +7943.76
#
# 3) Balance Sheet payments made in 2026 that reduced Bank but were NOT in PnL and NOT updated in Bilan:
#    - Tiguan purchase HT (Asset 22): -33927.23
#      (Note: in Bilan, VNC increased by 33927.23 - 13343.48 dotation = 20583.75)
#    - Payment of VAT debt from previous year (TVA DUE paid on 19/03/2026): -8320.00
#    - Investment in Participation SEF Srl (Asset 23, on 07/09/2026): -4000.00
#    - Acconti Dividendi paid to shareholders (on 01/06/2026): -5100.00
#    - Taxes on salaries / ACD movements recorded on 461 / 67:
#      Impots salaires paid/refunded: +769.15

print("Algebraic proof:")
pnl_net_result = 31328.91
dotation = 13343.48
tiguan_ht = 33927.23
delta_vnc = tiguan_ht - dotation # 20583.75

# Diff = pnl_net_result - delta_vnc - delta_bank
# We know: delta_bank = (pnl_net_result + dotation) + Net_TVA - tiguan_ht - 5767.63 - 8320 - 4000 - 5100 + 769.15
# Therefore:
# delta_bank + delta_vnc = pnl_net_result + Net_TVA - 5767.63 - 8320 - 4000 - 5100 + 769.15
# So:
# Diff = pnl_net_result - (delta_bank + delta_vnc)
# Diff = - (Net_TVA - 5767.63 - 8320 - 4000 - 5100 + 769.15)
# Let's compute that!
unrecorded_balance_sheet_movements = (
    8320.00    # TVA debito 2025 pagata a marzo 2026 (ha ridotto la banca di 8.320 € ma il debito 46 a bilancio è rimasto a 13.018 €)
    + 4000.00  # Saldo acquisto partecipazione SEF Srl (ha ridotto la banca di 4.000 € ma la voce 23 è rimasta a 234.221 €)
    + 5100.00  # Acconto dividendi prelevato (ha ridotto la banca di 5.100 € ma non è stato dedotto dal patrimonio netto)
    - 7943.76  # IVA netta incassata nel 2026 (ha aumentato la banca ma non è stata iscritta come debito IVA 461)
    - 769.15   # Ritenute d'imposta su salari regolate (461)
)
print("Unrecorded net movements sum:", unrecorded_balance_sheet_movements)
