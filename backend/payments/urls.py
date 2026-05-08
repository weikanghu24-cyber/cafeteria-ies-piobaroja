"""URLs de pagos."""
from django.urls import path
from .views import (
    crear_payment_intent, confirmar_pago,
    StripeWebhookView, stripe_publishable_key
)

urlpatterns = [
    path('config/', stripe_publishable_key, name='stripe-config'),
    path('create-intent/', crear_payment_intent, name='create-payment-intent'),
    path('confirm/', confirmar_pago, name='confirm-payment'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]
