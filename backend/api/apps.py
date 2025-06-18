from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        # Import signals here to avoid circular imports
        import api.signals  # noqa: F401
        print("[DEBUG] ApiConfig ready() called, signals imported")  # Debugging line