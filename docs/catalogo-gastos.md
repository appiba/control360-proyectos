# Catálogo inicial de gastos

El catálogo inicial vive en dos lugares:

- Frontend: `frontend/js/modules/expenses.js`, para selección visual inmediata.
- Apps Script: `apps-script/Expenses.gs`, para poblar `CatalogoGastos` durante `setupDatabase()`.

Categorías mínimas:

- Personal.
- Producción.
- Alquileres y mobiliario.
- Bebidas e hidratación.
- Alimentación.
- Logística y viáticos.
- Publicidad.
- Administración.
- Infraestructura.
- Otros.

Los conceptos personalizados deben guardarse en `CatalogoGastos` para reutilización posterior.

