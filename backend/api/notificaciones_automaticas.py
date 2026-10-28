
import logging

from .models import CustomUser, PushSubscription
from .push_service import enviar_push_a_usuario

logger = logging.getLogger(__name__)


def notificar_descripcion_generada(usuario_id, nombre_producto, creditos):
    """
    Envía una notificación push cuando una descripción
    se ha generado y guardado correctamente.
    """

    try:
        usuario = CustomUser.objects.get(pk=usuario_id)

        if not PushSubscription.objects.filter(
            usuario=usuario,
            activa=True
        ).exists():
            return

        titulo = "✨ ¡Tu descripción está lista!"

        if usuario.is_premium:
            mensaje = (
                f"Tu descripción de {nombre_producto} "
                "se generó correctamente."
            )

        elif creditos == 1:
            mensaje = (
                f"Tu descripción de {nombre_producto} está lista. "
                "Te queda 1 crédito gratuito."
            )

        elif creditos == 0:
            mensaje = (
                f"Tu descripción de {nombre_producto} está lista. "
                "Has agotado tus créditos gratuitos."
            )

        else:
            mensaje = (
                f"Tu descripción de {nombre_producto} está lista. "
                f"Tienes {creditos} créditos disponibles."
            )

        enviar_push_a_usuario(
            usuario,
            titulo,
            mensaje,
            "/"
        )

    except Exception:
        logger.exception(
            "Error enviando notificación automática al usuario %s",
            usuario_id
        )


def notificar_imagen_generada(usuario_id, nombre_producto):
    """
    Envía una notificación cuando la imagen
    publicitaria se ha guardado correctamente.
    """

    try:
        usuario = CustomUser.objects.get(pk=usuario_id)

        if not PushSubscription.objects.filter(
            usuario=usuario,
            activa=True
        ).exists():
            return

        titulo = "🎨 ¡Tu imagen publicitaria está lista!"

        mensaje = (
            f"La imagen publicitaria de {nombre_producto} "
            "se generó correctamente. "
            "Entra a Carlsoft para visualizarla."
        )

        enviar_push_a_usuario(
            usuario,
            titulo,
            mensaje,
            "/"
        )

    except Exception:
        logger.exception(
            "Error notificando imagen generada al usuario %s",
            usuario_id
        )

