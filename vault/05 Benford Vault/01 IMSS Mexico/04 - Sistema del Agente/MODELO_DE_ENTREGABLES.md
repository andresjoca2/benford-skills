# MODELO_DE_ENTREGABLES.md

## Propósito
Definir cómo pensar la capa de entregables finales dentro del sistema de `Auditoría del IMSS`.

## Corrección importante del modelo
La auditoría IMSS no debe modelarse simplemente como:
- un Excel final
- y un PDF final

Ese modelo era demasiado corto.

## Modelo correcto actual
La lógica real del sistema se entiende mejor así:

### 1. Plantilla fuente de Información Patronal
Es la capa principal que el agente debe ayudar a dejar lista.
Desde esta plantilla:
- el auditor genera archivos `.txt` mediante macros
- luego los sube manualmente al portal **SIDEIMSS**

### 2. SIDEIMSS
El portal procesa la información cargada y luego permite:
- validar aceptación
- descargar archivos derivados
- avanzar a atestiguamientos
- avanzar a opinión y pasos posteriores según el flujo

### 3. Expediente final descargable
El portal devuelve o habilita un expediente con componentes como:
- información patronal descargada por bloques
- atestiguamientos
- aviso de dictamen patronal
- acuses de formulación, firma y presentación
- opinión final
- PDFs técnicos o parciales

## Implicación clave
No existe una sola unidad universal de cierre por prueba.
Cada prueba puede:
- alimentar la plantilla fuente
- alimentar otra prueba antes de llegar a la plantilla fuente
- impactar componentes posteriores del expediente final descargable
- servir solo como soporte interno
- o alimentar múltiples destinos al mismo tiempo

## Regla por prueba
Para cada prueba, cuando sea posible, se debe documentar:
- qué raw data entra
- qué limpieza requiere
- qué transformación requiere
- qué output produce
- si ese output alimenta la plantilla fuente
- si ese output impacta componentes posteriores del expediente
- si ese output alimenta otra prueba
- si ese output es solo soporte interno

## Plantilla fuente como estructura paralela
La `Plantilla de Información Patronal` puede verse como otra forma de organizar la metodología, porque sus sheets representan salidas relevantes del sistema.

Sin embargo, por ahora la estructura principal del conocimiento sigue siendo por **prueba**, no por sheet.

## Regla de trazabilidad
Debe existir, en la medida de lo posible, un mapeo detallado entre:
- prueba
- documentos usados
- raw data
- transformaciones
- outputs intermedios
- sheets de la plantilla fuente
- componentes posteriores del expediente final descargable
- otras pruebas dependientes

## Regla de modelado operativo
El agente no necesita modelar ni automatizar todo el flujo manual del portal.
Su responsabilidad principal es dejar correctamente preparada y entendida la **plantilla fuente**, sin perder de vista cómo esa plantilla luego desemboca en el expediente final descargable.
