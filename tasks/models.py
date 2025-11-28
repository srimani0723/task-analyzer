from django.db import models

# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=100)
    due_date = models.DateField
    estimated_hours = models.IntegerField(default=1)
    importance = models.IntegerField(default=5)
    dependencies = models.JSONField(default=list,blank=True)
    
    def __str__(self):
        return self.title