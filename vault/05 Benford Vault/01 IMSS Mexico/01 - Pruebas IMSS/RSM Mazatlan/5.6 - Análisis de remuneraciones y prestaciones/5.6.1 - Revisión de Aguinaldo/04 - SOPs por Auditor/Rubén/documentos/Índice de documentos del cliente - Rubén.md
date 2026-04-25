# Índice de documentos del cliente - Rubén

## Prueba
`5.6.1 Revisión de Aguinaldo`

## Propósito
Listar el paquete documental reunido para ejecutar y entender la variante de Rubén en esta prueba.

## Documentos incluidos en esta carpeta
### Raw / fuente del cliente
- `5.10.2.1 - Acumulado de nómina con fórmulas - Servicios Administrativos Playa San Jose.xlsx`
  - fuente principal del universo de aguinaldo
  - se usa filtrando columna `B = A`
  - de aquí sale el aguinaldo pagado normal en `CX`

### Papeles de trabajo / soporte operativo
- `5.6.0 - Factores de integración - Servicios Administrativos Playa San Jose.xlsx`
  - se usa para determinar días de aguinaldo según antigüedad

### Resultado / papel de trabajo final
- `../resultado/5.6.1 - Revisión de Aguinaldo - Servicios Administrativos Playa San Jose.xlsx`
  - contiene la hoja `Aguinaldo`
  - es la cédula final principal de la prueba

## Documentos soporte adicionales referidos
- recibos de nómina de la muestra solicitada conforme a 4.5

## Relación con otras pruebas
- fuente principal relacionada: `5.10.2.1`
- criterio relacionado: `5.6.0`
- validación muestral relacionada: `4.5`
- salida relacionada: prueba de salario base de cotización cuando existen diferencias a cargo
