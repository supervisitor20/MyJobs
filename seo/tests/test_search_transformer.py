# -*- coding: utf-8 -*-
# from django.test import TestCase
from unittest import TestCase
import logging

from seo.search_transformer import transform_search, \
    SearchTransformer, optimize_tree, Parser, Energy, \
    token_peekable, tokenize

# Columns:
# input query, input location, default_query, expected output
test_data = [
    ('teaching assistant', 'teaching AND assistant'),
    ('teaching and assistant', 'teaching AND assistant'),
    ('teaching & assistant', 'teaching AND assistant'),
    ('teaching &      assistant', 'teaching AND assistant'),
    ('teaching     &    assistant', 'teaching AND assistant'),
    ('teaching && assistant', 'teaching AND assistant'),
    ('teaching AND assistant', 'teaching AND assistant'),
    ('teaching AND "assistant"', 'teaching AND assistant'),
    ('teaching,assistant', '(teaching OR assistant)'),
    ('teaching ,assistant', '(teaching OR assistant)'),
    ('teaching or assistant', '(teaching OR assistant)'),
    ('teaching OR assistant', '(teaching OR assistant)'),
    ('teaching | assistant', '(teaching OR assistant)'),
    ('teaching || assistant', '(teaching OR assistant)'),
    ('teaching   or  assistant', '(teaching OR assistant)'),
    ('"teaching OR assistant"', '"teaching OR assistant"'),
    ('"teaching,assistant"', '"teaching,assistant"'),
    ('"teaching assistant"', '"teaching assistant"'),
    ('" teaching assistant"', '"teaching assistant"'),
    ('"    teaching assistant"', '"teaching assistant"'),
    ('!"teaching assistant"', 'NOT "teaching assistant"'),
    ('NOT "teaching assistant"', 'NOT "teaching assistant"'),
    ('not "teaching assistant"', 'NOT "teaching assistant"'),
    ('-"teaching assistant"', 'NOT "teaching assistant"'),
    ('!teacher', 'NOT teacher'),
    ('NOT teacher', 'NOT teacher'),
    ('not teacher', 'NOT teacher'),
    ('-teacher', 'NOT teacher'),
    ('! teacher', 'NOT teacher'),
    ('!    teacher', 'NOT teacher'),
    ('NOT   teacher', 'NOT teacher'),
    ('not   teacher', 'NOT teacher'),
    ('- teacher', 'teacher'),
    ('& assistant', 'assistant'),
    ('assistant &', 'assistant'),
    ('| assistant', 'assistant'),
    ('assistant |', 'assistant'),
    ('AND assistant', 'assistant'),
    ('assistant AND', 'assistant'),
    ('OR assistant', 'assistant'),
    ('assistant OR', 'assistant'),
    ('"AND assistant"', '"AND assistant"'),
    ('"assistant AND"', '"assistant AND"'),
    ('"OR assistant"', '"OR assistant"'),
    ('"assistant OR"', '"assistant OR"'),
    ('(assistant OR teacher)', '(assistant OR teacher)'),
    ('(assistant OR teacher) and curriculum',
        '(assistant OR teacher) AND curriculum'),
    ('(assistant AND teacher) OR curriculum',
        '((assistant AND teacher) OR curriculum)'),
    ('(assistant AND teacher) OR curriculum OR (homework AND test)',
        '((assistant AND teacher) OR curriculum OR (homework AND test))'),
    ("+-&&||!(){}[]^\"~*?:\\",
        '\+\-\&&\||\!\(\)\{\}\[\]\^\"\~\*\?\:\\'),
    ('teach*', 'teach*'),
    ('teach?', 'teach?'),
    ('"teaching assistant', '\"teaching AND assistant'),
    ('(teaching assistant', '\(teaching AND assistant'),
    ('teaching assistant"', 'teaching AND assistant\"'),
    ('teaching assistant)', 'teaching AND assistant\)'),
    ('*teach', '\*teach'),

    # Cases added after the official cases in PD-616
    ('', ''),
    ('teaching-assistant', 'teaching-assistant'),
    ('Highway Crew Members - Seasonal Snow-Mechanics',
     'Highway AND Crew AND Members AND Seasonal AND Snow-Mechanics'),
    (u'全联接的智慧世界驱动', u'全联接的智慧世界驱动'),
    ('c#', 'c#'),
    ('c$', 'c$'),
    ('guid:22', 'guid:22'),
    ('software c^2 developer', 'software AND c^2 AND developer'),
    ('AT\\&T', 'AT\\&T'),
    ('country_short_exact:*', 'country_short_exact:*'),
    ('snow \/ shovel', 'snow AND \/ AND shovel'),
    ('snow / shovel', 'snow AND \/ AND shovel'),
    ('snow/shovel', 'snow AND \/ AND shovel'),
    ('"nurse maid" and not (plastic or "made man")',
        '"nurse maid" AND NOT (plastic OR "made man")'),
    ('GeoLocation:("45.51115348122337,-122.65618521950462")',
     'GeoLocation:("45.51115348122337,-122.65618521950462")'),
    ('GeoLocation:"45.51115348122337,-122.65618521950462"',
     'GeoLocation:"45.51115348122337,-122.65618521950462"'),
    ('GeoLocation:42 nurse',
     'GeoLocation:42 AND nurse'),
    ('C a:"b"',
     'C AND a:b'),
    ('C a:"b c"',
     'C AND a:"b c"'),
]


# Dynamically add data driven tests to this class so that we always
# get results for all the test cases, even if some fail.
class TestSearchParser(TestCase):
    pass


def test_one_case(self, input_query, expected):
    actual = transform_search(input_query)
    message = u""
    message += "\n    input: "
    message += input_query
    message += "\n expected: "
    message += expected
    message += "\n      got: "
    message += unicode(actual)
    self.assertEqual(expected, actual, message)
    logging.info("Correct: %s -> %s", input_query, expected)

for i, (input_query, expected) in enumerate(test_data):

    def run_test(self, input_query=input_query, expected=expected):
        test_one_case(self, input_query, expected)
    setattr(TestSearchParser, 'test_%03d' % (i + 1),
            run_test)


class TestSearchParserSpecial(TestCase):
    def test_internal_error(self):

        @token_peekable
        def blow_up(stream):
            raise Exception
            yield None

        def energy_factory():
            return Energy(5000)

        transformer = SearchTransformer(blow_up, Parser, optimize_tree,
                                        energy_factory)
        result = transformer.transform("error here ok")
        self.assertEqual("error here ok", result)

    def test_too_much_parsing(self):
        def energy_factory():
            return Energy(5)

        transformer = SearchTransformer(tokenize, Parser, optimize_tree,
                                        energy_factory)

        bad_query = 10 * "happy "
        result = transformer.transform(bad_query)
        self.assertEqual(bad_query, result)
