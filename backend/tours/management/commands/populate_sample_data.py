# backend/tours/management/commands/populate_sample_data.py
"""
Django management command to populate sample data for Richman Tours.
Usage: python manage.py populate_sample_data
"""

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from tours.models import Category, Destination, Tour, TourImage, Itinerary
from bookings.models import Customer, Booking, Inquiry
from django.contrib.auth.models import User
from decimal import Decimal
import requests
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Populate sample data for Richman Tours'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate sample data...'))
        
        # Create categories
        self.create_categories()
        
        # Create destinations
        self.create_destinations()
        
        # Create tours
        self.create_tours()
        
        # Create sample customers and bookings
        self.create_sample_bookings()
        
        # Create sample inquiries
        self.create_sample_inquiries()
        
        self.stdout.write(self.style.SUCCESS('Sample data population completed!'))

    def create_categories(self):
        categories = [
            {'name': 'Safari Tours', 'description': 'Wildlife viewing adventures across Kenya\'s national parks', 'icon': 'camera'},
            {'name': 'Cultural Tours', 'description': 'Experience Kenya\'s rich cultural heritage and traditions', 'icon': 'users'},
            {'name': 'Adventure Tours', 'description': 'Thrilling outdoor activities and extreme sports', 'icon': 'mountain'},
            {'name': 'Beach Tours', 'description': 'Relax on Kenya\'s beautiful coastal beaches', 'icon': 'sun'},
            {'name': 'Mountain Tours', 'description': 'Conquer Kenya\'s magnificent mountain peaks', 'icon': 'triangle'},
            {'name': 'City Tours', 'description': 'Explore Kenya\'s vibrant cities and urban culture', 'icon': 'building'},
        ]
        
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')

    def create_destinations(self):
        destinations = [
            {'name': 'Maasai Mara National Reserve', 'county': 'Narok', 'region': 'rift_valley', 
             'description': 'World-famous for the Great Migration and Big Five wildlife.'},
            {'name': 'Amboseli National Park', 'county': 'Kajiado', 'region': 'rift_valley',
             'description': 'Best place to view Mount Kilimanjaro and large elephant herds.'},
            {'name': 'Diani Beach', 'county': 'Kwale', 'region': 'coast',
             'description': 'Pristine white sand beaches and coral reefs.'},
            {'name': 'Mount Kenya', 'county': 'Kirinyaga', 'region': 'central',
             'description': 'Africa\'s second highest peak, perfect for hiking and climbing.'},
            {'name': 'Lake Nakuru', 'county': 'Nakuru', 'region': 'rift_valley',
             'description': 'Famous for flamingo viewing and rhino sanctuary.'},
            {'name': 'Samburu National Reserve', 'county': 'Samburu', 'region': 'northern',
             'description': 'Home to unique wildlife species and Samburu culture.'},
            {'name': 'Tsavo National Park', 'county': 'Taita Taveta', 'region': 'eastern',
             'description': 'Kenya\'s largest national park with diverse ecosystems.'},
            {'name': 'Hell\'s Gate National Park', 'county': 'Nakuru', 'region': 'rift_valley',
             'description': 'Unique park where you can walk and cycle among wildlife.'},
            {'name': 'Lamu Old Town', 'county': 'Lamu', 'region': 'coast',
             'description': 'UNESCO World Heritage site with Swahili culture.'},
            {'name': 'Aberdare National Park', 'county': 'Nyandarua', 'region': 'central',
             'description': 'Moorland and forest ecosystem with waterfalls.'},
        ]
        
        for dest_data in destinations:
            destination, created = Destination.objects.get_or_create(
                name=dest_data['name'],
                defaults=dest_data
            )
            if created:
                self.stdout.write(f'Created destination: {destination.name}')

    def create_tours(self):
        safari_category = Category.objects.get(name='Safari Tours')
        cultural_category = Category.objects.get(name='Cultural Tours')
        adventure_category = Category.objects.get(name='Adventure Tours')
        beach_category = Category.objects.get(name='Beach Tours')
        
        tours_data = [
            {
                'title': 'Maasai Mara Great Migration Safari',
                'category': safari_category,
                'description': 'Witness the spectacular Great Migration in Maasai Mara National Reserve. This 4-day safari offers the best wildlife viewing experience in Kenya with professional guides and comfortable accommodations.',
                'highlights': 'Great Migration viewing\nBig Five wildlife spotting\nMaasai village visit\nHot air balloon safari (optional)\nProfessional wildlife photography',
                'includes': 'Transportation in safari vehicle\nPark entry fees\nProfessional guide\nAccommodation\nAll meals\nGame drives',
                'excludes': 'International flights\nVisa fees\nTravel insurance\nPersonal expenses\nTips for guide',
                'price': Decimal('850.00'),
                'duration_days': 4,
                'duration_nights': 3,
                'max_group_size': 6,
                'difficulty': 'easy',
                'is_featured': True,
            },
            {
                'title': 'Mount Kenya Climbing Adventure',
                'category': adventure_category,
                'description': 'Challenge yourself with a climb to Point Lenana (4,985m), the third highest peak of Mount Kenya. This 5-day trek offers stunning alpine scenery and a sense of accomplishment.',
                'highlights': 'Point Lenana summit\nAlpine scenery\nUnique vegetation zones\nMountain wildlife\nSunrise at the summit',
                'includes': 'Mountain guide and porters\nMountain rescue insurance\nCamping equipment\nAll meals on mountain\nPark fees',
                'excludes': 'Nairobi accommodation\nPersonal climbing gear\nTips for guides and porters\nPersonal expenses',
                'price': Decimal('650.00'),
                'duration_days': 5,
                'duration_nights': 4,
                'difficulty': 'challenging',
            },
            {
                'title': 'Diani Beach Relaxation Package',
                'category': beach_category,
                'description': 'Unwind on the pristine white sands of Diani Beach. This 3-day package includes beachfront accommodation, water sports, and cultural excursions.',
                'highlights': 'Pristine white sand beaches\nSnorkeling and diving\nDhow sunset cruise\nColobus monkey sanctuary\nSwahili cooking class',
                'includes': 'Beachfront accommodation\nBreakfast daily\nAirport transfers\nDhow cruise\nWater sports equipment',
                'excludes': 'Lunch and dinner\nAlcoholic beverages\nSpa treatments\nPersonal expenses',
                'price': Decimal('450.00'),
                'duration_days': 3,
                'duration_nights': 2,
                'difficulty': 'easy',
                'is_featured': True,
            },
            {
                'title': 'Samburu Cultural Experience',
                'category': cultural_category,
                'description': 'Immerse yourself in the rich culture of the Samburu people. This 3-day tour combines wildlife viewing with authentic cultural experiences.',
                'highlights': 'Traditional Samburu village visit\nCultural performances\nUnique wildlife species\nTraditional crafts workshop\nStorytelling sessions',
                'includes': 'Cultural guide\nVillage visit fees\nAccommodation\nAll meals\nCraft materials',
                'excludes': 'Transport to Samburu\nPersonal shopping\nTips for community\nAlcoholic beverages',
                'price': Decimal('380.00'),
                'duration_days': 3,
                'duration_nights': 2,
                'difficulty': 'easy',
            },
        ]
        
        for tour_data in tours_data:
            tour, created = Tour.objects.get_or_create(
                title=tour_data['title'],
                defaults=tour_data
            )
            
            if created:
                # Add destinations to tour
                if 'Maasai Mara' in tour.title:
                    tour.destinations.add(Destination.objects.get(name__contains='Maasai Mara'))
                elif 'Mount Kenya' in tour.title:
                    tour.destinations.add(Destination.objects.get(name__contains='Mount Kenya'))
                elif 'Diani' in tour.title:
                    tour.destinations.add(Destination.objects.get(name__contains='Diani'))
                elif 'Samburu' in tour.title:
                    tour.destinations.add(Destination.objects.get(name__contains='Samburu'))
                
                # Create sample itinerary
                self.create_itinerary(tour)
                
                self.stdout.write(f'Created tour: {tour.title}')

    def create_itinerary(self, tour):
        if 'Maasai Mara' in tour.title:
            itinerary_days = [
                {'day': 1, 'title': 'Arrival and First Game Drive', 
                 'description': 'Depart Nairobi early morning and drive to Maasai Mara. Check in to your accommodation and enjoy lunch. Afternoon game drive to spot the Big Five and witness the Great Migration.'},
                {'day': 2, 'title': 'Full Day Game Drives', 
                 'description': 'Full day exploring Maasai Mara with morning and afternoon game drives. Visit the Mara River crossing points and observe wildlife behavior.'},
                {'day': 3, 'title': 'Cultural Visit and Game Drive', 
                 'description': 'Morning visit to a traditional Maasai village to learn about their culture and customs. Afternoon game drive and photography session.'},
                {'day': 4, 'title': 'Final Game Drive and Departure', 
                 'description': 'Early morning game drive for final wildlife viewing and photography. Return to Nairobi with lunch en route.'},
            ]
        elif 'Mount Kenya' in tour.title:
            itinerary_days = [
                {'day': 1, 'title': 'Chogoria Gate to Nithi Falls', 
                 'description': 'Drive to Chogoria Gate and start the trek to Nithi Falls campsite through bamboo and montane forest.'},
                {'day': 2, 'title': 'Nithi Falls to Mintos Hut', 
                 'description': 'Trek through moorland vegetation to Mintos Hut with spectacular views of the mountain peaks.'},
                {'day': 3, 'title': 'Mintos Hut to Point Lenana', 
                 'description': 'Early morning summit attempt to Point Lenana (4,985m) for sunrise, then descend to Shipton Camp.'},
                {'day': 4, 'title': 'Shipton Camp to Old Moses', 
                 'description': 'Descend through different vegetation zones to Old Moses campsite via Sirimon route.'},
                {'day': 5, 'title': 'Old Moses to Nairobi', 
                 'description': 'Final descent to Sirimon Gate and drive back to Nairobi.'},
            ]
        else:
            # Generic itinerary for other tours
            itinerary_days = [
                {'day': 1, 'title': 'Arrival and Orientation', 
                 'description': 'Arrival at destination, check-in, and orientation about the tour activities.'},
                {'day': 2, 'title': 'Main Activity Day', 
                 'description': 'Full day of main tour activities and experiences.'},
            ]
            if tour.duration_days > 2:
                itinerary_days.append({'day': 3, 'title': 'Cultural Experience', 
                                     'description': 'Cultural activities and local community interaction.'})
            if tour.duration_days > 3:
                itinerary_days.append({'day': 4, 'title': 'Final Activities and Departure', 
                                     'description': 'Final activities and departure back to Nairobi.'})
        
        for day_data in itinerary_days:
            Itinerary.objects.create(
                tour=tour,
                day_number=day_data['day'],
                title=day_data['title'],
                description=day_data['description'],
                accommodation='Standard Lodge/Camp' if day_data['day'] < tour.duration_days else '',
                meals='Breakfast, Lunch, Dinner' if day_data['day'] > 1 and day_data['day'] < tour.duration_days else 'Lunch'
            )

    def create_sample_bookings(self):
        # Create sample customers
        customers_data = [
            {'first_name': 'John', 'last_name': 'Doe', 'email': 'john.doe@email.com', 'phone_number': '+254712345678'},
            {'first_name': 'Jane', 'last_name': 'Smith', 'email': 'jane.smith@email.com', 'phone_number': '+254723456789'},
            {'first_name': 'Michael', 'last_name': 'Johnson', 'email': 'michael.j@email.com', 'phone_number': '+254734567890'},
        ]
        
        tours = Tour.objects.all()
        for customer_data in customers_data:
            customer, created = Customer.objects.get_or_create(
                email=customer_data['email'],
                defaults=customer_data
            )
            
            if created and tours.exists():
                # Create a booking for this customer
                tour = random.choice(tours)
                departure_date = date.today() + timedelta(days=random.randint(30, 90))
                return_date = departure_date + timedelta(days=tour.duration_days - 1)
                
                booking = Booking.objects.create(
                    tour=tour,
                    customer=customer,
                    departure_date=departure_date,
                    return_date=return_date,
                    number_of_adults=random.randint(1, 4),
                    number_of_children=random.randint(0, 2),
                    adult_price=tour.price,
                    child_price=tour.price * Decimal('0.7'),
                    status='confirmed'
                )
                
                self.stdout.write(f'Created booking: {booking.booking_reference}')

    def create_sample_inquiries(self):
        inquiries_data = [
            {
                'name': 'Sarah Wilson',
                'email': 'sarah.wilson@email.com',
                'phone_number': '+254745678901',
                'inquiry_type': 'booking',
                'subject': 'Family Safari Inquiry',
                'message': 'Hi, I would like to book a family-friendly safari for 2 adults and 2 children (ages 8 and 12) in July. What packages would you recommend?'
            },
            {
                'name': 'David Brown',
                'email': 'david.brown@email.com',
                'phone_number': '+254756789012',
                'inquiry_type': 'custom_tour',
                'subject': 'Custom Climbing Tour',
                'message': 'I am interested in a custom Mount Kenya climbing experience. Can you arrange a private guide and customize the itinerary?'
            }
        ]
        
        for inquiry_data in inquiries_data:
            inquiry, created = Inquiry.objects.get_or_create(
                email=inquiry_data['email'],
                defaults=inquiry_data
            )
            
            if created:
                self.stdout.write(f'Created inquiry: {inquiry.subject}')
                