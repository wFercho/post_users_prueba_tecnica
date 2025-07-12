import httpx
from fastapi import HTTPException, status
from posts.config import settings
from posts.schemas import AuthUser

class AuthService:
    @staticmethod
    async def validate_token(token: str) -> AuthUser:
        """Valida el token con el servicio de autenticación"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{settings.AUTH_SERVICE_URL}/validate-token",
                    json={"token": token},
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token"
                    )
                
                data = response.json()
                if not data.get("valid"):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=data.get("message", "Invalid token")
                    )
                
                return AuthUser(
                    user_id=data["user_id"],
                    email=data["email"],
                    username=data["username"]
                )
                
            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Auth service unavailable"
                )
            except httpx.RequestError:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Auth service connection error"
                )
