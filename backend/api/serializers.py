from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, ProductoGenerado, Contacto
import re


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

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
            'password',
            'plan',
            'fecha_fin_plan',
            'cancel_at_period_end',
        )
        read_only_fields = (
            'id',
            'username',
            'is_premium',
            'creditos',
            'plan',
            'fecha_fin_plan',
            'cancel_at_period_end',
        )

    def validate_email(self, value):
        value = value.lower().strip()

        if not value:
            raise serializers.ValidationError(
                "El correo es obligatorio."
            )

        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Este correo ya está registrado."
            )

        return value

    def validate_telefono(self, value):
        if not value:
            return value

        value = value.strip()

        if not re.fullmatch(r"\d{10}", value):
            raise serializers.ValidationError(
                "El teléfono debe contener exactamente 10 dígitos."
            )

        if CustomUser.objects.filter(telefono=value).exists():
            raise serializers.ValidationError(
                "Este número de teléfono ya está registrado."
            )

        return value

    def validate_first_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "El nombre debe contener al menos 2 caracteres."
            )

        if not re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+", value):
            raise serializers.ValidationError(
                "El nombre solo puede contener letras."
            )

        return value.title()

    def validate_last_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "El apellido debe contener al menos 2 caracteres."
            )

        if not re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+", value):
            raise serializers.ValidationError(
                "El apellido solo puede contener letras."
            )

        return value.title()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data['email'].lower().strip()

        user = CustomUser.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '').strip(),
            last_name=validated_data.get('last_name', '').strip(),
            telefono=validated_data.get('telefono', '').strip()
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
            'fecha_creacion',
            'imagen_producto',
            'marca',
            'categoria',
            'color',
            'material',
            'publico_objetivo',
            'tono',
            'instruccion_imagen',
            'prompt_imagen_publicitaria',
            'imagen_publicitaria',
            'imagen_publicitaria_url',
        )
        read_only_fields = (
            'id',
            'titulo_generado',
            'descripcion_generada',
            'fecha_creacion'
        )


class ContactoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contacto
        fields = '__all__'
        read_only_fields = ('fecha_creacion',)

    def validate_mensaje(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "El mensaje debe contener al menos 10 caracteres."
            )
        return value