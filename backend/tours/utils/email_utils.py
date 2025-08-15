import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_email(to_email, subject, html_content, plain_content=None):
    """
    Send email using Gmail SMTP
    """
    try:
        # Email configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = "nancykaroki49@gmail.com"
        sender_password = "phzl ccoo menu iexd"
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = sender_email
        message["To"] = to_email
        
        # Create the plain-text and HTML version of your message
        if plain_content:
            part1 = MIMEText(plain_content, "plain")
            message.attach(part1)
        
        part2 = MIMEText(html_content, "html")
        message.attach(part2)
        
        # Create SMTP session
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Enable security
        server.login(sender_email, sender_password)
        
        # Send email
        text = message.as_string()
        server.sendmail(sender_email, to_email, text)
        server.quit()
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_booking_confirmation_to_customer(booking):
    """
    Send booking confirmation email to customer
    """
    subject = f"Booking Request Received - {booking.booking_reference}"
    
    html_content = f"""
    <html>
    <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3498db;">Booking Request Received</h2>
            
            <p>Dear {booking.name},</p>
            
            <p>Thank you for your booking request with Richman Tours & Travel. We have received your request and it is currently under review.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Booking Details</h3>
                <p><strong>Booking Reference:</strong> {booking.booking_reference}</p>
                <p><strong>Tour:</strong> {booking.tour.title}</p>
                <p><strong>Destination:</strong> {booking.tour.destination}</p>
                <p><strong>Preferred Date:</strong> {booking.preferred_date.strftime('%B %d, %Y')}</p>
                <p><strong>Number of People:</strong> {booking.number_of_people}</p>
                <p><strong>Total Amount:</strong> ${booking.total_amount}</p>
                {f"<p><strong>Special Requirements:</strong> {booking.special_requirements}</p>" if booking.special_requirements else ""}
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60;">
                <p><strong>What's Next?</strong></p>
                <p>Richard will review your booking request and communicate with you soon regarding confirmation and additional details.</p>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us:</p>
            <ul>
                <li>Email: info@richmantours.com</li>
                <li>Phone: +1 (555) 123-4567</li>
            </ul>
            
            <p>Best regards,<br>
            The Richman Tours & Travel Team</p>
        </div>
    </body>
    </html>
    """
    
    plain_content = f"""
    Dear {booking.name},
    
    Thank you for your booking request with Richman Tours & Travel. We have received your request and it is currently under review.
    
    Booking Details:
    - Booking Reference: {booking.booking_reference}
    - Tour: {booking.tour.title}
    - Destination: {booking.tour.destination}
    - Preferred Date: {booking.preferred_date.strftime('%B %d, %Y')}
    - Number of People: {booking.number_of_people}
    - Total Amount: ${booking.total_amount}
    {f"- Special Requirements: {booking.special_requirements}" if booking.special_requirements else ""}
    
    Richard will review your booking request and communicate with you soon regarding confirmation and additional details.
    
    If you have any questions, please contact us at info@richmantours.com or +1 (555) 123-4567.
    
    Best regards,
    The Richman Tours & Travel Team
    """
    
    return send_email(booking.email, subject, html_content, plain_content)

def send_booking_notification_to_admin(booking):
    """
    Send booking notification to admin (Richard)
    """
    subject = f"New Booking Request - {booking.booking_reference}"
    
    html_content = f"""
    <html>
    <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">New Booking Request</h2>
            
            <p>Hello Richard,</p>
            
            <p>A new booking request has been submitted and requires your review.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Customer Details</h3>
                <p><strong>Name:</strong> {booking.name}</p>
                <p><strong>Email:</strong> {booking.email}</p>
                <p><strong>Phone:</strong> {booking.phone}</p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">Booking Details</h3>
                <p><strong>Booking Reference:</strong> {booking.booking_reference}</p>
                <p><strong>Tour:</strong> {booking.tour.title}</p>
                <p><strong>Destination:</strong> {booking.tour.destination}</p>
                <p><strong>Preferred Date:</strong> {booking.preferred_date.strftime('%B %d, %Y')}</p>
                <p><strong>Number of People:</strong> {booking.number_of_people}</p>
                <p><strong>Total Amount:</strong> ${booking.total_amount}</p>
                {f"<p><strong>Special Requirements:</strong> {booking.special_requirements}</p>" if booking.special_requirements else ""}
            </div>
            
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8;">
                <p><strong>Action Required:</strong></p>
                <p>Please log in to the admin panel to review and confirm this booking.</p>
                <p><a href="http://localhost:3000/admin" style="color: #17a2b8;">Go to Admin Panel</a></p>
            </div>
            
            <p>Best regards,<br>
            Richman Tours & Travel System</p>
        </div>
    </body>
    </html>
    """
    
    plain_content = f"""
    Hello Richard,
    
    A new booking request has been submitted and requires your review.
    
    Customer Details:
    - Name: {booking.name}
    - Email: {booking.email}
    - Phone: {booking.phone}
    
    Booking Details:
    - Booking Reference: {booking.booking_reference}
    - Tour: {booking.tour.title}
    - Destination: {booking.tour.destination}
    - Preferred Date: {booking.preferred_date.strftime('%B %d, %Y')}
    - Number of People: {booking.number_of_people}
    - Total Amount: ${booking.total_amount}
    {f"- Special Requirements: {booking.special_requirements}" if booking.special_requirements else ""}
    
    Please log in to the admin panel to review and confirm this booking.
    
    Best regards,
    Richman Tours & Travel System
    """
    
    return send_email("nancykaroki49@gmail.com", subject, html_content, plain_content)

def send_booking_confirmation_final(booking):
    """
    Send final booking confirmation to customer when booking is confirmed
    """
    subject = f"Booking Confirmed - {booking.booking_reference}"
    
    html_content = f"""
    <html>
    <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">🎉 Booking Confirmed!</h2>
            
            <p>Dear {booking.name},</p>
            
            <p>Great news! Your booking has been confirmed. We're excited to have you join us for this amazing adventure!</p>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60;">
                <h3 style="color: #2c3e50; margin-top: 0;">Confirmed Booking Details</h3>
                <p><strong>Booking Reference:</strong> {booking.booking_reference}</p>
                <p><strong>Tour:</strong> {booking.tour.title}</p>
                <p><strong>Destination:</strong> {booking.tour.destination}</p>
                <p><strong>Confirmed Date:</strong> {booking.confirmed_date.strftime('%B %d, %Y') if booking.confirmed_date else booking.preferred_date.strftime('%B %d, %Y')}</p>
                {f"<p><strong>Time:</strong> {booking.confirmed_time.strftime('%I:%M %p')}</p>" if booking.confirmed_time else ""}
                <p><strong>Number of People:</strong> {booking.number_of_people}</p>
                <p><strong>Total Amount:</strong> ${booking.total_amount}</p>
                {f"<p><strong>Meeting Point:</strong> {booking.meeting_point}</p>" if booking.meeting_point else ""}
            </div>
            
            {f'<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;"><p><strong>Additional Notes:</strong></p><p>{booking.additional_notes}</p></div>' if booking.additional_notes else ''}
            
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8;">
                <p><strong>What to Expect:</strong></p>
                <ul>
                    <li>Arrive at the meeting point 15 minutes early</li>
                    <li>Bring comfortable walking shoes and weather-appropriate clothing</li>
                    <li>Don't forget your camera for amazing photo opportunities!</li>
                </ul>
            </div>
            
            <p>If you have any questions before your tour, please contact us:</p>
            <ul>
                <li>Email: info@richmantours.com</li>
                <li>Phone: +1 (555) 123-4567</li>
            </ul>
            
            <p>We look forward to providing you with an unforgettable experience!</p>
            
            <p>Best regards,<br>
            Richard & The Richman Tours Team</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(booking.email, subject, html_content)
    