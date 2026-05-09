"""WSGI config para deploy en produccion."""
import os
import pymysql
pymysql.install_as_MySQLdb()
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()
