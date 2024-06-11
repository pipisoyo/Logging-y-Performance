import { createHash, isValidPassword } from '../utils/utils.js';
import userModel from '../dao/models/users.js';
import response from '../config/responses.js';
import userDTO from '../dao/DTOs/users.dto.js';
import { addLogger } from '../utils/logger.js';
import { getEmailFromToken, sendMailRestore } from '../utils/mailing.js';

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
                    req.logger.error('Sesión cerrada exitosamente')
                    return response.successResponse(res, 200, 'Sesión cerrada exitosamente', null);
                    }
                    req.loger.error('Error al cerrar sesión')
                    return response.errorResponse(res, 500, 'Error al cerrar sesión');
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
        addLogger(req, res, async () => {
            req.logger.info('Restaurando contraseña de usuario');
            let email = getEmailFromToken(req.params.token)
            let  {password}  = req.body.obj;
            userModel.findOne({ email }).then(user => {
                console.log("🚀 ~ userModel.findOne ~ user:", user)
                if (!user) {
                    req.logger.error('No se encuentra el usuario');
                    return response.errorResponse(res, 400, 'No se encuentra el usuario');
                }

                if (isValidPassword(user, password)) {
                    req.logger.error('La nueva contraseña es igual a la contraseña actual');
                    return response.errorResponse(res, 400, 'No es posible utilizar la misma contraseña');
                }
                
                const newPassword = createHash(password);
    
                userModel.updateOne({ _id: user._id }, { $set: { password: newPassword } }).then(() => {
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
            },

            mailRestore: (req, res) => {
                addLogger(req, res, () => {
                    req.logger.info('Verificando email');
                    const { email} = req.body;
                    userModel.findOne({ email }).then(user => {
                        if (!user) {
                            req.logger.error('No se encuentra el usuario');
                            return response.errorResponse(res, 400, 'No se encuentra el usuario');
                        }
                        sendMailRestore(email).then(() => {
                            req.logger.info('Email enviado');
                            response.successResponse(res, 200, 'Email enviado', null);
                        });
                    }).catch(err => {
                        req.logger.error('Error al enviar el email: ' + err.message);
                        response.errorResponse(res, 500, 'Error al enviar el email');
                    });
                });
            },
            
            premiun: (req, res) => {
                addLogger(req, res, async () => {
                    req.logger.info('Verificando email'); 
                    const uid = req.params.uid;
                    userModel.findById(uid).then(user => {
                        if (!user) {
                            req.logger.error('No se encuentra el usuario');
                            return response.errorResponse(res, 400, 'No se encuentra el usuario');
                        }
                        
                        let newRole = user.role === "premiun" ? "user" : "premiun";
                        
                        userModel.updateOne({ _id: uid }, { role: newRole }).then(() => {
                            req.logger.info(`Rol actualizado a ${newRole}`);
                            response.successResponse(res, 200, `Rol actualizado a ${newRole}`, null);
                        }).catch(err => {
                            req.logger.error('Error al actualizar el rol: ' + err.message);
                            response.errorResponse(res, 500, 'Error al actualizar el rol');
                        });
                    });
                });
            }
};

export default sessionController;