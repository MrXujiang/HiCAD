import{d as w,x as n,c as A,B as d}from"./index-2YmAdmN3.js";const a=["innerHTML"],v=`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="50,22 78,38 78,66 50,82 22,66 22,38" fill="#334155" opacity="0.8"/>
<polygon points="50,30 70,42 70,62 50,74 30,62 30,42" fill="#475569"/>
<text x="50" y="55" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="monospace">?</text>
</svg>`,E=w({__name:"TemplateThumbnail",props:{templateId:{}},setup(p){const s=p;function h(t,c,r,o,x){const l=Math.PI/x*.45,e=[];for(let y=0;y<x;y++){const i=y/x*2*Math.PI;e.push(`${(t+o*Math.cos(i-l)).toFixed(1)},${(c+o*Math.sin(i-l)).toFixed(1)}`),e.push(`${(t+r*Math.cos(i-l*.45)).toFixed(1)},${(c+r*Math.sin(i-l*.45)).toFixed(1)}`),e.push(`${(t+r*Math.cos(i+l*.45)).toFixed(1)},${(c+r*Math.sin(i+l*.45)).toFixed(1)}`),e.push(`${(t+o*Math.cos(i+l)).toFixed(1)},${(c+o*Math.sin(i+l)).toFixed(1)}`)}return e.join(" ")}const f={"tpl-phone-stand":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="50,76 82,62 82,68 50,82 18,68 18,62" fill="#2B2B38"/>
<polygon points="18,62 50,48 82,62 50,76" fill="#3D3D4D"/>
<polygon points="82,62 82,28 74,32 74,66" fill="#1A1E2E"/>
<polygon points="50,48 82,62 74,66 42,52" fill="#2B2B38"/>
<polygon points="50,48 50,14 42,18 42,52" fill="#22263A"/>
<polygon points="50,14 58,18 50,22 42,18" fill="#3D3D4D"/>
<rect x="38" y="10" width="24" height="5" rx="2" fill="#565171"/>
<ellipse cx="50" cy="61" rx="4" ry="2.5" fill="#060a14"/>
</svg>`,"tpl-storage-box":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="82,68 82,28 74,32 74,72" fill="#1A3E7A"/>
<polygon points="18,72 82,68 74,72 10,76" fill="#1D4E90"/>
<polygon points="18,28 82,28 82,68 18,72" fill="#2666B8"/>
<polygon points="26,32 50,20 74,32 50,44" fill="#3677C9"/>
<rect x="26" y="32" width="48" height="36" rx="2" fill="#0F2E60" opacity="0.7"/>
<ellipse cx="50" cy="44" rx="22" ry="7" fill="#2666B8"/>
<ellipse cx="50" cy="44" rx="18" ry="5" fill="#1A3060"/>
<rect x="66" y="36" width="12" height="28" rx="6" fill="#3677C9" opacity="0.5"/>
</svg>`,"tpl-m3-bracket":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="82,68 82,60 74,64 74,72" fill="#5A5A6A"/>
<polygon points="18,72 82,68 74,72 10,76" fill="#6A6A7A"/>
<polygon points="18,60 82,60 82,68 18,72" fill="#7A7A8A"/>
<circle cx="30" cy="62" r="6" fill="#5A5A6A"/>
<circle cx="30" cy="62" r="4" fill="#6A6A7A"/>
<circle cx="30" cy="62" r="2" fill="#3A3A4A"/>
<circle cx="50" cy="61" r="6" fill="#5A5A6A"/>
<circle cx="50" cy="61" r="4" fill="#6A6A7A"/>
<circle cx="50" cy="61" r="2" fill="#3A3A4A"/>
<circle cx="70" cy="62" r="6" fill="#5A5A6A"/>
<circle cx="70" cy="62" r="4" fill="#6A6A7A"/>
<circle cx="70" cy="62" r="2" fill="#3A3A4A"/>
</svg>`,"tpl-cable-clip":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="82,72 82,40 74,44 74,76" fill="#1A4A90"/>
<polygon points="18,76 82,72 74,76 10,80" fill="#1D58A8"/>
<polygon points="18,40 82,40 82,72 18,76" fill="#2E85EB"/>
<ellipse cx="29" cy="58" rx="7" ry="7" fill="#1A3E7A"/>
<ellipse cx="29" cy="58" rx="5" ry="5" fill="#2E85EB"/>
<ellipse cx="29" cy="52" rx="5" ry="5" fill="#080c18"/>
<ellipse cx="50" cy="57" rx="7" ry="7" fill="#1A3E7A"/>
<ellipse cx="50" cy="57" rx="5" ry="5" fill="#2E85EB"/>
<ellipse cx="50" cy="51" rx="5" ry="5" fill="#080c18"/>
<ellipse cx="71" cy="58" rx="7" ry="7" fill="#1A3E7A"/>
<ellipse cx="71" cy="58" rx="5" ry="5" fill="#2E85EB"/>
<ellipse cx="71" cy="52" rx="5" ry="5" fill="#080c18"/>
</svg>`,"tpl-gear":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="${h(50,50,38,30,20)}" fill="#859099"/>
<circle cx="50" cy="50" r="20" fill="#3E4450"/>
<rect x="48" y="18" width="4" height="24" fill="#6A7480" opacity="0.8"/>
<rect x="18" y="48" width="24" height="4" fill="#6A7480" opacity="0.8"/>
<rect x="58" y="48" width="24" height="4" fill="#6A7480" opacity="0.8"/>
<rect x="48" y="58" width="4" height="24" fill="#6A7480" opacity="0.8"/>
<circle cx="50" cy="50" r="10" fill="#4A5060"/>
<circle cx="50" cy="50" r="5" fill="#080c18"/>
</svg>`,"tpl-lamp-shade":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<ellipse cx="50" cy="80" rx="40" ry="10" fill="#4A4035"/>
<polygon points="10,80 90,80 70,26 30,26" fill="#6A5A42"/>
<polygon points="10,80 90,80 70,26 30,26" fill="url(#lsg)" opacity="0.3"/>
<ellipse cx="50" cy="26" rx="20" ry="5.5" fill="#8A7860"/>
<ellipse cx="50" cy="26" rx="16" ry="4" fill="#4A4035"/>
<ellipse cx="50" cy="80" rx="36" ry="8" fill="#3A3028" opacity="0.6"/>
<ellipse cx="50" cy="80" rx="26" ry="6" fill="#4A4035"/>
<defs><linearGradient id="lsg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="white" stop-opacity="0.3"/><stop offset="0.5" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="black" stop-opacity="0.15"/></linearGradient></defs>
</svg>`,"tpl-hinge":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<rect x="8" y="26" width="34" height="48" rx="3" fill="#7A6640"/>
<rect x="8" y="26" width="34" height="10" rx="3" fill="#A68C61"/>
<circle cx="25" cy="42" r="4" fill="#3A2810"/>
<circle cx="25" cy="42" r="2" fill="#7A6640"/>
<circle cx="25" cy="62" r="4" fill="#3A2810"/>
<circle cx="25" cy="62" r="2" fill="#7A6640"/>
<ellipse cx="50" cy="50" rx="8" ry="24" fill="#C4A878"/>
<ellipse cx="50" cy="50" rx="5" ry="24" fill="#A68C61"/>
<ellipse cx="50" cy="26" rx="8" ry="3" fill="#D4B888"/>
<ellipse cx="50" cy="74" rx="8" ry="3" fill="#8A7248"/>
<rect x="58" y="26" width="34" height="48" rx="3" fill="#7A6640"/>
<rect x="58" y="26" width="34" height="10" rx="3" fill="#A68C61"/>
<circle cx="75" cy="42" r="4" fill="#3A2810"/>
<circle cx="75" cy="42" r="2" fill="#7A6640"/>
<circle cx="75" cy="62" r="4" fill="#3A2810"/>
<circle cx="75" cy="62" r="2" fill="#7A6640"/>
</svg>`,"tpl-planter":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<ellipse cx="50" cy="79" rx="42" ry="10" fill="#8C4525"/>
<polygon points="8,79 92,79 76,44 24,44" fill="#AD5C33"/>
<ellipse cx="50" cy="44" rx="26" ry="6" fill="#C47044"/>
<ellipse cx="50" cy="44" rx="22" ry="5" fill="#6A3018"/>
<ellipse cx="50" cy="79" rx="38" ry="8" fill="#7A3820" opacity="0.6"/>
<circle cx="50" cy="79" r="3" fill="#4A2010"/>
<circle cx="35" cy="80" r="2" fill="#4A2010"/>
<circle cx="65" cy="80" r="2" fill="#4A2010"/>
<ellipse cx="50" cy="44" rx="8" ry="2" fill="#3A1808"/>
</svg>`,"tpl-pen-holder":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<ellipse cx="50" cy="82" rx="28" ry="8" fill="#252538"/>
<rect x="22" y="42" width="56" height="40" fill="#363648"/>
<polygon points="22,82 22,42 26,44 26,80" fill="#1E1E2E"/>
<polygon points="78,82 78,42 74,44 74,80" fill="#1E1E2E"/>
<ellipse cx="50" cy="42" rx="28" ry="8" fill="#484860"/>
<ellipse cx="50" cy="42" rx="22" ry="6" fill="#12121E"/>
</svg>`,"tpl-card-holder":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="82,68 82,36 74,40 74,72" fill="#252525"/>
<polygon points="18,72 82,68 74,72 10,76" fill="#353535"/>
<polygon points="18,36 82,36 82,68 18,72" fill="#454548"/>
<rect x="16" y="28" width="62" height="8" rx="2" fill="#353535" opacity="0.9"/>
<rect x="19" y="24" width="58" height="8" rx="2" fill="#353535" opacity="0.7"/>
<rect x="22" y="20" width="54" height="8" rx="2" fill="#353535" opacity="0.5"/>
<line x1="38" y1="36" x2="78" y2="36" stroke="#6A6A7A" stroke-width="1" opacity="0.4"/>
<circle cx="82" cy="68" r="4" fill="#080c18"/>
</svg>`,"tpl-wrist-rest":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="92,68 92,58 84,62 84,72" fill="#2A2826"/>
<polygon points="8,72 92,68 84,72 0,76" fill="#3A3430"/>
<polygon points="8,58 92,58 92,68 8,72" fill="#4A4440"/>
<rect x="8" y="54" width="84" height="14" rx="12" fill="#4A4440"/>
<rect x="8" y="54" width="84" height="5" rx="5" fill="#5A5450"/>
<line x1="20" y1="60" x2="80" y2="60" stroke="#605C58" stroke-width="1" opacity="0.5"/>
<rect x="36" y="56" width="28" height="2" rx="1" fill="#78716c" opacity="0.4"/>
</svg>`,"tpl-tablet-stand":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="50,84 82,72 82,78 50,90 18,78 18,72" fill="#2B2B38"/>
<polygon points="18,72 50,60 82,72 50,84" fill="#3D3D4D"/>
<polygon points="82,72 82,14 74,18 74,76" fill="#1A1E2E"/>
<polygon points="50,60 82,72 74,76 42,64" fill="#2B2B38"/>
<polygon points="18,72 18,14 26,18 26,76" fill="#22263A"/>
<polygon points="50,60 18,72 26,76 58,64" fill="#22263A"/>
<polygon points="26,18 50,8 74,18 50,28" fill="#3D3D4D"/>
<rect x="38" y="70" width="24" height="6" rx="2" fill="#565171"/>
</svg>`,"tpl-knob":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080808"/>
<ellipse cx="50" cy="76" rx="26" ry="8" fill="#18181B"/>
<rect x="24" y="46" width="52" height="30" fill="#27272A"/>
<ellipse cx="50" cy="46" rx="26" ry="8" fill="#3F3F46"/>
<ellipse cx="50" cy="46" rx="26" ry="8" fill="none" stroke="#71717A" stroke-width="1.5"/>
<ellipse cx="50" cy="59" rx="28" ry="4" fill="none" stroke="#52525B" stroke-width="3.5"/>
<rect x="48" y="30" width="4" height="16" rx="2" fill="#E4E4E7"/>
<circle cx="50" cy="46" r="7" fill="#52525B"/>
<circle cx="50" cy="46" r="3.5" fill="#080808"/>
</svg>`,"tpl-hex-nut":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="50,16 82,34 82,68 50,86 18,68 18,34" fill="#4A5060"/>
<polygon points="50,22 76,37 76,65 50,80 24,65 24,37" fill="#657080"/>
<polygon points="50,28 70,40 70,62 50,74 30,62 30,40" fill="#859099"/>
<circle cx="50" cy="57" r="14" fill="#080c18"/>
<circle cx="50" cy="57" r="12" fill="none" stroke="#4A5060" stroke-width="1"/>
<polygon points="50,16 82,34 76,37 50,22 24,37 18,34" fill="#A0ADB8" opacity="0.15"/>
</svg>`,"tpl-spring-clip":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<path d="M 76,50 A 26,26 0 1 0 31,68" stroke="#2666B8" stroke-width="16" fill="none" stroke-linecap="round"/>
<path d="M 76,50 A 26,26 0 1 0 31,68" stroke="#3D80D8" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.5"/>
<circle cx="76" cy="50" r="9" fill="#1A4A90"/>
<circle cx="31" cy="68" r="9" fill="#1A4A90"/>
<circle cx="76" cy="50" r="4.5" fill="#60A5FA" opacity="0.7"/>
<circle cx="31" cy="68" r="4.5" fill="#60A5FA" opacity="0.7"/>
</svg>`,"tpl-battery-holder":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="88,72 88,36 80,40 80,76" fill="#1E2E20"/>
<polygon points="12,76 88,72 80,76 4,80" fill="#2A3E2C"/>
<polygon points="12,36 88,36 88,72 12,76" fill="#2E4A30"/>
<circle cx="26" cy="55" r="11" fill="#1A2A1C"/>
<circle cx="26" cy="55" r="8" fill="#080c18"/>
<circle cx="26" cy="55" r="4" fill="#2E4A30"/>
<circle cx="47" cy="54" r="11" fill="#1A2A1C"/>
<circle cx="47" cy="54" r="8" fill="#080c18"/>
<circle cx="47" cy="54" r="4" fill="#2E4A30"/>
<circle cx="68" cy="55" r="11" fill="#1A2A1C"/>
<circle cx="68" cy="55" r="8" fill="#080c18"/>
<circle cx="68" cy="55" r="4" fill="#2E4A30"/>
<circle cx="83" cy="52" r="10" fill="#1A2A1C"/>
<circle cx="83" cy="52" r="7" fill="#080c18"/>
<circle cx="83" cy="52" r="3.5" fill="#2E4A30"/>
</svg>`,"tpl-headphone-stand":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080808"/>
<rect x="26" y="84" width="48" height="9" rx="4" fill="#1E1E24"/>
<rect x="26" y="80" width="48" height="5" rx="3" fill="#2E2E33"/>
<rect x="45" y="36" width="10" height="48" rx="5" fill="#3A3A3F"/>
<rect x="20" y="22" width="60" height="8" rx="4" fill="#3A3A3F"/>
<rect x="20" y="22" width="9" height="36" rx="4" fill="#2E2E33"/>
<rect x="71" y="22" width="9" height="36" rx="4" fill="#2E2E33"/>
<ellipse cx="24.5" cy="58" rx="10" ry="10" fill="none" stroke="#52525B" stroke-width="6"/>
<ellipse cx="75.5" cy="58" rx="10" ry="10" fill="none" stroke="#52525B" stroke-width="6"/>
<rect x="20" y="22" width="60" height="4" rx="2" fill="#71717A" opacity="0.4"/>
</svg>`,"tpl-candle-holder":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<ellipse cx="50" cy="86" rx="32" ry="8" fill="#5A1818"/>
<rect x="18" y="78" width="64" height="8" fill="#7F2424"/>
<ellipse cx="50" cy="78" rx="32" ry="8" fill="#991B1B"/>
<rect x="34" y="54" width="32" height="24" fill="#8A2020"/>
<ellipse cx="50" cy="54" rx="16" ry="5" fill="#B91C1C"/>
<ellipse cx="50" cy="40" rx="20" ry="6" fill="#991B1B"/>
<rect x="30" y="34" width="40" height="6" fill="#8A2020"/>
<ellipse cx="50" cy="34" rx="20" ry="6" fill="#B91C1C"/>
<ellipse cx="50" cy="34" rx="15" ry="4.5" fill="#3A0808"/>
<rect x="43" y="18" width="14" height="16" rx="2" fill="#FEF3C7"/>
<ellipse cx="50" cy="17" rx="6" ry="9" fill="#F97316" opacity="0.9"/>
<ellipse cx="50" cy="13" rx="3.5" ry="6" fill="#FBBF24"/>
<ellipse cx="50" cy="10" rx="1.5" ry="3" fill="#FFFBEB" opacity="0.8"/>
</svg>`,"tpl-nameplate":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="86,68 86,36 78,40 78,72" fill="#4A3820"/>
<polygon points="14,72 86,68 78,72 6,76" fill="#6A5430"/>
<polygon points="14,36 86,36 86,68 14,72" fill="#7A6438"/>
<rect x="14" y="38" width="72" height="30" rx="2" fill="none" stroke="#8A7448" stroke-width="1.5"/>
<rect x="24" y="46" width="52" height="3" rx="1.5" fill="#A08050" opacity="0.6"/>
<rect x="28" y="53" width="44" height="3" rx="1.5" fill="#8A7040" opacity="0.5"/>
<rect x="32" y="60" width="36" height="2" rx="1" fill="#7A6030" opacity="0.4"/>
<circle cx="22" cy="52" r="5" fill="#080c18"/>
<circle cx="22" cy="52" r="3" fill="#4A3820"/>
<circle cx="78" cy="52" r="5" fill="#080c18"/>
<circle cx="78" cy="52" r="3" fill="#4A3820"/>
</svg>`,"tpl-modular-box":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="82,68 82,28 74,32 74,72" fill="#044A70"/>
<polygon points="18,72 82,68 74,72 10,76" fill="#065A85"/>
<polygon points="18,28 82,28 82,68 18,72" fill="#075F8A"/>
<rect x="22" y="32" width="56" height="36" rx="2" fill="#033A58" opacity="0.8"/>
<polygon points="22,32 78,32 74,36 26,36" fill="#3D80DC" opacity="0.4"/>
<polygon points="26,36 74,32 74,72 26,68" fill="none" stroke="#1A5070" stroke-width="1"/>
</svg>`,"tpl-file-organizer":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="84,80 84,20 76,24 76,84" fill="#1A2030"/>
<polygon points="16,84 84,80 76,84 8,88" fill="#2A3040"/>
<polygon points="16,20 84,20 84,80 16,84" fill="#344055"/>
<rect x="16" y="20" width="4" height="60" fill="#1E293B"/>
<rect x="34" y="20" width="4" height="60" fill="#1E293B"/>
<rect x="52" y="20" width="4" height="60" fill="#1E293B"/>
<rect x="70" y="20" width="4" height="60" fill="#1E293B"/>
<rect x="16" y="80" width="68" height="4" fill="#2A3040"/>
<rect x="16" y="16" width="68" height="4" fill="#344055"/>
</svg>`,"tpl-sphere-hollow":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<circle cx="50" cy="50" r="36" fill="#831843"/>
<circle cx="36" cy="36" r="13" fill="#BE185D" opacity="0.3"/>
<circle cx="50" cy="50" r="36" fill="none" stroke="#DB2777" stroke-width="1.5" opacity="0.5"/>
<rect x="42" y="12" width="16" height="76" rx="8" fill="#080c18"/>
<rect x="12" y="42" width="76" height="16" rx="8" fill="#080c18"/>
<ellipse cx="50" cy="50" rx="8" ry="36" fill="#080c18" opacity="0.5"/>
<circle cx="50" cy="50" r="36" fill="none" stroke="#F9A8D4" stroke-width="1" opacity="0.3"/>
</svg>`,"tpl-wall-hook":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="30,78 30,16 22,20 22,82" fill="#50555F"/>
<polygon points="30,78 22,82 22,86 30,82" fill="#3A4048"/>
<polygon points="22,20 30,16 60,16 52,20" fill="#666B7A"/>
<rect x="22" y="16" width="38" height="10" rx="3" fill="#666B7A"/>
<rect x="52" y="22" width="10" height="34" rx="3" fill="#50555F"/>
<polygon points="52,22 60,18 70,22 62,26" fill="#666B7A"/>
<rect x="60" y="18" width="10" height="40" rx="3" fill="#666B7A"/>
<rect x="52" y="50" width="10" height="10" rx="2" fill="#404550"/>
<circle cx="26" cy="30" r="4" fill="#080c18"/>
<circle cx="26" cy="30" r="2" fill="#50555F"/>
<circle cx="26" cy="56" r="4" fill="#080c18"/>
<circle cx="26" cy="56" r="2" fill="#50555F"/>
</svg>`,"tpl-desk-organizer":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="84,76 84,22 76,26 76,80" fill="#0D4020"/>
<polygon points="16,80 84,76 76,80 8,84" fill="#145A28"/>
<polygon points="16,22 84,22 84,76 16,80" fill="#166534"/>
<rect x="50" y="24" width="4" height="54" fill="#0D4020"/>
<rect x="18" y="34" width="30" height="46" rx="2" fill="#080c18" opacity="0.7"/>
<rect x="54" y="34" width="28" height="46" rx="2" fill="#080c18" opacity="0.7"/>
<rect x="16" y="22" width="68" height="6" fill="#1A7A30" opacity="0.3"/>
</svg>`,"tpl-spiral-vase":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<path d="M 38,90 C 22,80 20,64 24,50 C 28,36 32,28 38,18 L 62,18 C 68,28 72,36 76,50 C 80,64 78,80 62,90 Z" fill="#B8845A"/>
<path d="M 38,90 C 22,80 20,64 24,50 C 28,36 32,28 38,18 L 62,18 C 68,28 72,36 76,50 C 80,64 78,80 62,90 Z" fill="url(#vg)" opacity="0.4"/>
<ellipse cx="50" cy="90" rx="22" ry="5" fill="#8A5A38"/>
<ellipse cx="50" cy="18" rx="12" ry="3" fill="#D4A070"/>
<path d="M 36,32 Q 50,40 64,32" stroke="#E0B584" stroke-width="2" fill="none"/>
<path d="M 33,46 Q 50,54 67,46" stroke="#D4A070" stroke-width="1.8" fill="none"/>
<path d="M 32,60 Q 50,68 68,60" stroke="#C08860" stroke-width="1.8" fill="none"/>
<path d="M 33,74 Q 50,80 67,74" stroke="#A87048" stroke-width="1.5" fill="none"/>
<defs><linearGradient id="vg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="white" stop-opacity="0.3"/><stop offset="0.5" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="black" stop-opacity="0.2"/></linearGradient></defs>
</svg>`,"tpl-gear-system":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="${h(34,58,27,21,16)}" fill="#859099"/>
<circle cx="34" cy="58" r="14" fill="#3E4450"/>
<rect x="32" y="30" width="4" height="28" fill="#6A7480" opacity="0.7"/>
<rect x="20" y="56" width="28" height="4" fill="#6A7480" opacity="0.7"/>
<circle cx="34" cy="58" r="5" fill="#4A5060"/>
<circle cx="34" cy="58" r="2.5" fill="#080c18"/>
<polygon points="${h(72,44,19,15,12)}" fill="#6A7A8A"/>
<circle cx="72" cy="44" r="10" fill="#2E3440"/>
<circle cx="72" cy="44" r="3.5" fill="#3A4050"/>
<circle cx="72" cy="44" r="1.8" fill="#080c18"/>
</svg>`,"tpl-propeller":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080808"/>
<polygon points="50,50 54,44 88,32 86,44 54,56" fill="#3C3C40" transform="rotate(0 50 50)"/>
<polygon points="50,50 54,44 88,32 86,44 54,56" fill="#4A4A4E" transform="rotate(120 50 50)"/>
<polygon points="50,50 54,44 88,32 86,44 54,56" fill="#2E2E32" transform="rotate(240 50 50)"/>
<circle cx="50" cy="50" r="11" fill="#242428"/>
<circle cx="50" cy="50" r="9" fill="#343438"/>
<circle cx="50" cy="50" r="4.5" fill="#080808"/>
<circle cx="50" cy="50" r="2" fill="#6A6A6E"/>
</svg>`,"tpl-heat-sink":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="84,78 84,74 76,78 76,82" fill="#7A8A9A"/>
<polygon points="12,82 84,78 76,82 4,86" fill="#94A3B3"/>
<polygon points="12,74 84,74 84,78 12,82" fill="#9AAFBF"/>
<rect x="13" y="20" width="9" height="54" rx="2" fill="#BCC8D8"/>
<rect x="13" y="20" width="4" height="54" rx="2" fill="#E0E8F0" opacity="0.6"/>
<rect x="25" y="20" width="9" height="54" rx="2" fill="#BCC8D8"/>
<rect x="25" y="20" width="4" height="54" rx="2" fill="#E0E8F0" opacity="0.6"/>
<rect x="37" y="20" width="9" height="54" rx="2" fill="#BCC8D8"/>
<rect x="37" y="20" width="4" height="54" rx="2" fill="#E0E8F0" opacity="0.6"/>
<rect x="49" y="20" width="9" height="54" rx="2" fill="#BCC8D8"/>
<rect x="49" y="20" width="4" height="54" rx="2" fill="#E0E8F0" opacity="0.6"/>
<rect x="61" y="20" width="9" height="54" rx="2" fill="#BCC8D8"/>
<rect x="61" y="20" width="4" height="54" rx="2" fill="#E0E8F0" opacity="0.6"/>
<rect x="73" y="20" width="9" height="54" rx="2" fill="#BCC8D8"/>
<rect x="73" y="20" width="4" height="54" rx="2" fill="#E0E8F0" opacity="0.6"/>
</svg>`,"tpl-gridfinity-bin":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="82,68 82,28 74,32 74,72" fill="#1A4A90"/>
<polygon points="18,72 82,68 74,72 10,76" fill="#1D58A8"/>
<polygon points="18,28 82,28 82,68 18,72" fill="#2970CC"/>
<rect x="22" y="32" width="56" height="36" rx="2" fill="#0F3060" opacity="0.8"/>
<polygon points="22,32 78,32 74,36 26,36" fill="#3D88E8" opacity="0.4"/>
<ellipse cx="50" cy="28" rx="30" ry="4" fill="#3D88E8" opacity="0.2"/>
<rect x="14" y="72" width="8" height="6" rx="3" fill="#0F3060"/>
</svg>`,"tpl-pipe-connector":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080808"/>
<rect x="6" y="42" width="88" height="16" rx="8" fill="#4A5060"/>
<rect x="6" y="42" width="88" height="6" rx="6" fill="#657080"/>
<rect x="42" y="6" width="16" height="36" rx="8" fill="#4A5060"/>
<rect x="42" y="6" width="6" height="36" rx="4" fill="#657080"/>
<circle cx="14" cy="50" r="9" fill="#28282E"/>
<circle cx="14" cy="50" r="6" fill="#18181E"/>
<circle cx="86" cy="50" r="9" fill="#28282E"/>
<circle cx="86" cy="50" r="6" fill="#18181E"/>
<circle cx="50" cy="14" r="9" fill="#28282E"/>
<circle cx="50" cy="14" r="6" fill="#18181E"/>
</svg>`,"tpl-enclosure-pro":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="84,72 84,28 76,32 76,76" fill="#1A4A90"/>
<polygon points="16,76 84,72 76,76 8,80" fill="#1D58A8"/>
<polygon points="16,28 84,28 84,72 16,76" fill="#236BD1"/>
<rect x="20" y="32" width="60" height="40" rx="2" fill="#0C2A60" opacity="0.7"/>
<rect x="16" y="28" width="68" height="8" fill="#3D80DC" opacity="0.18"/>
<line x1="16" y1="50" x2="84" y2="50" stroke="#1D5CB8" stroke-width="1" opacity="0.6" stroke-dasharray="4 3"/>
<circle cx="27" cy="38" r="5" fill="#1560C0"/>
<circle cx="27" cy="38" r="2.5" fill="#080c18"/>
<circle cx="74" cy="38" r="5" fill="#1560C0"/>
<circle cx="74" cy="38" r="2.5" fill="#080c18"/>
<circle cx="27" cy="72" r="5" fill="#1560C0"/>
<circle cx="27" cy="72" r="2.5" fill="#080c18"/>
<circle cx="74" cy="72" r="5" fill="#1560C0"/>
<circle cx="74" cy="72" r="2.5" fill="#080c18"/>
<rect x="13" y="56" width="5" height="12" rx="2" fill="#080c18"/>
</svg>`,"tpl-robotic-gripper":`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#080c18"/>
<polygon points="72,80 72,58 64,62 64,84" fill="#1A1A1E"/>
<polygon points="28,84 72,80 64,84 20,88" fill="#242428"/>
<polygon points="28,58 72,58 72,80 28,84" fill="#2E2E34"/>
<rect x="22" y="14" width="18" height="46" rx="4" fill="#343438"/>
<rect x="22" y="14" width="18" height="10" rx="4" fill="#4A4A50"/>
<rect x="60" y="14" width="18" height="46" rx="4" fill="#343438"/>
<rect x="60" y="14" width="18" height="10" rx="4" fill="#4A4A50"/>
<line x1="40" y1="32" x2="60" y2="32" stroke="#4A4A50" stroke-width="2" stroke-dasharray="3 3"/>
<circle cx="50" cy="66" r="7" fill="#2A2A30"/>
<circle cx="50" cy="66" r="4" fill="#080c18"/>
<circle cx="50" cy="66" r="1.8" fill="#5A5A60" opacity="0.6"/>
</svg>`},g=d(()=>f[s.templateId]??v);return(t,c)=>(n(),A("div",{class:"w-full h-full [&>svg]:w-full [&>svg]:h-full",innerHTML:g.value},null,8,a))}});export{E as _};
