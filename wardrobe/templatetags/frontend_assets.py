import os
import logging
from django import template
from django.conf import settings

logger = logging.getLogger(__name__)
register = template.Library()

@register.simple_tag
def get_frontend_assets():
    """Get the latest built frontend assets."""
    try:
        assets_dir = os.path.join(settings.STATIC_ROOT, 'frontend', 'assets')
        logger.debug(f"Looking for assets in: {assets_dir}")
        
        if not os.path.exists(assets_dir):
            logger.warning(f"Assets directory not found: {assets_dir}")
            return []
        
        files = []
        for filename in os.listdir(assets_dir):
            if filename.startswith('index-') and (filename.endswith('.js') or filename.endswith('.css')):
                file_path = f'frontend/assets/{filename}'
                files.append(file_path)
                logger.debug(f"Found asset: {file_path}")
        
        if not files:
            logger.warning("No frontend assets found")
        
        return files
    except Exception as e:
        logger.error(f"Error getting frontend assets: {e}")
        return [] 