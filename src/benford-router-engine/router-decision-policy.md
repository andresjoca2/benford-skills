# Router Decision Policy

## Proposito
Definir la politica simple que debe usar el Router Engine para revisar una `PROP-*` antes de que pueda pasar a Canonical Editor.

El Router tiene dos responsabilidades:

1. Revisar si la PROP genera incongruencias relevantes contra el resto del vault.
2. Rutear la PROP a la cola correcta.

Esta politica no busca volver al Router un juez auditor profundo. Su trabajo es hacer una revision general, trazable y conservadora, suficiente para decidir si la PROP puede avanzar sola o si debe pedir intervencion humana.

## Principio central
Una PROP debe avanzar sola cuando el cambio propuesto es claro, atomico, trazable y no contradice el conocimiento canonico relacionado.

Una PROP debe frenarse cuando existe una duda sustantiva que un humano debe resolver antes de imprimir en canonicos.

Los problemas tecnicos o de forma deben tratarse como correcciones de PROP, no como decisiones auditoras humanas.

## Revision general del vault
Antes de rutear, el Router debe formar un overview con los documentos del vault que tengan relacion directa con la PROP.

Debe revisar, cuando existan:

- el target canonico declarado;
- canonicos relacionados mencionados en la PROP;
- documentos o drafts usados como fuente;
- contribution origen;
- indices o mapas del vault que relacionen AIM, DICT, DOC, METH o TEST;
- canonicos con slug similar al target propuesto.

Esta revision no necesita ser exhaustiva en todo el vault. Debe enfocarse en detectar incongruencias obvias o riesgos de imprimir algo incorrecto.

## Preguntas minimas del overview
El Router debe poder responder:

| Pregunta | Si la respuesta es problematica |
|---|---|
| Existe ya un canonico equivalente? | Frenar si la PROP propone crear duplicado o no explica la diferencia. |
| El target declarado corresponde al tipo de PROP? | Frenar si parece clasificacion incorrecta. |
| Los canonicos relacionados solo son contexto o tambien se modifican? | Frenar solo si la PROP intenta modificar varios canonicos a la vez. |
| La evidencia fuente existe y se puede ubicar? | Corregir/rewrite si es problema de ruta; frenar si la evidencia realmente falta. |
| La PROP imprime como hecho algo marcado como pendiente? | Frenar si convierte una duda en canon. |
| Hay contradiccion con un canonico vigente? | Frenar para decision humana. |
| El cambio es atomico? | Corregir/rewrite si mezcla cambios separables. |

## Criterios para pasar sola
La PROP puede pasar a `03 Approved for Editor` si cumple todo:

- tiene metadata minima y campos de routing completos;
- tiene target canonico claro;
- el cambio es atomico;
- la evidencia minima existe o se puede resolver de forma clara;
- no declara contradiccion canonica;
- el overview no detecta canonico equivalente no considerado;
- los canonicos relacionados no son modificados por esta PROP;
- las dudas quedan como pendientes y no se imprimen como hechos;
- el riesgo es `low` o `medium`;
- no propone deprecacion, merge, rename o cambio de criterio auditor;
- `Requiere humano sugerido` no es `si`.

## Criterios para frenar con humano
La PROP debe ir a `02 Needs Human Decision` si ocurre cualquiera:

- contradice un canonico vigente;
- propone cambiar criterio auditor;
- propone agregar fundamento legal sin fuente primaria clara;
- propone deprecar, fusionar, renombrar o reemplazar un canonico;
- intenta modificar mas de un canonico como cambio real;
- existe un canonico equivalente y la diferencia no esta justificada;
- la evidencia existe pero su interpretacion es ambigua;
- imprime como hecho algo que la evidencia marca como pendiente;
- el riesgo es `high` o `unknown`;
- la propia PROP pide revision humana.

## Criterios para corregir la PROP
Estos casos no son decisiones humanas de auditoria. Deben tratarse como problemas de forma o de preparacion:

- rutas mal formateadas;
- rutas relativas que el Router no pudo resolver aunque el archivo exista;
- metadata incompleta;
- secciones requeridas ausentes;
- target path inconsistente con target ID;
- evidencia copiada en contribution pero referenciada con ruta legacy dificil de resolver;
- canonicos relacionados listados como contexto pero detectados erroneamente como impacto multi-canonico;
- mezcla de dos cambios que deberian separarse en dos PROPs.

Si el sistema solo permite dos colas, estos casos pueden ir temporalmente a `02 Needs Human Decision`, pero el `analysis_report.md` debe etiquetarlos como `rewrite/correccion tecnica`, no como decision auditora.

## Politica de evidencia
La evidencia debe evaluarse en dos niveles:

1. Existencia: el archivo o carpeta referenciada existe.
2. Suficiencia: la evidencia sostiene el cambio propuesto.

La existencia es un check tecnico. Si falla por resolucion de rutas, el Router debe intentar rutas alternativas antes de frenar:

- ruta absoluta;
- ruta relativa al vault root;
- ruta que empieza con `05 Benford Vault/`;
- ruta relativa a la contribution origen;
- ruta dentro de `materials/source_documents/`;
- ruta dentro de `skill_outputs/`.

Solo debe tratarse como evidencia faltante cuando no exista en ninguna ubicacion razonable.

## Politica de canonicos relacionados
No todo canonico mencionado es canonico afectado.

Un canonico relacionado es solo contexto cuando la PROP dice:

- pendiente;
- no validado;
- relacionado;
- referencia futura;
- no se propone crear/modificar en esta PROP.

Debe contar como impacto multi-canonico solo cuando la PROP propone crear, modificar, reemplazar, enlazar formalmente o deprecar mas de un canonico.

## Salida esperada del Router
El `analysis_report.md` debe separar:

- checks mecanicos;
- overview de documentos relacionados;
- incongruencias detectadas;
- riesgos aceptables;
- razones de ruteo;
- si el freno requiere humano o solo correccion tecnica.

El Router debe ser estricto, pero no debe usar humanos para resolver errores tecnicos propios como rutas no normalizadas.

