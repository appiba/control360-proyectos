function enviarInforme_(payload, context) {
  return preparedAction_("enviarInforme", "Envío de informes por correo preparado para Fase 2/5.", payload);
}

function sendEmailPlaceholder_(to, subject, body) {
  return {
    to: to,
    subject: subject,
    body: body,
    sent: false,
    reason: "Placeholder seguro: no se envía correo en Fase 1."
  };
}

