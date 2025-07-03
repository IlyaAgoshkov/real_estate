# apartments/management/commands/calculate_forecast_prices.py

from django.core.management.base import BaseCommand
from apartments.models import Apartment
import numpy as np
from django.db.models import F
from apartments.views import load_models
import apartments.views as apartments_views
import pandas as pd


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Начало расчета прогнозных цен...'))

        try:
            load_models()

            apartments = Apartment.objects.all()
            total_apartments = apartments.count()
            self.stdout.write(f'Расчет прогнозных цен для {total_apartments} квартир.')

            updated_count = 0
            apartments_to_update = []

            current_year = 2025

            for i, apt in enumerate(apartments):
                try:
                    X = np.array([[
                        apt.price_per_m2,
                        apt.floor,
                        apt.rooms,
                        apt.area,
                        apt.usd_rub,
                        apt.brent,
                        current_year
                    ]])

                    feature_names = ['prev_price', 'floor', 'rooms', 'area', 'usd_rub', 'brent', 'year']

                    X_df = pd.DataFrame(X, columns=feature_names)

                    X_scaled = apartments_views.scaler.transform(X_df)
                    y_pred_price_per_m2 = apartments_views.model.predict(X_scaled, verbose=0)[0][0]
                    
                    apt.forecast_price_next_year = round(float(y_pred_price_per_m2))
                    
                    if apt.price_per_m2 > 0:
                        profit_percentage = ((y_pred_price_per_m2 - apt.price_per_m2) / apt.price_per_m2) * 100
                        apt.profit_percentage = round(profit_percentage, 2)
                    else:
                        apt.profit_percentage = None

                    apartments_to_update.append(apt)
                    updated_count += 1

                    if (i + 1) % 100 == 0:
                         self.stdout.write(f'Процесс {i + 1}/{total_apartments} квартир.')

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Ошибка обработки квартиры {apt.id}: {e}'))

            Apartment.objects.bulk_update(apartments_to_update, ['forecast_price_next_year', 'profit_percentage'])

            self.stdout.write(self.style.SUCCESS(f'Успешно рассчитано и обновлено прогноз цен для {updated_count} квартир.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ошибка при расчете прогноза цен: {e}'))
