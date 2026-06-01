from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import RegisterView, ProfileView, GenerarDescripcionView, HistorialDescripcionesView, ActivarPremiumView, ContactoView

urlpatterns = [
    
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
  
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('generar-descripcion/', GenerarDescripcionView.as_view(), name='generar_descripcion'),
    path('historial/', HistorialDescripcionesView.as_view(), name='historial_descripciones'),
    path('activar-premium/', ActivarPremiumView.as_view(), name='activar_premium'),
    path('contacto/',ContactoView.as_view(),name='contacto'),
]