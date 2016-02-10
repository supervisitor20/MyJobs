from django.db import models

class ImportRecord(models.Model):
    buid = models.IntegerField(db_index=True)
    date = models.DateTimeField(auto_now=True, db_index=True)
    success = models.BooleanField()
    
    def __unicode__(self):
        return "<ImportRecord %s %s %s>" % (self.buid, self.date, 
                                         "SUCCEEDED" if self.success else "FAILED")