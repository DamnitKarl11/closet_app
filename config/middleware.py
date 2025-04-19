import re
from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware

class CsrfExemptMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the request path matches any of the exempt URLs
        path = request.path_info
        # Remove double api if present
        path = re.sub(r'^/api/api/', '/api/', path)
        for pattern in settings.CSRF_EXEMPT_URLS:
            if re.match(pattern, path):
                setattr(request, '_dont_enforce_csrf_checks', True)
                break
        return self.get_response(request) 