#!/usr/bin/env python
"""Punto de entrada para tareas administrativas de Django."""
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "No se puede importar Django. Asegurate de tenerlo instalado y "
            "el entorno virtual activado."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
