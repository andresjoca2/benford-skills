# Mapa de dependencias entre pruebas

## Propósito
Registrar relaciones entre pruebas que alimentan otras pruebas, sirven de soporte o producen outputs intermedios consumidos después.

## Dependencias iniciales detectadas

### 5.1
- parece alimentar `5.11`
- puede alimentar `Cuotas pagadas al Instituto`
- produce base útil para pagos / COPs / vaciados

### 5.2
- `5.2.1` y `5.2.2` alimentan `5.2.3`
- `5.2` parece conectarse con `5.11`
- `5.2` también se conecta con `5.12`

### 5.3
- puede alimentar diferencias o conclusiones de dictamen

### 5.4
- depende de datos laborales y avisos afiliatorios
- puede apoyar consistencia estructural de otras pruebas

### 5.5
- se conecta fuerte con `5.6`
- se conecta con pruebas de variables y SBC
- probablemente alimenta sheets de remuneraciones

### 5.6
- se conecta fuerte con `5.5`
- se conecta con `5.12`
- puede alimentar sheets de prestaciones y conclusiones de tratamiento

### 5.7
- funciona como base estructural transversal para otras pruebas

### 5.8
- puede consumir resultados o datos de `5.5` y `5.7`
- puede alimentar validación de cuotas pagadas

### 5.9
- puede producir conclusiones directas hacia entregables finales

### 5.10
- puede alimentar `Balanza de comprobación`
- puede alimentar diferencias por dictamen
- usa conciliaciones con peso transversal

### 5.11
- parece consumir información de `5.1`, `5.2` y posiblemente otras pruebas
- funciona como capa de razonabilidad agregada

### 5.12
- se conecta con `5.2`
- puede alimentar variables por separación o por bajas

## Nota
Este mapa es inicial y todavía debe refinarse conforme se hable con auditores y se entienda mejor el flujo real.
