import { Resend } from "resend";
import { env } from "../../config/env";

// Inicializamos Resend con la variable de entorno
const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;
const mailFrom = env.mailFrom;

export const mailService = {
  async sendOtpEmail(to: string, otp: string): Promise<void> {
    // 💡 CAMBIO DE SEGURIDAD:
    // Cambia esto a 'true' si quieres forzar que envíe correos reales desde tu PC (Local)
    // Cambia esto a 'process.env.NODE_ENV === "production"' cuando vayas a subir el proyecto a internet.
    const FORCE_REAL_EMAIL_IN_DEV = env.forceRealEmailInDev;
    // 1. MODO DESARROLLO (Solo por consola si no hay API key o si desactivas la fuerza)
    if (
      !resend ||
      (!FORCE_REAL_EMAIL_IN_DEV && process.env.NODE_ENV !== "production")
    ) {
      console.info("============== 📧 [DEVELOPMENT MAIL LOG] ==============");
      console.info(`Para:  ${to}`);
      console.info(`Asunto: Tu código de verificación OTP`);
      console.info(`Código: [ ${otp} ]`);
      console.info("=======================================================");
      return;
    }

    // 2. ENVÍO REAL (Resend)
    try {
      await resend.emails.send({
        from: mailFrom,
        to: to,
        subject: `${otp} es tu código de verificación`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #111827; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px;">Verifica tu identidad</h2>
            <p style="color: #4b5563; font-size: 16px; text-align: center; margin-bottom: 32px;">Usa el siguiente código de un solo uso (OTP) para completar tu solicitud. Este código expira en unos minutos.</p>
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 32px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1f2937; font-family: monospace;">${otp}</span>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
              Si no solicitaste este código, puedes ignorar este correo de forma segura.
            </p>
          </div>
        `,
      });
      console.info(`[MAIL_SUCCESS] OTP enviado exitosamente a ${to}`);
    } catch (error) {
      console.error(`[MAIL_ERROR] No se pudo enviar el OTP a ${to}:`, error);
      throw new Error("Error al enviar el correo de verificación.");
    }
  },
};
