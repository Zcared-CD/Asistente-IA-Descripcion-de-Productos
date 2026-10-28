
import json
import logging

from django.conf import settings
from pywebpush import webpush, WebPushException

from .models import PushSubscription

logger = logging.getLogger(__name__)


def enviar_notificacion_push(
    suscripcion,
    titulo,
    mensaje,
    url="/"
):
    """
    Envía una notificación Web Push
    a un dispositivo suscrito.
    """

    if not settings.VAPID_PRIVATE_KEY:
        raise RuntimeError(
            "La clave privada VAPID no está configurada."
        )

    if not settings.VAPID_SUBJECT:
        raise RuntimeError(
            "El contacto VAPID no está configurado."
        )

    subscription_info = {
        "endpoint": suscripcion.endpoint,
        "keys": {
            "p256dh": suscripcion.p256dh,
            "auth": suscripcion.auth
        }
    }

    payload = json.dumps({
        "title": titulo,
        "body": mensaje,
        "url": url
    })

    try:
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": settings.VAPID_SUBJECT
            },
            ttl=3600,
            timeout=10
        )

        return True

    except WebPushException as error:
        codigo = error.response.status_code if error.response else None

        # Suscripción caducada o eliminada.
        if codigo in (404, 410):
            suscripcion.activa = False
            suscripcion.save(update_fields=["activa"])

        logger.warning(
            "No se pudo enviar una notificación push. "
            "Estado HTTP: %s",
            codigo
        )

        return False


def enviar_push_a_usuario(usuario, titulo, mensaje, url="/"):
    """
    Envía la notificación a todos los dispositivos
    activos del usuario.
    """

    suscripciones = PushSubscription.objects.filter(
        usuario=usuario,
        activa=True
    )

    enviados = 0

    for suscripcion in suscripciones:
        try:
            if enviar_notificacion_push(
                suscripcion,
                titulo,
                mensaje,
                url
            ):
                enviados += 1
        except RuntimeError:
            logger.error(
                "Configuración VAPID incompleta."
            )
            break

    return enviados
