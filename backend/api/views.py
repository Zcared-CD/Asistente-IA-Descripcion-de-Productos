from rest_framework import generics, permissions
from .models import CustomUser
from .serializers import UserSerializer

# Vista para registrar nuevos usuarios (Cualquiera puede entrar, no necesita token)
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

# Vista para ver los datos del perfil (¡Solo usuarios con un Token válido pueden entrar!)
class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        # En lugar de buscar por ID en la URL, devolvemos automáticamente 
        # el usuario dueño del Token que viene en la petición.
        return self.request.user
