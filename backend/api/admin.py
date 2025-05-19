from django.contrib import admin
from django.apps import apps
from .models import *

# Automatically register all models in this app
app_models = apps.get_app_config('api').get_models()

for model in app_models:
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass