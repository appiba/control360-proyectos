# Fórmulas financieras

Todas las fórmulas críticas deben estar implementadas como funciones programadas en frontend y backend.

## Fórmulas mínimas

```text
Inversión personal = presupuesto total × porcentaje personal
Capital pendiente = capital comprometido - capital desembolsado
Ingresos totales = suma de ingresos según estado seleccionado
Gastos totales = suma de gastos según estado seleccionado
Utilidad bruta = ingresos totales - gastos directos
Utilidad neta = ingresos totales - gastos totales - impuestos - deducciones
Margen de utilidad = utilidad neta / ingresos totales
ROI = utilidad neta / inversión total
Punto de equilibrio monetario = gastos fijos / margen de contribución
Punto de equilibrio en unidades = costos fijos / (precio unitario - costo variable unitario)
Precio promedio ponderado = suma(precio × unidades) / suma(unidades)
Ahorro por negociación = precio cotizado - precio negociado
Desviación presupuestaria = valor real - valor presupuestado
```

## Separación de estados

No asumir que ingreso equivale a utilidad. Cada cálculo debe aclarar si toma valores:

- Estimados.
- Negociados.
- Confirmados.
- Facturados.
- Pagados.
- Cobrados.
- Pendientes.
- Vencidos.
- Cancelados.

## Socios y participaciones

CONTROL360 diferencia:

- Participación legal.
- Participación económica.
- Participación en utilidades.
- Poder de decisión.
- Participación temporal.
- Participación privada.

Un beneficiario puede recibir parte de las utilidades sin convertirse en socio legal. Por eso los cálculos de distribución deben tomar la base correcta:

```text
Utilidad de socio = utilidad distribuible × participación en utilidades
Dividendos pagados = monto registrado como pagado
Dividendos pendientes = utilidad calculada - dividendos pagados
```

## Validaciones

- ROI y margen retornan `0` si la base es `0`.
- Los porcentajes se almacenan como números de `0` a `100`.
- Se debe advertir si una distribución aplicable supera 100 %.
- Se debe permitir guardar acuerdos especiales, pero marcarlos para revisión.

