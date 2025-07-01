from bs4 import BeautifulSoup
import requests

url = "https://www.rentcollegepads.com/off-campus-housing/texas-tech/search"
headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
}   
from django.conf import settings
from django.utils import timezone
from .models import Campus, Housing

def scrape_details(detail_page_url):
    """
    Return
        • all_features – list[str]   (EVERY <li> inside <ul class="extra-list"> in Amenities)
        • description  – str
    """
    details = {
        "all_features": [],
        "description":  ""
    }

    try:
        r = requests.get(detail_page_url, headers=headers, timeout=10)
        r.raise_for_status()
    except requests.RequestException:
        return details

    soup = BeautifulSoup(r.text, "html.parser")

    features = []
    for ul in soup.find_all("ul", class_="extra-list"):
        for li in ul.find_all("li"):
            text = li.get_text(strip=True)
            if text:
                features.append(text)
    details["all_features"] = list(set(features))


    
    desc_hdr = soup.find(lambda tag: tag.name == "h2" and "description" in tag.get_text(strip=True).lower())
    if desc_hdr:
        block = desc_hdr.find_parent("div", class_="feature-block")
        if block:
            paragraphs = block.find_all("p")
            details["description"] = " ".join(p.get_text(" ", strip=True) for p in paragraphs)

    return details

def scrape_off_campus_housing(url=url):
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  
        soup = BeautifulSoup(response.text, 'html.parser')

        listings = soup.find_all('div', class_='c-list')

        apartments = []
        for listing in listings:
            apartment ={}

            name = listing.find('h3', class_='ellipsis')
            if name:
                apartment['name'] = name.text.strip()

            else:
                apartment['name'] = "No name found"

            address = listing.find('span', class_='ellipsis')
            if address:
                apartment['address'] = address.text.strip()
            else:
                apartment['address'] = "No address found"

            link = listing.find('a', href=True)
            if link:
                apartment['link'] = link['href']
                details = scrape_details(apartment['link'])
                apartment.update(details)
            else:
                apartment['link'] = "No link found"

            to_campus = listing.find('div', class_='walkTimeIdeal')
            if to_campus:
                # Check which icon is present
                icon = to_campus.find('i', class_='sprite')
                
                if icon and 'bg-walk' in icon.get('class', []):
                    # It's a walking distance
                    time_element = to_campus.find('em')
                    walk_time = time_element.text.strip() if time_element else "Time not specified"
                    
                    # If walk time is "30+ mins", add shuttle info
                    if walk_time == "30+ mins":
                        apartment['to_campus'] = f"Walk: {walk_time} (Shuttle to Campus)"
                    else:
                        apartment['to_campus'] = f"Walk: {walk_time}"
                        
                elif icon and 'bg-free_shuttle' in icon.get('class', []):
                    # It's a shuttle
                    apartment['to_campus'] = "Shuttle to Campus"
                else:
                    # Unknown transportation method
                    apartment['to_campus'] = to_campus.text.strip()
            else:
                # No commute information found
                apartment['to_campus'] = "No commute information found"




            apartments.append(apartment)


        return apartments[:10]
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return []
  

def scrape_and_update():
    """
    Main entrypoint: scrape the site and upsert into your DB twice a day.
    """
    try:
        campus = Campus.objects.get(name__icontains="Texas Tech")
    except Campus.DoesNotExist:
        print("⚠️  Campus 'Texas Tech' not found—skipping scraper run.")
        return

    listings = scrape_off_campus_housing()
    for data in listings:
        name = data.get("name")
        if not name:
            continue

        defaults = {
            'type':         'apartment',
            "county":       "Lubbock",
            "state":        "TX",
            "addressline1": data.get("address", ""),
            "description":  data.get("description", ""),
            "commute":      data.get("to_campus", ""),
            "features":     data.get("all_features", []),
        }
        apt, created = Housing.objects.update_or_create(
            campus=campus,
            name=name,
            defaults=defaults
        )
        print(f"{'Created' if created else 'Updated'} apartment: {apt.name}")