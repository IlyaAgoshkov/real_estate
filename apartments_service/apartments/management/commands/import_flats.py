import os
import re
import requests
from datetime import date
from pathlib import Path
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from apartments.models import Apartment

DEVELOPERS = {
    "51718": "Режиссёр",
    "53380": "Небо",
    "51716": "AVrorA",
    "56027": "URAL",
    "53531": "Смородина",
    "56030": "Зеленодар",
    "56033": "The Grand Palace",
    "56036": "Novella"
}

def extract_rooms(title):
    match = re.search(r"(\d+)-комн", title.lower())
    return int(match.group(1)) if match else 1

def clean_price(raw_price):
    return int(raw_price.replace(" ", "").strip())

class Command(BaseCommand):
    help = 'Парсит квартиры и сохраняет в базу данных'

    def handle(self, *args, **kwargs):
        total_saved = 0

        for dev_id, dev_name in DEVELOPERS.items():
            url = f"https://avadom.ru/local/api/new/apartments/?projects[]={dev_id}"
            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                self.stdout.write(f"❌ Ошибка {dev_name} ({dev_id}): {e}")
                continue

            saved = 0
            for item in data:
                try:
                    title = item.get("title", "")
                    rooms = extract_rooms(title)
                    address = item.get("address", "").strip()
                    floor = int(item.get("floorNum", 0))
                    area = float(item.get("area", 0))
                    price = clean_price(item.get("price", "0"))
                    price_per_m2 = int(price / area) if area else 0
                    image_url = None

                    
                    photos = item.get("photos", [])
                    if photos:
                        src = photos[0].get("src", "")
                        image_url = "https://avadom.ru" + src.replace("\\", "")

                    apartment = Apartment(
                        title=title,
                        rooms=rooms,
                        address=address,
                        floor=floor,
                        area=area,
                        price=price,
                        price_per_m2=price_per_m2,
                        complex_name=dev_name,
                        date=date.today().year,
                        usd_rub=79.1,
                        brent=64.6,
                    )

                    if image_url:
                        img_resp = requests.get(image_url)
                        if img_resp.status_code == 200:
                            image_name = os.path.basename(image_url)
                            apartment.image.save(image_name, ContentFile(img_resp.content), save=False)

                    apartment.save()
                    saved += 1
                except Exception as e:
                    self.stdout.write(f" Ошибка сохранения квартиры: {e}")
                    continue

            total_saved += saved
            self.stdout.write(f" {dev_name}: сохранено {saved} квартир.")

        self.stdout.write(f"\n Всего сохранено: {total_saved} квартир.")

