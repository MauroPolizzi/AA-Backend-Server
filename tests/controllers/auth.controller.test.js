const { login, googleSingIn, renewToken, returnClient_id } = require('../../controllers/auth.controller');
const bcrypt = require('bcryptjs');
const UsusarioModel = require('../../models/ususario.model');
const { generateJWT } = require('../../helpers/token');
const { googleVerifyTOKEN } = require('../../helpers/google-verify');

jest.mock('bcryptjs');
jest.mock('../../models/ususario.model');
jest.mock('../../helpers/token');
jest.mock('../../helpers/google-verify');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, guid: null };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('retorna 404 si el email no existe', async () => {
            req.body = { email: 'test@test.com', password: 'pass123' };
            UsusarioModel.findOne.mockResolvedValue(null);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ ok: false, message: 'Email no encontrado' });
        });

        it('retorna 400 si la password es incorrecta', async () => {
            req.body = { email: 'test@test.com', password: 'wrong' };
            UsusarioModel.findOne.mockResolvedValue({ _id: '123', password: 'hashed' });
            bcrypt.compareSync.mockReturnValue(false);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ ok: false, message: 'Email o password incorrectos' });
        });

        it('retorna 200 y token si las credenciales son correctas', async () => {
            req.body = { email: 'test@test.com', password: 'correct' };
            UsusarioModel.findOne.mockResolvedValue({ _id: '123', password: 'hashed' });
            bcrypt.compareSync.mockReturnValue(true);
            generateJWT.mockResolvedValue('jwt.token');

            await login(req, res);

            expect(generateJWT).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ ok: true, message: 'Login successfull', token: 'jwt.token' });
        });

        it('maneja errores y retorna 500', async () => {
            req.body = { email: 'test@test.com', password: 'pass123' };
            UsusarioModel.findOne.mockRejectedValue(new Error('DB error'));
            jest.spyOn(console, 'log').mockImplementation();

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ ok: false, message: 'Error al intentar ingresar' });
        });
    });

    describe('googleSingIn', () => {
        it('crea nuevo usuario si no existe', async () => {
            const mockUser = { _id: '456', save: jest.fn() };
            const userAuth = { name: 'John', email: 'john@gmail.com', picture: 'pic.jpg' };

            req.body = { token: 'google.token' };
            googleVerifyTOKEN.mockResolvedValue(userAuth);
            UsusarioModel.findOne.mockResolvedValue(null);
            UsusarioModel.mockImplementation(() => mockUser);
            generateJWT.mockResolvedValue('jwt.token');

            await googleSingIn(req, res);

            expect(mockUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ ok: true, userAuth, tokenServer: 'jwt.token' });
        });

        it('actualiza usuario existente', async () => {
            const existingUser = { _id: '789', google: false, save: jest.fn() };
            const userAuth = { name: 'Jane', email: 'jane@gmail.com', picture: 'pic.jpg' };

            req.body = { token: 'google.token' };
            googleVerifyTOKEN.mockResolvedValue(userAuth);
            UsusarioModel.findOne.mockResolvedValue(existingUser);
            generateJWT.mockResolvedValue('jwt.token');

            await googleSingIn(req, res);

            expect(existingUser.google).toBe(true);
            expect(existingUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('maneja token de Google inválido', async () => {
            req.body = { token: 'invalid' };
            googleVerifyTOKEN.mockRejectedValue(new Error('Invalid'));
            jest.spyOn(console, 'log').mockImplementation();

            await googleSingIn(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ ok: false, message: 'El token de Google es incorrecto' });
        });
    });

    describe('renewToken', () => {
        it('renueva el token y retorna usuario', async () => {
            const user = { _id: 'guid-123', nombre: 'Test', email: 'test@test.com' };
            req.guid = 'guid-123';
            generateJWT.mockResolvedValue('new.token');
            UsusarioModel.findById.mockResolvedValue(user);

            await renewToken(req, res);

            expect(generateJWT).toHaveBeenCalledWith('guid-123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ ok: true, message: 'Token renovado', newToken: 'new.token', usuario: user });
        });

        it('maneja errores y retorna 500', async () => {
            req.guid = 'guid-123';
            generateJWT.mockRejectedValue(new Error('JWT error'));
            jest.spyOn(console, 'log').mockImplementation();

            await renewToken(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ ok: false, message: 'Error al intentar renovar el token' });
        });
    });

    describe('returnClient_id', () => {
        it('retorna el Google Client ID', async () => {
            const original = process.env.GOOGLE_ID;
            process.env.GOOGLE_ID = 'test-client-id';

            await returnClient_id(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ googleClientId: 'test-client-id' });
            process.env.GOOGLE_ID = original;
        });

        it('maneja cuando GOOGLE_ID no está definido', async () => {
            const original = process.env.GOOGLE_ID;
            delete process.env.GOOGLE_ID;

            await returnClient_id(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ googleClientId: undefined });
            process.env.GOOGLE_ID = original;
        });
    });
});
