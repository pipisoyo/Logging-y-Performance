import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken'
import config from '../config.js'

const mailOptions = {
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    port: 587,
    auth: {
      user: config.mail_username,
      pass: config.mail_password,
    },
  };


export async function sendMailRestore(email) {
  
    const token = jwt.sign({ email }, 'secretKey', { expiresIn: '1h' });
    const transport = nodemailer.createTransport(mailOptions);
   
  try {
    const result = await transport.sendMail({
  from: `Correo de prueba`,
  to: email,
  subject: "Restablecer contraseña",
  html: `<div>
      <h1>Restablecer contraseña</h1>
      <h2>Haga click en el siguiente enlaze para reestablecer su contraseña</h2>
      <a href="http://localhost:8000/restore/${token}">Restablecer Contraseña</a>
      <h3>El link caduca en una hora</h3>
  </div>`,
  });
  
  return "Correo enviado";
  } catch (error) {
  // Maneja cualquier error que pueda ocurrir durante el envío del correo
  console.error("Error al enviar el correo:", error);
  throw error; // O maneja el error de alguna otra manera que consideres adecuada
  }
  }

  export function getEmailFromToken(token) {
    try {
        // Decodificar el token para obtener los datos
        const decoded = jwt.verify(token, 'secretKey');
        // Recuperar el email de los datos decodificados
        const email = decoded.email;
        return email;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
}
