# Qué tanto cambia la auditoría entre países

## Resumen
Documento de trabajo para evaluar cuánto del trabajo de auditoría financiera es reusable globalmente y cuánto requiere localización por país.

Tesis central del input:
- gran parte de la lógica de auditoría parece portable entre jurisdicciones
- la variación fuerte estaría más concentrada en fiscal, compliance, formatos documentales y regulación local

Esta nota es útil para la pregunta estratégica de Benford sobre geografía inicial e internacionalización.

## Idea principal
La auditoría no cambia completamente por país.

Lo que parece más reusable globalmente es:
- metodología de auditoría
- lógica de pruebas por rubro
- estructura de assertions
- evaluación de evidencia

Lo que parece cambiar más por país es:
- fiscal / compliance
- normas contables específicas
- formatos documentales e integraciones locales
- regulación sectorial o jurisdiccional

## Descomposición por capas
### 1. Base común global
#### Metodología de auditoría
El documento sugiere que la metodología base representa aproximadamente 60 a 70% del trabajo y cambia poco entre países.

Ejemplos:
- evaluación de riesgos
- materialidad
- pruebas sustantivas vs controles
- muestreo
- confirmaciones externas
- walkthroughs

La lógica aquí está bastante anclada en estándares internacionales y en una estructura metodológica común.

#### Procesos por rubro
También sugiere que 20 a 25% del trabajo vive en workflows de cuentas o rubros que son bastante similares globalmente.

Ejemplos:
- ingresos
- inventarios
- cuentas por cobrar
- efectivo

La estructura mental sería esencialmente la misma:
- existencia
- integridad
- valuación
- derechos y obligaciones
- presentación

Lo que sí cambia aquí suele ser:
- formato de documentos
- ERP o sistema fuente
- naming conventions

### 2. Capa semi-variable
#### Normas contables
El documento propone que 10 a 15% del trabajo depende de IFRS, US GAAP o normas locales.

Impacta especialmente en:
- revenue recognition
- leases
- instrumentos financieros
- impairment

Interpretación útil para Benford:
esto parece más una capa de reglas e interpretación que una reconstrucción total del workflow.

### 3. Capa altamente local
#### Fiscal y compliance
El documento ubica aquí la parte menos portable, con un rango de 15 a 25%.

Ejemplos:
- reglas fiscales
- documentación obligatoria local como CFDI
- integraciones con autoridades
- conciliaciones fiscal vs contable

#### Regulación local e industria específica
También hay una capa adicional local ligada a:
- requisitos regulatorios
- reportes obligatorios
- industrias específicas como banca o seguros

## Conclusión de trabajo
El documento propone esta lectura:
- ~75 a 85% sería reusable globalmente
- ~15 a 25% requeriría localización fuerte

La implicación estratégica es clara:
Benford podría construir un core audit engine reusable y tratar la localización como capas adicionales, no como productos completamente distintos por país.

## Implicaciones estratégicas para Benford
### 1. Refuerza la hipótesis internacional-first
Este documento sí refuerza una hipótesis importante ya presente en Benford:
que podría existir ventaja en construir primero una arquitectura global de auditoría y después localizar los bordes necesarios por país.

### 2. Cambia dónde pensar el moat
El moat no estaría principalmente en "saber auditar" una cuenta aislada.

Estaría más en:
- conectar fuentes de datos
- estandarizar inputs
- automatizar working papers
- construir una capa de judgment con human-in-the-loop
- mapear bien la localización fiscal, regulatoria y documental

### 3. Sugiere una arquitectura modular
El framing más útil del documento es pensar en:
- un core audit engine global
- capas locales para tax, accounting rules, parsing documental y outputs regulatorios

### 4. Ayuda a precisar la pregunta geográfica
La pregunta no sería solo "qué país atacar primero".

Sería:
- en qué jurisdicciones la capa local es suficientemente manejable
- dónde hay mejor combinación de dolor, velocidad de aprendizaje y complejidad regulatoria
- cuánto de la ventaja internacional viene realmente de la portabilidad del workflow

## Riesgos y cautelas
Hay que tomar este input como hipótesis estructurada, no como verdad probada.

Principales cautelas:
- los porcentajes parecen heurísticos, no empíricamente demostrados
- no trae fuentes primarias que soporten los rangos
- puede subestimar variaciones prácticas en ejecución entre firmas, tamaños de cliente y reguladores
- puede simplificar demasiado la dificultad de adaptar evidencia, formatos y enforcement local

## Qué me parece más valioso del documento
Lo más valioso no son los porcentajes exactos.

Lo más valioso es la descomposición por capas:
- metodología
- workflows por rubro
- accounting rules
- fiscal/compliance/regulación

Ese marco sí sirve para pensar mejor:
- geografía inicial
- arquitectura del producto
- tipo de moat
- secuencia de expansión internacional

## Preguntas que deja abiertas
- ¿Dónde se rompe realmente la portabilidad, en metodología o en acceso a evidencia?
- ¿Cuánto cambia la ejecución real entre firmas pequeñas, mid-market y Big Four?
- ¿Qué jurisdicciones tienen la mejor relación entre portabilidad del core y complejidad local?
- ¿Qué parte de la ventaja internacional depende de compliance local más que de lógica de auditoría?
- ¿Benford debe probar primero un país no-US para validar la tesis de portabilidad o entrar antes en US?

## Estado
Hipótesis estratégica útil.
No debe usarse como evidencia final en deck sin validación adicional.

## Fuente
Documento compartido por Antonio y generado inicialmente con ChatGPT, incorporado como input de trabajo estratégico.

## Links
- [[00 - Hub Preguntas Abiertas]]
- [[00 - Hub estratégico]]
- [[Comparar GTM y geografía inicial]]
- [[../01 - Mercado/00 - Hub Mercado]]
- [[../03 - Problemas y Workflows/Workflow wedge - pruebas de detalle]]
- [[../06 - Diseño de Compañía/00 - Hub Diseño de Compañía]]