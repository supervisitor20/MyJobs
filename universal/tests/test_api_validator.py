from unittest import TestCase

from universal.api_validation import ApiValidator


class TestApiValidator(TestCase):
    def test_note_error(self):
        '''We know when we have errors and can build error documents.'''
        validator = ApiValidator()
        self.assertEqual(False, validator.has_errors())

        validator.note_error("aaa")
        self.assertEqual(True, validator.has_errors())
        self.assertEqual([
            {
                "message": "aaa",
            }], validator.build_document())

        validator.note_error("bbb")
        self.assertEqual(True, validator.has_errors())
        self.assertEqual([
            {
                "message": "aaa",
            },
            {
                "message": "bbb",
            }], validator.build_document())

    def test_note_field_error(self):
        '''We can build error documents with field specific errors.'''
        validator = ApiValidator()
        validator.note_field_error("name", "aaa")
        self.assertEqual(True, validator.has_errors())
        self.assertEqual([
            {
                "field": "name",
                "message": "aaa",
            }], validator.build_document())
