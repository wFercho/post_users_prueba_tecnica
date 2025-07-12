import re
from typing import Optional

def create_slug(title: str, post_id: Optional[int] = None) -> str:
    """Crea un slug único para el post"""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
    slug = re.sub(r'\s+', '-', slug).strip('-')
    
    if post_id:
        slug = f"{slug}-{post_id}"
    
    return slug[:100]  # Limitar longitud

def truncate_text(text: str, max_length: int = 150) -> str:
    """Trunca el texto para resúmenes"""
    if len(text) <= max_length:
        return text
    
    truncated = text[:max_length].rsplit(' ', 1)[0]
    return f"{truncated}..."