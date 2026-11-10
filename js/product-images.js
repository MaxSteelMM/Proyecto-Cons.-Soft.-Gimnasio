(() => {
    const normalize = (value) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es')
        .trim();

    const productTypes = new Map([
        ['proteina whey 2kg', 'tub'],
        ['mancuernas 5kg', 'dumbbell'],
        ['remera deportiva mls', 'tshirt'],
        ['short deportivo mls', 'shorts'],
        ['barra olimpica estandar 20 kg', 'barbell'],
        ['discos olimpicos 10 kg (par)', 'plates'],
        ['kettlebell 12 kg', 'kettlebell'],
        ['bandas elasticas de resistencia (set de 5)', 'bands'],
        ['cuerda para saltar con rulemanes', 'rope'],
        ['guantes de entrenamiento antideslizantes', 'gloves'],
        ['colchoneta fitness antideslizante', 'mat'],
        ['botella deportiva 750 ml', 'bottle'],
        ['mancuernas ajustables 2 a 24 kg (par)', 'adjustable-dumbbell'],
        ['mancuernas hexagonales 10 kg (par)', 'hex-dumbbell'],
        ['discos bumper 5 kg (par)', 'bumper-plates'],
        ['discos olimpicos 15 kg (par)', 'plates'],
        ['barra curl ez cromada 1,2 m', 'curl-bar'],
        ['banco de pesas ajustable reforzado', 'bench'],
        ['rack para sentadillas con soportes', 'rack'],
        ['kettlebell de hierro 16 kg', 'kettlebell'],
        ['kettlebell de hierro 20 kg', 'kettlebell'],
        ['chaleco lastrado de 10 kg', 'vest'],
        ['barra de dominadas para puerta', 'pullup-bar'],
        ['mancuernas hexagonales 15 kg (par)', 'hex-dumbbell'],
        ['mancuernas hexagonales 20 kg (par)', 'hex-dumbbell'],
        ['discos olimpicos 20 kg (par)', 'plates'],
        ['set de collarines olimpicos metalicos', 'collars'],
        ['remera manga larga dry fit', 'long-sleeve'],
        ['musculosa deportiva transpirable', 'tank-top'],
        ['calza deportiva de compresion', 'leggings'],
        ['legging de cintura alta', 'leggings'],
        ['jogger deportivo liviano', 'joggers'],
        ['buzo con capucha para entrenamiento', 'hoodie'],
        ['top deportivo de soporte medio', 'sports-bra'],
        ['pantaloneta de entrenamiento liviana', 'shorts'],
        ['medias deportivas acolchadas (par)', 'socks'],
        ['guantes de entrenamiento con munequera', 'gloves'],
        ['camiseta termica de compresion', 'long-sleeve'],
        ['short de ciclismo con badana', 'cycling-shorts'],
        ['pantalon jogger de algodon', 'joggers'],
        ['gorra deportiva liviana', 'cap'],
        ['campera rompeviento deportiva', 'jacket'],
        ['proteina vegetal de arveja 1 kg', 'pouch'],
        ['proteina whey sabor chocolate 1 kg', 'tub'],
        ['creatina monohidratada 300 g', 'supplement-jar'],
        ['creatina micronizada 500 g', 'supplement-pouch'],
        ['avena instantanea integral 1 kg', 'grain-bag'],
        ['mantequilla de mani natural 500 g', 'peanut-jar'],
        ['barritas de proteina (caja de 12)', 'protein-bars'],
        ['galletas de avena y proteina (pack)', 'cookies'],
        ['bebida isotonica en polvo 500 g', 'drink-mix'],
        ['pre entreno sabor frutos rojos 300 g', 'preworkout'],
        ['sales de hidratacion y electrolitos (pack)', 'electrolytes'],
        ['granola con frutos secos 750 g', 'granola'],
        ['harina de avena instantanea 1 kg', 'grain-bag'],
        ['mix de frutos secos sin sal 500 g', 'nuts'],
        ['proteina caseina sabor vainilla 900 g', 'tub']
    ]);

    const silhouettes = {
        dumbbell: '<path d="M92 106h136v28H92z" fill="url(#metal)"/><rect x="72" y="82" width="31" height="76" rx="8" fill="url(#metal)"/><rect x="56" y="91" width="22" height="58" rx="8" fill="url(#accent)"/><rect x="217" y="82" width="31" height="76" rx="8" fill="url(#metal)"/><rect x="242" y="91" width="22" height="58" rx="8" fill="url(#accent)"/><path d="M100 93h10v54h-10m107-54h10v54h-10" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>',
        'adjustable-dumbbell': '<path d="M96 108h128v24H96z" fill="url(#metal)"/><rect x="75" y="83" width="25" height="74" rx="9" fill="url(#accent)"/><rect x="55" y="94" width="24" height="52" rx="9" fill="url(#metal)"/><rect x="220" y="83" width="25" height="74" rx="9" fill="url(#accent)"/><rect x="241" y="94" width="24" height="52" rx="9" fill="url(#metal)"/><circle cx="87" cy="120" r="6" fill="#222"/><circle cx="233" cy="120" r="6" fill="#222"/><path d="M112 100v40m96-40v40" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>',
        'hex-dumbbell': '<path d="M98 109h124v22H98z" fill="url(#metal)"/><path d="M60 91l15-11h23l12 15v50l-12 15H75l-15-11zm149 4 12-15h23l15 11v58l-15 11h-23l-12-15z" fill="url(#accent)" stroke="#ffb267" stroke-width="3"/><path d="M74 101h24m-24 38h24m119-38h24m-24 38h24" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>',
        plates: '<circle cx="160" cy="118" r="75" fill="url(#metal)" stroke="#ff8a24" stroke-width="8"/><circle cx="160" cy="118" r="31" fill="#17191d" stroke="#fff" stroke-opacity=".42" stroke-width="5"/><circle cx="160" cy="118" r="12" fill="#ff7214"/><path d="M113 72a66 66 0 0 1 77-13" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="6"/><path d="M112 175a66 66 0 0 0 94-3" fill="none" stroke="#111" stroke-opacity=".45" stroke-width="7"/>',
        'bumper-plates': '<circle cx="160" cy="118" r="73" fill="#242a31" stroke="url(#accent)" stroke-width="18"/><circle cx="160" cy="118" r="30" fill="#17191d" stroke="#f5f2eb" stroke-width="7"/><circle cx="160" cy="118" r="13" fill="#ff7214"/><path d="M121 67a62 62 0 0 1 77-2" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5"/>',
        barbell: '<path d="M67 111h186v14H67z" fill="url(#metal)"/><rect x="78" y="82" width="22" height="72" rx="5" fill="url(#accent)"/><rect x="101" y="91" width="19" height="54" rx="4" fill="url(#metal)"/><rect x="197" y="91" width="19" height="54" rx="4" fill="url(#metal)"/><rect x="218" y="82" width="22" height="72" rx="5" fill="url(#accent)"/><rect x="63" y="104" width="8" height="28" rx="3" fill="#fff"/><rect x="249" y="104" width="8" height="28" rx="3" fill="#fff"/>',
        'curl-bar': '<path d="M60 116h32l14 18 15-33 20 34 19-34 20 33 15-18h65" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><rect x="67" y="90" width="18" height="66" rx="5" fill="url(#accent)"/><rect x="89" y="98" width="13" height="50" rx="4" fill="url(#metal)"/><rect x="223" y="98" width="13" height="50" rx="4" fill="url(#metal)"/><rect x="239" y="90" width="18" height="66" rx="5" fill="url(#accent)"/>',
        bench: '<path d="M92 91h132q13 0 13 13v23H83v-25q0-11 9-11" fill="url(#accent)"/><path d="M106 127l-20 51m111-51 26 51m-126-15h120" stroke="url(#metal)" stroke-width="10" stroke-linecap="round"/><path d="M75 178h33m91 0h34" stroke="#f6f3eb" stroke-width="7" stroke-linecap="round"/><path d="M103 101h103" stroke="#fff" stroke-opacity=".3" stroke-width="4"/>',
        rack: '<path d="M91 52v127m138-127v127M76 58h30m108 0h30M91 79h138" fill="none" stroke="url(#metal)" stroke-width="10" stroke-linecap="round"/><path d="M74 177h34m105 0h34M91 96h-18v19h18m138-19h18v19h-18" fill="none" stroke="url(#accent)" stroke-width="9" stroke-linejoin="round"/><path d="M105 88h110" stroke="#f8f6f0" stroke-width="9"/><rect x="102" y="80" width="10" height="25" rx="3" fill="#ff7214"/><rect x="208" y="80" width="10" height="25" rx="3" fill="#ff7214"/>',
        kettlebell: '<path d="M124 92V76q0-37 36-37t36 37v16" fill="none" stroke="url(#metal)" stroke-width="13"/><path d="M128 88h64q36 28 31 69-5 40-63 40t-63-40q-5-41 31-69" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M119 126q8-20 24-25" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6"/>',
        vest: '<path d="M126 59q34 25 68 0l38 34-20 27-16-12 13 76H111l13-76-16 12-20-27z" fill="url(#accent)" stroke="#ffbc75" stroke-width="4" stroke-linejoin="round"/><path d="M143 66q17 22 34 0m-53 39h72m-68 23h64m-62 23h60" fill="none" stroke="#f8f6f0" stroke-opacity=".52" stroke-width="5"/><path d="M145 58v45h30V58" fill="#1e2228" stroke="#ffcf9c" stroke-width="3"/>',
        'pullup-bar': '<path d="M78 70h164v16H78zM93 86v83m134-83v83M79 169h28m122 0h28" fill="none" stroke="url(#metal)" stroke-width="10" stroke-linecap="round"/><path d="M112 70v-20m96 20V50m-96 0h96" stroke="url(#accent)" stroke-width="9" stroke-linecap="round"/><path d="M128 50v14m64-14v14" stroke="#f8f6f0" stroke-opacity=".6" stroke-width="4"/>',
        collars: '<g fill="url(#metal)" stroke="#ff9a42" stroke-width="5"><circle cx="122" cy="115" r="51"/><circle cx="198" cy="115" r="51"/></g><g fill="#17191d"><circle cx="122" cy="115" r="21"/><circle cx="198" cy="115" r="21"/></g><path d="M91 82q31-25 58 0m18 0q31-25 58 0" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="5"/>',
        bands: '<path d="M88 78q71-56 144 0l-17 19q-57-41-110 0zM80 105q80-57 160 0l-15 21q-65-43-130 0zM84 135q76-53 152 0l-17 22q-59-39-118 0z" fill="none" stroke="url(#accent)" stroke-width="11" stroke-linecap="round"/><path d="M97 173h126" stroke="url(#metal)" stroke-width="8" stroke-linecap="round"/><circle cx="105" cy="173" r="8" fill="#f3f0e9"/><circle cx="215" cy="173" r="8" fill="#f3f0e9"/>',
        rope: '<path d="M96 76q-29 47 0 95t65 0q29-48 65 0" fill="none" stroke="url(#accent)" stroke-width="8" stroke-linecap="round"/><rect x="75" y="63" width="28" height="67" rx="12" transform="rotate(-20 75 63)" fill="url(#metal)"/><rect x="216" y="115" width="28" height="67" rx="12" transform="rotate(-20 216 115)" fill="url(#metal)"/><circle cx="88" cy="80" r="6" fill="#ff7214"/><circle cx="229" cy="132" r="6" fill="#ff7214"/>',
        mat: '<rect x="84" y="68" width="151" height="101" rx="18" fill="url(#accent)"/><path d="M103 82v73m15-73v73m15-73v73m15-73v73m15-73v73m15-73v73m15-73v73" stroke="#fff" stroke-opacity=".18" stroke-width="3"/><ellipse cx="92" cy="118" rx="14" ry="50" fill="#ffb266"/><path d="M86 89q13 28 0 58" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>',
        bottle: '<path d="M145 51h30v22l14 14v82q0 17-17 17h-24q-17 0-17-17V87l14-14z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><rect x="142" y="39" width="36" height="18" rx="5" fill="url(#metal)"/><path d="M132 108h56m-56 12h56m-56 12h56" stroke="#fff" stroke-opacity=".2" stroke-width="4"/><path d="M143 95h34v48h-34z" fill="#17191d" fill-opacity=".72"/><path d="M149 107h22" stroke="#fff" stroke-width="4"/>',
        gloves: '<path d="M99 164l-8-51q-2-13 9-15 10-1 13 13l4 15-5-49q-1-13 10-14 12 0 13 13l4 42-1-54q0-13 12-13 12 0 12 13v52l5-44q1-12 13-11 12 1 10 14l-2 43 9-27q5-11 15-6 10 5 5 17l-15 46q-9 29-34 32l-33 1q-31-2-39-27" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M111 165q41 13 89-2" fill="none" stroke="#fff" stroke-opacity=".58" stroke-width="6"/>',
        tshirt: '<path d="M119 65l26-13h30l26 13 37 26-21 31-22-13v72H105v-72l-22 13-21-31z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M145 54q15 26 30 0" fill="none" stroke="#17191d" stroke-width="8"/><path d="M111 108h98" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>',
        'long-sleeve': '<path d="M123 62l23-12h28l23 12 52 38-20 34-34-22v69h-68v-69l-34 22-20-34z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M145 52q14 24 28 0m-64 61-30 20m136-20 30 20" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4"/>',
        'tank-top': '<path d="M119 62l26-11h30l26 11 28 38-29 18-11-18v72h-58v-72l-11 18-29-18z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M145 52q15 25 30 0m-49 14 9 28m52-28-9 28" fill="none" stroke="#17191d" stroke-width="7"/>',
        leggings: '<path d="M118 57h84l-5 46-8 71h-38l-8-65-9 65H96l18-71z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M120 73h79m-44 31 3 62" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4"/>',
        joggers: '<path d="M114 57h92l-7 58-9 61h-39l-3-54-9 54h-39l9-61z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M117 75h87m-48 20 3 65m-71 15h49m30 0h43" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="4"/>',
        hoodie: '<path d="M133 63l12-15h30l12 15 34 23-19 34-18-11v66H104v-66l-18 11-19-34z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M145 49q-4-25 15-25t15 25q-15 17-30 0m-12 17 12 18m30-18-12 18m-37 35h74v20h-74z" fill="none" stroke="#f8f6f0" stroke-opacity=".57" stroke-width="4"/>',
        'sports-bra': '<path d="M117 70q12-23 42-23t43 23l24 58-22 13-17-33v58h-56v-58l-17 33-22-13z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M143 51q16 25 32 0m-46 37q30 16 60 0m-57 51h53" fill="none" stroke="#fff" stroke-opacity=".48" stroke-width="4"/>',
        shorts: '<path d="M103 68h114l-9 61-9 43h-42l-8-52-12 52h-41l-8-43z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M106 82h108m-55 0v39m-47 15h41m16 0h42" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="4"/>',
        'cycling-shorts': '<path d="M112 62h96l-8 48-5 52h-48l-4-42-5 42h-48l-5-52z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M114 78h92m-75 62h34v16h-34m43-16h32v16h-32" fill="none" stroke="#fff" stroke-opacity=".48" stroke-width="4"/>',
        socks: '<path d="M113 52h42v77q0 18 23 19l37 4q18 2 17 18-1 15-19 15h-65q-39 0-39-41z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M113 71h42m-42 14h42m0 43q0 18 23 20l22 2" fill="none" stroke="#f8f6f0" stroke-opacity=".7" stroke-width="5"/>',
        cap: '<path d="M82 138q4-77 78-83 68 2 78 83l-59 8H83" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M82 138q53-27 157 0l-5 18q-73-14-147 0z" fill="url(#metal)"/><path d="M160 57v65m-45-52 28 43m62-43-28 43" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>',
        jacket: '<path d="M129 60l17-12h28l17 12 46 36-20 31-23-15v66H106v-66l-23 15-20-31z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M160 51v125m-44-57 27 9m54-9-27 9m-64 15 28 7m82-7-28 7" fill="none" stroke="#f8f6f0" stroke-opacity=".55" stroke-width="4"/>',
        tub: '<path d="M112 61h96l-8 22 13 16v70q0 11-13 11h-80q-13 0-13-11V99l13-16z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M108 60h104v19H108zm0 42h104v45H108z" fill="url(#metal)"/><path d="M132 116h57m-49 12h43" stroke="#ff7214" stroke-width="5" stroke-linecap="round"/>',
        'supplement-jar': '<path d="M121 73h78v17l15 13v66q0 10-12 10h-84q-12 0-12-10v-66l15-13z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M116 72h88v19h-88zm-10 42h108v39H106z" fill="url(#metal)"/><path d="M133 125h54m-45 12h36" stroke="#ff7214" stroke-width="5" stroke-linecap="round"/>',
        pouch: '<path d="M119 53h82l-5 21 19 23-10 78q-2 12-15 12h-60q-13 0-15-12l-10-78 19-23z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M119 74h82m-79 51h76v26h-76z" fill="url(#metal)"/><path d="M137 111h47m-40 56h32" stroke="#ff7214" stroke-width="5" stroke-linecap="round"/>',
        'supplement-pouch': '<path d="M119 53h82l-5 21 19 23-10 78q-2 12-15 12h-60q-13 0-15-12l-10-78 19-23z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4" stroke-linejoin="round"/><path d="M119 74h82m-79 51h76v26h-76z" fill="url(#metal)"/><path d="M137 111h47m-40 56h32" stroke="#ff7214" stroke-width="5" stroke-linecap="round"/>',
        'grain-bag': '<path d="M114 50h92l-6 24 19 21-10 83q-2 12-15 12h-68q-13 0-15-12l-10-83 19-21z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M114 74h92m-91 53h90v25h-90z" fill="url(#metal)"/><path d="M139 108q20-24 41 0m-42 5q20 25 42 0" fill="none" stroke="#ff7214" stroke-width="5"/>',
        'peanut-jar': '<path d="M122 69h76v19l14 14v68q0 11-13 11h-78q-13 0-13-11v-68l14-14z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M118 68h84v19h-84zm-10 46h104v36H108z" fill="url(#metal)"/><path d="M139 124q8-13 16 0t16 0t16 0" fill="none" stroke="#ff7214" stroke-width="5"/>',
        'protein-bars': '<rect x="92" y="68" width="137" height="101" rx="12" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M107 84h106v69H107z" fill="url(#metal)"/><path d="M103 89l44 34m-39 16 42-36m-21 51 42-35m-13-34 45 37" stroke="#ff7214" stroke-width="7"/><path d="M119 101h75m-58 45h45" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
        cookies: '<rect x="99" y="59" width="122" height="121" rx="15" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M108 73h104v91H108z" fill="url(#metal)"/><circle cx="145" cy="120" r="24" fill="#c88345"/><circle cx="181" cy="121" r="24" fill="#b46d36"/><g fill="#372319"><circle cx="138" cy="112" r="3"/><circle cx="151" cy="127" r="4"/><circle cx="178" cy="111" r="3"/><circle cx="188" cy="130" r="4"/></g>',
        'drink-mix': '<path d="M115 57h90l-6 21 18 20-10 79q-2 12-15 12h-64q-13 0-15-12l-10-79 18-20z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M115 77h90m-89 52h88v24h-88z" fill="url(#metal)"/><path d="M160 91q-25 30 0 49 25-19 0-49zm0 23v49" fill="none" stroke="#ff7214" stroke-width="5"/>',
        preworkout: '<path d="M121 69h78v19l14 14v68q0 11-13 11h-80q-13 0-13-11v-68l14-14z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M117 68h86v19h-86zm-10 47h106v38H107z" fill="url(#metal)"/><path d="M159 119l-12 20h12l-6 16 20-25h-13l9-11z" fill="#ff7214"/>',
        electrolytes: '<path d="M106 80l19-20h76l19 20v91l-19 18h-76l-19-18z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M117 88h92v64h-92z" fill="url(#metal)"/><path d="M163 98l-19 29h16l-7 17 26-31h-17l10-15z" fill="#ff7214"/>',
        granola: '<path d="M114 53h92l-6 22 19 20-10 83q-2 12-15 12h-68q-13 0-15-12l-10-83 19-20z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M114 75h92m-85 45q39-28 77 0v37h-77z" fill="url(#metal)"/><g fill="#ff7214"><circle cx="141" cy="131" r="7"/><circle cx="161" cy="140" r="8"/><circle cx="184" cy="129" r="7"/><circle cx="149" cy="154" r="5"/><circle cx="179" cy="154" r="5"/></g>',
        nuts: '<path d="M110 58h100l-8 26 17 21-11 70q-2 13-15 13h-66q-13 0-15-13l-11-70 17-21z" fill="url(#accent)" stroke="#ffc17e" stroke-width="4"/><path d="M109 83h102m-90 40q40-23 79 0v37h-79z" fill="url(#metal)"/><g fill="#b77c40"><ellipse cx="141" cy="139" rx="9" ry="6" transform="rotate(-28 141 139)"/><ellipse cx="164" cy="151" rx="9" ry="6" transform="rotate(22 164 151)"/><ellipse cx="185" cy="136" rx="9" ry="6" transform="rotate(-12 185 136)"/></g>'
    };

    const escapeXml = (value) => value.replace(/[<>&"']/g, (character) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;'
    })[character]);

    const artworkCache = new Map();
    const makeArtwork = (product, type) => {
        const key = normalize(product.nombre);
        if (artworkCache.has(key)) return artworkCache.get(key);

        const safeName = escapeXml(product.nombre);
        const safeCategory = escapeXml(product.categoria || 'GYM-MLS');
        const hue = [...key].reduce((total, character) => total + character.charCodeAt(0), 0) % 32;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 320 240" role="img"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#292a2c"/><stop offset="1" stop-color="#111214"/></linearGradient><linearGradient id="metal" x2=".8" y2="1"><stop stop-color="#f8f6f0"/><stop offset=".45" stop-color="#a8adb3"/><stop offset="1" stop-color="#686d75"/></linearGradient><linearGradient id="accent" x2="1" y2="1"><stop stop-color="#ff9a42"/><stop offset="1" stop-color="#d94b00"/></linearGradient><radialGradient id="glow"><stop stop-color="#ff7214" stop-opacity=".24"/><stop offset="1" stop-color="#ff7214" stop-opacity="0"/></radialGradient><filter id="shadow" x="-.3" y="-.3" width="1.6" height="1.8"><feGaussianBlur stdDeviation="7"/></filter><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#fff" stroke-opacity=".035"/></pattern></defs><rect width="320" height="240" fill="url(#bg)"/><rect width="320" height="240" fill="url(#grid)"/><circle cx="249" cy="52" r="118" fill="url(#glow)"/><path d="M18 22h28" stroke="#ff7214" stroke-width="4" stroke-linecap="round"/><text x="54" y="26" fill="#c5c6c8" font-family="Arial,sans-serif" font-size="9" letter-spacing="2">${safeCategory.toLocaleUpperCase('es')}</text><ellipse cx="160" cy="190" rx="76" ry="10" fill="#000" fill-opacity=".45" filter="url(#shadow)"/><g transform="translate(0 ${hue % 5})">${silhouettes[type] || silhouettes.tub}</g><rect x="0" y="203" width="320" height="37" fill="#0b0c0e" fill-opacity=".82"/><text x="160" y="226" fill="#f5f4f0" font-family="Arial,sans-serif" font-size="12" font-weight="700" text-anchor="middle">${safeName}</text></svg>`;
        const image = {
            src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            alt: `${product.nombre} — ilustración del producto`
        };
        artworkCache.set(key, image);
        return image;
    };

    window.GymProductImages = {
        get(product) {
            const key = normalize(product.nombre);
            const type = productTypes.get(key);
            return type ? makeArtwork(product, type) : null;
        }
    };
})();
