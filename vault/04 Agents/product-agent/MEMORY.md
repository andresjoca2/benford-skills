# MEMORY.md - Product Agent Long-Term Memory

Memoria larga del `product-agent`.

## Purpose
- Guardar contexto duradero sobre producto, decisiones, marcos de trabajo, preferencias operativas y aprendizajes que sigan siendo útiles entre sesiones.
- No duplicar notas diarias; aquí solo va lo que merece persistir.

## What belongs here
- Decisiones de producto importantes y su rationale
- Supuestos de trabajo que sigan vigentes
- Preferencias de Menen sobre research, PRDs, specs y entregables
- Estructuras, frameworks y playbooks que este agente use repetidamente
- Contexto estable sobre proyectos, productos o líneas de trabajo
- Lecciones aprendidas que eviten repetir errores

## What does NOT belong here
- Conversaciones efímeras
- Tareas temporales de un solo uso
- Logs crudos del día
- Información sensible que no haga falta conservar aquí

## Current durable context
- Este agente existe para ayudar con research de producto, discovery, PRDs, specs, feedback synthesis, roadmap thinking y documentación ejecutable.
- Debe convertir contexto ambiguo en entregables accionables para Menen y para otros agentes/equipos.
- Debe trabajar con trazabilidad: dejar claras decisiones, supuestos, pendientes y siguientes pasos.
- En `#5-1-josefina` (`discord channel 1489012071516602398`) hubo una pérdida de continuidad entre el historial real del canal y la sesión persistida local. El contexto operativo recuperado vive en `memory/2026-04-13-5-1-josefina-recovered-context.md`.
- Para la prueba IMSS `5.1` de Josefina, la lógica operativa base ya había quedado cerrada el 2026-04-02. No tratar esa prueba como si estuviera en blanco.
- En `5.1` de Josefina, lo ya establecido incluye: objetivo de conciliación operativo-contable, flujo `COPS -> BC -> Amarre`, trabajo por registro patronal con consolidado cuando hay varios RP, set raw base (`SUA mensual`, `SUA bimestral`, comprobante de pago, balanza y auxiliares), y composición final de los tres renglones del amarre.
- Si vuelve a salir una respuesta que diga que en `5.1` "todavía no se sabe la prueba", interpretar eso como consecuencia de la sesión truncada del 2026-04-13, no como estado real del conocimiento.
- Lo pendiente real en `5.1` no es la lógica core, sino el paquete documental final: ejemplos reales de archivos, ubicación exacta de la data por hoja/columna/campo cuando haga falta, SOP final y carpeta autocontenida del auditor.

## Menen preferences relevant to product work
- Prefiere respuestas directas, profesionales y al punto.
- Espera que el agente investigue y avance por su cuenta antes de hacer preguntas.
- Si falta contexto crítico, pedirlo de forma breve y concreta.

## Operating memory rules
- Revisar periódicamente `memory/YYYY-MM-DD.md` y promover aquí solo lo realmente duradero.
- Cuando una decisión cambie, actualizar esta memoria en vez de dejar versiones conflictivas.
- Mantener este archivo corto, útil y fácil de escanear.
