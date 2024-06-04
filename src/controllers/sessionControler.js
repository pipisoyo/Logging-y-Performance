import { createHash } from '../utils/utils.js';
import userModel from '../dao/models/users.js';
import response from '../config/responses.js';
import userDTO from '../dao/DTOs/users.dto.js';
import { addLogger } from '../utils/logger.js';

/**
 * Controlador para la gestión de sesiones de usuario.
 */
const sessionController = {

    /**
     * Cierra la sesión del usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    logout: (req, res) => {
        addLogger(req,res,() =>{
            req.session.destroy((err) => {
                if (err) {
                    req.loger.error('Error al cerrar sesión')
                    return response.errorResponse(res, 500, 'Error al cerrar sesión');
                }
                req.loger.error('Error al cerrar sesión')
                response.successResponse(res, 200, 'Sesión cerrada exitosamente', null);
            });
        });
    },

    /**
     * Registra a un nuevo usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    register: (req, res) => {
        addLogger(req, res, () => {
            req.logger.info('Registrando nuevo usuario');
            response.successResponse(res, 201, 'Usuario registrado exitosamente', null);
        });
    },

    /**
     * Maneja el fallo en el registro de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    failRegister: (req, res) => {
        addLogger(req, res, () => {
            req.logger.error('Fallo en el registro de usuario');
            console.log('error');
            response.errorResponse(res, 400, 'Falló el registro');
        });
    },

    /**
     * Inicia sesión de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    login: (req, res) => {
        addLogger(req, res, () => {
            if (!req.user) {
                req.logger.error('Error en el inicio de sesión');
                return response.errorResponse(res, 400, 'Error en el inicio de sesión');
            }
            req.session.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                age: req.user.age,
                role: req.user.role || 'user',
                cartId: req.user.cart
            };
            const user = userDTO(req.user);
            req.logger.info('Inicio de sesión exitoso');
            response.successResponse(res, 200, 'Inicio de sesión exitoso', { user });
        });
    },

    /**
     * Maneja el fallo en el inicio de sesión.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    failLogin: (req, res) => {
        addLogger(req, res, () => {
            req.logger.error('Fallo en el inicio de sesión');
            response.errorResponse(res, 400, 'Fallo en el inicio de sesión');
        });
    },

    /**
     * Inicia la autenticación con GitHub.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    githubLogin: (req, res) => {
        addLogger(req, res, () => {
            req.logger.info('Iniciando autenticación con GitHub');
            response.successResponse(res, 200, 'Autenticación con GitHub iniciada', null);
        });
    },

    /**
     * Callback de autenticación con GitHub.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    githubCallback: (req, res) => {
        addLogger(req, res, () => {
            req.session.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                age: req.user.age,
                role: req.user.role,
                cartId: req.user.cart
            };
            req.logger.info('Callback de autenticación con GitHub');
            res.redirect('/products');
        });
    },

    /**
     * Restaura la contraseña de un usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    restorePassword: (req, res) => {
        addLogger(req, res, () => {
            req.logger.info('Restaurando contraseña de usuario');
            const { email, password } = req.body;
            userModel.findOne({ email }).then(user => {
                if (!user) {
                    req.logger.error('No se encuentra el usuario');
                    return response.errorResponse(res, 400, 'No se encuentra el usuario');
                }
                const newPass = createHash(password);
                userModel.updateOne({ _id: user._id }, { $set: { password: newPass } }).then(() => {
                    req.logger.info('Contraseña actualizada correctamente');
                    response.successResponse(res, 200, 'Contraseña actualizada correctamente', null);
                });
            }).catch(err => {
                req.logger.error('Error al restaurar contraseña: ' + err.message);
                response.errorResponse(res, 500, 'Error al restaurar contraseña');
            });
        });
    },

            /**
     * Obtiene el usuario actualmente autenticado.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
            getCurrentUser: (req, res) => {
                addLogger(req, res, () => {
                    if (req.session.user) {
                        req.logger.info('Obteniendo usuario autenticado');
                        const user = userDTO(req.session.user);
                        response.successResponse(res, 200, 'Usuario autenticado', { user });
                    } else {
                        req.logger.error('Usuario no autenticado');
                        response.errorResponse(res, 401, 'Usuario no autenticado');
                    }
                });
            }
        };

export default sessionController;