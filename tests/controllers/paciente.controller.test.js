const { getPacientes, getPacienteById, postPaciente, putPaciente, deletePaciente } = require('../../controllers/paciente.controller');
const PacienteModel = require('../../models/paciente.model');
const UsusarioModel = require('../../models/ususario.model');

jest.mock('../../models/paciente.model');
jest.mock('../../models/ususario.model');

describe('Paciente Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            query: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('getPacientes', () => {
        it('retorna lista de pacientes activos con paginación por defecto', async () => {
            const mockPacientes = [
                { nombre: 'Juan', apellido: 'Pérez', activo: true },
                { nombre: 'María', apellido: 'García', activo: true }
            ];
            const mockTotal = 15;

            const mockFind = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockPacientes)
            };

            PacienteModel.find.mockReturnValue(mockFind);
            PacienteModel.countDocuments.mockResolvedValue(mockTotal);

            await getPacientes(req, res);

            expect(PacienteModel.find).toHaveBeenCalledWith(
                { activo: true },
                expect.any(String)
            );
            expect(mockFind.skip).toHaveBeenCalledWith(0);
            expect(mockFind.limit).toHaveBeenCalledWith(10);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                pacienteCollection: mockPacientes,
                total: mockTotal,
                pagina: 0
            });
        });

        it('retorna pacientes con paginación personalizada', async () => {
            req.query.pagina = '2';
            const mockPacientes = [{ nombre: 'Test', activo: true }];
            const mockTotal = 25;

            const mockFind = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockPacientes)
            };

            PacienteModel.find.mockReturnValue(mockFind);
            PacienteModel.countDocuments.mockResolvedValue(mockTotal);

            await getPacientes(req, res);

            expect(mockFind.skip).toHaveBeenCalledWith(2);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                pacienteCollection: mockPacientes,
                total: mockTotal,
                pagina: 2
            });
        });

        it('maneja valores de página inválidos', async () => {
            req.query.pagina = 'invalid';
            const mockPacientes = [];
            const mockFind = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockPacientes)
            };

            PacienteModel.find.mockReturnValue(mockFind);
            PacienteModel.countDocuments.mockResolvedValue(0);

            await getPacientes(req, res);

            expect(mockFind.skip).toHaveBeenCalledWith(0);
        });
    });

    describe('getPacienteById', () => {
        it('retorna 404 si el paciente no existe', async () => {
            req.params.guid = 'nonexistent-id';
            PacienteModel.findById.mockResolvedValue(null);

            await getPacienteById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'Paciente no encontrado'
            });
        });

        it('retorna 200 y el paciente si existe', async () => {
            const mockPaciente = {
                _id: 'valid-id',
                nombre: 'Juan',
                apellido: 'Pérez',
                activo: true
            };
            req.params.guid = 'valid-id';
            PacienteModel.findById.mockResolvedValue(mockPaciente);

            await getPacienteById(req, res);

            expect(PacienteModel.findById).toHaveBeenCalledWith('valid-id');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                paciente: mockPaciente
            });
        });

        it('maneja errores y retorna 500', async () => {
            req.params.guid = 'error-id';
            PacienteModel.findById.mockRejectedValue(new Error('DB error'));
            jest.spyOn(console, 'log').mockImplementation();

            await getPacienteById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'Error al intentar encontrar paciente'
            });
        });
    });

    describe('postPaciente', () => {
        it('retorna 400 si el número de documento ya existe', async () => {
            req.body = {
                numeroDocumento: 12345678,
                email: 'test@test.com',
                usuarioId: 'user-id'
            };

            PacienteModel.findOne
                .mockResolvedValueOnce({ numeroDocumento: 12345678 })
                .mockResolvedValueOnce(null);
            UsusarioModel.findById.mockResolvedValue({ _id: 'user-id' });

            await postPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'El numero de documento ya esta registrado en otro paciente'
            });
        });

        it('retorna 400 si el email ya existe', async () => {
            req.body = {
                numeroDocumento: 12345678,
                email: 'existing@test.com',
                usuarioId: 'user-id'
            };

            PacienteModel.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ email: 'existing@test.com' });
            UsusarioModel.findById.mockResolvedValue({ _id: 'user-id' });

            await postPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'El email ya esta registrado en otro paciente'
            });
        });

        it('retorna 404 si el usuario no existe', async () => {
            req.body = {
                numeroDocumento: 12345678,
                email: 'test@test.com',
                usuarioId: 'nonexistent-user'
            };

            PacienteModel.findOne.mockResolvedValue(null);
            UsusarioModel.findById.mockResolvedValue(null);

            await postPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'El usuario no existe en la base de datos'
            });
        });

        it('crea un paciente correctamente', async () => {
            const mockPacienteData = {
                nombre: 'Juan',
                apellido: 'Pérez',
                numeroDocumento: 12345678,
                email: 'juan@test.com',
                usuarioId: 'user-id'
            };

            req.body = mockPacienteData;

            const mockSave = jest.fn().mockResolvedValue();
            PacienteModel.mockImplementation(() => ({
                ...mockPacienteData,
                save: mockSave
            }));

            PacienteModel.findOne.mockResolvedValue(null);
            UsusarioModel.findById.mockResolvedValue({ _id: 'user-id' });

            await postPaciente(req, res);

            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                message: 'Paciente creado',
                pacienteDestino: expect.objectContaining(mockPacienteData)
            });
        });

        it('maneja errores y retorna 500', async () => {
            req.body = {
                numeroDocumento: 12345678,
                email: 'test@test.com',
                usuarioId: 'user-id'
            };

            PacienteModel.findOne.mockRejectedValue(new Error('DB error'));
            jest.spyOn(console, 'log').mockImplementation();

            await postPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'Error al intentar crear Paciente'
            });
        });
    });

    describe('putPaciente', () => {
        it('retorna 404 si el paciente no existe', async () => {
            req.params.guid = 'nonexistent-id';
            req.body = { nombre: 'Test' };

            PacienteModel.findById.mockResolvedValue(null);

            await putPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'Paciente no encontrado'
            });
        });

        it('retorna 400 si el nuevo número de documento ya existe en otro paciente', async () => {
            req.params.guid = 'paciente-id';
            req.body = {
                numeroDocumento: 99999999,
                email: 'test@test.com',
                usuarioId: 'user-id'
            };

            const mockPacienteDB = {
                numeroDocumento: 12345678,
                email: 'test@test.com',
                usuarioId: { toString: () => 'user-id' }
            };

            PacienteModel.findById.mockResolvedValue(mockPacienteDB);
            PacienteModel.findOne.mockResolvedValueOnce({
                numeroDocumento: 99999999,
                _id: 'other-id'
            });

            await putPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'El numero de documento ya esta siendo ocupado por otro paciente'
            });
        });

        it('retorna 400 si el nuevo email ya existe en otro paciente', async () => {
            req.params.guid = 'paciente-id';
            req.body = {
                numeroDocumento: 12345678,
                email: 'newemail@test.com',
                usuarioId: 'user-id'
            };

            const mockPacienteDB = {
                numeroDocumento: 12345678,
                email: 'oldemail@test.com',
                usuarioId: { toString: () => 'user-id' }
            };

            PacienteModel.findById.mockResolvedValue(mockPacienteDB);
            // El primer findOne es para el numeroDocumento (que no cambió, no se ejecuta)
            // El segundo findOne es para el email (que sí cambió)
            PacienteModel.findOne.mockResolvedValue({
                email: 'newemail@test.com',
                _id: 'other-id'
            });

            await putPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'El email ya esta siendo ocupado por otro paciente'
            });
        });

        it('retorna 404 si el nuevo usuario no existe', async () => {
            req.params.guid = 'paciente-id';
            req.body = {
                numeroDocumento: 12345678,
                email: 'test@test.com',
                usuarioId: 'new-user-id'
            };

            const mockPacienteDB = {
                numeroDocumento: 12345678,
                email: 'test@test.com',
                usuarioId: { toString: () => 'old-user-id' }
            };

            PacienteModel.findById.mockResolvedValue(mockPacienteDB);
            PacienteModel.findOne.mockResolvedValue(null);
            UsusarioModel.findById.mockResolvedValue(null);

            await putPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'El usuario no existe en la base de datos'
            });
        });

        it('actualiza el paciente correctamente cuando no hay cambios en campos únicos', async () => {
            req.params.guid = 'paciente-id';
            req.body = {
                nombre: 'Juan Actualizado',
                numeroDocumento: 12345678,
                email: 'test@test.com',
                usuarioId: 'user-id'
            };

            const mockPacienteDB = {
                numeroDocumento: 12345678,
                email: 'test@test.com',
                usuarioId: { toString: () => 'user-id' }
            };

            const mockUpdatedPaciente = {
                _id: 'paciente-id',
                nombre: 'Juan Actualizado',
                numeroDocumento: 12345678,
                email: 'test@test.com'
            };

            PacienteModel.findById.mockResolvedValue(mockPacienteDB);
            PacienteModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedPaciente);

            await putPaciente(req, res);

            expect(PacienteModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'paciente-id',
                expect.objectContaining({
                    nombre: 'Juan Actualizado',
                    numeroDocumento: 12345678,
                    email: 'test@test.com',
                    usuarioId: 'user-id'
                }),
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                message: 'Paciente actualizado',
                pacienteDestino: mockUpdatedPaciente
            });
        });

        it('actualiza el paciente correctamente cuando hay cambios en campos únicos', async () => {
            req.params.guid = 'paciente-id';
            req.body = {
                nombre: 'Juan',
                numeroDocumento: 99999999,
                email: 'newemail@test.com',
                usuarioId: 'new-user-id'
            };

            const mockPacienteDB = {
                numeroDocumento: 12345678,
                email: 'oldemail@test.com',
                usuarioId: { toString: () => 'old-user-id' }
            };

            const mockUpdatedPaciente = {
                _id: 'paciente-id',
                nombre: 'Juan',
                numeroDocumento: 99999999,
                email: 'newemail@test.com'
            };

            PacienteModel.findById.mockResolvedValue(mockPacienteDB);
            // Ambos findOne deben devolver null (no hay conflictos)
            PacienteModel.findOne
                .mockResolvedValueOnce(null)  // numeroDocumento no existe en otros
                .mockResolvedValueOnce(null); // email no existe en otros
            UsusarioModel.findById.mockResolvedValue({ _id: 'new-user-id' });
            PacienteModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedPaciente);

            await putPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                message: 'Paciente actualizado',
                pacienteDestino: mockUpdatedPaciente
            });
        });

        it('maneja errores y retorna 500', async () => {
            req.params.guid = 'error-id';
            req.body = { nombre: 'Test' };

            PacienteModel.findById.mockRejectedValue(new Error('DB error'));
            jest.spyOn(console, 'log').mockImplementation();

            await putPaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'Error al intentar actualizar al paciente'
            });
        });
    });

    describe('deletePaciente', () => {
        it('realiza borrado lógico del paciente correctamente', async () => {
            req.params.guid = 'paciente-id';

            const mockPaciente = {
                _id: 'paciente-id',
                nombre: 'Juan',
                apellido: 'Pérez',
                activo: false
            };

            PacienteModel.findByIdAndUpdate.mockResolvedValue(mockPaciente);

            await deletePaciente(req, res);

            expect(PacienteModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'paciente-id',
                { activo: false },
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                message: 'Paciente eliminado correctamente',
                paciente: {
                    _id: 'paciente-id',
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    activo: false
                }
            });
        });

        it('retorna 404 si el paciente no existe', async () => {
            req.params.guid = 'nonexistent-id';

            PacienteModel.findByIdAndUpdate.mockResolvedValue(null);

            await deletePaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'Paciente no encontrado'
            });
        });

        it('retorna 400 si el ID es inválido (CastError)', async () => {
            req.params.guid = 'invalid-id-format';

            const castError = new Error('Cast to ObjectId failed');
            castError.name = 'CastError';

            PacienteModel.findByIdAndUpdate.mockRejectedValue(castError);
            jest.spyOn(console, 'log').mockImplementation();

            await deletePaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'ID de paciente inválido'
            });
        });

        it('maneja errores generales y retorna 500', async () => {
            req.params.guid = 'error-id';

            PacienteModel.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));
            jest.spyOn(console, 'log').mockImplementation();

            await deletePaciente(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: 'Error al intentar eliminar paciente'
            });
        });
    });
});
