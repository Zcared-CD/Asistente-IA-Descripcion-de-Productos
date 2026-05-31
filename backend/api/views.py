from rest_framework import generics, permissions
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ProductoGenerado
from .serializers import ProductoGeneradoSerializer
from django.db import transaction


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class GenerarDescripcionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user

        nombre_producto = request.data.get('nombre_producto', '').strip()
        palabras_clave = request.data.get('palabras_clave', '').strip()

        if not nombre_producto:
            return Response(
                {'error': 'El nombre del producto es obligatorio.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(nombre_producto) < 3:
            return Response(
                {'error': 'El nombre del producto debe tener al menos 3 caracteres.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(nombre_producto) > 200:
            return Response(
                {'error': 'El nombre del producto no puede superar los 200 caracteres.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not palabras_clave:
            return Response(
                {'error': 'Las palabras clave son obligatorias.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(palabras_clave) < 5:
            return Response(
                {'error': 'Agrega más detalles del producto.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(palabras_clave) > 1000:
            return Response(
                {'error': 'Las palabras clave no pueden superar los 1000 caracteres.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            user.refresh_from_db()

            if not user.is_premium:
                if user.creditos <= 0:
                    return Response(
                        {'error': 'No tienes créditos disponibles.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

                user.creditos -= 1
                user.save(update_fields=['creditos'])

            titulo_generado = f"Campaña Destacada: {nombre_producto}"

            descripcion_generada = (
                f"Presentamos {nombre_producto}, un producto diseñado para destacar en el mercado.\n\n"
                f"Características principales: {palabras_clave}.\n\n"
                f"Esta descripción fue generada para ayudarte a crear una presentación clara, atractiva "
                f"y profesional para tus clientes."
            )

            producto = ProductoGenerado.objects.create(
                usuario=user,
                nombre_producto=nombre_producto,
                palabras_clave=palabras_clave,
                titulo_generado=titulo_generado,
                descripcion_generada=descripcion_generada
            )

        return Response({
            'producto': ProductoGeneradoSerializer(producto).data,
            'creditos': user.creditos,
            'is_premium': user.is_premium
        }, status=status.HTTP_201_CREATED)
    

class HistorialDescripcionesView(generics.ListAPIView):
    serializer_class = ProductoGeneradoSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ProductoGenerado.objects.filter(
            usuario=self.request.user
        ).order_by('-fecha_creacion')