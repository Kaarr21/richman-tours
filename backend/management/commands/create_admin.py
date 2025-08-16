# Create this file to easily create admin users
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import getpass

User = get_user_model()

class Command(BaseCommand):
    help = 'Create an admin user'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Admin username')
        parser.add_argument('--email', type=str, help='Admin email')
        parser.add_argument('--password', type=str, help='Admin password')

    def handle(self, *args, **options):
        username = options['username'] or input('Username: ')
        email = options['email'] or input('Email: ')
        password = options['password']
        
        if not password:
            password = getpass.getpass('Password: ')
            confirm_password = getpass.getpass('Confirm password: ')
            
            if password != confirm_password:
                self.stdout.write(
                    self.style.ERROR('Passwords do not match.')
                )
                return

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.ERROR(f'User "{username}" already exists.')
            )
            return

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=True,
                is_superuser=True,
                is_admin=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Admin user "{username}" created successfully.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating user: {str(e)}')
            )
