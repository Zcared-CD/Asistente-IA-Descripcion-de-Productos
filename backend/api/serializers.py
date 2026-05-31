from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from .models import CustomUser, ProductoGenerado

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'telefono',
            'is_premium',
            'creditos',
            'password'
        )
        read_only_fields = ('id', 'username', 'is_premium', 'creditos')

    def validate_email(self, value):
        value = value.lower().strip()

        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")

        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data['email']

        user = CustomUser.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telefono=validated_data.get('telefono', '')
        )

        return user
    

class ProductoGeneradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductoGenerado
        fields = (
            'id',
            'nombre_producto',
            'palabras_clave',
            'titulo_generado',
            'descripcion_generada',
            'fecha_creacion'
        )
        read_only_fields = (
            'id',
            'titulo_generado',
            'descripcion_generada',
            'fecha_creacion'
        )