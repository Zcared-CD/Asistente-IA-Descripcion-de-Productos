from rest_framework import generics, permissions
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ProductoGenerado
from .serializers import ProductoGeneradoSerializer
from django.db import transaction
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from .models import Contacto
from .serializers import ContactoSerializer
from django.conf import settings
from google import genai



@method_decorator(
    ratelimit(key='ip', rate='3/m', method='POST'),
    name='post'
)

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


@method_decorator(
    ratelimit(key='user', rate='20/h', method='POST'),
    name='post'
)

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

            if not settings.GEMINI_API_KEY:
              return Response(
                  {'error': 'Gemini API Key no configurada.'},
                  status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            prompt = f"""
            Eres un experto en marketing, e-commerce, branding y redacción publicitaria.

            Tu tarea es generar contenido profesional para vender un producto.

            Nombre del producto:
            {nombre_producto}

            Detalles proporcionados por el usuario:
            {palabras_clave}

            Reglas obligatorias:
            - Responde únicamente con el contenido solicitado.
            - No saludes.
            - No digas "con gusto", "claro", "aquí tienes" ni frases introductorias.
            - No inventes datos técnicos exactos si no fueron proporcionados.
            - Si falta información, usa frases generales pero profesionales.
            - Escribe en español.
            - Usa tono comercial, claro, moderno y persuasivo.

            Formato exacto de respuesta:

            TÍTULO:
            Un título comercial corto y atractivo.

            DESCRIPCIÓN:
            Una descripción detallada del producto en 2 o 3 párrafos.

            COLOR Y ESTILO:
            Describe el color, estilo visual o apariencia probable solo si se menciona o se puede inferir de forma general.

            DISEÑO:
            Describe el diseño del producto de forma comercial.

            BENEFICIOS:
            - Beneficio 1
            - Beneficio 2
            - Beneficio 3

            PÚBLICO OBJETIVO:
            Describe para quién es ideal este producto.

            HASHTAGS:
            #Etiqueta1 #Etiqueta2 #Etiqueta3 #Etiqueta4 #Etiqueta5
            """

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            texto_generado = response.text.strip()

            lineas = texto_generado.splitlines()
            titulo_generado = f"Descripción IA: {nombre_producto}"
            descripcion_generada = texto_generado

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
    

@method_decorator(
    ratelimit(key='user', rate='20/h', method='GET'),
    name='get'
)
class HistorialDescripcionesView(generics.ListAPIView):
    serializer_class = ProductoGeneradoSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ProductoGenerado.objects.filter(
            usuario=self.request.user
        ).order_by('-fecha_creacion')
    
class ActivarPremiumView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user

        plan = request.data.get('plan', '').strip()
        precio = request.data.get('precio')

        planes_validos = {
            'PyMes': 10,
            'Corporativo': 59,
        }

        if plan not in planes_validos:
            return Response(
                {'error': 'Plan no válido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if float(precio) != planes_validos[plan]:
            return Response(
                {'error': 'Precio no válido para este plan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_premium = True
        user.creditos = 999999
        user.save(update_fields=['is_premium', 'creditos'])

        return Response({
            'message': f'Plan {plan} activado correctamente.',
            'is_premium': user.is_premium,
            'creditos': user.creditos,
            'plan': plan
        }, status=status.HTTP_200_OK)
    

@method_decorator(
    ratelimit(
        key='ip',
        rate='5/h',
        method='POST'
    ),
    name='post'
)
class ContactoView(generics.CreateAPIView):
    queryset = Contacto.objects.all()
    serializer_class = ContactoSerializer
    permission_classes = (permissions.AllowAny,)


@method_decorator(
    ratelimit(
        key='ip',
        rate='30/h',
        method='POST'
    ),
    name='post'
)
class ChatbotView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        mensaje = request.data.get('mensaje', '').strip()

        if not mensaje:
            return Response(
                {'error': 'El mensaje no puede estar vacío.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(mensaje) < 2:
            return Response(
                {'error': 'El mensaje es demasiado corto.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(mensaje) > 500:
            return Response(
                {'error': 'El mensaje no puede superar los 500 caracteres.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        respuesta = (
            "Gracias por tu mensaje. Soy el asistente de Carlsoft Product IA. "
            "Por ahora puedo ayudarte con información sobre el generador de descripciones, "
            "planes, créditos, soporte y funcionamiento general de la plataforma."
        )

        return Response({
            'respuesta': respuesta
        }, status=status.HTTP_200_OK)