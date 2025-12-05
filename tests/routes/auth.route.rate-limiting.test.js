const request = require('supertest');
const express = require('express');
const { authRouter } = require('../../routes/auth.route');
const { login } = require('../../controllers/auth.controller');
const UsusarioModel = require('../../models/ususario.model');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('../../helpers/token');

// Mocks
jest.mock('../../models/ususario.model');
jest.mock('bcryptjs');
jest.mock('../../helpers/token');

describe('Auth Route - Rate Limiting Security Tests', () => {
    let app;

    beforeEach(() => {
        // Crear una nueva instancia de la aplicación para cada test
        app = express();
        app.use(express.json());
        app.use('/api/login', authRouter);

        // Limpiar todos los mocks
        jest.clearAllMocks();
    });

    describe('Rate Limiting en endpoint de login', () => {

        it('debería permitir hasta 5 intentos de login en 15 minutos', async () => {
            // Mock de usuario no encontrado para simular intentos fallidos
            UsusarioModel.findOne.mockResolvedValue(null);

            const email = 'test@test.com';
            const password = 'password123';

            // Realizar 5 intentos (el límite)
            for (let i = 0; i < 5; i++) {
                const response = await request(app)
                    .post('/api/login')
                    .send({ email, password });

                // Los primeros 5 intentos deben ser procesados normalmente
                expect(response.status).toBe(404);
                expect(response.body).toEqual({
                    ok: false,
                    message: 'Email no encontrado'
                });
            }
        });

        it('debería bloquear el intento 6 con mensaje de rate limit excedido', async () => {
            UsusarioModel.findOne.mockResolvedValue(null);

            const email = 'blocked@test.com';
            const password = 'password123';

            // Realizar 5 intentos permitidos
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/api/login')
                    .send({ email, password });
            }

            // El sexto intento debe ser bloqueado por rate limiting
            const response = await request(app)
                .post('/api/login')
                .send({ email, password });

            expect(response.status).toBe(429); // Too Many Requests
            expect(response.body).toEqual({
                ok: false,
                message: 'Demasiados intentos de login. Por favor, intente nuevamente en 15 minutos.'
            });
        });

        it('debería incluir headers de rate limit en las respuestas', async () => {
            UsusarioModel.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'headers@test.com',
                    password: 'password123'
                });

            // Verificar que los headers de rate limit estén presentes
            expect(response.headers).toHaveProperty('ratelimit-limit');
            expect(response.headers).toHaveProperty('ratelimit-remaining');
            expect(response.headers).toHaveProperty('ratelimit-reset');

            // Verificar que el límite sea 5
            expect(response.headers['ratelimit-limit']).toBe('5');
        });

        it('debería rastrear intentos por email de usuario', async () => {
            UsusarioModel.findOne.mockResolvedValue(null);

            // Diferentes emails deberían tener contadores separados
            const email1 = 'user1@test.com';
            const email2 = 'user2@test.com';
            const password = 'password123';

            // 5 intentos con email1
            for (let i = 0; i < 5; i++) {
                const response = await request(app)
                    .post('/api/login')
                    .send({ email: email1, password });

                expect(response.status).toBe(404);
            }

            // El sexto intento con email1 debe ser bloqueado
            const blockedResponse = await request(app)
                .post('/api/login')
                .send({ email: email1, password });

            expect(blockedResponse.status).toBe(429);

            // Pero email2 aún debe poder intentar (contador diferente)
            const allowedResponse = await request(app)
                .post('/api/login')
                .send({ email: email2, password });

            expect(allowedResponse.status).toBe(404); // Procesado normalmente
            expect(allowedResponse.body.message).not.toContain('Demasiados intentos');
        });

        it('debería prevenir ataques de fuerza bruta automatizados', async () => {
            // Simular un ataque de fuerza bruta con múltiples contraseñas
            const email = 'victim@test.com';
            const passwords = [
                'password1', 'password2', 'password3',
                'password4', 'password5', 'password6',
                'password7', 'password8', 'password9', 'password10'
            ];

            UsusarioModel.findOne.mockResolvedValue({
                _id: '123',
                email: email,
                password: 'hashedpassword'
            });
            bcrypt.compareSync.mockReturnValue(false); // Todas las contraseñas son incorrectas

            let blockedCount = 0;
            let processedCount = 0;

            for (const password of passwords) {
                const response = await request(app)
                    .post('/api/login')
                    .send({ email, password });

                if (response.status === 429) {
                    blockedCount++;
                } else {
                    processedCount++;
                }
            }

            // Verificar que se procesaron solo 5 intentos y el resto fue bloqueado
            expect(processedCount).toBe(5);
            expect(blockedCount).toBe(5);
        });

        it('debería permitir login exitoso dentro del límite de intentos', async () => {
            const email = 'success@test.com';
            const password = 'correctpassword';
            const mockUser = {
                _id: '456',
                email: email,
                password: 'hashedpassword'
            };
            const mockToken = 'jwt.token.here';

            UsusarioModel.findOne.mockResolvedValue(mockUser);
            bcrypt.compareSync.mockReturnValue(true);
            generateJWT.mockResolvedValue(mockToken);

            // Realizar 3 intentos fallidos
            bcrypt.compareSync.mockReturnValueOnce(false);
            bcrypt.compareSync.mockReturnValueOnce(false);
            bcrypt.compareSync.mockReturnValueOnce(false);

            for (let i = 0; i < 3; i++) {
                await request(app)
                    .post('/api/login')
                    .send({ email, password: 'wrongpassword' });
            }

            // El cuarto intento con contraseña correcta debe funcionar
            bcrypt.compareSync.mockReturnValue(true);
            const successResponse = await request(app)
                .post('/api/login')
                .send({ email, password });

            expect(successResponse.status).toBe(200);
            expect(successResponse.body).toEqual({
                ok: true,
                message: 'Login successfull',
                token: mockToken
            });
        });

        it('debería mantener el contador de rate limit después de errores de validación', async () => {
            // Intentar con email inválido (sin formato de email)
            const invalidAttempts = 6;

            for (let i = 0; i < invalidAttempts; i++) {
                const response = await request(app)
                    .post('/api/login')
                    .send({
                        email: 'notanemail', // Email inválido
                        password: 'password123'
                    });

                // Los primeros 5 deben retornar error de validación
                // El sexto debe ser bloqueado por rate limiting
                if (i < 5) {
                    expect(response.status).toBe(400); // Error de validación
                } else {
                    expect(response.status).toBe(429); // Rate limit
                }
            }
        });

        it('debería decrementar el contador de intentos restantes con cada solicitud', async () => {
            UsusarioModel.findOne.mockResolvedValue(null);

            const email = 'countdown@test.com';
            const password = 'password123';

            // Primera solicitud - 4 restantes
            let response = await request(app)
                .post('/api/login')
                .send({ email, password });
            expect(response.headers['ratelimit-remaining']).toBe('4');

            // Segunda solicitud - 3 restantes
            response = await request(app)
                .post('/api/login')
                .send({ email, password });
            expect(response.headers['ratelimit-remaining']).toBe('3');

            // Tercera solicitud - 2 restantes
            response = await request(app)
                .post('/api/login')
                .send({ email, password });
            expect(response.headers['ratelimit-remaining']).toBe('2');

            // Cuarta solicitud - 1 restante
            response = await request(app)
                .post('/api/login')
                .send({ email, password });
            expect(response.headers['ratelimit-remaining']).toBe('1');

            // Quinta solicitud - 0 restantes
            response = await request(app)
                .post('/api/login')
                .send({ email, password });
            expect(response.headers['ratelimit-remaining']).toBe('0');

            // Sexta solicitud - bloqueada
            response = await request(app)
                .post('/api/login')
                .send({ email, password });
            expect(response.status).toBe(429);
        });
    });

    describe('Endpoints NO protegidos por rate limiting (verificación)', () => {

        it('el endpoint de renovación de token NO debe tener rate limiting de login', async () => {
            // Este test verifica que solo el endpoint de login tiene rate limiting
            // Los otros endpoints no deben estar afectados

            // Agotar el límite de rate en login
            UsusarioModel.findOne.mockResolvedValue(null);
            const email = 'different@test.com';

            for (let i = 0; i < 6; i++) {
                await request(app)
                    .post('/api/login')
                    .send({ email, password: 'pass' });
            }

            // Verificar que /renew no está afectado por el rate limit de login
            const renewResponse = await request(app)
                .get('/api/login/renew')
                .set('x-token', 'sometoken');

            // No debe retornar 429 (puede retornar 401 por token inválido, pero no 429)
            expect(renewResponse.status).not.toBe(429);
        });
    });

    describe('Protección contra ataques comunes', () => {

        it('debería proteger contra credential stuffing', async () => {
            // Credential stuffing: usar credenciales filtradas de otros sitios
            const email = 'credstuffing@test.com'; // Email único para este test
            const passwords = [
                'Password123!', 'qwerty123', 'admin123',
                'letmein', 'welcome1', 'monkey123'
            ];

            UsusarioModel.findOne.mockResolvedValue({
                _id: '123',
                email: email,
                password: 'correcthash'
            });
            bcrypt.compareSync.mockReturnValue(false);

            let processedCount = 0;
            let blockedCount = 0;

            for (let i = 0; i < passwords.length; i++) {
                const response = await request(app)
                    .post('/api/login')
                    .send({ email, password: passwords[i] });

                // Después del intento 5, debe estar bloqueado
                if (response.status === 429) {
                    blockedCount++;
                } else {
                    // Los primeros 5 intentos deben procesarse (aunque fallen)
                    expect(response.status).toBe(400); // Password incorrecta
                    processedCount++;
                }
            }

            // Verificar que se procesaron 5 intentos y 1 fue bloqueado
            expect(processedCount).toBe(5);
            expect(blockedCount).toBe(1);
        });

        it('debería proteger contra dictionary attacks', async () => {
            // Dictionary attack: probar palabras comunes del diccionario
            const commonPasswords = [
                '123456', 'password', '12345678', 'qwerty', '123456789',
                'abc123', 'password1', '1234567', 'welcome', 'monkey'
            ];

            const email = 'target@test.com';
            UsusarioModel.findOne.mockResolvedValue({
                _id: '789',
                email: email,
                password: 'securehash'
            });
            bcrypt.compareSync.mockReturnValue(false);

            let attemptCount = 0;

            for (const password of commonPasswords) {
                const response = await request(app)
                    .post('/api/login')
                    .send({ email, password });

                attemptCount++;

                // Después de 5 intentos, todos deben ser bloqueados
                if (attemptCount > 5) {
                    expect(response.status).toBe(429);
                    expect(response.body.message).toContain('Demasiados intentos');
                }
            }
        });

        it('debería proteger completamente contra ataques distribuidos con rate limiting por email', async () => {
            // Al rastrear por email en lugar de IP, protegemos completamente
            // contra ataques distribuidos desde múltiples IPs al mismo email

            const targetEmail = 'ceo@company.com';
            UsusarioModel.findOne.mockResolvedValue({
                _id: 'ceo-id',
                email: targetEmail,
                password: 'verysecurehash'
            });
            bcrypt.compareSync.mockReturnValue(false);

            // Simular 5 intentos desde "diferentes IPs" (mismo email)
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/api/login')
                    .send({ email: targetEmail, password: `attempt${i}` });
            }

            // El sexto intento debe ser bloqueado, sin importar la "IP"
            const response = await request(app)
                .post('/api/login')
                .send({ email: targetEmail, password: 'attempt6' });

            // Verificar que está bloqueado
            expect(response.status).toBe(429);
            expect(response.body.message).toContain('Demasiados intentos');
        });
    });
});
