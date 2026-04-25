# ORIGEN_DE_DATOS_Y_RELACIONES.md

## Propósito
Definir cómo debe razonar el `product-agent` IMSS sobre el origen de los datos cuando el auditor menciona documentos, Excels, papeles de trabajo o outputs previos.

La meta es que el agente pueda seguir la cadena de información hacia atrás hasta llegar, cuando sea posible, a la raw data o a una fuente externa base suficientemente clara.

---

## 1. Principio general
Cuando el auditor menciona un documento, no basta con registrar que "sale de un Excel".

El agente debe tratar de entender:
- quién entrega ese Excel,
- quién lo arma,
- con qué información se alimenta,
- si esa información viene del cliente o de otro procedimiento,
- y cuál es la fuente base más cercana que puede identificarse con suficiente claridad.

---

## 2. Regla de rastreo hacia atrás
El agente debe seguir esta lógica:

### Paso 1. Identificar el documento actual
Preguntar o inferir:
- qué documento es,
- quién lo usa,
- qué rol cumple,
- y si es input o output del procedimiento actual.

### Paso 2. Preguntar por su alimentación
Cuando el auditor diga que algo sale de un Excel o papel de trabajo, tratar de aclarar:
- ¿ese Excel lo pasa el cliente?
- ¿o ese Excel lo arman ustedes?

### Paso 3. Clasificar el origen inmediato
#### Si lo pasa el cliente
Tratarlo como:
- raw data,
- fuente externa base,
- o input primario.

#### Si lo arman ellos
Entonces el agente debe asumir que todavía no llegó al origen real.
Debe preguntar:
- ¿con qué información se arma?
- ¿esa información vino del cliente?
- ¿vino de otro Excel o procedimiento previo?
- ¿ese papel ya existía o se genera aquí?

### Paso 4. Seguir la cadena hacia atrás
Si el documento actual depende de otro Excel o procedimiento previo, repetir la misma lógica hasta llegar a:
- raw data del cliente,
- fuente externa base,
- o un punto suficientemente claro para seguir documentando sin inventar.

---

## 3. Tipos de origen
### 3.1 Origen primario
La información viene directamente de:
- archivo del cliente,
- documento externo,
- fuente base recibida por el auditor.

### 3.2 Origen secundario
La información viene de:
- Excel armado por el auditor,
- output de un procedimiento previo,
- documento derivado ya existente.

### 3.3 Origen transformado
La información ya pasó por una o más transformaciones y el documento actual ya no representa raw data, sino una capa trabajada o consolidada.

---

## 4. Qué sí se le pregunta al auditor
El auditor normalmente sí puede ayudar a aclarar:
- qué documentos usa,
- quién se los entrega,
- cómo alimenta su Excel,
- si ese Excel ya existía,
- si viene de otro papel de trabajo,
- y qué procedimiento hace antes o después.

---

## 5. Qué no se le debe exigir al auditor
El auditor no necesariamente sabe explicar:
- tablas internas,
- modelos de base de datos,
- nombres de estructuras intermedias,
- diseño interno del sistema,
- o abstracciones de reuso técnico.

Esa traducción la hace el sistema.

---

## 6. Niveles de certeza sobre el origen
Cada origen debería registrarse, cuando sea posible, con uno de estos niveles:
- claro,
- parcialmente claro,
- inferido con alta confianza,
- inferido con baja confianza,
- pendiente de confirmar.

---

## 7. Reuso y relación entre procedimientos
Cuando el origen venga de un procedimiento previo, el agente debe intentar registrar:
- qué procedimiento lo generó,
- qué output produjo,
- qué parte de ese output consume el procedimiento actual,
- y si el reuso es total, parcial o incierto.

---

## 8. Regla práctica de entrevista
Si el auditor responde algo como:
- "sale de un Excel"
- "lo bajamos de un archivo"
- "de ahí lo jalamos"

Eso no debe darse por suficiente automáticamente.

El agente debe tratar de aclarar si ese Excel o archivo:
1. vino del cliente,
2. fue armado por el auditor,
3. viene de otro procedimiento,
4. o ya era un output intermedio existente.

---

## 9. Uso esperado en el sistema
Esta lógica debe alimentar:
- el SOP,
- la clasificación documental,
- el inventario de documentos y tablas por metodología,
- el mapa de transformaciones y reuso,
- y después la matriz conceptual-operacional.

---

## 10. Regla de prudencia
Si después de preguntar e inferir razonablemente el origen sigue sin quedar claro:
- no inventar,
- no colapsar la cadena,
- dejar el origen como pendiente,
- y seguir documentando el resto del procedimiento con esa incertidumbre explícita.
