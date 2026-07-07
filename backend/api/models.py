from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta


class CustomUser(AbstractUser):
    telefono = models.CharField(max_length=10, blank=True, null=True)
    is_premium = models.BooleanField(default=False)
    creditos = models.IntegerField(default=3)  # Damos 3 créditos gratis por defecto
    plan = models.CharField(max_length=20, default="FREE")
    fecha_inicio_plan = models.DateField(blank=True, null=True)
    fecha_fin_plan = models.DateField(blank=True, null=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    subscription_status = models.CharField(max_length=50, default="inactive")
    cancel_at_period_end = models.BooleanField(default=False)
    descripciones_hoy = models.PositiveIntegerField(default=0)
    imagenes_hoy = models.PositiveIntegerField(default=0)
    fecha_uso = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.email or self.username


class ProductoGenerado(models.Model):

    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    nombre_producto = models.CharField(max_length=200)
    palabras_clave = models.TextField()
    marca = models.CharField(max_length=100, blank=True, null=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=100, blank=True, null=True)
    material = models.CharField(max_length=150, blank=True, null=True)
    publico_objetivo = models.CharField(max_length=150, blank=True, null=True)
    tono = models.CharField(max_length=100, blank=True, null=True)
    instruccion_imagen = models.TextField(blank=True, null=True)
    prompt_imagen_publicitaria = models.TextField(blank=True, null=True)
    imagen_publicitaria_url = models.URLField(blank=True, null=True)
    

    imagen_publicitaria = models.ImageField(
        upload_to="publicidad/", blank=True, null=True
    )

    imagen_producto = models.ImageField(upload_to="productos/", blank=True, null=True)

    titulo_generado = models.CharField(max_length=255, blank=True)
    descripcion_generada = models.TextField(blank=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre_producto} - {self.usuario.username}"


class Contacto(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField()
    numero_orden = models.CharField(max_length=100, blank=True, null=True)

    mensaje = models.TextField()

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
