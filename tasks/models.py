from django.db import models
from django.utils import timezone


# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=100)
    due_date = models.DateField(default=timezone.now)
    importance = models.IntegerField(default=5)
    estimated_hours = models.IntegerField(default=1)
    dependencies = models.JSONField(default=list,blank=True)
    
    def __str__(self):
        return self.title