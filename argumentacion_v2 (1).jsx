import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════
const TEACHER_PIN = "docente";
const POLL_MS = 6000;
const SESSIONS = ["Sesión 1","Sesión 2","Sesión 3","Sesión 4","Sesión 5"];
const GROUPS = ["A","B","C","D","E","F"];

const C = {
  navy:"#1B3D6E", navyDark:"#132D54",
  green:"#2D8C72", greenLight:"#EBF7F4",
  amber:"#C4780A", amberLight:"#FEF6E7",
  danger:"#C13030", dangerLight:"#FEF0F0",
  violet:"#5C3FA0", violetLight:"#F2EEFF",
  teal:"#1D7FA5", tealLight:"#E8F5FB",
  orange:"#B85210", orangeLight:"#FEF2EB",
  blue:"#1A5FA8", blueLight:"#EBF2FB",
  bg:"#F7F8FC", card:"#FFFFFF",
  border:"#E1E4ED", text:"#1A2030", muted:"#6B7280",
};

const FIELDS = [
  { key:"yo_creo",          label:"Yo creo que…",                                        role:"Conclusión",    color:C.navy,    emoji:"💡" },
  { key:"debido_a",         label:"Debido a…",                                            role:"Hechos/Datos",  color:C.green,   emoji:"🔍" },
  { key:"en_contra",        label:"Argumentos en contra de mi idea pueden ser…",          role:"Refutación",    color:C.danger,  emoji:"⚡" },
  { key:"como_convencer",   label:"Cómo convencer a alguien que no crea en mi idea…",    role:"Ventajas",      color:C.violet,  emoji:"✨" },
  { key:"comparar",         label:"Con qué puedo comparar…",                             role:"Comparación",   color:C.teal,    emoji:"🔗" },
  { key:"evidencias",       label:"Evidencias que usaría para convencer…",               role:"Justificación", color:C.amber,   emoji:"📊" },
  { key:"palabras_profesor",label:"Palabras que usaría el profesor para apoyar mi idea…",role:"Fundamentación",color:C.orange,  emoji:"📚" },
  { key:"ejemplos",         label:"Ejemplos…",                                           role:"Ejemplos",      color:C.blue,    emoji:"🌟" },
];

const TEXT_ORDER = [
  { key:"yo_creo",           pre:"" },
  { key:"debido_a",          pre:" porque " },
  { key:"evidencias",        pre:", ya que " },
  { key:"como_convencer",    pre:". Una ventaja de esta idea es que " },
  { key:"en_contra",         pre:". Sin embargo, " },
  { key:"comparar",          pre:". En cambio, " },
  { key:"ejemplos",          pre:", como " },
  { key:"palabras_profesor", pre:". Por lo tanto, " },
];

// ═══════════════════════════════════════════════════════
// EXPERIMENTS DATA
// ═══════════════════════════════════════════════════════
const EXPERIMENTS = [
  {
    id:"combustion_mg", emoji:"🔥",
    title:"Combustión del magnesio",
    subtitle:"Reacciones de combustión y conservación de masa",
    eje:"Materia y sus transformaciones", duration:"45 min",
    oa:"OA 3 · Investigar reacciones químicas y conservación de masa",
    materials:["Cinta de magnesio (5 cm/grupo)","Pinzas metálicas","Mechero Bunsen","Balanza digital","Vidrio de reloj","Gafas de seguridad (obligatorio)"],
    safety:"⚠️ NUNCA mirar directamente la llama encendida. Gafas de seguridad son obligatorias. El polvo de MgO puede irritar las vías respiratorias.",
    guide_steps:[
      { id:1, phase:"Activación", title:"Predicciones iniciales", duration:"8 min",
        teacher_notes:"Preguntar: '¿Qué le pasa a la masa del magnesio al quemarse?' Anotar todas las respuestas en la pizarra sin validar ninguna. Busca tres ideas distintas: disminuye / se conserva / aumenta.",
        student_task:"Escribir predicción en el campo 'Yo creo que…' antes de ver el experimento.",
        tips:["No corrijas ninguna predicción todavía — el objetivo es la disonancia cognitiva.","Si todos coinciden, pregunta: '¿Y si les digo que hay química que argumenta lo contrario?'"] },
      { id:2, phase:"Preparación", title:"Materiales y seguridad", duration:"5 min",
        teacher_notes:"Distribuir materiales por grupo. Revisar normas de seguridad. Demostrar el uso correcto de pinzas. Verificar que todos usen gafas.",
        student_task:"Pesar la cinta de magnesio y anotar la masa inicial.",
        tips:["Detener la clase si alguien no usa gafas antes de continuar."] },
      { id:3, phase:"Experiencia", title:"Realizar la combustión", duration:"12 min",
        teacher_notes:"Circular por grupos. La llama es blanca e intensa — recordar no mirarla. El producto (MgO) es un polvo blanco. Algunos grupos pueden perder parte del polvo.",
        student_task:"Encender el magnesio con pinzas sobre el vidrio de reloj. Observar y describir cambios.",
        tips:["Preguntas orientadoras: '¿Qué colores ves? ¿Huele a algo? ¿La balanza marca lo mismo?'","Aceptar resultados cualitativos si el MgO se dispersa."] },
      { id:4, phase:"Registro", title:"Completar la plantilla", duration:"8 min",
        teacher_notes:"Circular y hacer preguntas socráticas: '¿De dónde vino ese oxígeno? ¿Cómo sabes que hubo una reacción y no solo un cambio físico?'",
        student_task:"Completar los 8 campos de la plantilla de argumentación.",
        tips:["Énfasis en 'evidencias' y 'debido_a' — deben ser observaciones reales, no definiciones del libro."] },
      { id:5, phase:"Argumentación", title:"Construir el texto argumentativo", duration:"8 min",
        teacher_notes:"Los estudiantes redactan su texto con los conectores y piden retroalimentación IA. Circula para apoyar a quien tiene dificultades.",
        student_task:"Generar el texto argumentativo y solicitar retroalimentación IA si completó 3+ campos.",
        tips:["Recuerda que el orden del texto difiere del orden de la plantilla — esto es intencional."] },
      { id:6, phase:"Puesta en común", title:"Análisis y cierre", duration:"8 min",
        teacher_notes:"Usa el panel de Análisis IA para mostrar las predicciones iniciales de la clase. Conectar con Ley de Lavoisier.",
        student_task:"Escuchar y complementar argumentos de otros grupos.",
        tips:["Pregunta clave: '¿Por qué el óxido de magnesio es MÁS pesado si visualmente parece que algo desaparece?'"] },
    ],
    expected_conclusion:"El magnesio reacciona con el oxígeno del aire formando óxido de magnesio (MgO). La masa aumenta porque incorpora oxígeno como reactivo.",
    common_misconceptions:["Creer que la masa disminuye porque algo 'se quema o consume'","No reconocer el oxígeno del aire como reactivo","Confundir la energía liberada (luz/calor) con pérdida de masa"],
    scaffolding:{
      yo_creo:"¿Qué crees que pasará con la masa del magnesio después de quemarlo?",
      debido_a:"¿Qué observaste durante la reacción? (cambio de color, luz, temperatura, masa antes y después)",
      en_contra:"¿Qué argumentaría alguien que piensa que la masa disminuye al quemar algo?",
      como_convencer:"¿Qué ventaja tiene tu explicación para describir lo que ocurrió?",
      comparar:"¿Con qué proceso cotidiano compararías esta reacción?",
      evidencias:"¿Qué mediciones o datos concretos apoyan tu conclusión?",
      palabras_profesor:"¿Qué conceptos (oxidación, Ley de Lavoisier, reacción de síntesis) respaldan tu idea?",
      ejemplos:"Escribe un ejemplo cotidiano donde ocurra algo parecido (óxido en metales, combustión...)."
    }
  },
  {
    id:"acido_base", emoji:"🟣",
    title:"Indicadores ácido-base",
    subtitle:"pH, ácidos y bases con col morada",
    eje:"Materia y sus transformaciones", duration:"45 min",
    oa:"OA 5 · Clasificar sustancias como ácidas, neutras o básicas usando indicadores",
    materials:["Hojas de col morada (o repollo)","Agua caliente","Vasos plásticos transparentes (6/grupo)","Vinagre blanco","Bicarbonato de sodio","Jugo de limón","Leche","Agua de cal","Agua destilada"],
    safety:"✅ Experimento seguro. Evitar ingerir mezclas. Lavar manos al terminar.",
    guide_steps:[
      { id:1, phase:"Activación", title:"¿Qué hace cambiar de color al repollo?", duration:"5 min",
        teacher_notes:"Mostrar el indicador preparado (líquido morado intenso). Preguntar: '¿Por qué creen que cambia de color al mezclarlo con distintas sustancias?'",
        student_task:"Escribir predicciones sobre qué sustancias cambiarán el color y hacia qué tono.",
        tips:["Conectar con experiencias cotidianas: limón, vinagre, jabón."] },
      { id:2, phase:"Preparación", title:"Preparar el indicador", duration:"8 min",
        teacher_notes:"Demostrar extracción del pigmento con agua caliente. El indicador debe tener color morado intenso.",
        student_task:"Preparar el indicador y etiquetar los vasos con cada sustancia.",
        tips:["Alternativas si no hay col: jugo de remolacha o té de hibisco."] },
      { id:3, phase:"Experiencia", title:"Probar las sustancias", duration:"12 min",
        teacher_notes:"Agregar ~5 mL de indicador a cada vaso y luego la sustancia. Ácidos→ rojo/rosado. Bases→ verde/amarillo.",
        student_task:"Agregar cada sustancia al indicador y registrar el color resultante.",
        tips:["Pedir que ordenen los vasos de más ácido a más básico según el color."] },
      { id:4, phase:"Registro", title:"Completar la plantilla", duration:"8 min",
        teacher_notes:"Circular y guiar. Énfasis: la evidencia debe ser el cambio de color observado, no una definición copiada.",
        student_task:"Completar los 8 campos para UNA de las sustancias probadas (la más sorprendente).",
        tips:["Sugerir que elijan la sustancia que más les sorprendió para argumentar."] },
      { id:5, phase:"Argumentación", title:"Construir el texto", duration:"7 min",
        teacher_notes:"Retroalimentación IA individual.",
        student_task:"Generar texto argumentativo y pedir feedback IA.",
        tips:[] },
      { id:6, phase:"Puesta en común", title:"Escala de pH de la clase", duration:"5 min",
        teacher_notes:"Usar panel IA para ver qué sustancias eligieron más. Construir colectivamente una escala de pH con los resultados.",
        student_task:"Compartir resultados y posicionarlos en la escala.",
        tips:["Pregunta: '¿Por qué el limón y el vinagre se parecen en su comportamiento?'"] },
    ],
    expected_conclusion:"Las sustancias ácidas hacen que el indicador de col morada vire hacia rojo/rosado; las bases producen colores verde/amarillo.",
    common_misconceptions:["Creer que solo los ácidos 'peligrosos' (fuertes) cambian el indicador","Confundir 'ácido' con 'amargo' o 'corrosivo'","No reconocer bases comunes en el hogar (bicarbonato, jabón)"],
    scaffolding:{
      yo_creo:"¿Qué crees que le pasará al indicador de col morada al mezclarlo con la sustancia que elegiste?",
      debido_a:"¿Qué cambio observaste exactamente? (color, intensidad, rapidez)",
      en_contra:"¿Qué podría argumentar alguien que piense que la sustancia es neutra?",
      como_convencer:"¿Por qué el cambio de color es evidencia suficiente para clasificar la sustancia?",
      comparar:"¿Con qué otros fenómenos cotidianos puedes comparar este comportamiento?",
      evidencias:"¿Qué dato concreto de tu experimento apoya tu clasificación?",
      palabras_profesor:"¿Qué conceptos (pH, ácido, base, indicador, antocianina) explican lo que observaste?",
      ejemplos:"Nombra otras sustancias cotidianas que se comportarían igual que la que elegiste."
    }
  },
  {
    id:"electrolisis", emoji:"⚡",
    title:"Electrólisis del agua",
    subtitle:"Descomposición del agua en hidrógeno y oxígeno",
    eje:"Estructura y transformación de la materia", duration:"50 min",
    oa:"OA 2 · Explicar que el agua es un compuesto que puede descomponerse en sus elementos",
    materials:["Batería 9V o fuente de poder","Cables con pinzas caimán","2 lápices de grafito (sin madera en puntas)","Vaso con agua + sal disuelta","2 tubos de ensayo (opcional)","Astilla para comprobar O₂ (opcional)"],
    safety:"⚠️ No conectar la batería antes de tener todo listo. Evitar tocar el agua mientras el circuito está activo. Buena ventilación del laboratorio.",
    guide_steps:[
      { id:1, phase:"Activación", title:"¿El agua es elemento o compuesto?", duration:"8 min",
        teacher_notes:"Preguntar si el agua puede 'separarse' en algo más simple. Esperar hipótesis. Conectar con historia: Lavoisier, Cavendish.",
        student_task:"Escribir predicción: ¿qué esperas ver cuando pases corriente por el agua?",
        tips:["Buena oportunidad para conectar con la historia de la ciencia y el concepto de compuesto."] },
      { id:2, phase:"Preparación", title:"Armar el circuito", duration:"10 min",
        teacher_notes:"Mostrar cómo conectar cables, electrodos y batería. La sal aumenta la conductividad. Verificar que los electrodos no se toquen.",
        student_task:"Armar el circuito sin conectar la batería todavía.",
        tips:["Verificar que los electrodos no se toquen entre sí."] },
      { id:3, phase:"Experiencia", title:"Observar la electrólisis", duration:"15 min",
        teacher_notes:"Conectar la batería. Burbujas en ambos electrodos. El cátodo (-) produce el doble de burbujas que el ánodo (+). Relación 2:1.",
        student_task:"Observar burbujas, medir y comparar volúmenes de gas en cada electrodo.",
        tips:["La relación 2:1 (H₂:O₂) es la evidencia clave.","Si tienen tubos de ensayo, pueden recoger el gas para comparar volúmenes."] },
      { id:4, phase:"Registro", title:"Completar la plantilla", duration:"8 min",
        teacher_notes:"Preguntas guía: '¿Por qué hay más gas en un electrodo?' '¿Qué son esas burbujas?'",
        student_task:"Completar los 8 campos.",
        tips:[] },
      { id:5, phase:"Argumentación", title:"Construir el texto", duration:"6 min",
        teacher_notes:"Retroalimentación IA individual.",
        student_task:"Generar texto argumentativo.",
        tips:[] },
      { id:6, phase:"Puesta en común", title:"Síntesis colectiva", duration:"5 min",
        teacher_notes:"¿Identificaron la relación 2:1? Conectar con la fórmula H₂O. Usar panel IA.",
        student_task:"Comparar resultados.",
        tips:["Pregunta extra: '¿Cómo demostrarías que uno de los gases es hidrógeno y el otro oxígeno?'"] },
    ],
    expected_conclusion:"El agua es un compuesto que se descompone en H₂ y O₂ mediante electricidad. La relación 2:1 en volúmenes evidencia la fórmula H₂O.",
    common_misconceptions:["Creer que el agua 'se convierte en electricidad'","No relacionar los gases producidos con los elementos H y O","No entender por qué se necesita la sal"],
    scaffolding:{
      yo_creo:"¿Qué crees que pasará cuando pases corriente eléctrica por el agua con sal?",
      debido_a:"¿Qué observaste en cada electrodo? ¿Qué diferencias notaste entre los dos?",
      en_contra:"¿Qué diría alguien que piense que las burbujas son solo vapor de agua?",
      como_convencer:"¿Cómo explicarías la diferencia en cantidad de burbujas entre ambos electrodos?",
      comparar:"¿Con qué proceso de separación conocido compararías la electrólisis?",
      evidencias:"¿Qué datos (volúmenes, velocidad de producción) apoyan tu conclusión?",
      palabras_profesor:"¿Qué conceptos (electrólisis, cátodo, ánodo, compuesto, elemento) explican el fenómeno?",
      ejemplos:"¿Dónde se usa la electrólisis fuera del laboratorio?"
    }
  },
  {
    id:"solubilidad", emoji:"🧂",
    title:"Factores de solubilidad",
    subtitle:"Temperatura, agitación y naturaleza del soluto",
    eje:"Disoluciones y sus propiedades", duration:"45 min",
    oa:"OA 7 · Investigar factores que afectan la solubilidad",
    materials:["Sal de cocina (NaCl)","Azúcar","Aceite vegetal","Agua fría, tibia y caliente","Vasos plásticos (9/grupo)","Cucharadita medidora","Termómetro (si disponible)"],
    safety:"✅ Completamente seguro. Supervisar uso de agua caliente.",
    guide_steps:[
      { id:1, phase:"Activación", title:"¿Cuánto cabe en el agua?", duration:"5 min",
        teacher_notes:"Preguntar: '¿Cuántas cucharadas de azúcar caben en un vaso de agua? ¿Depende de algo?'",
        student_task:"Hacer predicciones sobre qué factores afectan la cantidad de soluto que se puede disolver.",
        tips:["Conectar con té caliente vs frío, aceite y agua."] },
      { id:2, phase:"Preparación", title:"Diseñar el experimento", duration:"8 min",
        teacher_notes:"Cada grupo elige UNA variable: temperatura, agitación o tipo de soluto. Guiar diseño experimental.",
        student_task:"Definir variable independiente, dependiente y controles.",
        tips:["Énfasis en controlar variables — oportunidad para hablar de diseño experimental."] },
      { id:3, phase:"Experiencia", title:"Realizar el experimento", duration:"15 min",
        teacher_notes:"Supervisar el control de variables. Resultado esperado: más temperatura = más solubilidad para sólidos. El aceite no se disuelve.",
        student_task:"Realizar el experimento y registrar cuánto se disuelve en cada condición.",
        tips:["Punto de saturación: cuando ya no se disuelve más aunque se agite."] },
      { id:4, phase:"Registro", title:"Completar la plantilla", duration:"8 min",
        teacher_notes:"Guiar argumentación. La conclusión debe relacionar la variable investigada con el resultado.",
        student_task:"Completar los 8 campos.",
        tips:[] },
      { id:5, phase:"Argumentación", title:"Construir el texto", duration:"6 min",
        teacher_notes:"",
        student_task:"Generar texto argumentativo.",
        tips:[] },
      { id:6, phase:"Puesta en común", title:"Comparar variables investigadas", duration:"5 min",
        teacher_notes:"Si distintos grupos investigaron distintas variables, comparar resultados. Usar panel IA.",
        student_task:"Presentar resultados y escuchar los de otros grupos.",
        tips:["'¿Qué pasaría si combinamos todos los factores favorables a la vez?'"] },
    ],
    expected_conclusion:"La solubilidad de sólidos en agua aumenta con la temperatura. La agitación acelera la disolución pero no aumenta la solubilidad máxima. El aceite no se disuelve en agua.",
    common_misconceptions:["Confundir velocidad de disolución con solubilidad máxima","Creer que el aceite 'se disuelve lentamente'","No controlar variables al diseñar el experimento"],
    scaffolding:{
      yo_creo:"¿Qué factor crees que tiene más efecto en cuánta sustancia se puede disolver en agua?",
      debido_a:"¿Qué observaste al cambiar la variable que investigaste?",
      en_contra:"¿Qué podría argumentar alguien que diga que la temperatura no importa para la solubilidad?",
      como_convencer:"¿Cómo explicarías tus resultados a alguien escéptico?",
      comparar:"¿Con qué fenómeno cotidiano compararías lo que observaste?",
      evidencias:"¿Qué datos numéricos o cualitativos apoyan tu conclusión?",
      palabras_profesor:"¿Qué conceptos (solubilidad, saturación, soluto, solvente, solución) explican tus resultados?",
      ejemplos:"Menciona dos situaciones cotidianas donde la solubilidad sea importante."
    }
  },
  {
    id:"oxidacion", emoji:"🦵",
    title:"Oxidación del hierro (corrosión)",
    subtitle:"Condiciones para la formación de óxido de hierro",
    eje:"Reacciones químicas y energía", duration:"2 sesiones",
    oa:"OA 3 · Investigar reacciones de oxidación como ejemplo de reacciones de síntesis",
    materials:["Lana de hierro / viruta (3 porciones/grupo)","Vinagre blanco","Agua destilada","Aceite vegetal","3 tubos de ensayo o vasos","Cinta de enmascarar y marcador"],
    safety:"✅ Seguro. El vinagre puede irritar ojos en grandes cantidades.",
    guide_steps:[
      { id:1, phase:"Activación (sesión 1)", title:"¿Qué hace que el hierro se oxide?", duration:"8 min",
        teacher_notes:"Mostrar imágenes de corrosión en puentes, barcos, vehículos. '¿Por qué el hierro se oxida? ¿Qué factores influyen?'",
        student_task:"Hacer predicciones sobre qué condiciones aceleran o impiden la oxidación.",
        tips:["Conectar con pérdidas económicas por corrosión — relevancia social."] },
      { id:2, phase:"Preparación", title:"Preparar las condiciones", duration:"10 min",
        teacher_notes:"Cada grupo prepara 3 condiciones: (A) lana de hierro+vinagre, (B) lana de hierro+agua, (C) lana de hierro+aceite.",
        student_task:"Preparar y etiquetar los tubos. Observar el estado inicial.",
        tips:["Fotografiar el estado inicial si tienen celular disponible."] },
      { id:3, phase:"Observación (24-48 hrs)", title:"Registrar cambios", duration:"Observación prolongada",
        teacher_notes:"Al día siguiente: observar cambios. El vinagre acelera la oxidación. El aceite la impide.",
        student_task:"Registrar cambios en color, textura de cada muestra.",
        tips:["Pedir fotos comparativas si es posible."] },
      { id:4, phase:"Registro (sesión 2)", title:"Completar la plantilla", duration:"10 min",
        teacher_notes:"Guiar análisis: '¿Por qué el aceite funciona como protector?'",
        student_task:"Completar los 8 campos de la plantilla.",
        tips:[] },
      { id:5, phase:"Argumentación", title:"Construir el texto", duration:"8 min",
        teacher_notes:"",
        student_task:"Generar texto argumentativo.",
        tips:[] },
      { id:6, phase:"Puesta en común", title:"Aplicaciones industriales", duration:"5 min",
        teacher_notes:"Discutir pinturas anticorrosión, galvanizado, acero inoxidable. Usar panel IA.",
        student_task:"Compartir hallazgos.",
        tips:["'¿Cómo protegerían un puente del óxido?'"] },
    ],
    expected_conclusion:"El hierro se oxida en presencia de agua y oxígeno. El vinagre acelera el proceso. El aceite impide el contacto con agua y O₂, previniendo la oxidación.",
    common_misconceptions:["Creer que el hierro 'se come' sin entender la reacción química","No reconocer el oxígeno como reactivo","Confundir prevención (aceite) con inhibición química"],
    scaffolding:{
      yo_creo:"¿Qué condiciones crees que son necesarias para que el hierro se oxide?",
      debido_a:"¿Qué cambios observaste en cada uno de los tres tubos?",
      en_contra:"¿Qué diría alguien que piense que el hierro se oxida solo por contacto con el aire?",
      como_convencer:"¿Qué evidencia de tu experimento demuestra que el agua también es necesaria?",
      comparar:"¿Con qué otro proceso de deterioro de materiales compararías la oxidación?",
      evidencias:"¿Qué cambios específicos observados apoyan tu conclusión?",
      palabras_profesor:"¿Qué conceptos (oxidación, Fe₂O₃, catalizador, inhibidor) explican el fenómeno?",
      ejemplos:"Menciona tres métodos usados en la industria para prevenir la corrosión."
    }
  },
  {
    id:"vinagre_bic", emoji:"🫧",
    title:"Vinagre y bicarbonato",
    subtitle:"Reacción ácido-base y producción de CO₂",
    eje:"Reacciones químicas", duration:"35 min",
    oa:"OA 3 y OA 5 · Reacciones ácido-base y producción de gases",
    materials:["Vinagre blanco (50 mL/grupo)","Bicarbonato de sodio (5 g/grupo)","Globos (2/grupo)","Botellas plásticas pequeñas","Embudo pequeño","Balanza (opcional)"],
    safety:"✅ Completamente seguro. El CO₂ producido no es tóxico en estas cantidades.",
    guide_steps:[
      { id:1, phase:"Activación", title:"¿Qué pasa cuando mezclas…?", duration:"5 min",
        teacher_notes:"'¿Quién ha mezclado vinagre y bicarbonato? ¿Qué pasó?' Probable que la mayoría lo haya visto.",
        student_task:"Escribir predicciones: ¿qué gas se produce? ¿cómo lo demostrarías?",
        tips:["Conectar con levadura en repostería (CO₂ que esponja el pan)."] },
      { id:2, phase:"Preparación", title:"Preparar el experimento del globo", duration:"5 min",
        teacher_notes:"Poner bicarbonato dentro del globo con el embudo. Vinagre en la botella. Sin mezclar aún.",
        student_task:"Preparar materiales sin mezclar todavía.",
        tips:[] },
      { id:3, phase:"Experiencia", title:"Inflar el globo con CO₂", duration:"10 min",
        teacher_notes:"Conectar el globo a la botella y dejar caer el bicarbonato. El globo se inflará con CO₂. Medir circunferencia.",
        student_task:"Realizar la reacción, observar y medir el globo. Probar con distintas cantidades.",
        tips:["Variable: ¿más bicarbonato produce más gas?"] },
      { id:4, phase:"Registro", title:"Completar la plantilla", duration:"7 min",
        teacher_notes:"Énfasis en que el gas CO₂ es evidencia de reacción química, no solo una mezcla.",
        student_task:"Completar los 8 campos.",
        tips:[] },
      { id:5, phase:"Argumentación", title:"Construir el texto", duration:"5 min",
        teacher_notes:"",
        student_task:"Generar texto argumentativo.",
        tips:[] },
      { id:6, phase:"Puesta en común", title:"¿Cómo saber si hubo reacción?", duration:"5 min",
        teacher_notes:"Discutir indicadores de reacción química. Usar panel IA.",
        student_task:"Comparar resultados.",
        tips:["Indicadores: cambio de color, precipitado, gas, cambio de temperatura."] },
    ],
    expected_conclusion:"El vinagre (ácido acético) reacciona con el bicarbonato (base) produciendo CO₂, que infla el globo. La producción de gas es evidencia de una reacción química.",
    common_misconceptions:["Creer que es solo una mezcla física (el gas 'ya estaba')","No identificar los reactivos correctamente","Confundir CO₂ con vapor de agua"],
    scaffolding:{
      yo_creo:"¿Qué crees que ocurre cuando el vinagre y el bicarbonato se mezclan?",
      debido_a:"¿Qué observaste que indica que hubo una reacción y no solo una mezcla?",
      en_contra:"¿Qué argumentaría alguien que diga que el gas ya estaba disuelto en el vinagre?",
      como_convencer:"¿Cómo demostrarías que se produjo un gas nuevo?",
      comparar:"¿Con qué proceso conocido compararías esta reacción?",
      evidencias:"¿Qué datos (tamaño del globo, temperatura, efervescencia) apoyan tu conclusión?",
      palabras_profesor:"¿Qué conceptos (reacción ácido-base, CO₂, reactivos, productos) usarías para explicarlo?",
      ejemplos:"¿Dónde más se usa esta reacción en la vida cotidiana?"
    }
  },
];

// ═══════════════════════════════════════════════════════
// CONFIG — pega aquí tus credenciales
// ═══════════════════════════════════════════════════════
const cfg = {
  orKey:     "",   // no hardcodear — se carga desde el hash URL
  fbProject: "",
  fbKey:     "",
};

// Carga automática desde hash URL: #or=KEY&fbp=PROJECT_ID&fbk=WEB_API_KEY
(() => {
  try {
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (h.get("or"))  cfg.orKey     = h.get("or");
    if (h.get("fbp")) cfg.fbProject = h.get("fbp");
    if (h.get("fbk")) cfg.fbKey     = h.get("fbk");
  } catch {}
})();

// ═══════════════════════════════════════════════════════
// FIREBASE FIRESTORE REST HELPERS
// ═══════════════════════════════════════════════════════
const fsBase = () =>
  `https://firestore.googleapis.com/v1/projects/${cfg.fbProject}/databases/(default)/documents`;

// Convert flat JS object → Firestore fields (responses stored as JSON string)
const toFsFields = (data) => {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "boolean")       fields[k] = { booleanValue: v };
    else if (typeof v === "number")   fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (typeof v === "string")   fields[k] = { stringValue: v };
    else if (typeof v === "object")   fields[k] = { stringValue: JSON.stringify(v) };
  }
  return fields;
};

// Convert Firestore document → flat JS object
const fromFsDoc = (doc) => {
  if (!doc?.fields) return null;
  const s = {};
  for (const [k, fv] of Object.entries(doc.fields)) {
    if (fv.stringValue !== undefined)   s[k] = fv.stringValue;
    else if (fv.integerValue !== undefined) s[k] = parseInt(fv.integerValue);
    else if (fv.doubleValue !== undefined)  s[k] = fv.doubleValue;
    else if (fv.booleanValue !== undefined) s[k] = fv.booleanValue;
  }
  if (typeof s.responses === "string") {
    try { s.responses = JSON.parse(s.responses); } catch { s.responses = {}; }
  }
  return s;
};

const saveStudent = async (data) => {
  if (!cfg.fbProject || !cfg.fbKey) return false;
  try {
    const flat = { ...data, responses: JSON.stringify(data.responses || {}), updatedAt: Date.now() };
    const r = await fetch(
      `${fsBase()}/students/${data.id}?key=${cfg.fbKey}`,
      { method:"PATCH", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ fields: toFsFields(flat) }) }
    );
    return r.ok;
  } catch { return false; }
};

const loadAllStudents = async () => {
  if (!cfg.fbProject || !cfg.fbKey) return [];
  try {
    const r = await fetch(`${fsBase()}/students?key=${cfg.fbKey}&pageSize=200`);
    const data = await r.json();
    if (!data.documents) return [];
    return data.documents
      .map(fromFsDoc).filter(Boolean)
      .sort((a, b) => (a.registeredAt||0) - (b.registeredAt||0));
  } catch { return []; }
};

// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════
const genId = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const filledCount = (r) => FIELDS.filter(f => r?.[f.key]?.trim()).length;
const timeAgo = (ts) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  return m < 1 ? "ahora" : m < 60 ? `${m}m` : `${Math.floor(m/60)}h`;
};

const assembleText = (responses) =>
  TEXT_ORDER
    .map(({ key, pre }) => responses[key]?.trim() ? pre + responses[key].trim() : "")
    .join("").trim() + ".";

const stepColor = (step, submitted) => {
  if (submitted || step >= 4) return C.green;
  if (step >= 2) return C.amber;
  return C.teal;
};
const stepLabel = (step, submitted) =>
  submitted ? "Enviado ✓" : ["Registrado","Iniciado","Llenando plantilla","Redactando","Enviado ✓"][Math.min(step,4)];

// shared button style factory
const btn = (bg, fg="#fff", extra={}) => ({
  background:bg, color:fg, border:"none", borderRadius:8, padding:"10px 20px",
  cursor:"pointer", fontWeight:600, fontSize:14, ...extra
});

// ═══════════════════════════════════════════════════════
// OPENROUTER API
// ═══════════════════════════════════════════════════════
const OR_MODEL = "meta-llama/llama-3.3-70b-instruct";

const callAI = async (system, user, maxTokens=1000) => {
  if (!cfg.orKey.trim()) throw new Error("Falta la API key de OpenRouter");
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${cfg.orKey}`,
      "HTTP-Referer":"https://pucv.cl",
      "X-Title":"Argumentación Científica 2° Medio"
    },
    body:JSON.stringify({
      model:OR_MODEL, max_tokens:maxTokens,
      messages:[{ role:"system", content:system },{ role:"user", content:user }]
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
  return d.choices[0].message.content;
};

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function App() {
  const [mode, setMode] = useState(null);
  const [tAuthed, setTAuthed] = useState(false);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"system-ui,sans-serif", color:C.text }}>
      {!mode && <ModeSelector onSelect={setMode} />}
      {mode==="student" && <StudentApp onBack={()=>setMode(null)} />}
      {mode==="teacher" && (
        tAuthed
          ? <TeacherApp onBack={()=>{setMode(null);setTAuthed(false);}} />
          : <TeacherAuth onAuth={()=>setTAuthed(true)} onBack={()=>setMode(null)} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MODE SELECTOR
// ═══════════════════════════════════════════════════════
function ModeSelector({ onSelect }) {
  const [or,  setOr]  = useState(cfg.orKey);
  const [fbp, setFbp] = useState(cfg.fbProject);
  const [fbk, setFbk] = useState(cfg.fbKey);
  const [open, setOpen] = useState(!cfg.fbProject);

  const set = (k, v) => {
    if (k==="or")  { setOr(v);  cfg.orKey=v.trim(); }
    if (k==="fbp") { setFbp(v); cfg.fbProject=v.trim(); }
    if (k==="fbk") { setFbk(v); cfg.fbKey=v.trim(); }
  };

  const ok = cfg.orKey && cfg.fbProject && cfg.fbKey;
  const mono = { fontFamily:"monospace", fontSize:12 };
  const lbl = { fontSize:11, fontWeight:700, textTransform:"uppercase",
    letterSpacing:"0.05em", color:C.muted, marginBottom:4, display:"block" };

  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:32,gap:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:12 }}>⚗️</div>
        <h1 style={{ fontSize:28,fontWeight:800,color:C.navy,margin:0 }}>Argumentación Científica</h1>
        <p style={{ color:C.muted,margin:"8px 0 0",fontSize:15 }}>2° Medio · Ciencias Naturales · PUCV</p>
      </div>

      {/* Panel de configuración */}
      <div style={{ background:"white",border:`1px solid ${ok?C.green:C.amber}`,borderRadius:12,
        padding:"14px 18px",maxWidth:500,width:"100%",boxSizing:"border-box" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open?12:0 }}>
          <span style={{ fontSize:13,fontWeight:700,color:ok?C.green:C.amber }}>
            {ok?"✅ Listo para usar":"⚙️ Configuración requerida"}
          </span>
          <button onClick={()=>setOpen(!open)}
            style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12 }}>
            {open?"ocultar ▲":"editar ▼"}
          </button>
        </div>

        {open && (<>
          <div style={{ marginBottom:10 }}>
            <label style={lbl}>OpenRouter API Key</label>
            <input type="password" value={or} onChange={e=>set("or",e.target.value)}
              placeholder="sk-or-v1-..."
              style={{ width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,
                borderRadius:7,boxSizing:"border-box",outline:"none",...mono }} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <div>
              <label style={lbl}>Firebase Project ID</label>
              <input value={fbp} onChange={e=>set("fbp",e.target.value)}
                placeholder="mi-proyecto-abc"
                style={{ width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,
                  borderRadius:7,boxSizing:"border-box",outline:"none",...mono }} />
            </div>
            <div>
              <label style={lbl}>Firebase Web API Key</label>
              <input type="password" value={fbk} onChange={e=>set("fbk",e.target.value)}
                placeholder="AIzaSy..."
                style={{ width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,
                  borderRadius:7,boxSizing:"border-box",outline:"none",...mono }} />
            </div>
          </div>
          <div style={{ background:C.amberLight,borderRadius:7,padding:"8px 12px",fontSize:11 }}>
            💡 El docente comparte el link con las keys en el hash y los estudiantes no necesitan configurar nada:<br/>
            <code style={{ fontSize:10,wordBreak:"break-all" }}>
              #or=KEY&fbp=PROJECT_ID&fbk=WEB_API_KEY
            </code>
          </div>
        </>)}
      </div>
      <div style={{ display:"flex",gap:20,flexWrap:"wrap",justifyContent:"center" }}>
        {[
          { id:"student",emoji:"🎓",title:"Soy estudiante",desc:"Explorar el experimento\ny construir mi argumento",color:C.green },
          { id:"teacher",emoji:"👩‍🏫",title:"Soy docente",desc:"Guía interactiva, seguimiento\nde estudiantes y análisis IA",color:C.navy },
        ].map(({ id,emoji,title,desc,color }) => (
          <button key={id} onClick={()=>onSelect(id)} style={{
            background:"white", border:`2px solid ${color}`, borderRadius:16,
            padding:"32px 40px", cursor:"pointer", textAlign:"center", minWidth:220,
            boxShadow:"0 2px 12px rgba(0,0,0,0.07)", transition:"all 0.18s"
          }}
          onMouseEnter={e=>{e.currentTarget.style.background=color;e.currentTarget.querySelector("p").style.color="rgba(255,255,255,0.8)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.querySelector("p").style.color=C.muted;}}
          >
            <div style={{ fontSize:40,marginBottom:10 }}>{emoji}</div>
            <div style={{ fontSize:16,fontWeight:700,color,marginBottom:6 }}>{title}</div>
            <p style={{ fontSize:12,color:C.muted,margin:0,lineHeight:1.6,whiteSpace:"pre-line",transition:"color 0.18s" }}>{desc}</p>
          </button>
        ))}
      </div>

      <p style={{ fontSize:11,color:C.muted,marginTop:8,textAlign:"center" }}>
        Adaptado de Merino, Izquierdo & Arellano (2006) · Current Developments in Technology-Assisted Education
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TEACHER AUTH
// ═══════════════════════════════════════════════════════
function TeacherAuth({ onAuth, onBack }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (pin === TEACHER_PIN) onAuth();
    else { setErr("PIN incorrecto. Intenta de nuevo."); setPin(""); }
  };

  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24 }}>
      <div style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:12,padding:36,maxWidth:340,width:"100%",textAlign:"center" }}>
        <div style={{ fontSize:36,marginBottom:12 }}>🔑</div>
        <h2 style={{ fontSize:20,fontWeight:700,color:C.navy,margin:"0 0 6px" }}>Acceso Docente</h2>
        <p style={{ color:C.muted,fontSize:14,marginBottom:24 }}>Ingresa el PIN de acceso</p>
        <input
          type="password" value={pin} autoFocus
          onChange={e=>{setPin(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&submit()}
          placeholder="PIN"
          style={{ width:"100%",padding:"11px 14px",border:`1px solid ${err?C.danger:C.border}`,borderRadius:8,
            fontSize:16,textAlign:"center",boxSizing:"border-box",marginBottom:8,outline:"none" }}
        />
        {err && <p style={{ color:C.danger,fontSize:13,margin:"4px 0 8px" }}>{err}</p>}
        <button onClick={submit} style={{ ...btn(C.navy),width:"100%",padding:"12px",marginTop:6,marginBottom:12 }}>
          Entrar
        </button>
        <button onClick={onBack} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13 }}>
          ← Volver
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STUDENT APP
// ═══════════════════════════════════════════════════════
function StudentApp({ onBack }) {
  const [phase, setPhase] = useState("reg"); // reg | form | done
  const [student, setStudent] = useState(null);

  const handleRegister = async (data) => {
    const s = { id:genId(), ...data, step:1, responses:{}, submitted:false, registeredAt:Date.now() };
    setStudent(s);
    await saveStudent(s);
    setPhase("form");
  };

  const handleUpdate = async (responses, step) => {
    const u = { ...student, responses, step };
    setStudent(u);
    await saveStudent(u);
  };

  const handleSubmit = async (responses) => {
    const u = { ...student, responses, step:4, submitted:true, submittedAt:Date.now() };
    setStudent(u);
    await saveStudent(u);
    setPhase("done");
  };

  if (phase==="reg") return <StudentReg onRegister={handleRegister} onBack={onBack} />;
  if (phase==="form") return <ArgForm student={student} onUpdate={handleUpdate} onSubmit={handleSubmit} />;
  if (phase==="done") return <SubmittedView student={student} onBack={onBack} />;
}

function StudentReg({ onRegister, onBack }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [session, setSession] = useState("");
  const [expId, setExpId] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!name.trim()) return setErr("Ingresa tu nombre completo");
    if (!group) return setErr("Selecciona tu grupo");
    if (!session) return setErr("Selecciona la sesión");
    if (!expId) return setErr("Selecciona el experimento de la clase");
    onRegister({ name:name.trim(), group, session, experimentId:expId });
  };

  const input = { width:"100%",padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit" };
  const card = { background:"white",border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:14 };

  return (
    <div style={{ padding:20,maxWidth:600,margin:"0 auto" }}>
      <button onClick={onBack} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,marginBottom:14,padding:0 }}>← Volver</button>

      <div style={{ ...card,borderLeft:`4px solid ${C.green}` }}>
        <h1 style={{ fontSize:20,fontWeight:800,color:C.navy,margin:"0 0 4px" }}>🎓 Registro</h1>
        <p style={{ color:C.muted,fontSize:13,margin:0 }}>Completa tus datos para comenzar</p>
      </div>

      <div style={card}>
        <label style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:C.muted }}>
          Nombre completo
        </label>
        <input value={name} onChange={e=>{setName(e.target.value);setErr("");}}
          placeholder="Ej: María González" style={{ ...input,marginTop:6 }} />
      </div>

      <div style={card}>
        <label style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:C.muted }}>
          Grupo / Mesa
        </label>
        <div style={{ display:"flex",gap:8,marginTop:8,flexWrap:"wrap" }}>
          {GROUPS.map(g => (
            <button key={g} onClick={()=>{setGroup(g);setErr("");}} style={{
              padding:"7px 14px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",
              border:`2px solid ${group===g?C.navy:C.border}`,
              background:group===g?C.navy:"white", color:group===g?"white":C.text
            }}>Grupo {g}</button>
          ))}
        </div>
      </div>

      <div style={card}>
        <label style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:C.muted }}>
          Sesión de clase
        </label>
        <div style={{ display:"flex",gap:8,marginTop:8,flexWrap:"wrap" }}>
          {SESSIONS.map(s => (
            <button key={s} onClick={()=>{setSession(s);setErr("");}} style={{
              padding:"7px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",
              border:`2px solid ${session===s?C.teal:C.border}`,
              background:session===s?C.teal:"white", color:session===s?"white":C.text
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={card}>
        <label style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:C.muted }}>
          Experimento de la clase
        </label>
        <div style={{ marginTop:10,display:"flex",flexDirection:"column",gap:8 }}>
          {EXPERIMENTS.map(exp => (
            <button key={exp.id} onClick={()=>{setExpId(exp.id);setErr("");}} style={{
              display:"flex",alignItems:"center",gap:14,padding:"12px 14px",cursor:"pointer",textAlign:"left",
              border:`2px solid ${expId===exp.id?C.navy:C.border}`,borderRadius:10,
              background:expId===exp.id?"#EEF2FA":"white"
            }}>
              <span style={{ fontSize:26 }}>{exp.emoji}</span>
              <div>
                <div style={{ fontWeight:600,fontSize:14,color:expId===exp.id?C.navy:C.text }}>{exp.title}</div>
                <div style={{ fontSize:12,color:C.muted }}>{exp.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {err && <p style={{ color:C.danger,fontSize:13,marginBottom:8 }}>{err}</p>}
      <button onClick={submit} style={{ ...btn(C.green),width:"100%",padding:"13px",fontSize:15 }}>
        Comenzar actividad →
      </button>
    </div>
  );
}

function ArgForm({ student, onUpdate, onSubmit }) {
  const exp = EXPERIMENTS.find(e=>e.id===student.experimentId);
  const [resp, setResp] = useState(student.responses||{});
  const [fi, setFi] = useState(0); // field index
  const [showText, setShowText] = useState(false);
  const [aiFb, setAiFb] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const saveT = useRef(null);

  const fc = filledCount(resp);

  const updateField = (key, val) => {
    const u = { ...resp, [key]:val };
    setResp(u);
    if (saveT.current) clearTimeout(saveT.current);
    saveT.current = setTimeout(()=>{
      const step = fc>=6?3:fc>=2?2:1;
      onUpdate(u, step);
    }, 2000);
  };

  const getAI = async () => {
    if (fc<3) return;
    setLoadingAI(true);
    try {
      const system = `Eres profesor de química. Evalúa argumentos de estudiantes de 2° Medio según modelo de Toulmin (Sardà & Sanmartí, 2000).
Responde SOLO JSON válido sin markdown ni texto extra:
{"nivel":"Básico|Intermedio|Avanzado","estrellas":1-5,"fortaleza":"1-2 oraciones","mejora":"sugerencia concreta 1-2 oraciones","pregunta":"pregunta socrática"}`;
      const user = `Experimento: ${exp.title}\nTexto: "${assembleText(resp)}"\nCampos completados: ${fc}/8`;
      const raw = await callAI(system, user);
      setAiFb(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch(e) {
      setAiFb({nivel:"—",estrellas:0,fortaleza:e.message||"Error al obtener retroalimentación.",mejora:"Verifica la API key de OpenRouter en la pantalla de inicio.",pregunta:""});
    }
    setLoadingAI(false);
  };

  const f = FIELDS[fi];

  return (
    <div style={{ padding:20,maxWidth:720,margin:"0 auto" }}>
      {/* Header */}
      <div style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:14,display:"flex",gap:12,alignItems:"center" }}>
        <span style={{ fontSize:30 }}>{exp.emoji}</span>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:17,fontWeight:700,color:C.navy,margin:0 }}>{exp.title}</h1>
          <p style={{ color:C.muted,fontSize:12,margin:"2px 0 0" }}>{student.name} · Grupo {student.group} · {student.session}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11,color:C.muted }}>completado</div>
          <div style={{ fontSize:22,fontWeight:800,color:fc===8?C.green:C.amber }}>{fc}/8</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height:5,background:C.border,borderRadius:3,marginBottom:14,overflow:"hidden" }}>
        <div style={{ height:"100%",width:`${(fc/8)*100}%`,background:fc===8?C.green:C.navy,borderRadius:3,transition:"width 0.4s" }}/>
      </div>

      {/* Field tabs */}
      <div style={{ display:"flex",gap:4,marginBottom:12,flexWrap:"wrap" }}>
        {FIELDS.map((fd,i)=>(
          <button key={fd.key} onClick={()=>setFi(i)} style={{
            padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",fontWeight:600,
            border:`2px solid ${fi===i?fd.color:resp[fd.key]?.trim()?fd.color+"70":C.border}`,
            background:fi===i?fd.color:resp[fd.key]?.trim()?fd.color+"18":"white",
            color:fi===i?"white":fd.color
          }}>
            {fd.emoji} {resp[fd.key]?.trim()?"✓ ":""}{fd.role}
          </button>
        ))}
      </div>

      {/* Active field */}
      <div style={{ background:"white",border:`1px solid ${C.border}`,borderLeft:`4px solid ${f.color}`,borderRadius:12,padding:20,marginBottom:12 }}>
        <div style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:12 }}>
          <span style={{ fontSize:22 }}>{f.emoji}</span>
          <div>
            <div style={{ fontWeight:700,color:f.color,fontSize:14 }}>{f.role}</div>
            <div style={{ fontSize:14,color:C.text,marginTop:2 }}>{f.label}</div>
            <div style={{ fontSize:12,color:C.muted,marginTop:4,fontStyle:"italic" }}>{exp.scaffolding[f.key]}</div>
          </div>
        </div>
        <textarea
          value={resp[f.key]||""}
          onChange={e=>updateField(f.key,e.target.value)}
          placeholder="Escribe aquí tu respuesta…"
          style={{ width:"100%",minHeight:90,padding:"10px 12px",border:`1px solid ${C.border}`,borderRadius:8,
            fontSize:14,resize:"vertical",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}
        />
        <div style={{ display:"flex",justifyContent:"space-between",marginTop:10 }}>
          <button onClick={()=>setFi(Math.max(0,fi-1))} disabled={fi===0}
            style={{ ...btn("#E5E7EB",C.text),padding:"7px 14px",opacity:fi===0?0.4:1 }}>← Anterior</button>
          <button onClick={()=>setFi(Math.min(7,fi+1))} disabled={fi===7}
            style={{ ...btn(f.color),padding:"7px 14px",opacity:fi===7?0.4:1 }}>Siguiente →</button>
        </div>
      </div>

      {/* Preview toggle */}
      <button onClick={()=>setShowText(!showText)}
        style={{ ...btn("white",C.navy),border:`1px solid ${C.navy}`,width:"100%",marginBottom:10 }}>
        {showText?"▲ Ocultar":"▼ Ver"} texto argumentativo
      </button>

      {showText && (
        <div style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:12 }}>
          <h3 style={{ fontSize:14,fontWeight:700,marginBottom:10,color:C.navy }}>📝 Tu texto argumentativo</h3>
          {fc>0 ? (
            <p style={{ fontSize:14,lineHeight:1.9,margin:0 }}>
              {TEXT_ORDER.map(({key,pre})=>{
                const v=resp[key];
                if(!v?.trim()) return null;
                const fd=FIELDS.find(f=>f.key===key);
                return <span key={key}>
                  <span style={{ color:C.muted,fontSize:12 }}>{pre}</span>
                  <span style={{ color:fd.color,fontWeight:500 }}>{v}</span>
                </span>;
              })}
              {fc>0&&"."}
            </p>
          ) : <p style={{ color:C.muted,fontSize:13,fontStyle:"italic",margin:0 }}>Completa al menos un campo.</p>}

          {fc>=3 && (
            <div style={{ marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}` }}>
              <button onClick={getAI} disabled={loadingAI}
                style={{ ...btn(C.violet),padding:"8px 16px",fontSize:13 }}>
                {loadingAI?"⏳ Analizando…":"✨ Retroalimentación IA"}
              </button>
              {aiFb && (
                <div style={{ marginTop:12,padding:14,background:"#FAFAFA",borderRadius:8,border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:8 }}>
                    <span style={{ fontSize:16 }}>{"⭐".repeat(aiFb.estrellas)}</span>
                    <span style={{ fontWeight:700,color:C.navy,fontSize:13 }}>{aiFb.nivel}</span>
                  </div>
                  <p style={{ fontSize:13,color:C.green,margin:"0 0 6px" }}><strong>✓ Fortaleza:</strong> {aiFb.fortaleza}</p>
                  <p style={{ fontSize:13,color:C.amber,margin:"0 0 6px" }}><strong>→ Mejora:</strong> {aiFb.mejora}</p>
                  {aiFb.pregunta&&<p style={{ fontSize:13,color:C.violet,margin:0 }}><strong>💭 Para pensar:</strong> {aiFb.pregunta}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={()=>onSubmit(resp)}
        disabled={fc<5}
        style={{ ...btn(fc>=5?C.green:"#9CA3AF"),width:"100%",padding:"13px",fontSize:15 }}>
        {fc<5?`Completa ${5-fc} campo(s) más para enviar`:"✓ Enviar al docente"}
      </button>
    </div>
  );
}

function SubmittedView({ student, onBack }) {
  const exp = EXPERIMENTS.find(e=>e.id===student.experimentId);
  const fc = filledCount(student.responses);
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24 }}>
      <div style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:12,padding:36,maxWidth:460,width:"100%",textAlign:"center" }}>
        <div style={{ fontSize:56,marginBottom:14 }}>🎉</div>
        <h1 style={{ fontSize:22,fontWeight:800,color:C.green,margin:"0 0 8px" }}>¡Argumento enviado!</h1>
        <p style={{ color:C.muted,fontSize:14,marginBottom:20,lineHeight:1.6 }}>
          Tu trabajo sobre <strong>{exp.title}</strong> fue registrado.<br/>Tu docente puede verlo en tiempo real.
        </p>
        <div style={{ display:"flex",gap:20,justifyContent:"center",marginBottom:24 }}>
          <div><div style={{ fontSize:22,fontWeight:800,color:C.navy }}>{fc}</div><div style={{ fontSize:11,color:C.muted }}>campos completados</div></div>
          <div><div style={{ fontSize:22,fontWeight:800,color:C.green }}>{student.group}</div><div style={{ fontSize:11,color:C.muted }}>grupo</div></div>
          <div><div style={{ fontSize:22,fontWeight:800,color:C.teal }}>{student.session?.replace("Sesión ","S")}</div><div style={{ fontSize:11,color:C.muted }}>sesión</div></div>
        </div>
        <button onClick={onBack} style={{ ...btn(C.navy) }}>Volver al inicio</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TEACHER APP
// ═══════════════════════════════════════════════════════
function TeacherApp({ onBack }) {
  const [tab, setTab] = useState("guide");
  const [expId, setExpId] = useState(EXPERIMENTS[0].id);
  const [sessionFilter, setSessionFilter] = useState("Todas");
  const [students, setStudents] = useState([]);
  const pollRef = useRef(null);

  const fetchAll = useCallback(async () => { setStudents(await loadAllStudents()); }, []);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  const exp = EXPERIMENTS.find(e=>e.id===expId);
  const expStudents = students.filter(s=>s.experimentId===expId);
  const filtered = sessionFilter==="Todas" ? expStudents : expStudents.filter(s=>s.session===sessionFilter);
  const totalSubmitted = expStudents.filter(s=>s.submitted).length;

  const tabStyle = (id) => ({
    padding:"11px 18px",border:"none",background:"none",cursor:"pointer",fontSize:14,
    borderBottom:`3px solid ${tab===id?C.navy:"transparent"}`,
    color:tab===id?C.navy:C.muted,fontWeight:tab===id?700:400
  });

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column" }}>
      {/* Top bar */}
      <div style={{ background:C.navyDark,color:"white",padding:"10px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.65)",cursor:"pointer",fontSize:13 }}>← Salir</button>
        <span style={{ fontWeight:700,fontSize:15 }}>👩‍🏫 Panel Docente</span>
        <div style={{ flex:1 }}/>
        <select value={expId} onChange={e=>setExpId(e.target.value)}
          style={{ padding:"6px 10px",borderRadius:6,fontSize:13,border:"none",background:"rgba(255,255,255,0.15)",color:"white",cursor:"pointer" }}>
          {EXPERIMENTS.map(ex=><option key={ex.id} value={ex.id} style={{ background:C.navyDark }}>{ex.emoji} {ex.title}</option>)}
        </select>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <div style={{ width:8,height:8,borderRadius:"50%",background:"#4ADE80",animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:12,color:"rgba(255,255,255,0.7)" }}>{expStudents.length} estudiante(s) · {totalSubmitted} enviado(s)</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"white",borderBottom:`1px solid ${C.border}`,padding:"0 20px",display:"flex",gap:0 }}>
        {[["guide","📋 Guía"],["tracking","👥 Seguimiento"],["analysis","🤖 Análisis IA"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={tabStyle(id)}>{label}</button>
        ))}
        <div style={{ flex:1 }}/>
        {tab==="tracking"&&(
          <select value={sessionFilter} onChange={e=>setSessionFilter(e.target.value)}
            style={{ padding:"6px 10px",fontSize:12,border:`1px solid ${C.border}`,borderRadius:6,margin:"8px 0",color:C.text,cursor:"pointer" }}>
            <option>Todas</option>
            {SESSIONS.map(s=><option key={s}>{s}</option>)}
          </select>
        )}
        <button onClick={fetchAll} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:"0 12px" }}>🔄</button>
      </div>

      {/* Content */}
      <div style={{ flex:1,padding:20,maxWidth:920,width:"100%",margin:"0 auto",boxSizing:"border-box" }}>
        {tab==="guide"    && <GuideTab exp={exp} />}
        {tab==="tracking" && <TrackingTab students={filtered} allStudents={expStudents} sessionFilter={sessionFilter} />}
        {tab==="analysis" && <AnalysisTab students={expStudents} filtered={filtered} exp={exp} sessionFilter={sessionFilter} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GUIDE TAB
// ═══════════════════════════════════════════════════════
function GuideTab({ exp }) {
  const [done, setDone] = useState(new Set());
  const [expanded, setExpanded] = useState(0);

  const toggleDone = (id) => setDone(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });

  return (
    <div>
      {/* Overview card */}
      <div style={{ background:"white",border:`1px solid ${C.border}`,borderLeft:`4px solid ${C.navy}`,borderRadius:12,padding:20,marginBottom:18 }}>
        <div style={{ display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap" }}>
          <span style={{ fontSize:38 }}>{exp.emoji}</span>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:20,fontWeight:800,color:C.navy,margin:"0 0 4px" }}>{exp.title}</h2>
            <p style={{ color:C.muted,fontSize:13,margin:"0 0 6px" }}>{exp.subtitle} · ⏱ {exp.duration}</p>
            <p style={{ fontSize:12,color:C.green,margin:0 }}>{exp.oa}</p>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16,flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:C.muted,marginBottom:6,textTransform:"uppercase" }}>Materiales</div>
            {exp.materials.map((m,i)=><div key={i} style={{ fontSize:13,marginBottom:3 }}>• {m}</div>)}
          </div>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:C.muted,marginBottom:6,textTransform:"uppercase" }}>Seguridad</div>
            <p style={{ fontSize:13,color:C.danger,margin:0,lineHeight:1.6 }}>{exp.safety}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:16 }}>
        <span style={{ fontSize:12,color:C.muted,whiteSpace:"nowrap" }}>Progreso de la sesión:</span>
        <div style={{ flex:1,height:7,background:C.border,borderRadius:4,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${(done.size/exp.guide_steps.length)*100}%`,background:C.green,borderRadius:4,transition:"width 0.4s" }}/>
        </div>
        <span style={{ fontSize:12,color:C.muted,whiteSpace:"nowrap" }}>{done.size}/{exp.guide_steps.length} pasos</span>
      </div>

      {/* Steps */}
      {exp.guide_steps.map((step,idx)=>{
        const isDone=done.has(step.id);
        const isOpen=expanded===idx;
        return (
          <div key={step.id} style={{ background:"white",border:`1px solid ${C.border}`,borderLeft:`4px solid ${isDone?C.green:isOpen?C.navy:C.border}`,borderRadius:12,marginBottom:10,opacity:isDone?0.78:1 }}>
            <div onClick={()=>setExpanded(isOpen?-1:idx)} style={{ display:"flex",alignItems:"center",gap:12,padding:16,cursor:"pointer" }}>
              <div style={{ width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                background:isDone?C.green:isOpen?C.navy:C.border,
                color:isDone||isOpen?"white":C.muted,fontWeight:700,fontSize:14 }}>
                {isDone?"✓":idx+1}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11,color:C.muted,textTransform:"uppercase",marginBottom:2 }}>{step.phase} · {step.duration}</div>
                <div style={{ fontWeight:600,fontSize:14,color:isDone?C.muted:C.text }}>{step.title}</div>
              </div>
              <span style={{ color:C.muted,fontSize:12 }}>{isOpen?"▲":"▼"}</span>
            </div>

            {isOpen && (
              <div style={{ padding:"0 16px 16px" }}>
                <div style={{ height:1,background:C.border,marginBottom:14 }}/>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:11,fontWeight:700,color:C.navy,marginBottom:6,textTransform:"uppercase" }}>📝 Nota del docente</div>
                    <p style={{ fontSize:13,color:C.text,margin:0,lineHeight:1.65 }}>{step.teacher_notes}</p>
                  </div>
                  <div>
                    <div style={{ fontSize:11,fontWeight:700,color:C.green,marginBottom:6,textTransform:"uppercase" }}>🎓 Tarea del estudiante</div>
                    <p style={{ fontSize:13,color:C.text,margin:0,lineHeight:1.65 }}>{step.student_task}</p>
                  </div>
                </div>
                {step.tips?.length>0&&(
                  <div style={{ background:C.amberLight,borderRadius:8,padding:12,marginBottom:12 }}>
                    <div style={{ fontSize:11,fontWeight:700,color:C.amber,marginBottom:6 }}>💡 TIPS</div>
                    {step.tips.map((t,i)=><p key={i} style={{ fontSize:13,margin:"0 0 4px" }}>• {t}</p>)}
                  </div>
                )}
                <button onClick={()=>{toggleDone(step.id);if(!isDone)setExpanded(Math.min(idx+1,exp.guide_steps.length-1));}}
                  style={{ ...btn(isDone?"#E5E7EB":C.green,isDone?C.text:"white"),padding:"8px 16px",fontSize:13 }}>
                  {isDone?"↩ Marcar como pendiente":"✓ Paso completado"}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Misconceptions */}
      <div style={{ background:C.dangerLight,border:`1px solid ${C.danger}30`,borderRadius:12,padding:20,marginTop:18 }}>
        <h3 style={{ fontSize:14,fontWeight:700,color:C.danger,marginBottom:12 }}>⚠️ Concepciones alternativas frecuentes</h3>
        {exp.common_misconceptions.map((m,i)=>(
          <div key={i} style={{ display:"flex",gap:8,marginBottom:8 }}>
            <span style={{ color:C.danger,fontWeight:700,flexShrink:0 }}>→</span>
            <span style={{ fontSize:13 }}>{m}</span>
          </div>
        ))}
        <div style={{ marginTop:12,paddingTop:12,borderTop:`1px solid ${C.danger}30` }}>
          <div style={{ fontSize:11,fontWeight:700,color:C.green,marginBottom:4 }}>CONCLUSIÓN ESPERADA</div>
          <p style={{ fontSize:13,color:C.text,margin:0,fontStyle:"italic" }}>"{exp.expected_conclusion}"</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TRACKING TAB
// ═══════════════════════════════════════════════════════
function TrackingTab({ students, allStudents, sessionFilter }) {
  const groups = GROUPS.filter(g=>students.some(s=>s.group===g));

  const stats = {
    total: students.length,
    submitted: students.filter(s=>s.submitted).length,
    inProgress: students.filter(s=>!s.submitted&&s.step>=2).length,
    registered: students.filter(s=>s.step<=1).length,
  };

  if (students.length===0) return (
    <div style={{ textAlign:"center",padding:60,color:C.muted }}>
      <div style={{ fontSize:48,marginBottom:14 }}>⏳</div>
      <p style={{ fontSize:16 }}>Esperando que los estudiantes se registren{sessionFilter!=="Todas"?` en ${sessionFilter}`:""}…</p>
    </div>
  );

  return (
    <div>
      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
        {[
          {label:"Total",value:stats.total,color:C.navy},
          {label:"Registrados",value:stats.registered,color:C.teal},
          {label:"En progreso",value:stats.inProgress,color:C.amber},
          {label:"Enviados",value:stats.submitted,color:C.green},
        ].map(({label,value,color})=>(
          <div key={label} style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center" }}>
            <div style={{ fontSize:24,fontWeight:800,color }}>{value}</div>
            <div style={{ fontSize:11,color:C.muted }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Field legend */}
      <div style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
        <span style={{ fontSize:11,fontWeight:700,color:C.muted }}>CAMPOS:</span>
        {FIELDS.map(f=>(
          <span key={f.key} style={{ display:"flex",alignItems:"center",gap:4 }}>
            <span style={{ width:10,height:10,borderRadius:"50%",background:f.color,display:"inline-block" }}/>
            <span style={{ fontSize:11,color:C.muted }}>{f.role}</span>
          </span>
        ))}
      </div>

      {/* By group */}
      {groups.map(g=>{
        const gs=students.filter(s=>s.group===g);
        return (
          <div key={g} style={{ marginBottom:20 }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:C.navy,marginBottom:10 }}>
              Grupo {g} <span style={{ fontWeight:400,color:C.muted,fontSize:13 }}>({gs.length} estudiante{gs.length!==1?"s":""})</span>
            </h3>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:10 }}>
              {gs.map(s=>{
                const sc=stepColor(s.step,s.submitted);
                const fc2=filledCount(s.responses);
                return (
                  <div key={s.id} style={{ background:"white",border:`2px solid ${sc}`,borderRadius:10,padding:12,boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontWeight:700,fontSize:13,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.name}</div>
                    <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>{s.session}</div>
                    <div style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:11,
                      background:`${sc}20`,color:sc,borderRadius:12,padding:"2px 8px",fontWeight:600,marginBottom:8 }}>
                      {stepLabel(s.step,s.submitted)}
                    </div>
                    <div style={{ display:"flex",gap:3,flexWrap:"wrap",marginBottom:6 }}>
                      {FIELDS.map(f=>(
                        <div key={f.key} title={f.role} style={{ width:11,height:11,borderRadius:"50%",
                          background:s.responses?.[f.key]?.trim()?f.color:"#E5E7EB" }}/>
                      ))}
                    </div>
                    <div style={{ fontSize:11,color:C.muted }}>{fc2}/8 campos{s.updatedAt?` · ${timeAgo(s.updatedAt)}`:""}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ANALYSIS TAB
// ═══════════════════════════════════════════════════════
function AnalysisTab({ students, filtered, exp, sessionFilter }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submitted = students.filter(s=>s.submitted);
  const withResponses = students.filter(s=>s.responses?.yo_creo?.trim());

  const generate = async () => {
    if (students.length===0) return;
    setLoading(true); setErr("");
    const payload = students.map(s=>({
      nombre:s.name, grupo:s.group, sesion:s.session, enviado:s.submitted,
      yo_creo:s.responses?.yo_creo||"",
      evidencias:s.responses?.evidencias||"",
      en_contra:s.responses?.en_contra||"",
      palabras_profesor:s.responses?.palabras_profesor||"",
    })).filter(s=>s.yo_creo||s.evidencias);

    try {
      const system = `Eres experto en didáctica de las ciencias. Analiza respuestas de estudiantes de 2° Medio y genera reporte PARA EL DOCENTE en JSON válido sin markdown ni texto extra:
{
  "concurrencias":["3-5 ideas o patrones que aparecen en múltiples estudiantes, 1 oración c/u"],
  "concepciones_alternativas":["2-4 errores conceptuales detectados, 1 oración c/u"],
  "fortalezas":["2-3 aspectos positivos del grupo, 1 oración c/u"],
  "distribucion":{"bien_argumentado":0,"parcialmente":0,"necesita_apoyo":0},
  "preguntas_discusion":["3 preguntas concretas para puesta en común productiva"],
  "recomendacion":"párrafo breve con la acción pedagógica más urgente para el docente"
}`;
      const user = `Experimento: ${exp.title}
Conclusión esperada: ${exp.expected_conclusion}
Concepciones alternativas conocidas: ${exp.common_misconceptions.join("; ")}
Filtro: ${sessionFilter}

Respuestas (${payload.length} estudiantes):
${JSON.stringify(payload,null,2)}`;
      const raw = await callAI(system, user, 1200);
      setReport(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch(e) { setErr(`No se pudo generar el análisis: ${e.message||"verifica la API key de OpenRouter y reintenta."}`); }
    setLoading(false);
  };

  if (students.length===0) return (
    <div style={{ textAlign:"center",padding:60,color:C.muted }}>
      <div style={{ fontSize:48,marginBottom:14 }}>📊</div>
      <p>El análisis estará disponible cuando haya estudiantes registrados.</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:16 }}>
        <div style={{ display:"flex",gap:16,alignItems:"center",flexWrap:"wrap" }}>
          <div>
            <h2 style={{ fontSize:18,fontWeight:800,color:C.navy,margin:"0 0 4px" }}>🤖 Análisis de concurrencias</h2>
            <p style={{ color:C.muted,fontSize:13,margin:0 }}>
              {students.length} estudiante(s) · {submitted.length} enviado(s) · {withResponses.length} con predicción inicial
              {sessionFilter!=="Todas"?` · ${sessionFilter}`:""}
            </p>
          </div>
          <div style={{ flex:1 }}/>
          <button onClick={generate} disabled={loading}
            style={{ ...btn(C.violet),padding:"10px 18px" }}>
            {loading?"⏳ Analizando…":report?"🔄 Actualizar":"✨ Generar análisis"}
          </button>
        </div>
        {err&&<p style={{ color:C.danger,fontSize:13,marginTop:8 }}>{err}</p>}
      </div>

      {/* Quick: yo_creo */}
      <div style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:14 }}>
        <h3 style={{ fontSize:14,fontWeight:700,color:C.navy,marginBottom:12 }}>
          💡 Predicciones iniciales — "Yo creo que…" ({withResponses.length}/{students.length})
        </h3>
        {withResponses.length===0
          ? <p style={{ color:C.muted,fontSize:13,fontStyle:"italic" }}>Aún sin respuestas</p>
          : withResponses.map(s=>(
            <div key={s.id} style={{ display:"flex",gap:8,marginBottom:8,alignItems:"flex-start" }}>
              <span style={{ fontSize:11,fontWeight:700,color:"white",background:C.navy,borderRadius:12,padding:"2px 8px",whiteSpace:"nowrap",flexShrink:0 }}>
                {s.group}·{s.name.split(" ")[0]}
              </span>
              <span style={{ fontSize:13,color:C.text }}>{s.responses.yo_creo}</span>
            </div>
          ))
        }
      </div>

      {/* Report */}
      {report && (<>
        <div style={{ background:"white",border:`1px solid ${C.border}`,borderLeft:`4px solid ${C.navy}`,borderRadius:12,padding:18,marginBottom:12 }}>
          <h3 style={{ fontSize:14,fontWeight:700,color:C.navy,marginBottom:12 }}>🔄 Concurrencias y patrones</h3>
          {report.concurrencias.map((c,i)=>(
            <div key={i} style={{ display:"flex",gap:8,marginBottom:8 }}>
              <span style={{ color:C.navy,fontWeight:700,minWidth:20 }}>{i+1}.</span>
              <span style={{ fontSize:13 }}>{c}</span>
            </div>
          ))}
        </div>

        <div style={{ background:C.dangerLight,border:`1px solid ${C.danger}30`,borderLeft:`4px solid ${C.danger}`,borderRadius:12,padding:18,marginBottom:12 }}>
          <h3 style={{ fontSize:14,fontWeight:700,color:C.danger,marginBottom:12 }}>⚠️ Concepciones alternativas detectadas</h3>
          {report.concepciones_alternativas.map((c,i)=>(
            <div key={i} style={{ display:"flex",gap:8,marginBottom:8 }}>
              <span style={{ color:C.danger,fontWeight:700 }}>→</span>
              <span style={{ fontSize:13 }}>{c}</span>
            </div>
          ))}
        </div>

        <div style={{ background:C.greenLight,border:`1px solid ${C.green}30`,borderLeft:`4px solid ${C.green}`,borderRadius:12,padding:18,marginBottom:12 }}>
          <h3 style={{ fontSize:14,fontWeight:700,color:C.green,marginBottom:12 }}>✅ Fortalezas del grupo</h3>
          {report.fortalezas.map((f,i)=>(
            <div key={i} style={{ display:"flex",gap:8,marginBottom:8 }}>
              <span style={{ color:C.green,fontWeight:700 }}>✓</span>
              <span style={{ fontSize:13 }}>{f}</span>
            </div>
          ))}
        </div>

        {report.distribucion && (
          <div style={{ background:"white",border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:12 }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:C.navy,marginBottom:12 }}>📊 Distribución de argumentación</h3>
            <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
              {[
                {label:"Bien argumentado",val:report.distribucion.bien_argumentado,color:C.green},
                {label:"Parcialmente",val:report.distribucion.parcialmente,color:C.amber},
                {label:"Necesita apoyo",val:report.distribucion.necesita_apoyo,color:C.danger},
              ].map(({label,val,color})=>(
                <div key={label} style={{ flex:1,minWidth:120,textAlign:"center",padding:"12px 8px",background:`${color}10`,borderRadius:8,border:`1px solid ${color}30` }}>
                  <div style={{ fontSize:22,fontWeight:800,color }}>{val}</div>
                  <div style={{ fontSize:11,color:C.muted }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background:C.violetLight,border:`1px solid ${C.violet}20`,borderRadius:12,padding:18,marginBottom:12 }}>
          <h3 style={{ fontSize:14,fontWeight:700,color:C.violet,marginBottom:12 }}>💬 Preguntas para la puesta en común</h3>
          {report.preguntas_discusion.map((q,i)=>(
            <div key={i} style={{ display:"flex",gap:8,marginBottom:10,padding:"10px 12px",background:"white",borderRadius:8 }}>
              <span style={{ color:C.violet,fontWeight:700,flexShrink:0 }}>Q{i+1}</span>
              <span style={{ fontSize:13 }}>{q}</span>
            </div>
          ))}
        </div>

        <div style={{ background:C.amberLight,border:`1px solid ${C.amber}30`,borderLeft:`4px solid ${C.amber}`,borderRadius:12,padding:18 }}>
          <h3 style={{ fontSize:14,fontWeight:700,color:C.amber,marginBottom:8 }}>📌 Recomendación pedagógica</h3>
          <p style={{ fontSize:13,color:C.text,margin:0,lineHeight:1.75 }}>{report.recomendacion}</p>
        </div>
      </>)}
    </div>
  );
}
