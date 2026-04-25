# METHODOLOGY_CONTEXT_RULES.md

## Propósito
Formalizar que, para el `product-agent` IMSS, la unidad principal de contexto operativo ya no es el auditor individual, sino la **metodología**.

Este documento aterriza la Fase 2 del plan de evolución del agente.

---

## 1. Regla central
La unidad principal de contexto para documentar procedimientos IMSS es la **metodología**.

El auditor individual sigue siendo importante como fuente, variante o ejecutor, pero el contexto base que el agente debe cargar, leer y mantener es la metodología.

---

## 2. Qué representa una carpeta de metodología
Dentro de `01 - Pruebas IMSS/`, cada carpeta raíz de esta capa representa una metodología operativa.

Ejemplos válidos:
- `RCM Mazatlán`
- `RCM Mérida`
- `RSM Mérida`
- `RSM Mérida Metodología 1`
- `RSM Mérida Metodología 2`

Una carpeta de metodología puede estar nombrada por oficina, firma o combinación de ambas, siempre que en la práctica represente una forma consistente de ejecutar procedimientos.

---

## 3. Relación entre metodología y auditor
- Puede haber varios auditores bajo la misma metodología.
- Si varios auditores siguen la misma metodología, el contexto base y el SOP base siguen siendo comunes.
- Las diferencias entre auditores deben registrarse como variantes, ejemplos, notas de ejecución o SOPs por auditor cuando aplique.
- El agente no debe arrancar desde cero por cada auditor si ya existe contexto previo de la metodología.

---

## 4. Qué debe identificar el agente antes de levantar un SOP
Antes de documentar un procedimiento nuevo, el agente debe identificar explícitamente:

1. cuál es la metodología correcta,
2. cuál es la carpeta correcta dentro de `01 - Pruebas IMSS`,
3. si ya existen SOPs previos de esa metodología,
4. si el procedimiento ya fue documentado parcial o indirectamente,
5. qué auditores previos pertenecen a esa misma metodología.

Si la metodología no está clara, el agente debe aclararla antes de tratar el procedimiento como una pieza aislada.

---

## 5. Orden de prioridad contextual
Cuando exista tensión entre auditor y metodología, el orden de prioridad para cargar contexto es:

1. contexto global del dictamen IMSS,
2. contexto de la metodología,
3. contexto del procedimiento/prueba específica,
4. contexto del auditor individual.

Esto significa que el auditor se interpreta dentro de la metodología, no al revés.

---

## 6. Implicaciones operativas
El agente debe asumir lo siguiente:

- una entrevista nueva no empieza en blanco si ya existe una metodología documentada,
- los SOPs previos de esa metodología son contexto obligatorio,
- el objetivo es reconstruir la cadena de procedimientos de la metodología completa,
- y el auditor individual ayuda a completar, confirmar o variar esa metodología.

---

## 7. Qué NO debe hacer el agente
El agente no debe:

- tratar cada auditor como una metodología nueva sin evidencia,
- duplicar SOPs base solo por cambiar de persona,
- ignorar SOPs previos de la metodología por centrarse solo en el auditor actual,
- ni colapsar variantes individuales sin dejar rastro.

---

## 8. Relación con Fase 3
Esta regla no sustituye la lectura previa contextual. La prepara.

La Fase 2 establece **qué contexto manda**.
La Fase 3 establecerá **qué debe leerse y en qué orden antes de cada entrevista o levantamiento**.

---

## 9. Uso esperado
Este documento debe ser leído por el `product-agent` cuando:

- se definan reglas operativas del sistema,
- se preparen cambios a la lógica de entrevistas,
- se vaya a documentar un procedimiento nuevo,
- o exista duda sobre si el contexto principal debe ser el auditor o la metodología.
