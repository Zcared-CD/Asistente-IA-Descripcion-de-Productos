from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, ProductoGenerado

# Aquí le decimos a Django cómo queremos que muestre a los usuarios en el panel
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    # Columnas que veremos en la lista principal
    list_display = ['username', 'email', 'telefono', 'is_premium', 'creditos']
    
    # Agregamos nuestros campos personalizados a la pantalla de edición
    fieldsets = UserAdmin.fieldsets + (
        ('Datos de Carlsoft AI', {'fields': ('telefono', 'is_premium', 'creditos')}),
    )

class ProductoGeneradoAdmin(admin.ModelAdmin):
    # Columnas para ver rápidamente qué generaron
    list_display = ['nombre_producto', 'usuario', 'fecha_creacion']
    list_filter = ['fecha_creacion']
    search_fields = ['nombre_producto', 'usuario__username']

# Registramos nuestros modelos
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(ProductoGenerado, ProductoGeneradoAdmin)