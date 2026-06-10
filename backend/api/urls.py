from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    ProfileView,
    GenerarDescripcionView,
    HistorialDescripcionesView,
    ActivarPremiumView,
    ContactoView,
    ChatbotView,
    UserStatusView,
    GenerarImagenPublicitariaView,
    EliminarProductoGeneradoView,
)

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path(
        "generar-descripcion/",
        GenerarDescripcionView.as_view(),
        name="generar_descripcion",
    ),
    path(
        "historial/",
        HistorialDescripcionesView.as_view(),
        name="historial_descripciones",
    ),
    path("activar-premium/", ActivarPremiumView.as_view(), name="activar_premium"),
    path("contacto/", ContactoView.as_view(), name="contacto"),
    path("chatbot/", ChatbotView.as_view(), name="chatbot"),
    path("user-status/", UserStatusView.as_view(), name="user_status"),
    path(
        "productos/<int:producto_id>/generar-imagen-publicitaria/",
        GenerarImagenPublicitariaView.as_view(),
        name="generar_imagen_publicitaria",
    ),
    path(
        "historial/<int:producto_id>/eliminar/",
        EliminarProductoGeneradoView.as_view(),
        name="eliminar_producto_historial",
    ),
]
