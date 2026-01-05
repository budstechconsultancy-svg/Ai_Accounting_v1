
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom exception handler to handle standard Python PermissionError
    and convert it to a 403 Forbidden DRF response.
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # If response is None, then there may be an unhandled exception
    if response is None:
        if isinstance(exc, PermissionError):
            return Response({
                'detail': str(exc),
                'code': 'permission_denied'
            }, status=status.HTTP_403_FORBIDDEN)
            
        if isinstance(exc, ValueError):
             return Response({
                'detail': str(exc),
                'code': 'validation_error'
            }, status=status.HTTP_400_BAD_REQUEST)

    return response
