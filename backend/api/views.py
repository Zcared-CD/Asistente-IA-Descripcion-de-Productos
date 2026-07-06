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
from rest_framework.parsers import MultiPartParser, FormParser
import base64
from django.utils import timezone
from datetime import timedelta
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import cloudinary
import cloudinary.uploader
from google.genai import types
import requests
from decimal import Decimal
from openai import OpenAI
from django.core.files.base import ContentFile
import uuid
import base64


@method_decorator(ratelimit(key="ip", rate="3/m", method="POST"), name="post")
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class OpenpayCreateChargeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user

        plan = request.data.get("plan", "").upper()
        token_id = request.data.get("token_id")
        device_session_id = request.data.get("device_session_id")

        planes = {
            "PYMES": Decimal("10.00"),
            "CORPORATIVO": Decimal("59.00"),
        }

        if plan not in planes:
            return Response({"error": "Plan no válido."}, status=400)

        if not token_id or not device_session_id:
            return Response(
                {"error": "Falta token_id o device_session_id."},
                status=400,
            )

        if not settings.OPENPAY_MERCHANT_ID or not settings.OPENPAY_PRIVATE_KEY:
            return Response(
                {"error": "Openpay no está configurado."},
                status=500,
            )

        url = f"{settings.OPENPAY_API_URL}/{settings.OPENPAY_MERCHANT_ID}/charges"

        payload = {
            "method": "card",
            "source_id": token_id,
            "amount": float(planes[plan]),
            "currency": "MXN",
            "description": f"Suscripción {plan} - Carlsoft Product IA",
            "order_id": f"CARLSOFT-{user.id}-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            "device_session_id": device_session_id,
            "customer": {
                "name": user.first_name or user.username,
                "last_name": user.last_name or "Cliente",
                "email": user.email,
                "phone_number": user.telefono or "0000000000",
            },
        }

        try:
            response = requests.post(
                url,
                json=payload,
                auth=(settings.OPENPAY_PRIVATE_KEY, ""),
                timeout=30,
            )

            data = response.json()

            if response.status_code not in [200, 201]:
                return Response(
                    {
                        "error": "Openpay rechazó el cargo.",
                        "detalle": data,
                    },
                    status=400,
                )

            user.is_premium = True
            user.plan = plan
            user.creditos = 0
            user.fecha_inicio_plan = timezone.now().date()
            user.fecha_fin_plan = timezone.now().date() + timedelta(days=30)
            user.subscription_status = "active"
            user.cancel_at_period_end = False
            user.save(
                update_fields=[
                    "is_premium",
                    "plan",
                    "creditos",
                    "fecha_inicio_plan",
                    "fecha_fin_plan",
                    "subscription_status",
                    "cancel_at_period_end",
                ]
            )

            return Response(
                {
                    "message": "Pago aprobado y plan activado.",
                    "openpay_charge": data,
                    "plan": plan,
                    "is_premium": user.is_premium,
                    "fecha_fin_plan": user.fecha_fin_plan,
                },
                status=200,
            )

        except requests.RequestException as e:
            print("ERROR OPENPAY:", e)
            return Response(
                {"error": "No se pudo conectar con Openpay."},
                status=500,
            )


def subir_imagen_a_cloudinary(image_bytes, nombre_archivo):
    try:
        resultado = cloudinary.uploader.upload(
            image_bytes,
            folder="carlsoft/publicidad",
            public_id=nombre_archivo,
            resource_type="image",
            overwrite=True,
        )

        return resultado.get("secure_url")

    except Exception as e:
        print("ERROR CLOUDINARY:", e)
        return None


def obtener_limites_usuario(user):
    plan = (user.plan or "FREE").upper()

    if not user.is_premium:
        plan = "FREE"

    limites = {
        "FREE": {
            "descripciones": 5,
            "imagenes": 1,
            "pdf": False,
        },
        "PYMES": {
            "descripciones": 20,
            "imagenes": 8,
            "pdf": True,
        },
        "CORPORATIVO": {
            "descripciones": 100,
            "imagenes": 50,
            "pdf": True,
        },
    }

    return limites.get(plan, limites["FREE"])


def reiniciar_uso_diario_si_es_necesario(user):
    hoy = timezone.now().date()

    if user.fecha_uso != hoy:
        user.descripciones_hoy = 0
        user.imagenes_hoy = 0
        user.fecha_uso = hoy
        user.save(
            update_fields=[
                "descripciones_hoy",
                "imagenes_hoy",
                "fecha_uso",
            ]
        )


@method_decorator(ratelimit(key="user", rate="20/h", method="POST"), name="post")
class GenerarDescripcionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user

        nombre_producto = request.data.get("nombre_producto", "").strip()
        palabras_clave = request.data.get("palabras_clave", "").strip()
        marca = request.data.get("marca", "").strip()
        categoria = request.data.get("categoria", "").strip()
        color = request.data.get("color", "").strip()
        material = request.data.get("material", "").strip()
        publico_objetivo = request.data.get("publico_objetivo", "").strip()
        tono = request.data.get("tono", "").strip()
        instruccion_imagen = request.data.get("instruccion_imagen", "").strip()
        imagen_producto = request.FILES.get("imagen_producto")

        if imagen_producto:
            tipos_permitidos = ["image/jpeg", "image/png", "image/webp"]
            max_size = 5 * 1024 * 1024  # 5MB

            if imagen_producto.content_type not in tipos_permitidos:
                return Response(
                    {"error": "Solo se permiten imágenes JPG, PNG o WEBP."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if imagen_producto.size > max_size:
                return Response(
                    {"error": "La imagen no puede superar los 5MB."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not nombre_producto:
            return Response(
                {"error": "El nombre del producto es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(nombre_producto) < 3:
            return Response(
                {"error": "El nombre del producto debe tener al menos 3 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(nombre_producto) > 200:
            return Response(
                {
                    "error": "El nombre del producto no puede superar los 200 caracteres."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not palabras_clave:
            return Response(
                {"error": "Las palabras clave son obligatorias."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(palabras_clave) < 5:
            return Response(
                {"error": "Agrega más detalles del producto."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(palabras_clave) > 1000:
            return Response(
                {"error": "Las palabras clave no pueden superar los 1000 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user.refresh_from_db()

            reiniciar_uso_diario_si_es_necesario(user)

            limites = obtener_limites_usuario(user)

            if user.descripciones_hoy >= limites["descripciones"]:
                return Response(
                    {
                        "error": f"Has alcanzado tu límite diario de {limites['descripciones']} descripciones."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if not user.is_premium:
                if user.creditos <= 0:
                    return Response(
                        {"error": "No tienes créditos disponibles."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                user.creditos -= 1
                user.save(update_fields=["creditos"])

            if not settings.GEMINI_API_KEY:
                return Response(
                    {"error": "Gemini API Key no configurada."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            prompt = f"""
            Eres un experto en marketing, e-commerce, análisis visual de productos, retail, tecnología, hogar, moda, herramientas, cocina, decoración y redacción publicitaria.

            Tu tarea es generar contenido profesional para vender un producto, Analiza el producto usando la información escrita y, si hay imagen, también lo que se observa visualmente.

            Nombre del producto:
            {nombre_producto}

            Detalles proporcionados por el usuario:
            {palabras_clave}

            Marca:
            {marca or "No especificada"}

            Categoría:
            {categoria or "No especificada"}

            Color:
            {color or "No especificado"}

            Material:
            {material or "No especificado"}

            Público objetivo:
            {publico_objetivo or "No especificado"}

            Tono deseado:
            {tono or "Comercial y claro"}

            Instrucciones para futura imagen publicitaria:
            {instruccion_imagen or "No especificadas"}

            Reglas obligatorias:
            - Responde únicamente con el contenido solicitado.
            - No saludes.
            - No digas "con gusto", "claro", "aquí tienes" ni frases introductorias.
            - Si algo se infiere visualmente, dilo como "aparenta", "parece" o "podría".
            - No inventes datos técnicos exactos si no fueron proporcionados.
            - Si el producto parece orientado a hombre, mujer o unisex, indícalo como recomendación comercial, no como afirmación absoluta.
            - Si falta información, usa frases generales pero profesionales.
            - Escribe en español.
            - Usa tono comercial, claro, moderno y persuasivo.

            Formato exacto de respuesta:

            TÍTULO:
            Máximo 8 palabras.

            DESCRIPCIÓN CORTA:
            Máximo 3 líneas. Lista para ecommerce o marketplace.

            CARACTERÍSTICAS CLAVE:
            - Característica 1
            - Característica 2
            - Característica 3

            BENEFICIOS:
            - Beneficio 1
            - Beneficio 2
            - Beneficio 3
            
            TIPO DE PRODUCTO:
            Una frase corta indicando si parece ropa, tecnología, cocina, herramienta, accesorio, equipo, decoración u otra categoría.

            USO RECOMENDADO:
            Una frase corta indicando para qué sirve o dónde usarlo.

            PÚBLICO OBJETIVO:
            Una frase corta indicando para quién es ideal.

            ANÁLISIS VISUAL:
            Máximo 2 líneas sobre color, forma o apariencia visible.

            HASHTAGS:
            #Etiqueta1 #Etiqueta2 #Etiqueta3 #Etiqueta4 #Etiqueta5
            """

            try:
                if imagen_producto:
                    image_bytes = imagen_producto.read()
                    imagen_producto.seek(0)

                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[
                            {
                                "inline_data": {
                                    "mime_type": imagen_producto.content_type,
                                    "data": base64.b64encode(image_bytes).decode(
                                        "utf-8"
                                    ),
                                }
                            },
                            prompt,
                        ],
                    )
                else:
                    response = client.models.generate_content(
                        model="gemini-2.5-flash", contents=prompt
                    )

                texto_generado = response.text.strip()

            except Exception as e:
                print("ERROR GEMINI GENERADOR:", e)

                texto_generado = (
                    "TÍTULO:\n"
                    f"{nombre_producto} listo para destacar\n\n"
                    "DESCRIPCIÓN CORTA:\n"
                    f"{nombre_producto} es una opción ideal para ecommerce, retail o catálogo digital.\n\n"
                    "CARACTERÍSTICAS CLAVE:\n"
                    f"- {palabras_clave}\n"
                    "- Presentación clara para venta online\n"
                    "- Enfoque comercial\n\n"
                    "BENEFICIOS:\n"
                    "- Ayuda a presentar mejor el producto\n"
                    "- Facilita su publicación en tienda online\n"
                    "- Mejora la comunicación con el cliente\n\n"
                    "USO RECOMENDADO:\n"
                    "Ideal para tiendas en línea, catálogos y publicaciones comerciales.\n\n"
                    "PÚBLICO OBJETIVO:\n"
                    f"{publico_objetivo or 'Clientes interesados en productos de calidad.'}\n\n"
                    "ANÁLISIS VISUAL:\n"
                    "No se pudo completar el análisis visual avanzado en este momento.\n\n"
                    "HASHTAGS:\n"
                    "#Producto #Ecommerce #Retail #VentaOnline #Catálogo"
                )

            titulo_generado = f"Descripción IA: {nombre_producto}"
            descripcion_generada = texto_generado

            producto = ProductoGenerado.objects.create(
                usuario=user,
                nombre_producto=nombre_producto,
                palabras_clave=palabras_clave,
                marca=marca,
                categoria=categoria,
                color=color,
                material=material,
                publico_objetivo=publico_objetivo,
                tono=tono,
                instruccion_imagen=instruccion_imagen,
                imagen_producto=imagen_producto,
                titulo_generado=titulo_generado,
                descripcion_generada=descripcion_generada,
            )

            user.descripciones_hoy += 1
            user.save(update_fields=["descripciones_hoy"])

        return Response(
            {
                "producto": ProductoGeneradoSerializer(producto).data,
                "creditos": user.creditos,
                "is_premium": user.is_premium,
            },
            status=status.HTTP_201_CREATED,
        )


@method_decorator(ratelimit(key="user", rate="20/h", method="GET"), name="get")
class HistorialDescripcionesView(generics.ListAPIView):
    serializer_class = ProductoGeneradoSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ProductoGenerado.objects.filter(usuario=self.request.user).order_by(
            "-fecha_creacion"
        )


class ActivarPremiumView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user

        plan = request.data.get("plan", "").strip()
        precio = request.data.get("precio")

        planes_validos = {
            "PyMes": 10,
            "Corporativo": 59,
        }

        if plan not in planes_validos:
            return Response(
                {"error": "Plan no válido."}, status=status.HTTP_400_BAD_REQUEST
            )

        if float(precio) != planes_validos[plan]:
            return Response(
                {"error": "Precio no válido para este plan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_premium = True
        user.plan = plan.upper()
        user.creditos = 0
        user.fecha_inicio_plan = timezone.now().date()
        user.fecha_fin_plan = timezone.now().date() + timedelta(days=30)

        user.save(
            update_fields=[
                "is_premium",
                "plan",
                "creditos",
                "fecha_inicio_plan",
                "fecha_fin_plan",
            ]
        )

        return Response(
            {
                "message": f"Plan {plan} activado correctamente.",
                "is_premium": user.is_premium,
                "creditos": user.creditos,
                "plan": plan,
            },
            status=status.HTTP_200_OK,
        )


@method_decorator(ratelimit(key="ip", rate="5/h", method="POST"), name="post")
class ContactoView(generics.CreateAPIView):
    queryset = Contacto.objects.all()
    serializer_class = ContactoSerializer
    permission_classes = (permissions.AllowAny,)


@method_decorator(ratelimit(key="ip", rate="20/h", method="POST"), name="post")
class ChatbotView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        mensaje = request.data.get("mensaje", "").strip()

        if not mensaje:
            return Response(
                {"error": "El mensaje no puede estar vacío."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(mensaje) < 2:
            return Response(
                {"error": "El mensaje es demasiado corto."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(mensaje) > 500:
            return Response(
                {"error": "El mensaje no puede superar los 500 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not settings.GEMINI_API_KEY:
            return Response(
                {"error": "Gemini API Key no configurada."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        user = request.user if request.user.is_authenticated else None

        contexto_usuario = "Usuario no autenticado."

        if user:
            reiniciar_uso_diario_si_es_necesario(user)
            limites = obtener_limites_usuario(user)

            if user.is_premium:
                contexto_usuario = f"""
Usuario autenticado:
Nombre: {user.first_name} {user.last_name}
Email: {user.email}
Plan: {user.plan}
Premium: Sí
Descripciones usadas hoy: {user.descripciones_hoy} de {limites['descripciones']}
Imágenes usadas hoy: {user.imagenes_hoy} de {limites['imagenes']}
Fecha fin del plan: {user.fecha_fin_plan}
"""
            else:
                contexto_usuario = f"""
Usuario autenticado:
Nombre: {user.first_name} {user.last_name}
Email: {user.email}
Plan: FREE
Premium: No
Créditos disponibles: {user.creditos}
Descripciones usadas hoy: {user.descripciones_hoy} de {limites['descripciones']}
Imágenes usadas hoy: {user.imagenes_hoy} de {limites['imagenes']}
"""

        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            prompt = f"""
Eres el asistente virtual de Carlsoft Product IA.

Tu trabajo es ayudar a los usuarios de una plataforma que genera descripciones de productos con inteligencia artificial.

Datos del usuario:
{contexto_usuario}

Puedes responder sobre:
- cómo generar descripciones de productos
- cómo usar palabras clave
- cómo subir imágenes de productos
- créditos disponibles
- planes premium
- soporte técnico
- recomendaciones para mejorar descripciones
- dudas generales sobre la plataforma

Reglas:
- Responde en español.
- Sé amable, claro y breve.
- Si el usuario está autenticado, puedes usar su nombre, plan, créditos y fecha de vencimiento del plan para personalizar la respuesta.
- No inventes funciones que el sistema todavía no tiene.
- No digas que puedes procesar pagos reales; por ahora los pagos son simulados.
- No pidas datos sensibles de tarjetas o contraseñas.
- Si preguntan algo fuera del sistema, responde de forma útil pero corta.
- Si preguntan por precios, menciona: plan básico gratis, PyMes $10/mes y Corporativo $59/mes.
- Si preguntan por créditos, usa los datos reales del usuario si están disponibles.
- Si preguntan por su plan, usa los datos reales del usuario si están disponibles.
- Si preguntan por vencimiento, usa la fecha fin del plan si está disponible.
- Si preguntan por imágenes, explica que pueden subir una imagen del producto para mejorar el análisis visual.
- Si el usuario no está autenticado y pregunta por sus datos, indícale que debe iniciar sesión.

Mensaje del usuario:
{mensaje}
"""

            response = client.models.generate_content(
                model="gemini-2.5-flash", contents=prompt
            )

            respuesta = response.text.strip()

            return Response({"respuesta": respuesta}, status=status.HTTP_200_OK)

        except Exception as e:
            print("ERROR GEMINI CHATBOT:", e)

            return Response(
                {
                    "error": "No pude generar una respuesta en este momento. Intenta nuevamente."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserStatusView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        hoy = timezone.now().date()

        dias_restantes = None
        aviso = None

        if user.is_premium and user.fecha_fin_plan:
            dias_restantes = (user.fecha_fin_plan - hoy).days

            if dias_restantes < 0:
                user.is_premium = False
                user.plan = "FREE"
                user.creditos = 3
                user.subscription_status = "expired"
                user.cancel_at_period_end = False

                user.save(
                    update_fields=[
                        "is_premium",
                        "plan",
                        "creditos",
                        "subscription_status",
                        "cancel_at_period_end",
                    ]
                )

                aviso = "Tu plan premium ha expirado. Volviste al plan gratuito."
            elif dias_restantes <= 5:
                aviso = f"Tu plan vence en {dias_restantes} día(s)."
            else:
                aviso = "Tu plan está activo."

        elif not user.is_premium:
            if user.creditos <= 0:
                aviso = "Ya no tienes créditos disponibles."
            elif user.creditos <= 1:
                aviso = "Te queda 1 crédito disponible."
            else:
                aviso = f"Tienes {user.creditos} créditos disponibles."

        reiniciar_uso_diario_si_es_necesario(user)
        limites = obtener_limites_usuario(user)

        return Response(
            {
                "nombre": user.first_name,
                "apellido": user.last_name,
                "email": user.email,
                "is_premium": user.is_premium,
                "plan": user.plan,
                "creditos": user.creditos,
                "fecha_fin_plan": user.fecha_fin_plan,
                "cancel_at_period_end": user.cancel_at_period_end,
                "dias_restantes": dias_restantes,
                "aviso": aviso,
                "descripciones_hoy": user.descripciones_hoy,
                "imagenes_hoy": user.imagenes_hoy,
                "limite_descripciones": limites["descripciones"],
                "limite_imagenes": limites["imagenes"],
                "pdf_habilitado": limites["pdf"],
                "uso_descripciones_texto": f"{user.descripciones_hoy} de {limites['descripciones']}",
                "uso_imagenes_texto": f"{user.imagenes_hoy} de {limites['imagenes']}",
            }
        )


@method_decorator(ratelimit(key="user", rate="10/h", method="POST"), name="post")
class GenerarImagenPublicitariaView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, producto_id):
        user = request.user

        reiniciar_uso_diario_si_es_necesario(user)
        limites = obtener_limites_usuario(user)

        if user.imagenes_hoy >= limites["imagenes"]:
            return Response(
                {
                    "error": f"Has alcanzado tu límite diario de {limites['imagenes']} imágenes publicitarias."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            producto = ProductoGenerado.objects.get(id=producto_id, usuario=user)
        except ProductoGenerado.DoesNotExist:
            return Response(
                {"error": "Producto no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not settings.GEMINI_API_KEY:
            return Response(
                {"error": "Gemini API Key no configurada."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not settings.OPENAI_API_KEY:
            return Response(
                {"error": "OpenAI API Key no configurada."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

            prompt_gemini = f"""
Eres un experto en dirección de arte, fotografía comercial, diseño publicitario, ecommerce y marketing visual.

Tu tarea es crear un prompt profesional para generar una imagen publicitaria del producto.

Producto:
{producto.nombre_producto}

Marca:
{producto.marca or "No especificada"}

Categoría:
{producto.categoria or "No especificada"}

Color:
{producto.color or "No especificado"}

Material:
{producto.material or "No especificado"}

Público objetivo:
{producto.publico_objetivo or "General"}

Descripción generada:
{producto.descripcion_generada}

Instrucciones del usuario para la imagen:
{producto.instruccion_imagen or "Crear una imagen publicitaria limpia, moderna y profesional."}

Reglas:
- Genera únicamente un prompt listo para OpenAI Images.
- El prompt debe describir fondo, iluminación, composición, estilo, encuadre y ambiente.
- Debe servir para ecommerce, retail o catálogo.
- No incluyas texto dentro de la imagen.
- No inventes logos ni marcas falsas.
- Si la marca fue proporcionada, menciona que se respete el producto original sin inventar elementos.
- Escribe el prompt en español.
- Máximo 120 palabras.

Formato:
PROMPT IMAGEN:
"""

            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt_gemini,
            )

            prompt_generado = response.text.strip()

        except Exception as e:
            print("ERROR PROMPT GEMINI IMAGEN:", e)

            prompt_generado = (
                f"Fotografía publicitaria profesional de {producto.nombre_producto}, "
                f"presentado en un escenario limpio y moderno para ecommerce. "
                f"Fondo neutro, iluminación suave de estudio, sombras naturales, "
                f"composición centrada, alta calidad visual, estilo catálogo premium. "
                f"Sin texto, sin logos inventados, sin marcas falsas."
            )

        try:
            openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

            imagen_response = openai_client.images.generate(
                model="gpt-image-1",
                prompt=prompt_generado,
                size="1024x1024",
                quality="medium",
                n=1,
            )

            image_base64 = imagen_response.data[0].b64_json
            image_bytes = base64.b64decode(image_base64)

            nombre_archivo = f"publicidad_{producto.id}_{uuid.uuid4().hex}.png"

            producto.imagen_publicitaria.save(
                nombre_archivo,
                ContentFile(image_bytes),
                save=False,
            )

        except Exception as e:
            print("ERROR OPENAI IMAGE:", e)

            producto.prompt_imagen_publicitaria = prompt_generado
            producto.save(update_fields=["prompt_imagen_publicitaria"])

            return Response(
                {
                    "error": "No se pudo generar la imagen publicitaria real.",
                    "prompt_imagen_publicitaria": prompt_generado,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        producto.prompt_imagen_publicitaria = prompt_generado
        producto.save(
            update_fields=[
                "prompt_imagen_publicitaria",
                "imagen_publicitaria",
            ]
        )

        user.imagenes_hoy += 1
        user.save(update_fields=["imagenes_hoy"])

        return Response(
            {
                "message": "Imagen publicitaria generada correctamente.",
                "producto": ProductoGeneradoSerializer(producto).data,
                "prompt_imagen_publicitaria": producto.prompt_imagen_publicitaria,
                "imagen_publicitaria_url": producto.imagen_publicitaria.url
                if producto.imagen_publicitaria
                else None,
            },
            status=status.HTTP_200_OK,
        )


class EliminarProductoGeneradoView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, producto_id):
        try:
            producto = ProductoGenerado.objects.get(
                id=producto_id, usuario=request.user
            )
        except ProductoGenerado.DoesNotExist:
            return Response(
                {"error": "Producto no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

        producto.delete()

        return Response(
            {"message": "Producto eliminado del historial."}, status=status.HTTP_200_OK
        )


class CrearCheckoutSessionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        plan = request.data.get("plan")

        precios = {
            "PYMES": settings.STRIPE_PRICE_PYMES,
            "CORPORATIVO": settings.STRIPE_PRICE_CORPORATIVO,
        }

        if plan not in precios:
            return Response(
                {"error": "Plan no válido."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = stripe.checkout.Session.create(
                mode="subscription",
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": precios[plan],
                        "quantity": 1,
                    }
                ],
                customer_email=request.user.email,
                success_url=f"{settings.FRONTEND_URL}?payment=success",
                cancel_url=f"{settings.FRONTEND_URL}?payment=cancel",
                metadata={
                    "user_id": request.user.id,
                    "plan": plan,
                },
                subscription_data={
                    "metadata": {
                        "user_id": request.user.id,
                        "plan": plan,
                    }
                },
            )

            return Response({"checkout_url": session.url})

        except Exception as e:
            print("ERROR STRIPE CHECKOUT:", e)
            return Response(
                {"error": "No se pudo crear la sesión de pago."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response({"error": "Payload inválido."}, status=400)
        except stripe.error.SignatureVerificationError:
            return Response({"error": "Firma inválida."}, status=400)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]

            metadata = session.metadata
            user_id = (
                metadata.user_id if metadata and hasattr(metadata, "user_id") else None
            )
            plan = metadata.plan if metadata and hasattr(metadata, "plan") else None

            subscription_id = session.subscription
            customer_id = session.customer

            if not user_id or not plan:
                return Response({"error": "Metadata incompleta."}, status=400)

            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response({"error": "Usuario no encontrado."}, status=404)

            user.is_premium = True
            user.plan = plan
            user.creditos = 0
            user.stripe_customer_id = customer_id
            user.stripe_subscription_id = subscription_id
            user.subscription_status = "active"
            user.cancel_at_period_end = False
            user.fecha_inicio_plan = timezone.now().date()
            user.fecha_fin_plan = timezone.now().date() + timedelta(days=30)

            user.save(
                update_fields=[
                    "is_premium",
                    "plan",
                    "creditos",
                    "stripe_customer_id",
                    "stripe_subscription_id",
                    "subscription_status",
                    "cancel_at_period_end",
                    "fecha_inicio_plan",
                    "fecha_fin_plan",
                ]
            )

        elif event["type"] == "customer.subscription.deleted":
            subscription = event["data"]["object"]
            subscription_id = subscription.id

            try:
                user = CustomUser.objects.get(stripe_subscription_id=subscription_id)
            except CustomUser.DoesNotExist:
                return Response({"status": "user_not_found"}, status=200)

            user.is_premium = False
            user.plan = "FREE"
            user.creditos = 3
            user.subscription_status = "canceled"
            user.fecha_fin_plan = None
            user.cancel_at_period_end = False

            user.save(
                update_fields=[
                    "is_premium",
                    "plan",
                    "creditos",
                    "subscription_status",
                    "fecha_fin_plan",
                    "cancel_at_period_end",
                ]
            )

        elif event["type"] == "customer.subscription.updated":
            subscription = event["data"]["object"]

            subscription_id = subscription.id
            status_subscription = subscription.status

            try:
                user = CustomUser.objects.get(stripe_subscription_id=subscription_id)
            except CustomUser.DoesNotExist:
                return Response({"status": "user_not_found"}, status=200)

            user.subscription_status = status_subscription
            user.cancel_at_period_end = subscription.cancel_at_period_end

            if status_subscription in ["canceled", "unpaid", "incomplete_expired"]:
                user.is_premium = False
                user.plan = "FREE"
                user.creditos = 3
                user.fecha_fin_plan = None
                user.cancel_at_period_end = False

            user.save(
                update_fields=[
                    "is_premium",
                    "plan",
                    "creditos",
                    "subscription_status",
                    "fecha_fin_plan",
                    "cancel_at_period_end",
                ]
            )

        return Response({"status": "success"}, status=200)


class CrearPortalClienteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        user = request.user

        if not user.stripe_customer_id:
            return Response(
                {"error": "No existe cliente Stripe asociado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            session = stripe.billing_portal.Session.create(
                customer=user.stripe_customer_id, return_url=settings.FRONTEND_URL
            )

            return Response({"portal_url": session.url})

        except Exception as e:
            print("ERROR STRIPE PORTAL:", e)

            return Response(
                {"error": "No se pudo abrir el portal."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
