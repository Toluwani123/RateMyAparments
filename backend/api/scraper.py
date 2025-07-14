from urllib.parse import urljoin
from bs4 import BeautifulSoup
import requests
import random

CAMPUS_URL_MAP = {
    "https://www.rentcollegepads.com/off-campus-housing/texas-tech/search": {
        "campus_name": "Texas Tech University",
        "county": "Lubbock",
        "state": "TX"
    },
    "https://www.rentcollegepads.com/off-campus-housing/tcu/search": {
        "campus_name": "Texas Christian University", 
        "county": "Tarrant",
        "state": "TX"
    },
    "https://www.rentcollegepads.com/off-campus-housing/tamu/search": {
        "campus_name": "Texas A&M University",
        "county": "Brazos",
        "state": "TX"
    },
}
headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
}   
from django.conf import settings
from django.utils import timezone
from .models import Campus, Housing



import re


def scrape_details(detail_page_url):
    details = {
        "all_features": [],
        "description": "",
        "lowest_rent": None,
        "image_urls": [],
        "phone": "",
        "bedrooms": None,
        "bathrooms": None,
    }

    try:
        r = requests.get(detail_page_url, headers=headers, timeout=10)
        r.raise_for_status()
    except requests.RequestException:
        return details

    soup = BeautifulSoup(r.text, "html.parser")

    # ————————— Amenities —————————
    features = []
    for ul in soup.find_all("ul", class_="extra-list"):
        for li in ul.find_all("li"):
            text = li.get_text(strip=True)
            if text:
                features.append(text)
    details["all_features"] = list(set(features))

    # ————————— Description —————————
    desc_hdr = soup.find(
        lambda tag: tag.name == "h2"
                    and "description" in tag.get_text(strip=True).lower()
    )
    if desc_hdr:
        block = desc_hdr.find_parent("div", class_="feature-block")
        if block:
            paras = block.find_all("p")
            details["description"] = " ".join(p.get_text(" ", strip=True) for p in paras)

    # ————————— Lowest Rent —————————
    rent_prices = []
    # find **all** tables under any tab-pane
    for pane in soup.select("div.tab-pane"):
        for row in pane.select("tbody tr"):
            cols = row.find_all("td")
            if len(cols) < 4:
                continue
            rent_text = cols[3].get_text(" ", strip=True)
            # extract any numbers, e.g. “$917.00” or “1163.00”
            found = re.findall(r"\$?([\d,]+(?:\.\d+)?)", rent_text)
            # convert to float
            nums = []
            for num in found:
                clean = num.replace(",", "")
                try:
                    nums.append(float(clean))
                except ValueError:
                    pass
            if nums:
                rent_prices.append(min(nums))

    if rent_prices:
        details["lowest_rent"] = min(rent_prices)

    # ————————— Gallery Images —————————
    MAX_IMAGES        = 4
    S3_BASE           = "https://s3.amazonaws.com/rcp-prod-uploads/property_images/slider_images/"
    gallery_div       = soup.find(id="gallerySlider")
    details["image_urls"] = []                       # always present

    if gallery_div:
        seen = set()

        # any <img> inside the slider, eager or lazy-loaded
        for tag in gallery_div.select("img"):
            raw = tag.get("src") or tag.get("data-lazy")
            if not raw:
                continue

            # convert relative -> absolute
            url = raw if raw.startswith(("http://", "https://")) else urljoin(S3_BASE, raw.lstrip("/"))

            if url in seen:
                continue
            seen.add(url)

            if len(seen) == MAX_IMAGES:
                break

        details["image_urls"] = list(seen) 

    # Contact information
    contact_div = soup.find("li", class_="nav-item")
    if contact_div:
        phone = contact_div.find("a", href=re.compile(r"tel:"))
        if phone:
            details["phone"] = phone.get("href", "").replace("tel:", "").strip()
        else:
            details["phone"] = "No phone number found"
    else:

        details["phone"] = "No contact information found"

    # Bathrooms and Bedrooms
    details["bedrooms"] = None     # keep the keys consistent even if not found
    details["bathrooms"] = None

    bed_bath_div = soup.find("div", class_="property-detail")
    if bed_bath_div:
        for row in bed_bath_div.select("tbody tr"):
            cols = row.find_all("td")
            if len(cols) != 2:
                continue
            label = cols[0].get_text(strip=True).rstrip(":").lower()
            value = cols[1].get_text(strip=True)

            if label == "bedrooms":
                details["bedrooms"] = value          # e.g. "2-4"
            elif label == "bathrooms":
                details["bathrooms"] = value  



    return details



def scrape_off_campus_housing(url):
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  
        soup = BeautifulSoup(response.text, 'html.parser')

        listings = soup.find_all('div', class_='c-list')

        apartments = []
        for listing in listings:
            apartment = {}

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
            detail_url = link['href'] if link else "No link found"
            apartment['link'] = detail_url
            if detail_url:
                apartment.update(scrape_details(detail_url))

            to_campus = listing.find('div', class_='walkTimeIdeal')
            if to_campus:
                icon = to_campus.find('i', class_='sprite')
                
                if icon and 'bg-walk' in icon.get('class', []):
                    time_element = to_campus.find('em')
                    walk_time = time_element.text.strip() if time_element else "Time not specified"
                    
                    if walk_time == "30+ mins":
                        apartment['to_campus'] = f"Walk: {walk_time} (Shuttle to Campus)"
                    else:
                        apartment['to_campus'] = f"Walk: {walk_time}"
                        
                elif icon and 'bg-free_shuttle' in icon.get('class', []):
                    apartment['to_campus'] = "Shuttle to Campus"
                else:
                    apartment['to_campus'] = to_campus.text.strip()
            else:
                apartment['to_campus'] = "No commute information found"

            thumb = listing.find('img')
            if thumb:
                src = thumb.get('src') or thumb.get('data-lazy')
                apartment['thumbnail'] = urljoin(url, src)

            apartments.append(apartment)

        return apartments[:15]
    except requests.exceptions.RequestException as e:
        print(f"An error occurred scraping {url}: {e}")
        return []

def scrape_and_update():
    """
    Main entrypoint: scrape all configured sites and upsert into DB.
    """
    total_processed = 0
    
    for url, campus_info in CAMPUS_URL_MAP.items():
        print(f"🔍 Scraping {campus_info['campus_name']}...")
        
        try:
            # Try to find the campus by name
            campus = Campus.objects.get(name__icontains=campus_info['campus_name'].split()[0])
        except Campus.DoesNotExist:
            print(f"⚠️  Campus '{campus_info['campus_name']}' not found—skipping.")
            continue
        except Campus.MultipleObjectsReturned:
            # If multiple matches, try exact name match
            try:
                campus = Campus.objects.get(name=campus_info['campus_name'])
            except Campus.DoesNotExist:
                print(f"⚠️  Campus '{campus_info['campus_name']}' not found—skipping.")
                continue

        listings = scrape_off_campus_housing(url)
        campus_processed = 0
        
        for data in listings:
            name = data.get("name")
            if not name:
                continue

            defaults = {
                'type': 'apartment',
                "county": campus_info['county'],
                "state": campus_info['state'],
                "addressline1": data.get("address", ""),
                "description": data.get("description", ""),
                "commute": data.get("to_campus", ""),
                "features": data.get("all_features", []),
                "thumbnail": data.get("thumbnail", None),
                "lowest_rent": data.get("lowest_rent", None),
                'image_urls': data.get("image_urls", []),
                "phone": data.get("phone", ""),
                "bedrooms": data.get("bedrooms", None),
                "bathrooms": data.get("bathrooms", None),
            }
            
            apt, created = Housing.objects.update_or_create(
                campus=campus,
                name=name,
                defaults=defaults
            )
            
            action = "Created" if created else "Updated"
            print(f"  {action} apartment: {apt.name}")
            campus_processed += 1

        print(f"✅ Processed {campus_processed} apartments for {campus_info['campus_name']}")
        total_processed += campus_processed

    print(f"🎉 Total apartments processed: {total_processed}")