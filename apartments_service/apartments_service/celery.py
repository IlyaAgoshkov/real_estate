import os
from celery import Celery
from celery.schedules import crontab
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'apartments_service.settings')

app = Celery('apartments_service')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()



app.conf.beat_schedule = {
    'parse_apartments_daily': {
        'task': 'apartments.tasks.parse_apartments',
        'schedule': crontab(minute=37, hour=2),
    },
}
