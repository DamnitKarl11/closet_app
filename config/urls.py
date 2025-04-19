"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from wardrobe.templatetags.frontend_assets import get_frontend_assets
from accounts.views import create_initial_superuser

class FrontendView(TemplateView):
    template_name = 'index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['static_files'] = get_frontend_assets()
        return context

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('wardrobe.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('init-superuser/', create_initial_superuser),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve frontend for all other routes
urlpatterns += [
    re_path(r'^.*', FrontendView.as_view()),
]
