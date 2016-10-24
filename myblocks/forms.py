from fsm.widget import FSM

from django import forms
from django.core.urlresolvers import reverse_lazy

from myblocks import models
from universal.helpers import autofocus_input


class BlockForm(forms.ModelForm):
    class Meta:
        exclude = ('updated', )
        model = models.Block

    def __init__(self, *args, **kwargs):
        super(BlockForm, self).__init__(*args, **kwargs)
        self.fields['template'].initial = models.raw_base_template(self.Meta.model)
        self.fields['head'].initial = models.raw_base_head(self.Meta.model)
        autofocus_input(self)


class ApplyLinkBlockForm(BlockForm):
    class Meta:
        model = models.ApplyLinkBlock
        exclude = []


class BreadboxBlockForm(BlockForm):
    class Meta:
        model = models.BreadboxBlock
        exclude = []


class ColumnBlockForm(forms.ModelForm):
    class Meta:
        exclude = ('updated', 'template', )
        model = models.ColumnBlock
        exclude = []


class ContentBlockForm(BlockForm):
    class Meta:
        model = models.ContentBlock
        exclude = []


class FacetBlurbBlockForm(BlockForm):
    class Meta:
        model = models.FacetBlurbBlock
        exclude = []


class JobDetailBlockForm(BlockForm):
    class Meta:
        model = models.JobDetailBlock
        exclude = []


class JobDetailBreadboxBlockForm(BlockForm):
    class Meta:
        model = models.JobDetailBreadboxBlock
        exclude = []


class JobDetailHeaderBlockForm(BlockForm):
    class Meta:
        model = models.JobDetailHeaderBlock
        exclude = []


class LoginBlockForm(BlockForm):
    class Meta:
        model = models.LoginBlock
        exclude = []


class MoreButtonBlockForm(BlockForm):
    class Meta:
        model = models.MoreButtonBlock
        exclude = []


class RegistrationBlockForm(BlockForm):
    class Meta:
        model = models.RegistrationBlock
        exclude = []


class ToolsWidgetBlockForm(BlockForm):
    class Meta:
        model = models.ToolsWidgetBlock
        exclude = []


class SavedSearchWidgetBlockForm(BlockForm):
    class Meta:
        model = models.SavedSearchWidgetBlock
        exclude = []


class SavedSearchesListWidgetBlockForm(BlockForm):
    class Meta:
        model = models.SavedSearchesListWidgetBlock
        exclude = []


class SearchBoxBlockForm(BlockForm):
    class Meta:
        model = models.SearchBoxBlock
        exclude = []


class SearchFilterBlockForm(BlockForm):
    class Meta:
        model = models.SearchFilterBlock
        exclude = []


class SearchResultBlockForm(BlockForm):
    class Meta:
        model = models.SearchResultBlock
        exclude = []


class SearchResultHeaderBlockForm(BlockForm):
    class Meta:
        model = models.SearchResultBlock
        exclude = []


class ShareBlockForm(BlockForm):
    class Meta:
        model = models.ShareBlock
        exclude = []


class VeteranSearchBoxForm(BlockForm):
    class Meta:
        model = models.VeteranSearchBox
        exclude = []


class PageForm(forms.ModelForm):
    class Meta:
        exclude = ('updated', )
        widgets = {
            'sites': FSM('Site', reverse_lazy('site_admin_fsm'), lazy=True),
        }
        model = models.Page

    def __init__(self, *args, **kwargs):
        super(PageForm, self).__init__(*args, **kwargs)
        self.fields['head'].initial = models.raw_base_head(self.Meta.model)
        # without this, we get two options for ''. Setting blank=False on the
        # model also gets rid of the second option, but means that the blank
        # opton can never be chosen
        doc_type = self.fields['doc_type']
        language_code = self.fields['language_code']
        doc_type.choices = doc_type.choices[1:]
        language_code.choices = language_code.choices[1:]


class RowForm(forms.ModelForm):
    class Meta:
        exclude = ('updated', )
        model = models.Row
