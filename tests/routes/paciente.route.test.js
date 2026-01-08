const request = require('supertest');
const express = require('express');
const { pacienteRouter } = require('../../routes/paciente.route');
const PacienteModel = require('../../models/paciente.model');
const UsusarioModel = require('../../models/ususario.model');
const { Genero, TipoSangre, TipoDocumento } = require('../../models/enums');

// Mocks
jest.mock('../../models/paciente.model');
jest.mock('../../models/ususario.model');
jest.mock('jsonwebtoken');

describe('Paciente Route - Validation and Security Tests', () => {
    let app;
    let validToken;
    const validPacienteData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        tipoDocumento: TipoDocumento.DNI,
        numeroDocumento: 12345678,
        fechaNacimiento: '1990-01-15',
        genero: Genero.MASCULINO,
        tipoSangre: TipoSangre.O_POS,
        email: 'juan.perez@test.com',
        direccion: 'Calle Falsa 123',
        usuarioId: '507f1f77bcf86cd799439011'
    };

    beforeEach(() => {
        // Crear una nueva instancia de la aplicación para cada test
        app = express();
        app.use(express.json());
        app.use('/api/pacientes', pacienteRouter);

        // Mock del JWT válido
        validToken = 'valid.jwt.token';
        const jwt = require('jsonwebtoken');
        jwt.verify = jest.fn().mockReturnValue({ guid: 'user-guid-123' });

        // Limpiar todos los mocks
        jest.clearAllMocks();
    });

    describe('GET / - Obtener pacientes', () => {
        it('debe retornar 401 si no se envía token JWT', async () => {
            const response = await request(app)
                .get('/api/pacientes');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                ok: false,
                message: 'Necesita una key especial para esta acción.'
            });
        });

        it('debe retornar 500 si el token es inválido', async () => {
            const jwt = require('jsonwebtoken');
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            jest.spyOn(console, 'log').mockImplementation();

            const response = await request(app)
                .get('/api/pacientes')
                .set('x-token', 'invalid.token');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                ok: false,
                message: 'La key proporcionada no es valida'
            });
        });

        it('debe retornar lista de pacientes con token válido', async () => {
            const mockPacientes = [
                { nombre: 'Juan', apellido: 'Pérez' },
                { nombre: 'María', apellido: 'García' }
            ];

            const mockFind = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockPacientes)
            };

            PacienteModel.find.mockReturnValue(mockFind);
            PacienteModel.countDocuments.mockResolvedValue(10);

            const response = await request(app)
                .get('/api/pacientes')
                .set('x-token', validToken);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.pacienteCollection).toBeDefined();
        });
    });

    describe('GET /:guid - Obtener paciente por ID', () => {
        it('debe requerir autenticación JWT', async () => {
            const response = await request(app)
                .get('/api/pacientes/507f1f77bcf86cd799439011');

            expect(response.status).toBe(401);
        });

        it('debe retornar paciente con token válido', async () => {
            const mockPaciente = {
                _id: '507f1f77bcf86cd799439011',
                nombre: 'Juan',
                apellido: 'Pérez',
                fechaNacimiento: new Date('1990-01-01'),
                edad: 35
            };

            const mockFindById = {
                populate: jest.fn().mockResolvedValue(mockPaciente)
            };

            PacienteModel.findById.mockReturnValue(mockFindById);

            const response = await request(app)
                .get('/api/pacientes/507f1f77bcf86cd799439011')
                .set('x-token', validToken);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.paciente).toBeDefined();
        });
    });

    describe('POST / - Crear paciente - Validaciones de campos obligatorios', () => {
        it('debe requerir autenticación JWT', async () => {
            const response = await request(app)
                .post('/api/pacientes')
                .send(validPacienteData);

            expect(response.status).toBe(401);
        });

        it('debe validar que el nombre es obligatorio', async () => {
            const invalidData = { ...validPacienteData };
            delete invalidData.nombre;

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.ok).toBe(false);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.nombre).toBeDefined();
            expect(response.body.error.nombre.msg).toBe('El nombre es obligatorio');
        });

        it('debe validar que el apellido es obligatorio', async () => {
            const invalidData = { ...validPacienteData };
            delete invalidData.apellido;

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.apellido.msg).toBe('El apellido es obligatorio');
        });

        it('debe validar que el email es obligatorio', async () => {
            const invalidData = { ...validPacienteData };
            delete invalidData.email;

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.email).toBeDefined();
        });

        it('debe validar que el email tenga un formato válido', async () => {
            const invalidData = {
                ...validPacienteData,
                email: 'correo-invalido'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.email).toBeDefined();
            expect(response.body.error.email.msg).toBe('El email no es válido');
        });

        it('debe validar que la dirección es obligatoria', async () => {
            const invalidData = { ...validPacienteData };
            delete invalidData.direccion;

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.direccion).toBeDefined();
            expect(response.body.error.direccion.msg).toBe('La dirección es obligatoria');
        });

        it('debe validar que el usuarioId sea un ObjectId de MongoDB válido', async () => {
            const invalidData = {
                ...validPacienteData,
                usuarioId: 'id-invalido-123'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.usuarioId).toBeDefined();
            expect(response.body.error.usuarioId.msg).toBe('El ID de usuario debe ser un ObjectId válido');
        });
    });

    describe('POST / - Validaciones de tipo de documento', () => {
        it('debe validar que el tipo de documento es obligatorio', async () => {
            const invalidData = { ...validPacienteData };
            delete invalidData.tipoDocumento;

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.tipoDocumento).toBeDefined();
        });

        it('debe validar que el tipo de documento sea un valor válido del enum', async () => {
            const invalidData = {
                ...validPacienteData,
                tipoDocumento: 'TIPO_INVALIDO'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.tipoDocumento).toBeDefined();
            expect(response.body.error.tipoDocumento.msg).toBe('El tipo de documento no es válido');
        });

        it('debe validar que el número de documento sea numérico', async () => {
            const invalidData = {
                ...validPacienteData,
                numeroDocumento: 'ABC123'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.numeroDocumento).toBeDefined();
            expect(response.body.error.numeroDocumento.msg).toBe('El número de documento debe ser numérico');
        });
    });

    describe('POST / - Validaciones de fecha de nacimiento', () => {
        it('debe validar que la fecha de nacimiento es obligatoria', async () => {
            const invalidData = { ...validPacienteData };
            delete invalidData.fechaNacimiento;

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.fechaNacimiento).toBeDefined();
        });

        it('debe validar que la fecha de nacimiento sea una fecha válida ISO8601', async () => {
            const invalidData = {
                ...validPacienteData,
                fechaNacimiento: '31/12/1990'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.fechaNacimiento).toBeDefined();
            expect(response.body.error.fechaNacimiento.msg).toBe('La fecha de nacimiento debe ser una fecha válida');
        });
    });

    describe('POST / - Validaciones de enums (género y tipo de sangre)', () => {
        it('debe validar que el género sea un valor válido del enum', async () => {
            const invalidData = {
                ...validPacienteData,
                genero: 'INVALIDO'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.genero).toBeDefined();
            expect(response.body.error.genero.msg).toBe('El género no es válido');
        });

        it('debe validar que el tipo de sangre sea un valor válido del enum', async () => {
            const invalidData = {
                ...validPacienteData,
                tipoSangre: 'Z+'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.tipoSangre).toBeDefined();
            expect(response.body.error.tipoSangre.msg).toBe('El tipo de sangre no es válido');
        });
    });

    describe('POST / - Creación exitosa', () => {
        it('debe crear paciente exitosamente con datos válidos', async () => {
            const mockSave = jest.fn().mockResolvedValue();
            const mockPaciente = {
                ...validPacienteData,
                save: mockSave
            };

            PacienteModel.mockImplementation(() => mockPaciente);
            PacienteModel.findOne.mockResolvedValue(null);
            UsusarioModel.findById.mockResolvedValue({ _id: validPacienteData.usuarioId });

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(validPacienteData);

            expect(response.status).toBe(201);
            expect(response.body.ok).toBe(true);
            expect(response.body.message).toBe('Paciente creado');
        });

        it('debe validar múltiples campos simultáneamente', async () => {
            const invalidData = {
                tipoDocumento: 'INVALIDO',
                numeroDocumento: 'ABC',
                genero: 'INVALIDO',
                tipoSangre: 'Z+',
                email: 'correo-invalido',
                usuarioId: 'id-invalido'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.ok).toBe(false);
            expect(response.body.error).toBeDefined();

            // Verificar que hay múltiples errores
            const errorCount = Object.keys(response.body.error).length;
            expect(errorCount).toBeGreaterThan(1);
        });
    });

    describe('PUT /:guid - Actualizar paciente', () => {
        it('debe requerir autenticación JWT', async () => {
            const response = await request(app)
                .put('/api/pacientes/507f1f77bcf86cd799439011')
                .send(validPacienteData);

            expect(response.status).toBe(401);
        });

        it('debe validar campos obligatorios igual que POST', async () => {
            const invalidData = { ...validPacienteData };
            delete invalidData.nombre;

            const response = await request(app)
                .put('/api/pacientes/507f1f77bcf86cd799439011')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.nombre).toBeDefined();
            expect(response.body.error.nombre.msg).toBe('El nombre es obligatorio');
        });

        it('debe validar el formato del email en PUT', async () => {
            const invalidData = {
                ...validPacienteData,
                email: 'no-es-email'
            };

            const response = await request(app)
                .put('/api/pacientes/507f1f77bcf86cd799439011')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.email).toBeDefined();
            expect(response.body.error.email.msg).toBe('El email no es válido');
        });

        it('debe actualizar paciente exitosamente con datos válidos', async () => {
            const mockPacienteDB = {
                numeroDocumento: 12345678,
                email: 'old@test.com',
                usuarioId: { toString: () => '507f1f77bcf86cd799439011' }
            };

            const mockUpdatedPaciente = {
                ...validPacienteData,
                _id: '507f1f77bcf86cd799439011'
            };

            PacienteModel.findById.mockResolvedValue(mockPacienteDB);
            PacienteModel.findOne.mockResolvedValue(null);
            UsusarioModel.findById.mockResolvedValue({ _id: validPacienteData.usuarioId });
            PacienteModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedPaciente);

            const response = await request(app)
                .put('/api/pacientes/507f1f77bcf86cd799439011')
                .set('x-token', validToken)
                .send(validPacienteData);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.message).toBe('Paciente actualizado');
        });
    });

    describe('DELETE /:guid - Eliminar paciente', () => {
        it('debe requerir autenticación JWT', async () => {
            const response = await request(app)
                .delete('/api/pacientes/507f1f77bcf86cd799439011');

            expect(response.status).toBe(401);
        });

        it('debe eliminar (borrado lógico) paciente con token válido', async () => {
            const mockPaciente = {
                _id: '507f1f77bcf86cd799439011',
                nombre: 'Juan',
                apellido: 'Pérez',
                activo: false
            };

            PacienteModel.findByIdAndUpdate.mockResolvedValue(mockPaciente);

            const response = await request(app)
                .delete('/api/pacientes/507f1f77bcf86cd799439011')
                .set('x-token', validToken);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.message).toBe('Paciente eliminado correctamente');
        });
    });

    describe('Validación completa de enums', () => {
        it('debe aceptar todos los valores válidos de TipoDocumento', async () => {
            PacienteModel.findOne.mockResolvedValue(null);
            UsusarioModel.findById.mockResolvedValue({ _id: validPacienteData.usuarioId });

            for (const tipo of Object.values(TipoDocumento)) {
                const data = { ...validPacienteData, tipoDocumento: tipo, email: `test-${tipo}@test.com` };

                PacienteModel.mockImplementation(() => ({
                    ...data,
                    save: jest.fn().mockResolvedValue()
                }));

                const response = await request(app)
                    .post('/api/pacientes')
                    .set('x-token', validToken)
                    .send(data);

                expect(response.status).toBe(201);
            }
        });

        it('debe aceptar todos los valores válidos de Genero', async () => {
            PacienteModel.findOne.mockResolvedValue(null);
            UsusarioModel.findById.mockResolvedValue({ _id: validPacienteData.usuarioId });

            for (const genero of Object.values(Genero)) {
                const data = { ...validPacienteData, genero, email: `test-${genero}@test.com` };

                PacienteModel.mockImplementation(() => ({
                    ...data,
                    save: jest.fn().mockResolvedValue()
                }));

                const response = await request(app)
                    .post('/api/pacientes')
                    .set('x-token', validToken)
                    .send(data);

                expect(response.status).toBe(201);
            }
        });

        it('debe aceptar todos los valores válidos de TipoSangre', async () => {
            PacienteModel.findOne.mockResolvedValue(null);
            UsusarioModel.findById.mockResolvedValue({ _id: validPacienteData.usuarioId });

            for (const tipo of Object.values(TipoSangre)) {
                const data = { ...validPacienteData, tipoSangre: tipo, email: `test-${tipo}@test.com` };

                PacienteModel.mockImplementation(() => ({
                    ...data,
                    save: jest.fn().mockResolvedValue()
                }));

                const response = await request(app)
                    .post('/api/pacientes')
                    .set('x-token', validToken)
                    .send(data);

                expect(response.status).toBe(201);
            }
        });
    });

    describe('Seguridad - Prevención de ataques', () => {
        it('debe rechazar ObjectId malformados que podrían causar errores', async () => {
            const invalidData = {
                ...validPacienteData,
                usuarioId: '../../../etc/passwd'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.usuarioId).toBeDefined();
            expect(response.body.error.usuarioId.msg).toBe('El ID de usuario debe ser un ObjectId válido');
        });

        it('debe validar que los datos numéricos no contengan código malicioso', async () => {
            const invalidData = {
                ...validPacienteData,
                numeroDocumento: '12345; DROP TABLE --'
            };

            const response = await request(app)
                .post('/api/pacientes')
                .set('x-token', validToken)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error.numeroDocumento).toBeDefined();
            expect(response.body.error.numeroDocumento.msg).toBe('El número de documento debe ser numérico');
        });

        it('debe proteger todos los endpoints con autenticación JWT', async () => {
            // Verificar que todos los métodos HTTP requieren JWT
            const endpoints = [
                { method: 'get', url: '/api/pacientes' },
                { method: 'get', url: '/api/pacientes/507f1f77bcf86cd799439011' },
                { method: 'post', url: '/api/pacientes' },
                { method: 'put', url: '/api/pacientes/507f1f77bcf86cd799439011' },
                { method: 'delete', url: '/api/pacientes/507f1f77bcf86cd799439011' }
            ];

            for (const endpoint of endpoints) {
                const response = await request(app)[endpoint.method](endpoint.url);
                expect(response.status).toBe(401);
                expect(response.body.ok).toBe(false);
            }
        });
    });
});
