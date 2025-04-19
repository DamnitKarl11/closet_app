import re
import logging
from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request details
        logger.debug(f"Request path: {request.path}")
        logger.debug(f"Request method: {request.method}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Authorization header: {request.headers.get('Authorization')}")
        
        response = self.get_response(request)
        return response

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