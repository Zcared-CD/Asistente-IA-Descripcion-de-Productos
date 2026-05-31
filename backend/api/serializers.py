from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # Campos que vamos a leer/escribir
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'telefono', 'is_premium', 'creditos', 'password')
        # Hacemos que la contraseña solo se pueda escribir, no leer por seguridad
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Usamos create_user para que la contraseña se encripte correctamente en la base de datos
        user = CustomUser.objects.create_user(
            username=validated_data.get('email'), # Usaremos el email como username también
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telefono=validated_data.get('telefono', '')
        )
        return user