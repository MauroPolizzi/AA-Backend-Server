const mongoose = require('mongoose');
const PacienteModel = require('../../models/paciente.model');
const { Genero, TipoSangre, TipoDocumento } = require('../../models/enums');

describe('Paciente Model', () => {
    describe('Schema Fields', () => {
        it('debe tener los campos requeridos definidos correctamente', () => {
            const schema = PacienteModel.schema.obj;

            // Campos obligatorios
            expect(schema.nombre.required).toBe(true);
            expect(schema.nombre.type).toBe(String);

            expect(schema.apellido.required).toBe(true);
            expect(schema.apellido.type).toBe(String);

            expect(schema.tipoDocumento.required).toBe(true);
            expect(schema.tipoDocumento.type).toBe(String);
            expect(schema.tipoDocumento.enum).toEqual(Object.values(TipoDocumento));

            expect(schema.numeroDocumento.required).toBe(true);
            expect(schema.numeroDocumento.type).toBe(Number);
            expect(schema.numeroDocumento.unique).toBe(true);

            expect(schema.fechaNacimiento.required).toBe(true);
            expect(schema.fechaNacimiento.type).toBe(Date);

            expect(schema.genero.required).toBe(true);
            expect(schema.genero.type).toBe(String);

            expect(schema.tipoSangre.required).toBe(true);
            expect(schema.tipoSangre.type).toBe(String);

            expect(schema.email.required).toBe(true);
            expect(schema.email.type).toBe(String);
            expect(schema.email.unique).toBe(true);

            expect(schema.direccion.required).toBe(true);
            expect(schema.direccion.type).toBe(String);

            expect(schema.usuarioId.required).toBe(true);
            expect(schema.usuarioId.type).toBe(mongoose.Schema.Types.ObjectId);
            expect(schema.usuarioId.ref).toBe('usuario');
        });

        it('debe tener campos opcionales definidos correctamente', () => {
            const schema = PacienteModel.schema.obj;

            // Campos opcionales
            expect(schema.telefono.type).toBe(Number);
            expect(schema.telefono.required).toBeUndefined();

            expect(schema.ciudad.type).toBe(String);
            expect(schema.ciudad.required).toBeUndefined();

            expect(schema.estado.type).toBe(String);
            expect(schema.estado.required).toBeUndefined();

            expect(schema.codigoPostal.type).toBe(Number);
            expect(schema.codigoPostal.required).toBeUndefined();

            expect(schema.contactoEmergencia.type).toBe(Number);
            expect(schema.contactoEmergencia.required).toBeUndefined();

            expect(schema.numeroSeguro.type).toBe(Number);
            expect(schema.numeroSeguro.required).toBeUndefined();

            expect(schema.alergias.type).toBe(String);
            expect(schema.alergias.required).toBeUndefined();

            expect(schema.observaciones.type).toBe(String);
            expect(schema.observaciones.required).toBeUndefined();

            expect(schema.activo.type).toBe(Boolean);
            expect(schema.activo.required).toBeUndefined();

            expect(schema.img.type).toBe(String);
            expect(schema.img.required).toBeUndefined();
        });

        it('debe tener configurada la colección como "pacientes"', () => {
            expect(PacienteModel.collection.name).toBe('pacientes');
        });
    });

    describe('Enums Validation', () => {
        it('debe validar correctamente los valores del enum TipoDocumento', () => {
            const schema = PacienteModel.schema.obj;
            const validValues = ['DNI', 'RUT', 'PASAPORTE'];
            expect(schema.tipoDocumento.enum).toEqual(validValues);
        });

        it('debe validar correctamente los valores del enum Genero', () => {
            const schema = PacienteModel.schema.obj;
            expect(schema.genero.enum).toEqual(Object.values(Genero));
        });

        it('debe validar correctamente los valores del enum TipoSangre', () => {
            const schema = PacienteModel.schema.obj;
            expect(schema.tipoSangre.enum).toEqual(Object.values(TipoSangre));
        });
    });

    describe('getAge Method', () => {
        let paciente;
        let OriginalDate;

        beforeEach(() => {
            OriginalDate = global.Date;
            paciente = new PacienteModel({
                nombre: 'Juan',
                apellido: 'Pérez',
                tipoDocumento: TipoDocumento.DNI,
                numeroDocumento: 12345678,
                fechaNacimiento: new OriginalDate('1990-06-15'),
                genero: TipoSangre.A_POS, // Nota: bug en el modelo
                tipoSangre: Genero.MASCULINO, // Nota: bug en el modelo
                email: 'juan.perez@test.com',
                direccion: 'Calle 123',
                usuarioId: new mongoose.Types.ObjectId()
            });
        });

        afterEach(() => {
            global.Date = OriginalDate;
        });

        it('debe calcular correctamente la edad cuando ya cumplió años este año', () => {
            const mockToday = new OriginalDate('2025-12-31');

            global.Date = class extends OriginalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super();
                        return mockToday;
                    }
                    super(...args);
                }
            };

            paciente.fechaNacimiento = new OriginalDate('1990-06-15');
            const edad = paciente.getAge();

            expect(edad).toBe(35);
        });

        it('debe calcular correctamente la edad cuando aún no cumplió años este año', () => {
            const mockToday = new OriginalDate('2025-03-10');

            global.Date = class extends OriginalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super();
                        return mockToday;
                    }
                    super(...args);
                }
            };

            paciente.fechaNacimiento = new OriginalDate('1990-06-15');
            const edad = paciente.getAge();

            expect(edad).toBe(34);
        });

        it('debe calcular correctamente la edad en el mismo mes pero antes del día de cumpleaños', () => {
            const mockToday = new OriginalDate('2025-06-10');

            global.Date = class extends OriginalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super();
                        return mockToday;
                    }
                    super(...args);
                }
            };

            paciente.fechaNacimiento = new OriginalDate('1990-06-15');
            const edad = paciente.getAge();

            expect(edad).toBe(34);
        });

        it('debe calcular correctamente la edad en el mismo mes y después del día de cumpleaños', () => {
            const mockToday = new OriginalDate('2025-06-20');

            global.Date = class extends OriginalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super();
                        return mockToday;
                    }
                    super(...args);
                }
            };

            paciente.fechaNacimiento = new OriginalDate('1990-06-15');
            const edad = paciente.getAge();

            expect(edad).toBe(35);
        });

        it('debe calcular correctamente la edad en el día exacto del cumpleaños', () => {
            const mockToday = new OriginalDate('2025-06-15');

            global.Date = class extends OriginalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super();
                        return mockToday;
                    }
                    super(...args);
                }
            };

            paciente.fechaNacimiento = new OriginalDate('1990-06-15');
            const edad = paciente.getAge();

            expect(edad).toBe(35);
        });

        it('debe calcular 0 años para un bebé recién nacido', () => {
            const mockToday = new OriginalDate('2025-06-15');

            global.Date = class extends OriginalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super();
                        return mockToday;
                    }
                    super(...args);
                }
            };

            paciente.fechaNacimiento = new OriginalDate('2025-03-10');
            const edad = paciente.getAge();

            expect(edad).toBe(0);
        });
    });

    describe('toJSON Method', () => {
        it('debe transformar _id a Guid y remover __v', () => {
            const paciente = new PacienteModel({
                nombre: 'María',
                apellido: 'González',
                tipoDocumento: TipoDocumento.DNI,
                numeroDocumento: 87654321,
                fechaNacimiento: new Date('1985-03-20'),
                genero: TipoSangre.O_POS, // Nota: bug en el modelo
                tipoSangre: Genero.FEMENINO, // Nota: bug en el modelo
                email: 'maria.gonzalez@test.com',
                direccion: 'Avenida 456',
                usuarioId: new mongoose.Types.ObjectId()
            });

            const json = paciente.toJSON();

            expect(json._id).toBeUndefined();
            expect(json.__v).toBeUndefined();
            expect(json.Guid).toBeDefined();
            expect(json.nombre).toBe('María');
            expect(json.apellido).toBe('González');
        });

        it('debe mantener todos los demás campos en el JSON', () => {
            const usuarioId = new mongoose.Types.ObjectId();
            const paciente = new PacienteModel({
                nombre: 'Carlos',
                apellido: 'Rodríguez',
                tipoDocumento: TipoDocumento.PASAPORTE,
                numeroDocumento: 11223344,
                fechaNacimiento: new Date('1978-12-05'),
                genero: TipoSangre.AB_NEG,
                tipoSangre: Genero.MASCULINO,
                email: 'carlos.rodriguez@test.com',
                direccion: 'Boulevard 789',
                telefono: 555123456,
                ciudad: 'Buenos Aires',
                estado: 'CABA',
                codigoPostal: 1000,
                contactoEmergencia: 555987654,
                numeroSeguro: 999888777,
                alergias: 'Penicilina',
                observaciones: 'Paciente diabético',
                activo: true,
                img: 'foto.jpg',
                usuarioId: usuarioId
            });

            const json = paciente.toJSON();

            expect(json.nombre).toBe('Carlos');
            expect(json.apellido).toBe('Rodríguez');
            expect(json.tipoDocumento).toBe(TipoDocumento.PASAPORTE);
            expect(json.numeroDocumento).toBe(11223344);
            expect(json.telefono).toBe(555123456);
            expect(json.ciudad).toBe('Buenos Aires');
            expect(json.estado).toBe('CABA');
            expect(json.codigoPostal).toBe(1000);
            expect(json.contactoEmergencia).toBe(555987654);
            expect(json.numeroSeguro).toBe(999888777);
            expect(json.alergias).toBe('Penicilina');
            expect(json.observaciones).toBe('Paciente diabético');
            expect(json.activo).toBe(true);
            expect(json.img).toBe('foto.jpg');
            expect(json.usuarioId).toEqual(usuarioId);
        });
    });
});
