
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.throttling import UserRateThrottle

from django.conf import settings

from .models import PushSubscription
from .push_service import enviar_push_a_usuario


# ==========================================
# LIMITADOR DE NOTIFICACIONES DE PRUEBA
# ==========================================

class PushTestRateThrottle(UserRateThrottle):
    """
    Permite un máximo de 3 solicitudes
    por hora para cada usuario autenticado.
    """
    scope = "push_test"
    rate = "3/hour"


# ==========================================
# OBTENER CLAVE PÚBLICA VAPID
# ==========================================

class PushPublicKeyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        public_key = getattr(
            settings,
            "VAPID_PUBLIC_KEY",
            ""
        )

        if not public_key:
            return Response(
                {"error": "Clave VAPID no configurada."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response({
            "publicKey": public_key
        })


# ==========================================
# REGISTRAR DISPOSITIVO PARA PUSH
# ==========================================

class PushSubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        subscription = request.data

        if not isinstance(subscription, dict):
            return Response(
                {"error": "Suscripción inválida."},
                status=status.HTTP_400_BAD_REQUEST
            )

        endpoint = subscription.get("endpoint")
        keys = subscription.get("keys") or {}

        if not isinstance(keys, dict):
            return Response(
                {"error": "Claves inválidas."},
                status=status.HTTP_400_BAD_REQUEST
            )

        p256dh = keys.get("p256dh")
        auth = keys.get("auth")

        if not all(
            isinstance(value, str) and value
            for value in (endpoint, p256dh, auth)
        ):
            return Response(
                {"error": "Faltan datos de suscripción."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            len(endpoint) > 2048
            or len(p256dh) > 512
            or len(auth) > 512
            or not endpoint.startswith("https://")
        ):
            return Response(
                {"error": "Formato de suscripción inválido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                "usuario": request.user,
                "p256dh": p256dh,
                "auth": auth,
                "activa": True,
            }
        )

        return Response(
            {
                "message": "Dispositivo registrado correctamente."
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# DESACTIVAR NOTIFICACIONES EN DISPOSITIVO
# ==========================================

class PushUnsubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get("endpoint")

        if not isinstance(endpoint, str) or not endpoint:
            return Response(
                {"error": "Endpoint requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted, _ = PushSubscription.objects.filter(
            usuario=request.user,
            endpoint=endpoint
        ).delete()

        return Response({
            "message": "Suscripción eliminada.",
            "deleted": deleted > 0
        })


# ==========================================
# NOTIFICACIÓN PUSH DE PRUEBA
# ==========================================

class PushTestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Máximo 3 pruebas por hora y usuario.
    throttle_classes = [PushTestRateThrottle]

    def post(self, request):

        # Comprobar que exista un dispositivo activo.
        if not PushSubscription.objects.filter(
            usuario=request.user,
            activa=True
        ).exists():
            return Response(
                {"error": "No tienes dispositivos suscritos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enviar notificación de prueba.
        enviados = enviar_push_a_usuario(
            request.user,
            "¡Bienvenido a las notificaciones de Carlsoft!",
            "Ya puedes recibir avisos sobre tus créditos, "
            "descripciones y novedades.",
            "/"
        )

        if enviados == 0:
            return Response(
                {"error": "No se pudo enviar la notificación."},
                status=status.HTTP_502_BAD_GATEWAY
            )

        return Response({
            "message": "Notificación push enviada.",
            "enviados": enviados
        })
