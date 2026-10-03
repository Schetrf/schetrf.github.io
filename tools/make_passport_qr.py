#!/usr/bin/env python3
"""Build-time generator for the DEMO passport QR code (cabinet-assets/passport-qr.svg).

All data is invented for the demo cabinet. Requires: pip install segno
Run from repo root: python3 tools/make_passport_qr.py
"""
import json
import segno

DATA = {
    "demo": "ОБРАЗЕЦ / ДЕМО — не является документом",
    "surname": "KARIMOV / КАРИМОВ",
    "given_names": "AZIZBEK RUSTAMOVICH / АЗИЗБЕК РУСТАМОВИЧ",
    "nationality": "Узбекистан (DEMO)",
    "birth_date": "14.03.1994",
    "doc_no": "DEMO 000000",
    "issue_date": "20.05.2021",
    "expiry_date": "19.05.2031",
    "phone": "+7 999 123-45-67",
}

qr = segno.make(json.dumps(DATA, ensure_ascii=False, separators=(",", ":")), error="m")
qr.save("cabinet-assets/passport-qr.svg", scale=4, border=2, dark="#0f172a", light="#ffffff",
        xmldecl=False, svgns=True, title="QR: ДЕМО-данные паспорта (не документ)")
# add a viewBox so the SVG scales with CSS
path = "cabinet-assets/passport-qr.svg"
svg = open(path, encoding="utf-8").read()
if "viewBox" not in svg:
    w = qr.symbol_size(scale=4, border=2)[0]
    svg = svg.replace('<svg ', f'<svg viewBox="0 0 {w} {w}" ', 1)
    open(path, "w", encoding="utf-8").write(svg)
print("version", qr.version, "->", "cabinet-assets/passport-qr.svg")
