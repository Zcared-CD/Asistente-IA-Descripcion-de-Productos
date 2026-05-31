from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # Heredamos de AbstractUser de Django (que ya trae email, password, nombre, etc.)
    # Y le agregamos nuestros campos personalizados:
    telefono = models.CharField(max_length=20, blank=True, null=True)
    is_premium = models.BooleanField(default=False)
    creditos = models.IntegerField(default=3) # Damos 3 créditos gratis por defecto
    
    def __str__(self):
        return self.email or self.username

class ProductoGenerado(models.Model):
    # Relacionamos cada descripción generada con el usuario que la creó
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    nombre_producto = models.CharField(max_length=200)
    palabras_clave = models.TextField()
    
    # Resultados de la IA
    titulo_generado = models.CharField(max_length=255, blank=True)
    descripcion_generada = models.TextField(blank=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre_producto} - {self.usuario.username}"