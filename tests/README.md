# Tests Unitarios

Este directorio contiene todos los tests unitarios del proyecto, organizados por tipo de componente.

## Estructura de Directorios

```
tests/
├── controllers/     # Tests para controladores
├── helpers/         # Tests para funciones helper
├── middlewares/     # Tests para middlewares
├── models/          # Tests para modelos de datos
└── routes/          # Tests para definiciones de rutas
```

## Convenciones

1. **Nombres de archivos**: Los archivos de test deben seguir el formato `[nombre-archivo].test.js`
   - Ejemplo: `auth.controller.test.js` para testear `auth.controller.js`

2. **Ubicación**: Cada archivo de test debe ubicarse en el subdirectorio correspondiente al tipo de componente
   - Controlador → `tests/controllers/`
   - Helper → `tests/helpers/`
   - Middleware → `tests/middlewares/`
   - Modelo → `tests/models/`
   - Ruta → `tests/routes/`

3. **Imports**: Los imports deben usar rutas relativas desde el directorio de tests
   ```javascript
   // Para testear un controlador
   const { login } = require('../../controllers/auth.controller');

   // Para testear un helper
   const { generateJWT } = require('../../helpers/token');
   ```

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan al guardar cambios)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## Estructura de un Test

```javascript
const { funcionATestear } = require('../../path/to/module');
const dependencia = require('../../path/to/dependency');

// Mock de dependencias
jest.mock('../../path/to/dependency');

describe('Nombre del Módulo', () => {
    let req, res; // Variables compartidas

    beforeEach(() => {
        // Setup antes de cada test
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('nombreFuncion', () => {
        it('debería comportarse de cierta manera', async () => {
            // Arrange
            req.body = { data: 'test' };
            dependencia.metodo.mockResolvedValue('resultado');

            // Act
            await funcionATestear(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ ok: true });
        });
    });
});
```

## Coverage Reports

Los reportes de cobertura se generan en el directorio `coverage/` y están excluidos del control de versiones.
