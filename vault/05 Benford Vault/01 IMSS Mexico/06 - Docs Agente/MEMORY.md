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

## Menen preferences relevant to product work
- Prefiere respuestas directas, profesionales y al punto.
- Espera que el agente investigue y avance por su cuenta antes de hacer preguntas.
- Si falta contexto crítico, pedirlo de forma breve y concreta.

## Operating memory rules
- Revisar periódicamente `memory/YYYY-MM-DD.md` y promover aquí solo lo realmente duradero.
- Cuando una decisión cambie, actualizar esta memoria en vez de dejar versiones conflictivas.
- Mantener este archivo corto, útil y fácil de escanear.
