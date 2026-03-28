# Gastos del hogar

Aplicación web para repartir y llevar la cuenta de **gas** y **agua** entre las personas que viven juntas: montos por mes, cuánto corresponde a cada quien según quién participa de cada servicio, y si ya pagaron o no.

## Para qué sirve

Sirve como cuaderno digital del hogar para servicios compartidos:

- **Resumen mensual**: total de gas y agua del mes y monto aproximado por persona (según participantes).
- **Gas y agua**: cargar los totales del mes, marcar quién ya pagó y adjuntar fotos de recibos o comprobantes (solo en este dispositivo).
- **Personas**: dar de alta quién vive ahí y si entra en el reparto del gas, del agua o ambos.
- **Historial**: revisar meses anteriores.
- **Compartir**: armar un texto con el resumen para enviarlo por WhatsApp (u otra app compatible).

Los datos se guardan en el **navegador** (`localStorage`); no hay servidor propio ni cuenta: todo queda en el dispositivo donde uses la app.

## Tecnología

Proyecto [Next.js](https://nextjs.org) creado con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), con soporte PWA para usarla casi como app en el móvil.

## Primeros pasos

Ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.